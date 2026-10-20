# Vintage Sled Revival

Read `README.md` and `DESIGN.md`, then inspect the existing app before changing it. Work in this local checkout. Showroom is the approved production homepage; Swatchbook is the approved Paint codes & colors layout.

## Required UI preview workflow

For every UI design or layout change, always create **at least two distinct, working design alternatives** and publish both using Cloudflare Worker version preview URLs before asking Joshua to choose a direction. Apply this to homepage, guided restoration and other interface changes. Two screenshots or two local URLs do not satisfy this requirement.

- Preserve the approved navigation and color palette unless Joshua explicitly requests changes.
- Use the frontend-design skill when available. Record the alternatives and design reasoning in `DESIGN.md`.
- Use the dedicated `vintage-sled-revival-designs` Worker and the workflow in `scripts/ui-preview.mjs`. Extend the variant implementation when needed so the previews actually show the proposed changes to the relevant page.
- Publish each alternative with its own stable alias. Include **clickable links to both previews** in the user-facing response, with a short explanation of their differences and a recommendation. Keep the links in `README.md` current.
- Verify each deployed preview loads actual published project data, behaves correctly on desktop and mobile, and enforces read-only access. Capture screenshots for visual review.
- Keep production on the approved design while alternatives are being compared. After Joshua chooses a preview and authorizes promotion, publish that selected design; do not require another pair of alternatives for that same promotion.
- Backend-only fixes and documentation-only changes do not require design alternatives. Explicit user instructions take precedence.

## Data and authentication

Preserve supplied photos, uploaded photos, published records, original browser backups and recovery drafts. Never reset or seed production data to demonstrate a design. The early sled's chassis year remains **unconfirmed**. A working year or model label must never count as verified identity or unlock parts ordering.

Keep the guided restoration workflow, evidence requirements, stage dependencies and purchase gates intact. Public visitors can read; only the authenticated owner can change records. Preserve Cloudflare Access JWT verification and server-side write enforcement.

UI previews must remain isolated and read only: use `worker/ui-preview.mjs`, only the static-assets binding, and the fixed public production read endpoint. Never forward cookies or authorization headers, attach production storage or owner-login secrets, or deploy the preview backend over production.

## Checks and release

Run `npm test`, `npm run check` and the appropriate Wrangler dry run (`npm run cf:check` for production, `npm run ui:preview -- <edition> check` for a preview). Use `npm run test:runtime` when changing Worker authentication, API behavior or storage. Inspect the deployed result before reporting completion.

Production uses `wrangler.jsonc`, Worker `vintage-sled-revival`, the existing `GARAGE` Durable Object and its tracked migration. Promote the chosen look with `data-ui-edition` on `dist/index.html`; production must not have `data-ui-preview="true"`. Keep the existing backend and authentication settings. Push approved releases to GitHub and verify the live homepage and public API. Never commit credentials, authentication tokens or exported garage backups.
