# Vintage Sled Revival interface

## Purpose

Joshua’s personal restoration log for two vintage Ski-Doos. Visitors follow published progress; Joshua signs in to add evidence and record work. The homepage must explain this before asking anyone to use a restoration form.

## Visual plan

Keep the established garage palette and supplied photographs:

- Workshop paper `#f6f5ef`: page background.
- Sled yellow `#f5bd28`: primary actions and selected navigation.
- Garage ink `#242822`: headings and the navigation rail.
- Field green `#4f6645`: recorded progress and supporting actions.
- Quiet text `#626a5d`: readable secondary copy.
- Divider `#dedfd6`: grouping where it clarifies relationships.

Retain Barlow Condensed for the garage identity and headings, DM Sans for instructions, controls, and records. Body copy on the homepage is larger than metadata. Align content left; keep explanatory paragraphs below 75 characters per line. Use one page heading.

Two structures considered:

```
A. Task dashboard                 B. Project homepage (chosen)
   next action / next action        name + plain explanation
   decorative hero                  [early sled] [Olympique]
   statistics                       purpose of each project + next step
   projects                         walkthrough / photos / parts / journal
```

A assumes the visitor already understands the garage, duplicates next actions, and gives competing meanings to progress. B makes the real sled photographs and project identities the focal point. It answers what this site is and where to begin without assuming a chassis year.

## Review against the brief

A generic marketing hero, invented illustrations, decorative numbers, and a statistics dashboard would obscure this personal restoration log. Use the owner’s two actual sled photos, working identity labels, real guide stage, and real next action instead. Avoid repeated slogans, two hero headings, and duplicated task prompts. Project numbers are unnecessary because these are two parallel projects, not a sequence.

The application navigation must say **Home**, including on a phone. The home link, brand, and root URL return to the introduction. Existing `#overview` links and guide deep links remain valid. The walkthrough stays a working tool reached from a project, with an obvious way home.

## Homepage hierarchy

1. **Vintage Sled Revival**: what it is, whose garage it is, and a clear invitation to explore.
2. **The sled projects**: two real photographs, provisional identity, current guide stage, next action, and separate project / walkthrough links.
3. **What you can do here**: explicit descriptions of the walkthrough, evidence archive, parts / costs, and workshop journal.
4. **Access**: anyone can read published progress; only the owner can add or edit records.

Use one progress measure on home: completed guide steps. Parts installation remains a separately named measure inside each project. Browser recovery is an expandable owner notice; actual publishing errors and active recovery previews remain prominent.

## Preserve

Keep the current photos, browser backups, shared data, authentication, guide validation, and purchase gates. The early sled’s chassis year is unconfirmed. Neither a visual refresh nor a working year label changes verification status.

## UI comparison: Showroom and Workbench

The approved navigation rail, mobile navigation, palette and saved records remain the baseline. The next pass explores the main canvas through two Cloudflare version previews on a dedicated UI Worker; production remains on the current homepage while the designs are compared.

Tokens stay workshop paper `#f6f5ef`, sled yellow `#f5bd28`, garage ink `#242822`, field green `#4f6645`, quiet text `#626a5d`, divider `#dedfd6`. Barlow Condensed remains the display face; DM Sans remains the reading and control face. Larger imagery, a deliberate type scale, more breathing room and fewer little boxes should carry the improvement.

```
Showroom                         Workbench
intro      two portrait photos   intro / project switcher
project summaries + next steps  large photo | active project / next action
tools, explained simply          evidence strip | latest workshop note
```

Showroom makes the real sleds the memorable element. It combines a photo-led opening with generous project summaries rather than repeating a full photo on every panel. Workbench makes the current project the focus: selecting a sled changes the photograph, next task and supporting evidence together. That selection is interface state only; it never edits the garage.

Review against the brief: a new navigation system or new colors would discard what the user already likes. Repeated small bordered panels would reproduce the current problem. Keep the shared navigation untouched, use the original portrait photographs at useful sizes, retain the plain explanation of the site, and use real findings rather than decorative statistics or invented restoration milestones. Each design must remain usable at phone widths and provide the same routes into the restoration workflow.

UI previews use a dedicated read-only Worker. It fetches only the public published garage snapshot from the existing site and never forwards authentication headers, cookies or writes. No production database binding or owner-login secrets are attached to design previews.

## Approved production direction

Joshua selected Showroom on October 19, 2026. Use its photo-led homepage in production, with the existing owner sign-in and shared garage backend. Workbench remains available for comparison. Future UI changes must follow the two-preview workflow in `AGENTS.md`; promoting this already-selected design does not require another comparison round.

## Paint reference previews

Keep Showroom and the existing palette and typography in both previews. Add a clearly named Paint codes & colors destination. This is a sourced reference library, independent of the saved restoration record: browsing a formula never confirms a chassis, chooses a paint, or unlocks ordering.

Two alternatives:

```
Swatchbook                       Reference ledger
explanation | color chips        explanation / evidence key
year / color / source / search   year / color / source / search
two-column reference cards       compact comparison table
expand sources + caveats         expand sources + caveats
unresolved questions             unresolved questions
```

Swatchbook uses the vernacular of physical paint samples, with generous cards and small color-family strips. Ledger is for comparing several codes at once, with source type and claimed years visible in rows. Both show actual research, source links, access requirements, and unresolved conflicts. Chips represent color families only; they never simulate a verified paint formula. Use paper, ink, green and yellow from the existing tokens; red `#ae4335` is limited to the red color-family illustration.

Review: a wall of realistic-looking yellow swatches could imply measured color accuracy we do not have. Use one illustrative set of family chips and textual codes instead. The historical chart groups 1964–1970 together, while a public group comment distinguishes 1964 from later yellows. Keep that disagreement visible. Distinguish an archived formula from a member's modern match; nothing in this first research pass confirms a paint for either sled. No member photographs, contact details or full posts are republished.

Joshua selected Swatchbook for production on October 19, 2026. Promote that layout at `#paint`, retaining Showroom on Home and the existing production data and authentication. The two paint previews remain available for reference.

## Early-year paint references

Joshua rejected the schematic sled illustrations: they did not resemble the original machines closely enough. Remove the drawings and their infographic downloads. Limit the range to the 1950s, 1960s and 1970s: 1959–1979. Do not use a generic or unchecked photograph as a substitute for an actual year/model example.

Retain the approved Showroom homepage, Swatchbook library, navigation, Barlow Condensed / DM Sans typography and yellow, olive, ink and paper palette. The additional content is a paint reference browser with illustrative swatches, model references, historical recipes and source links. Open paint-assignment questions and the 1964 disagreement stay visible. No project identity or saved progress changes.

Keep two alternatives on the dedicated preview Worker: **Year sheets** pairs one year with a larger swatch and sources; **Year gallery** shows compact swatch cards with 1950s/1960s/1970s filters and a detail dialog. Joshua selected **Year Sheets** on October 21, 2026. Promote that selected edition alongside Showroom and Swatchbook; no new comparison round is required for this promotion. Actual photographs can be added later when their model, year and provenance are established; never recolor a documentary photograph to imply a verified paint match.
