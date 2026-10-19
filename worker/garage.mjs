import Records from '../dist/records.js';
import Guide from '../dist/guide.js';
import { authConfiguration, ownerIdentity } from './auth.mjs';

export const MAX_BYTES = 12 * 1024 * 1024;
const CHUNK_BYTES = 120 * 1024;

function json(value, status = 200, headers = {}) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
}

async function boundedJSON(request) {
  if (Number(request.headers.get('Content-Length')) > MAX_BYTES) throw new Response('Garage record exceeds 12 MB.', { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) throw new Response('A JSON record is required.', { status: 400 });
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) { await reader.cancel(); throw new Response('Garage record exceeds 12 MB.', { status: 413 }); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new Response('Invalid JSON.', { status: 400 }); }
}

export function normalizedState(value) {
  if (!Records.validState(value) || value.parts.length > 5000 || value.logs.length > 5000 || value.photos.length > 1000) return null;
  for (const photos of value.photos) if (photos.src.startsWith('data:') && !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(photos.src)) return null;
  for (const rows of [value.parts, value.logs, value.photos]) if (new Set(rows.map(x => x.id)).size !== rows.length) return null;
  // Retain restoration records, never client-supplied authentication fields.
  const state = Records.mergeBuiltInPhotos({ schema: 1, parts: value.parts, logs: value.logs, photos: value.photos });
  state.guides = Guide.migrate(value.guides, state);
  return state;
}

async function readSnapshot(storage) {
  const meta = await storage.get('meta');
  if (!meta) return { revision: 0, state: null };
  const keys = Array.from({ length: meta.chunks }, (_, i) => `state:${i}`);
  const values = await storage.get(keys);
  const chunks = keys.map(key => values.get(key));
  if (chunks.some(x => !(x instanceof Uint8Array))) throw new Error('Stored garage record is incomplete.');
  const bytes = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.byteLength, 0));
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return { revision: meta.revision, state: JSON.parse(new TextDecoder().decode(bytes)) };
}

export class GarageStore {
  constructor(ctx) { this.storage = ctx.storage; }

  async fetch(request) {
    if (request.method === 'GET') {
      const snapshot = await this.storage.transaction(readSnapshot);
      return json(snapshot, 200, { ETag: `"${snapshot.revision}"` });
    }
    if (request.method !== 'PUT') return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET, PUT' });
    const match = /^"(\d+)"$/.exec(request.headers.get('If-Match') || '');
    if (!match) return json({ error: 'Reload the current garage record before saving.' }, 428);
    let incoming;
    try { incoming = normalizedState(await boundedJSON(request)); }
    catch (error) { if (error instanceof Response) return error; throw error; }
    if (!incoming) return json({ error: 'This is not a valid garage record.' }, 400);
    const bytes = new TextEncoder().encode(JSON.stringify(incoming));
    if (bytes.byteLength > MAX_BYTES) return json({ error: 'Garage record exceeds 12 MB. Export a backup before removing photos.' }, 413);
    const result = await this.storage.transaction(async transaction => {
      const previous = await readSnapshot(transaction);
      if (previous.revision !== Number(match[1])) return { conflict: true, revision: previous.revision };
      const oldParts = previous.state?.parts || Records.initialState().parts;
      for (const part of incoming.parts.filter(p => p.status === 'Ordered')) {
        const before = oldParts.find(p => p.id === part.id);
        if (request.headers.get('X-Garage-Import') === '1' || (before?.status === 'Ordered' && before.sled === part.sled)) continue;
        const errors = Guide.purchaseIssues(incoming, part, 'Ordered');
        if (errors.length) return { error: errors[0] };
      }
      const count = Math.ceil(bytes.byteLength / CHUNK_BYTES);
      const entries = { meta: { revision: previous.revision + 1, chunks: count } };
      for (let i = 0; i < count; i++) entries[`state:${i}`] = bytes.slice(i * CHUNK_BYTES, (i + 1) * CHUNK_BYTES);
      const oldMeta = await transaction.get('meta');
      const obsolete = Array.from({ length: Math.max(0, (oldMeta?.chunks || 0) - count) }, (_, i) => `state:${count + i}`);
      if (obsolete.length) await transaction.delete(obsolete);
      await transaction.put(entries);
      return { revision: previous.revision + 1 };
    });
    if (result.conflict) return json({ error: 'Another session updated the garage. Your draft is preserved; reload the published record before replacing it.', revision: result.revision }, 409);
    if (result.error) return json({ error: result.error }, 422);
    return json(result);
  }
}

export function createWorker(authenticate = ownerIdentity) {
  return {
    async fetch(request, env) {
      const url = new URL(request.url);
      const path = url.pathname;
      try {
        if (path === '/api/session') {
          if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);
          const owner = await authenticate(request, env);
          return json({ canEdit: Boolean(owner), email: owner?.email || null, configured: Boolean(authConfiguration(env)), loginUrl: '/admin/login', logoutUrl: '/cdn-cgi/access/logout' });
        }
        if (path === '/admin/login') {
          if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);
          if (!authConfiguration(env)) return json({ error: 'Owner sign-in is not configured yet. Public viewing remains available.' }, 503);
          const owner = await authenticate(request, env);
          if (!owner) return json({ error: 'Sign in through the owner’s Cloudflare Access application.' }, 401);
          const target = url.searchParams.get('return');
          const lifetime = Math.max(0, Math.min(8*60*60, owner.expires-Math.floor(Date.now()/1000)));
          return new Response(null, { status: 303, headers: {
            Location: new URL(/^\/#(overview|guide|sleds|parts|journal|archive)$/.test(target || '') ? target : '/', url.origin).href,
            'Cache-Control': 'no-store',
            'Set-Cookie': `__Host-garage-session=${owner.token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${lifetime}`,
          } });
        }
        if (path === '/api/logout') {
          if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
          if (request.headers.get('Origin') !== url.origin) return json({ error: 'Sign out from this garage’s own page.' }, 403);
          return json({ logoutUrl: '/cdn-cgi/access/logout' }, 200, { 'Set-Cookie': '__Host-garage-session=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0' });
        }
        if (path === '/api/garage') {
          if (!['GET', 'PUT'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET, PUT' });
          if (request.method === 'PUT') {
            if (!await authenticate(request, env)) return json({ error: 'Owner sign-in is required to change the garage.' }, 401);
            if (request.headers.get('Origin') !== url.origin) return json({ error: 'Save changes from this garage’s own page.' }, 403);
            if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return json({ error: 'Use an application/json record.' }, 415);
          }
          if (!env.GARAGE) return json({ error: 'Shared garage storage is unavailable.' }, 503);
          const store = env.GARAGE.get(env.GARAGE.idFromName('garage'));
          return await store.fetch(request);
        }
        if (path.startsWith('/api/') || path.startsWith('/admin/')) return json({ error: 'Not found.' }, 404);
        if (!['GET', 'HEAD'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405);
        return env.ASSETS.fetch(request);
      } catch {
        return json({ error: 'The garage is temporarily unavailable. Your browser draft is preserved.' }, 503);
      }
    },
  };
}

export default createWorker();
