import { createRemoteJWKSet, jwtVerify } from 'jose';

const keySets = new Map();

export function authConfiguration(env) {
  try {
    const team = new URL(env.ACCESS_TEAM_DOMAIN);
    if (team.protocol !== 'https:' || !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(team.hostname) || team.port || team.username || team.password || team.search || team.hash || team.pathname !== '/') return null;
    if (typeof env.ACCESS_AUD !== 'string' || !env.ACCESS_AUD.trim()) return null;
    if (typeof env.OWNER_EMAIL !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.OWNER_EMAIL)) return null;
    return { issuer: team.origin, audience: env.ACCESS_AUD, email: env.OWNER_EMAIL.toLowerCase() };
  } catch { return null; }
}

export async function ownerIdentity(request, env, testKeys) {
  const config = authConfiguration(env);
  if (!config) return null;
  // Access adds the assertion on protected paths; its cookie also accompanies
  // same-origin API calls. Neither an email header nor a client flag is trusted.
  const assertion = request.headers.get('Cf-Access-Jwt-Assertion');
  const cookies = request.headers.get('Cookie')?.split(';').map(x => x.trim()) || [];
  const cookie = name => cookies.find(x => x.startsWith(name+'='))?.slice(name.length+1);
  const token = assertion || cookie('__Host-garage-session') || cookie('CF_Authorization');
  if (!token || token.length > 16384) return null;
  try {
    if (!keySets.has(config.issuer)) keySets.set(config.issuer, createRemoteJWKSet(new URL('/cdn-cgi/access/certs', config.issuer)));
    const { payload } = await jwtVerify(token, testKeys || keySets.get(config.issuer), {
      issuer: config.issuer,
      audience: config.audience,
      algorithms: ['RS256'],
      requiredClaims: ['exp', 'iat', 'sub', 'email'],
    });
    if (typeof payload.email !== 'string' || payload.email.toLowerCase() !== config.email) return null;
    return { email: payload.email, token, expires: payload.exp };
  } catch { return null; }
}
