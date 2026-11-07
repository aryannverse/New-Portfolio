# Portfolio plan: StringTune structure → Aryan's content

**How this was built.** string-tune.fiddle.digital belongs to Fiddle.Digital. Its website code isn't public. Its 3D katana, paintings, Aika/Oji characters, KH Teka fonts and copy are their brand assets. Following the two skills you pointed me to, this is a **reference build**, which means:
- **Reproduced:** the structure, grid, type scale, scroll choreography and interaction ideas.
- **Yours instead of theirs:** the name, imagery, 3D object, palette, fonts and copy.

The motion engine is **StringTune itself**, which is MIT-licensed and free to use, so the scroll feel and the split-text and parallax mechanics come from the same library their site runs on.

Measured from the source and reused: the 14/6-column grid (0.4rem gap, 1.6rem margins), the 1.333 modular type scale on a stepped 16/20/22/24/28px root, the easing curves, the 800vh word stage, the per-character blur-wave formula, the glass pill buttons and the header behaviour.

---

## Section map

| # | Source chapter (string-tune) | Your chapter | Content used | Status |
|---|---|---|---|---|
| — | — | **Preloader**: on a fresh entry or reload of the home page (or a first-ever visit): black screen, the bloom chapter's falling pixel flowers in three depths, a 0→100 counter bottom-left paced by real page load, then a glass prompt with a live equaliser (↵ with sound / esc silent); the prompt and flowers blur away and the black screen dissolves into pixels from the centre while the page comes into focus | — | ✅ |
| — | — | **Sound**: ambient track (loudness-normalised, moderate volume) with 1.8s fade-in / 0.9s fade-out, position remembered across pauses and reloads, and it never stops on page changes (Astro ClientRouter keeps the document; page scripts run on astro:page-load and clean up via src/scripts/life.ts); React Bits SoundEngine (vendored, React-free) plays *nib* on every click and *plush* on nav page changes; mute/unmute pill left of the info button (and in the phone menu) | — | ✅ |
| 0 | Header: logo mark, wordmark, `i` / Dev Guides / Skill Hub / Start a Project, scroll % | **Header**: `AV` mark, "Aryan Verma©" appears on scroll, `i` (info sheet) / Home / Work / Experience / Resume ↗, scroll %. The current page gets an accent ring and dot (Experience lights up while its chapter is on screen); clicking the page you're on just scrolls, with no page transition | name, resume link | ✅ |
| 1 | Welcome: giant "StringTune©", "Skill Hub" video card, katana | **Hero**: giant "Aryan Verma©" with a glass sheen, "Data meets design.", the large 3D MacBook over the ink tree (the *Latest work* card was removed) | role, location, Miraki | ✅ |
| 1b | Aika/Oji pixel character + dialogue bubble | **Pixel guide**: your cartoon portrait pixelated live in canvas, typewriter lines with Next | 3 guide lines | ✅ |
| 2 | "Concentrate / Keep Scrolling / The Spirit Awakened" (800vh) + rotating katana + red progress line | **Collect / Learn / Design**: the 3D MacBook (your GLB, Ferrari wallpaper) opens and turns above the words | ML pipeline metaphor | ✅ |
| 3 | Storm: painted band, pixel assembly, Master Oji dialogue, Skip, pixel dissolve to light | **Story / About**: Jaipur panorama assembles from a pixel mosaic, the MacBook glides across the band and closes, your bio types out, Skip, pixel wipe to light | bios (FAQ + funny ML/designer bios) | ✅ |
| 3a | Storm entry: the painting is letterboxed by black bars | **Bars in**: the Jaipur panorama assembles full-screen, then black bars slide in from the top and bottom edges to letterbox it under the dialogue | — | ✅ |
| 3b | Storm exit: the black bars withdraw and the site sits in an inset rounded window | **Frame**: during the story's pixel wipe the dark bars above/below the panorama glide out into a thin dark rim with rounded corners that frames every chapter after it (`src/scripts/frame.ts`) | — | ✅ |
| 4b | Tree + bamboo composition with falling pixels and cursor mosaic | **Bloom**: same paper tone as its neighbours with faded top/bottom edges (no seams), a noise-generated cloud bank, "Plant the seed… / Let it bloom…" over a cloudy paper sky and warm glows; a red-crowned generative tree, pixel-art flowers falling from its crown with depth of field (soft far layer, crisp fluttering mid layer, and a heavily blurred near layer that reads as drifting red glows, as on the source) pushed by gusting wind, cursor mosaic clipped to the tree | — | ✅ |
| 4 | "Take it… / And listen…" + falling pixels + tree and bamboo composition | **Find the pattern… / Then design it…** + falling accent pixels + parallax collage of your photos, quote and signature | 6 of your captures, quote, signature | ✅ |
| 5 | "To master the sword…" emblem + "Principles" + 5 techniques + sword | **Toolkit**: intro emblem + ghost name, then a logo wall modelled on nickho-motorsports.nl's sponsor section: 7 columns with rules that draw in, 32 tech logos from your résumé in 4 groups (columns 1·2 and 6·7, inner columns staggered, brand colour on hover), and a sticky MacBook spinning in the middle (scroll speeds it up) | résumé skills | ✅ |
| 6 | Masonry of 11 feature demo cards | **Selected work bento**: the 5 latest builds on light cards with animated, interactive SVG graphics (Veritas: data flowing through BM25/dense lanes → RRF → critics; Guardrails: tokens streaming through a shield and coming out redacted; SLM: a signal re-quantised 16→8→4→2 bit, cursor picks the bits; MCP: tool nodes orbiting a hub with request pulses; Vol Surface: a live wireframe IV surface the cursor tilts), "20+ projects", a root-cause gauge (counts 50 → 18 min while the dial sweeps; replays on hover), "Currently @ Ninebar.ai" turns red on hover, the awards ticker now leads with the ICAIN 2026 paper, a cross-fading captures tile, "Currently @ Ninebar.ai", awards ticker (résumé), contact card, link to all projects; **My captures** opens a gallery sheet (same shrink choreography as the info sheet) with a balanced masonry of 17 frames from the old Framer site | projects, stats, awards, captures | ✅ |
| 7 | "Who It's For": 3 cards on a wheel around an emblem over a ripple video | **Three Personalities**: the same wheel: active card upright on top, the others tilted back in 3D and greyed; hover lifts a card, click turns the wheel (1.8s) to bring it to the top, and the AV discs re-form per card; radial lines over a blurred ripple; the centre is React Bits' Strands glass orb (ported to vanilla WebGL2, brand palette, light mode) which reacts to hover and pulses when a card is chosen | approach section | ✅ |
| 8 | "Code With Clarity": sticky big word swap + 4 steps filling in | **Work With Clarity**: at rest the stage shows "( signature )"; scrolling blurs it away and Ninebar → Ericsson → Azalio → IEEE CS swap in (eased, slower fills), 4 roles fill word by word, ink shape rises | experience (4 roles, from the new résumé) | ✅ |
| 9 | Footer: "Attribute ⟷ driven." impulse string, statements, mirrored giant name, フィドル, octagon | **Contact**: "Let's ⟷ talk." with a pluckable spring string, 3 statements, email + socials, mirrored name, आर्यन वर्मा, octagon photo | contact, socials, resume | ✅ |
| 1c | Painted tree in an octagon behind the katana | **Generative ink tree** (sepia line-art, red gulmohar blossoms, seeded so it's always the same tree) in an octagon behind the title; grows in on load, drifts with scroll and cursor | — | ✅ |
| 10 | `i` button → info pop (page shrinks to a 0.13 thumbnail, sheet animates in) | **Info sheet**: same choreography: page shrinks to a rounded thumbnail under a veil; name, close pill, nav pills (staggered), about paragraph rising line by line, flipping avatar card | about, links | ✅ |
| 11 | /skill-hub (3D drum list, sticky readouts, impulse string, W/S/Enter keys, Change view catalogue) | **/work**: same layout and motion with 8 projects in 5 categories; every project has its own animated, interactive dark-theme SVG graphic (same component as the bento: cursor parallax, hover speed-up; only the centred card animates); `[soon]` for items without a public link | projects + résumé projects | ✅ |
| 12 | Route transitions | **"The deck"**: the page shrinks into a card (same gesture as the info sheet), slides away as the next page rises in as a card, then opens to full screen; reversed when going home. Native View Transitions in Chrome/Edge/Safari, curtain fallback elsewhere | — | ✅ |
| — | /dev-guides | — | — | ⏭ phase 2 |

---

## Where the rest of your old site fits (phase 2)

| From aryannverse.framer.ai | Proposal |
|---|---|
| 5 case studies (Leukemia, Miraki, Genesis, Hackerzstreet, BSM). The text was extracted in full | `/work/[slug]` pages using Astro content collections (Markdown per project). Cards currently link to GitHub, Behance or the live app, so I'd switch them to the case-study pages with a page transition |
| /photography gallery + video | Done as the captures sheet; swap the photos in `captures` (`src/data/site.ts`, files in `public/media/gallery/`) |
| Awards (4) with descriptions | Currently a ticker. Could become an expandable list in the info dialog or a strip under Experience |
| FAQ (4 Q&As) | Folded into the `i` dialog. Could become an accordion before the footer |
| Contact form ("Fill this form out") | Add a form in the footer that sends to Formspree, Resend or a Vercel serverless function. Today it's a mailto link |
| Live clock "LOCAL/" in the old header | Easy to add next to the scroll % |

---

## What I need from you

0. **Work page.** 22 entries: your public repos plus the ISL patent and design work. Every card has a custom drawn cover (no screenshots), and every link goes to its GitHub repo, except Miraki and Genesis, which link to Behance. Garb by GTC was removed at your request. Skipped: your profile-config repo and the two forks (HackX3.0, Git-It-Done-IEEECS); the older EfficientNet leukemia repo is folded into Leukemia Detection. Anchor (`Anchor-Ninebar.ai`) is excluded at your request. Hackerzstreet and the ISL patent show `[soon]`.
0. **Ninebar.ai description** for the Experience chapter (placeholder text for now, `experience.roles[0]` in `src/data/site.ts`).

1. **Accent colour.** Now a deep red `#b5302a` (matches the Ferrari screen and the bloom tree) for the logo mark, active nav, pixels and highlights. It's one line in `tokens.css`. Note: `public/og.jpg` (the social preview image) still has the old blue mark and should be regenerated.
2. **Asset rights.** All photos are from your Framer site. Please confirm they're yours, especially the cartoon portrait (`aryan-toon`), the eye macro and the Jaipur panorama, plus any you'd rather drop.
3. **Better source images.** Some Framer exports are compressed. Originals would help for the panorama (wide, 2400px+), the hero card and your portrait.
4. **Copy decisions.** Check these in `src/data/site.ts`:
   - the three stage words (*Collect / Learn / Design*)
   - the guide lines
   - the "Toolkit" kicker
   - the stats: "22% happy clients" and "5+ years" are jokes carried over from your old site; keep them?
   - the Hackerzstreet link, which on your old site points to a Framer template URL
5. **3D MacBook.** Uses your `Macbook 3D model (MahdiEdits)/Macbook.glb`, compressed to 1.1 MB in `public/models/macbook.glb`. Please confirm you have the right to publish it, and note the Ferrari wallpaper and Apple logo are third-party trademarks. Fine on a personal portfolio, but worth knowing.
6. **Domain** for `astro.config.mjs` `site` (canonical + OG URLs).

---

## Known deviations and notes

- **No Fiddle assets.** The katana GLB, paintings, characters, KH Teka fonts and copy are not used. The type uses your fonts: **Clash Display** (ITF Free Font License, which allows self-hosting) and **Inter**, plus Geist Mono for the micro labels. Both Inter and Geist Mono are OFL.
- **The 3D MacBook** is your GLB, re-compressed with meshopt + WebP (9.2 MB → 1.1 MB). It is downloaded once and shared by the hero and Toolkit scenes, loads after first paint, and each canvas renders only while visible. Toolkit logos are from Simple Icons (CC0), rendered as inline SVG at build time.
- **Cursor and the plucked string are custom code**, not StringTune modules: they're lighter and fully controllable.
- **Hover mosaic:** a soft, ragged brush follows the cursor and turns the object under it into a crisp nearest-pixel mosaic that then dissolves, clipped to the object's own silhouette (both MacBooks and the Bloom tree; `src/scripts/pixeltrail.ts`).
- **Mobile:** a glass hamburger opens a glass bar of links that drops from the top (Work, Experience, Info, Resume); native scroll, a smaller MacBook, the Toolkit wall as 4 columns under the MacBook, the guide hidden under 640px, and the hero name on two lines.
- **Accessibility:**
  - skip link
  - semantic landmarks and headings
  - every animated split word keeps an `aria-label`
  - the about dialog is a native `<dialog>` (Esc and backdrop close it)
  - visible focus
  - `prefers-reduced-motion` turns off smooth scroll, the blur waves, the falling pixels and the MacBook's float and spin
- **Verified:** `astro check` reports 0 errors; the production build is clean; the console is empty; all network requests are local; frames were reviewed at 1440, 768 and 390. Interaction checks covered the cursor states, guide, dialog, Skip, header theme switching, the string pluck and reduced motion.
- **Not pixel-diffed against the source.** In a reference build the content differs on purpose, so fidelity is to layout and motion rather than pixels.
