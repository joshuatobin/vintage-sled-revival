# Tobin's Ski-Doo Garage

Buildless frontend in `dist/`, served by a Cloudflare Worker with a public shared garage record and owner-only editing.

Includes two vehicle profiles, a guided restoration workflow, a parts/inspection tracker, actual purchase totals, workshop notes, a photo archive, source manuals and supplier leads.

## Homepage

The root URL and existing `#overview` links open **Home**, using the approved **Showroom** design. It introduces Vintage Sled Revival as Joshua’s personal restoration log with the two original sled photographs, shows each project's real guide stage and next action, and links photos / manuals, parts / costs and the workshop journal. Project links open the chosen sled; walkthrough links open that sled’s next available step. The walkthrough includes a Home link, and phone navigation keeps visible text labels. Browser recovery options remain available in an expandable owner notice.

[DESIGN.md](DESIGN.md) records the interface direction and preservation requirements.

## Guided restoration

Open **Guided restoration** or use **Continue walkthrough** from the overview. Each sled has its own 20-step record across six stages:

1. Discovery: a supplied starting file (working year/model and photos), missing photo evidence, chassis year/model verification, installed engine, carburetor, drive/electrical equipment and matching references.
2. Inspection: condition findings and a disposition for each system's linked parts.
3. Parts plan: verified part/service specifications, supplier references and quantities.
4. Repair: completed work and installation records.
5. Checks & first run: documented service settings, pre-start review and run outcome.
6. Finish & handoff: finished photos, project summary and maintenance actions.

Step 1 is already recorded from the supplied photos and provisional identity. It is a starting file, not a verified year: the early sled remains “1963?” and the later model is provisional. Existing records gain this starting step without replacing saved findings, parts, purchases, journal entries or photos. Corrections to the working label survive reloads and backup imports.

The walkthrough then shows which identification views are selected or missing, links the applicable factory references, and asks how the chassis was identified, which photo supports it, and what source and reasoning support the conclusion. Chassis confirmation requires the preceding photo evidence. A missing identifier can be documented as missing; it does not become an invented serial number. A saved estimate or unresolved conclusion never unlocks ordering. The parts tracker shows the outstanding discovery requirements, and blocked orders return to the walkthrough with an explanation. Installed engine and component verification plus each part’s specification and supplier link remain required for new orders.

The walkthrough uses photo cards, a collapsible journey map, and one active task. Supplied estimates and photos stay in an expandable starting file. Chassis identification is grouped into reading the sled, connecting evidence to sources, and recording a conclusion. Photo selections update in place, partial findings autosave with publishing feedback, and incomplete-step messages link directly to the missing field. On phones, the journey collapses and evidence cards stack. Public visitors can open evidence photos while editing controls remain disabled.

Steps support partial drafts and explicitly recorded blockers. Unknown identity remains open; the site never converts a hypothesis into a confirmed chassis year. Later stages require prior-stage completion. If evidence disappears, an earlier finding is reopened, or a required part returns to an unresolved status, affected completion is recalculated. New order entries require discovery and fitment information; previously recorded purchases are preserved.

Recorded chassis findings update the sled profile without changing the historical journal. Completing a guide step also creates a dated workshop entry.

The guide tracks a restoration process. Factory references and appropriate mechanical review still determine the actual procedures and settings. No operational oil ratio, test pressure, lubricant quantity or torque is invented by the app.

## Run and check

Install the Worker development tools and start the local app, including its API and isolated local storage:

```sh
npm ci
npm run cf:dev
```

Open the URL printed by Wrangler (normally `http://localhost:8787`). Local storage is separate from production. Public viewing works immediately; owner editing requires a valid Cloudflare Access login. There is no development authentication bypass. Copy `.dev.vars.example` to the ignored `.dev.vars` only when configuring local verification against your own Access application.

Run the checks with Node 22 or later:

```sh
npm test
npm run check
npm run cf:check
```

`npm run test:runtime` also exercises the bundled Worker and SQLite-backed Durable Object in Cloudflare's local runtime, using test-only signing keys and an intercepted test certificate endpoint. It never contacts production or disables production authentication.

A simple Python static server can show the frontend, but has no shared API: it remains read-only and reports that published progress could not be loaded.

`dist/records.js` holds the shared record definitions and validation. `dist/guide.js` contains workflow validation, `dist/guide-ui.js` renders the walkthrough, `dist/app.js` handles the garage UI, and `dist/sync.js` handles authenticated synchronization and recoverable browser drafts. `worker/auth.mjs` verifies login tokens; `worker/garage.mjs` implements the API and durable record. Tests cover authorization, public viewing, photo persistence, conflicts, migrations, workflow dependencies and purchase gates.

## Cloudflare Workers

`wrangler.jsonc` serves the existing `dist/` folder and routes `/api/*` and `/admin/*` through `worker/index.mjs`. The Worker is named `vintage-sled-revival`. Its `GARAGE` SQLite-backed Durable Object is provisioned by the tracked `v1-garage` migration. No D1 database ID, R2 bucket, application build, or manual database migration is required. Hash-based navigation and all supplied photos are retained.

Install the deployment tools once, then validate without publishing:

```sh
npm ci
npm run cf:check
```

`npm run cf:dev` previews the Worker locally. `npm run cf:deploy` publishes using your Cloudflare CLI login; use it only when ready to deploy. A static-only Python preview stays read-only; use `cf:dev` to exercise the shared API.

For Git-connected deployment, push the configuration and lockfile to GitHub, then choose the repository in Cloudflare **Workers & Pages → Create application → GitHub**. If the repository is missing, open [GitHub installed applications](https://github.com/settings/installations), configure **Cloudflare Workers & Pages** under `joshuatobin`, and add `vintage-sled-revival` to its selected repositories while retaining the existing selections. Refresh the Cloudflare picker afterward. This access is separate from your local `gh` login.

Use these Workers Builds settings:

| Setting | Value |
| --- | --- |
| Worker / project name | `vintage-sled-revival` |
| Repository | `joshuatobin/vintage-sled-revival` |
| Production branch | `main` |
| Root directory | Repository root (leave blank) |
| Build command | `npm test && npm run check` |
| Deploy command | `npm run cf:deploy` |

The Worker name must match `wrangler.jsonc`. The `dist/` asset directory is declared there; no separate build-output setting is needed. Cloudflare's Git integration installs project dependencies before running the commands.

## Public viewing and owner sign-in

Public visitors can read the published garage, view photos and guides, filter records, and export the public record. They cannot add, edit, delete, import or save findings. The Worker independently rejects unauthorized writes even if someone changes the browser UI or forges an email header.

Configure **one hostname/path-based Cloudflare Access self-hosted application** for the deployed hostname's `/admin/login` path. Keep the rest of the hostname public; do not enable Access for the entire Worker. Use the One-time PIN identity provider and one Allow policy containing only the owner's exact email address. Use an eight-hour session and do not add an Everyone, email-domain, or bypass policy. The owner email is configured in Cloudflare, not committed to this repository.

Set these Worker secrets or environment variables:

| Name | Value |
| --- | --- |
| `ACCESS_TEAM_DOMAIN` | Your team origin, such as `https://your-team.cloudflareaccess.com` |
| `ACCESS_AUD` | The owner-login application's Audience (AUD) tag |
| `OWNER_EMAIL` | The exact email address allowed to edit |

`keep_vars` preserves dashboard-configured variables on deployment. Cloudflare secrets also persist across deployments. The Worker never grants editing when any authentication setting is absent or invalid.

After Access authenticates `/admin/login`, the Worker verifies the JWT's RS256 signature, issuer, audience, expiration and owner email. It places the verified token in a `Secure`, `HttpOnly`, host-only, `SameSite=Lax` session cookie. The token is never returned to JavaScript or stored in localStorage. Each write revalidates it and requires a same-origin JSON request. Sign-out clears the app cookie and goes through Cloudflare Access logout. Email-code sign-in proves access to the inbox; the app does not accept an unverified email string as identity.

## Records and backups

Published parts, costs, workshop notes, guide findings and resized uploaded photos are stored together in the shared Durable Object, so visitors and other devices see the same progress on their next page load. API reads are uncached. Published records, including costs and workshop notes, are publicly readable. The current archive limit is 12 MB, including uploaded images. Only the authenticated owner can replace that record.

Saves use a revision check and an atomic storage transaction. An older session cannot silently replace newer progress. Failed or conflicting writes leave an explicit status and preserve a browser draft when browser capacity permits. Export that draft before reloading when resolving a conflict; network failures also offer a retry. If browser backup storage is full, keep the page open until publishing succeeds or export a backup.

The original localStorage key, `tobin-skidoo-garage-v1`, is preserved untouched. A visitor never loads or publishes that browser-only record. After owner sign-in, use **Review original browser records** to inspect it, then explicitly publish it. Existing purchases in an explicit import remain recorded even while identification is unresolved. New orders still require verified identity and fitment. Unpublished recovery drafts use `tobin-skidoo-garage-draft-v2`; those are removed only after the corresponding record is acknowledged by the server.

For a record held at another origin or in another browser, export its JSON backup there, sign in on the new site, then **Import backup**. The import confirmation explains that this replaces the shared record and makes the imported photos, notes, findings and costs public. Keep the original backup until the published record is verified. JSON retains guides, blockers, completion records, original purchases and user photos. CSV exports the filtered parts list.

The repository contains the supplied photographs and app source, not live restoration data, authentication tokens or exported backups. No existing chassis finding is promoted to a confirmed year by authentication or migration.

References: [Cloudflare Access paths](https://developers.cloudflare.com/workers/configuration/cloudflare-access/), [one-time PIN login](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/), [JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/), [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## Identification policy

The early chassis is unconfirmed; 1963 is a working hypothesis. Engine serial transcription 1308696 and the supplied year chart are research leads only. The later chassis is provisionally SE8 / 1968 Olympique 300 E; the plate photograph is available, and the code interpretation remains an explicit discovery step. Factory specifications describe original models, not verified installed hardware.

The earlier shopping list's 293 cc, 69 mm 300E piston, 40:1 oil ratio, straight SAE30 chaincase fluid, production ordinal, and fixed bogie quantity are not treated as verified instructions.

## Primary references

- https://www.trailz.net/pub/Snowmobiles/SKIDOO/1996-1997/1997/MSPE_A97.PDF
- https://www.vintagesnow.com/Ski-Doo_files/1968%20Ski-doo%20Parts%20List%20.pdf
- https://vintagesnow.com/Ski-Doo_files/1960-1965%20Ski-doo%20Parts%20List.pdf
- https://museebombardier.com/en/services/

Photographs supplied by the owner. The 1968 gallery includes the owner-provided porch view, Super Olympique E seat badge, and chassis data plate. Built-in photo updates merge into saved browser data and imported backups without resetting parts, notes, or uploaded images.

## Compare UI designs without changing production

**Showroom** and **Workbench** are available as comparison homepages. Joshua selected **Showroom** for production. Navigation, colors, photographs, restoration validation and public/owner access rules stay shared. `AGENTS.md` requires at least two published Cloudflare alternatives with clickable links for future UI changes before selecting a direction.

- [Showroom preview](https://showroom-vintage-sled-revival-designs.joshuatobin.workers.dev): a photo-led introduction and project stories.
- [Workbench preview](https://workbench-vintage-sled-revival-designs.joshuatobin.workers.dev): a selected project, its evidence and next action.
- [Current production](https://vintage-sled-revival.joshuatobin.workers.dev): the approved Showroom homepage with owner sign-in.

Cloudflare version URLs on the separate `vintage-sled-revival-designs` Worker let each design remain available for comparison. This Worker has only a static-assets binding. It reads `/api/garage` from the existing public production endpoint and cannot write records, sign in, or access production storage directly. Request cookies and authorization headers are never forwarded. Preview assets and API responses discourage search indexing.

The preview configuration explicitly enables `global_fetch_strictly_public` so its Worker can fetch the other Worker's public endpoint on Cloudflare's network.

```sh
# Local snapshots of each design; restart after editing source assets.
npm run ui:preview -- showroom dev --port 8792
npm run ui:preview -- workbench dev --port 8793

# Validate without publishing.
npm run ui:preview -- showroom check
npm run ui:preview -- workbench check

# One-time creation of the dedicated UI Worker using the current layout.
npm run ui:preview -- classic initialize

# Upload immutable versions with stable showroom / workbench aliases.
npm run ui:preview -- showroom publish
npm run ui:preview -- workbench publish
```

Publishing requires a Wrangler login with `account:read`, `user:read` and `workers_scripts:write`. General `workers:write` access alone does not authorize the legacy script deployment APIs. The preview script creates temporary static snapshots, sets the chosen edition only in those snapshots, and removes them afterward. It never deploys the production Worker. Running the script without a mode validates a preview instead of uploading it.

Each upload returns an immutable version URL and a stable alias URL. The stable alias moves forward when that design is uploaded again. Preview uploads leave production unchanged. To promote a chosen look, set `data-ui-edition="showroom"` or `data-ui-edition="workbench"` on the production `html` element, without the `data-ui-preview` attribute, and deploy through the normal production workflow. Showroom is currently selected. Keep the existing production backend and authentication; the read-only preview Worker is never promoted over it.

This workflow uses Cloudflare’s [version URL and alias mechanism](https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/) on a dedicated UI Worker. The main Worker exports a Durable Object; Cloudflare does not generate version URLs for Workers that implement one.
