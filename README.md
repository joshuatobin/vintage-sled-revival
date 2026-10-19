# Tobin's Ski-Doo Garage

Buildless static website. `dist/` is the published directory.

Includes two vehicle profiles, a guided restoration workflow, a parts/inspection tracker, actual purchase totals, workshop notes, a photo archive, source manuals and supplier leads.

## Guided restoration

Open **Guided restoration** or use **Continue walkthrough** from the overview. Each sled has its own 19-step record across six stages:

1. Discovery: evidence photos, chassis identity, installed engine, carburetor, drive/electrical equipment and matching references.
2. Inspection: condition findings and a disposition for each system's linked parts.
3. Parts plan: verified part/service specifications, supplier references and quantities.
4. Repair: completed work and installation records.
5. Checks & first run: documented service settings, pre-start review and run outcome.
6. Finish & handoff: finished photos, project summary and maintenance actions.

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
