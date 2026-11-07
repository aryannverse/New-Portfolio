# Aryan Verma — Portfolio

<p align="center">
  <strong>Data Science & Analysis + UI/UX Design</strong><br>
  <em>Outcome-focused Computer Science undergraduate specializing in Artificial Intelligence & Machine Learning with strong product design expertise.</em>
</p>

<p align="center">
  <a href="https://aryannverse.vercel.app"><strong>Live Demo ↗</strong></a> •
  <a href="https://drive.google.com/file/d/17WZSdia8nSppIF4iLty3egXvXF4ujDk9/view?usp=sharing"><strong>Resume ↗</strong></a> •
  <a href="https://github.com/aryannverse"><strong>GitHub</strong></a> •
  <a href="https://www.linkedin.com/in/aryannnnverma/"><strong>LinkedIn</strong></a>
</p>

---

## ⚡ Overview

An interactive, high-performance personal portfolio built with **Astro**, **Three.js**, **StringTune**, and **WebGL**. 

Features custom 3D model choreography, generative pixel-art particle engines, continuous Web Audio across client-side view transitions, and an editorial 14/6-column layout.

### ✨ Key Features

- **Interactive 3D Apple MacBook (Three.js / WebGL)**:
  - Custom GLB model with Ferrari dashboard wallpaper, synchronized opening hinges, 3D turntable spin, and real-time scroll pose interpolation.
- **Continuous Sound Engine (Web Audio API)**:
  - Ambient relaxing background soundtrack with volume normalization, smooth fade in/out, and uninterrupted playback across page transitions via Astro ClientRouter.
  - Interactive tactile sound effects (*nib* click, *plush* navigation) ported from React Bits.
- **Generative Ink Tree & Bloom Particle Systems**:
  - Procedural Japanese ink tree canvas drawing seeded algorithmically.
  - Multi-layered flower petal particle falling system with depth-of-field simulation and interactive cursor wind turbulence.
- **Selected Work Bento Grid**:
  - Dynamic interactive SVG visualizers for machine learning & systems work (Veritas dense/sparse RRF, Guardrails PII redaction shield, SLM bit-quantization simulator, MCP tool orchestration orbit, Vol Surface 3D IV wireframe).
- **Interactive Work Hub (`/work`)**:
  - 3D drum list with sticky categorical readouts, W/S/Enter key navigation, and dynamic project filtering.
- **Photography Gallery**:
  - Fullscreen modal with balanced responsive masonry layout showcasing 40+ curated high-resolution captures in modern WebP.
- **Interactive Three Personalities Wheel**:
  - Vanilla WebGL2 Strands glass orb reaction with rotating 3D tilted card carousel.
- **Smooth View Transitions ("The Deck")**:
  - Native browser View Transitions API with card-scaling gesture choreography and smooth fallback.
- **Accessibility & Performance First**:
  - Full `prefers-reduced-motion` compliance, semantic markup, zero external UI framework bloat, and optimized assets.

---

## 🛠️ Tech Stack

- **Framework**: [Astro 5+](https://astro.build/) (Static Site Generation)
- **Language**: TypeScript
- **Motion & Scroll Engine**: [@fiddle-digital/string-tune](https://www.npmjs.com/package/@fiddle-digital/string-tune) (MIT)
- **3D Graphics & Shaders**: [Three.js](https://threejs.org/) & [OGL](https://github.com/oframe/ogl)
- **Typography**: [Inter Variable](https://fontsource.org/fonts/inter), [Geist Mono](https://fontsource.org/fonts/geist-mono), [Instrument Serif](https://fontsource.org/fonts/instrument-serif), [Zen Kaku Gothic New](https://fontsource.org/fonts/zen-kaku-gothic-new)
- **Icons**: Simple Icons
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📂 Project Architecture

```
.
├── astro.config.mjs         # Astro configuration (SSG, site origin, prefetch)
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vercel.json              # Vercel deployment and caching headers
├── docs/
│   └── PLAN.md              # Technical design specification & choreography plan
├── public/
│   ├── audio/               # Ambient audio track (Web Audio API)
│   ├── fonts/               # Web font assets
│   ├── media/               # WebP optimized imagery & gallery photos
│   └── models/              # Optimized 3D MacBook GLB asset
└── src/
    ├── components/          # Astro UI components
    │   ├── Approach.astro   # Toolkit & logo wall with 3D turntable
    │   ├── BentoArt.astro   # Interactive SVG graphics for ML projects
    │   ├── Bloom.astro      # Generative tree and drifting petal particles
    │   ├── Experience.astro # Career journey timeline
    │   ├── Footer.astro     # Contact section with pluckable spring string
    │   ├── GalleryPage.astro# Fullscreen photography masonry sheet
    │   ├── Header.astro     # Responsive navigation with sound toggle & resume
    │   ├── Hero.astro       # Landing hero with 3D model integration
    │   ├── InfoPage.astro   # Interactive modal dialog sheet
    │   ├── Listen.astro     # Quote & visual collage section
    │   ├── Overlays.astro   # Dynamic pixel guide typewriter
    │   ├── Personalities.astro # Interactive 3D cards wheel & Strands orb
    │   ├── Preloader.astro  # Initial loading screen with live equalizer
    │   ├── Stage.astro      # Multi-stage ML pipeline metaphor
    │   ├── Story.astro      # Pixel mosaic assembly & typewriter bio
    │   └── Work.astro       # Bento grid showcase
    ├── data/
    │   └── site.ts          # Centralized data store (content, projects, resume link)
    ├── layouts/
    │   └── Base.astro       # HTML shell, metadata, global scripts & fonts
    ├── pages/
    │   ├── index.astro      # Main landing experience
    │   └── work.astro       # Skill-hub catalogue view
    ├── scripts/             # TypeScript modules for physics, 3D, and audio
    │   ├── audio.ts         # Ambient sound & SFX manager
    │   ├── laptop.ts        # Three.js 3D MacBook controller
    │   ├── string.ts        # StringTune scroll observer boot
    │   ├── tree.ts          # Generative ink tree canvas
    │   └── ...
    └── styles/              # CSS tokens, base reset, and view transitions
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `22.12+` (tested on Node 22 and 24)
- **npm**, **pnpm**, or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/aryannverse/New-Portfolio.git
cd New-Portfolio

# Install dependencies
npm install
```

### Development & Build Commands

| Command | Action |
|---|---|
| `npm run dev` | Starts local dev server at `http://localhost:4321` |
| `npm run build` | Builds production-ready static output into `dist/` |
| `npm run preview` | Serves production build locally for performance checks |
| `npx astro check` | Runs Astro type diagnostics |

---

## 🚢 Deployment (Vercel)

The project is pre-configured with `vercel.json` for zero-configuration deployment on Vercel:

1. Push your changes to GitHub:
   ```bash
   git push origin main
   ```
2. Import the repository `aryannverse/New-Portfolio` on [Vercel](https://vercel.com/new).
3. Vercel automatically detects the **Astro** framework, sets the output directory to `dist`, and applies the cache headers from `vercel.json`.
4. Update the `site` property in `astro.config.mjs` with your production domain for canonical and OpenGraph URLs.

---

## 📄 License & Credits

- Website design, code, and personal assets © [Aryan Verma](https://github.com/aryannverse).
- Built with [StringTune](https://www.npmjs.com/package/@fiddle-digital/string-tune) (MIT License).
- Audio and visual effects ported from [React Bits](https://reactbits.dev).
- 3D model base by MahdiEdits (optimized and customized for real-time WebGL).
