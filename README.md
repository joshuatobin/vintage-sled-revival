# Tobin's Ski-Doo Garage

Buildless static website. `dist/` is the published directory.

Includes two vehicle profiles, a guided restoration workflow, a parts/inspection tracker, actual purchase totals, workshop notes, a photo archive, source manuals and supplier leads.

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

Steps support partial drafts and explicitly recorded blockers. Unknown identity remains open; the site never converts a hypothesis into a confirmed chassis year. Later stages require prior-stage completion. If evidence disappears, an earlier finding is reopened, or a required part returns to an unresolved status, affected completion is recalculated. New order entries require discovery and fitment information; previously recorded purchases are preserved.

Recorded chassis findings update the sled profile without changing the historical journal. Completing a guide step also creates a dated workshop entry.

The guide tracks a restoration process. Factory references and appropriate mechanical review still determine the actual procedures and settings. No operational oil ratio, test pressure, lubricant quantity or torque is invented by the app.

## Run and check

No dependency installation or build is needed. Serve `dist/` using any static web server. With Python installed:

```sh
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Node 20 or later runs the checks:

```sh
npm test
npm run check
```

`dist/guide.js` contains the pure workflow definitions and validation. `dist/guide-ui.js` renders the walkthrough and handles prompts. `dist/app.js` contains the garage, records, photos and browser persistence. Tests cover workflow dependencies, stale completion, evidence, purchasing requirements, rendering and saved-data migration.

## Cloudflare Workers

`wrangler.jsonc` serves the existing `dist/` folder as a static-assets Worker named `vintage-sled-revival`. There is no application build step or server-side data migration. The existing hash-based navigation works with static asset serving.

Install the deployment tools once, then validate without publishing:

```sh
npm ci
npm run cf:check
```

`npm run cf:dev` previews the Worker locally. `npm run cf:deploy` publishes using your Cloudflare CLI login; use it only when ready to deploy. Normal Python previews and the application checks above still need no dependency installation.

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

**Move your browser records:** before switching to a Cloudflare URL or custom domain, export a JSON backup from the browser and URL holding your current records. Open the new URL and import that backup. localStorage belongs to each origin, so hosting the same code at a new URL does not transfer parts, notes, guide findings or uploaded photos automatically. Keep the backup until the imported records are verified. The storage key and data format are unchanged.

References: [Workers static assets](https://developers.cloudflare.com/workers/static-assets/), [GitHub repository access](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/), [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## Records and backups

Edits persist in browser localStorage under `tobin-skidoo-garage-v1`. JSON export/import carries the full state, including guided findings, blockers, completion records and user-added resized photos. CSV exports the currently filtered parts list. No cross-device synchronization is implied. Updating the code never resets the storage key or existing parts, costs, journal entries or photos.

The repository contains the website source, supplied site photographs, tests and documentation. Browser records are not automatically committed to GitHub. Export a backup to preserve personal restoration records; exported backups and local environment files are ignored by Git.

## Identification policy

The early chassis is unconfirmed; 1963 is a working hypothesis. Engine serial transcription 1308696 and the supplied year chart are research leads only. The later chassis is provisionally SE8 / 1968 Olympique 300 E; the plate photograph is available, and the code interpretation remains an explicit discovery step. Factory specifications describe original models, not verified installed hardware.

The earlier shopping list's 293 cc, 69 mm 300E piston, 40:1 oil ratio, straight SAE30 chaincase fluid, production ordinal, and fixed bogie quantity are not treated as verified instructions.

## Primary references

- https://www.trailz.net/pub/Snowmobiles/SKIDOO/1996-1997/1997/MSPE_A97.PDF
- https://www.vintagesnow.com/Ski-Doo_files/1968%20Ski-doo%20Parts%20List%20.pdf
- https://vintagesnow.com/Ski-Doo_files/1960-1965%20Ski-doo%20Parts%20List.pdf
- https://museebombardier.com/en/services/

Photographs supplied by the owner. The 1968 gallery includes the owner-provided porch view, Super Olympique E seat badge, and chassis data plate. Built-in photo updates merge into saved browser data and imported backups without resetting parts, notes, or uploaded images.
