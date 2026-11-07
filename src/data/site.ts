/**
 * All portfolio content lives here. Components only read from this file,
 * so copy edits never require touching layout code.
 * Source: https://aryannverse.framer.ai (extracted 2026-11-06).
 */

export const person = {
  name: "Aryan Verma",
  first: "Aryan",
  last: "Verma",
  initials: "AV",
  role: "Data Science & Analysis + UI/UX",
  location: "New Delhi, India",
  availability: "Available worldwide",
  estd: "Estd. 30 July 2005",
  email: "aryannverse@gmail.com",
  resume: "https://drive.google.com/file/d/17WZSdia8nSppIF4iLty3egXvXF4ujDk9/view?usp=sharing",
  intro:
    "Outcome-focused Computer Science undergrad specialising in Artificial Intelligence and Machine Learning, with a strong foundation in data engineering and data analysis.",
  education: "CSE undergrad at Manipal University Jaipur, graduating 2027",
  seeking: "Pursuing roles in Machine Learning, Data Science & Product Design.",
};

export const social = [
  { label: "GitHub", short: "GH", href: "https://github.com/aryannverse" },
  { label: "LinkedIn", short: "IN", href: "https://www.linkedin.com/in/aryannnnverma/" },
  { label: "Instagram", short: "IG", href: "https://www.instagram.com/aryannverse/" },
];

export const meta = {
  title: "Aryan Verma — ML, Data Science & Product Design",
  description:
    "Aryan Verma is a Computer Science undergrad in New Delhi specialising in Machine Learning, Data Science and UI/UX — building models that learn and interfaces people enjoy.",
};

/** Hero dialogue: the pixel guide in the corner. */
export const guide = {
  name: "Aryan",
  lines: [
    "Hey there, wanderer! 👋 Welcome to the Aryanverse, where data meets design.",
    "I build models that learn, and interfaces people actually enjoy.",
    "Keep scrolling. The good stuff is below ↓",
  ],
};

/** Words that blur in and out during the first long scroll stage. */
export const transitionWords = ["Collect", "Learn", "Design"];

/** Chapter 2 — the dialogue over the panorama (replaces the "storm"). */
export const story = {
  speaker: "Aryan, 21",
  lines: [
    "Ah, you've finally scrolled this far…",
    "Hi! Myself Aryan — a CSE undergrad specialising in **Machine Learning** and **AI**.",
    "Professional Googler pretending to be an ML Engineer. I write code that works, I just don't know why it works.",
    "Also a **product designer**: I can break the grid, the colour palette and the developer's spirit, simultaneously.",
    "Powered by caffeine, hex codes and files named final_final_v3_REAL.fig. Let me show you around…",
  ],
};

/** Chapter 3 (light) — two words then the photo composition. */
export const listenWords = ["Find the pattern…", "Then design it…"];

/** Light chapter with the red tree and falling pixel flowers (Bloom.astro). */
export const bloom = {
  label: "Plant the seed",
  words: ["Plant the seed…", "Let it bloom…"],
  caption: ["Ship small,", "let the data grow it."],
};
export const quote = {
  text: "Never follow anyone else's path. Unless you're in the woods and you're lost and you see a path. Then by all means follow that path.",
  aside: "Data in. Design out.",
};

/**
 * Chapter 4 — Toolkit. Intro + a logo wall (layout after nickho-motorsports.nl's sponsor wall):
 * four columns of tech logos around a spinning MacBook. Stack taken from the résumé.
 * `icon` = Simple Icons slug (CC0, simpleicons.org); `name` overrides the display title.
 */
export const approach = {
  kicker: ["To read the data", "is to read the people…"],
  linesLeft: "To model the world…",
  linesRight: "is to design for it.",
  title: "Toolkit",
  side: "Stack & tools / from the résumé",
  groups: [
    { title: "Languages & tools", tools: [
      { icon: "python" }, { icon: "cplusplus" }, { icon: "javascript" }, { icon: "typescript" },
      { icon: "html5", name: "HTML" }, { icon: "css" }, { icon: "git" }, { icon: "linux" },
    ] },
    { title: "ML & deep learning", tools: [
      { icon: "pytorch" }, { icon: "tensorflow" }, { icon: "keras" }, { icon: "scikitlearn" },
      { icon: "huggingface" }, { icon: "opencv" }, { icon: "numpy" }, { icon: "pandas" },
    ] },
    { title: "LLMs & agents", tools: [
      { icon: "langchain" }, { icon: "langgraph" }, { icon: "modelcontextprotocol", name: "MCP" }, { icon: "claude", name: "Claude Code" },
      { icon: "googlegemini", name: "Gemini" }, { icon: "ollama" }, { icon: "pydantic" }, { icon: "n8n" },
    ] },
    { title: "Data, serving & DevOps", tools: [
      { icon: "fastapi" }, { icon: "streamlit" }, { icon: "nextdotjs", name: "Next.js" }, { icon: "docker" },
      { icon: "gitlab", name: "GitLab CI/CD" }, { icon: "sonarqubeserver", name: "SonarQube" }, { icon: "duckdb" }, { icon: "sqlite" },
    ] },
  ] as { title: string; tools: { icon: string; name?: string }[] }[],
};

export type Project = {
  slug: string;
  title: string;
  short: string;
  category: string;
  year: string;
  client: string;
  duration: string;
  summary: string;
  image: string;
  link: { label: string; href: string } | null;
};

export const projects: Project[] = [
  {
    slug: "leukemia-detection",
    title: "Leukemia Detection using CNN",
    short: "Leukemia Detection",
    category: "Deep Learning",
    year: "2025",
    client: "Me. I need projects.",
    duration: "1 week",
    summary:
      "Transfer learning on EfficientNetB3 to tell normal white blood cells from Acute Lymphoblastic Leukemia blasts in the C-NMC dataset — 95% overall accuracy.",
    image: "/media/work-leukemia.webp",
    link: { label: "GitHub", href: "https://github.com/aryannverse/Leukemia-Detection-Using-DenseNet121-CNN" },
  },
  {
    slug: "miraki",
    title: "Miraki",
    short: "Miraki",
    category: "Product Design · Case Study",
    year: "2025",
    client: "Microsoft SEFA Program",
    duration: "2–3 weeks",
    summary:
      "A discovery engine that connects every student with their perfect project — smart filters, profile-aware suggestions and accessibility-ready teams.",
    image: "/media/work-miraki.webp",
    link: { label: "Behance", href: "https://www.behance.net/gallery/232511369/MIRAKI-Find-Your-Intellectual-Partner" },
  },
  {
    slug: "genesis",
    title: "Genesis 5.0",
    short: "Genesis 5.0",
    category: "Design & Branding",
    year: "2025",
    client: "Genesis MUJ",
    duration: "Brand identity",
    summary:
      "Brand identity for IEEE MUJ's tech fest — the formation of a technological revolution, from yesterday towards a greater tomorrow.",
    image: "/media/work-genesis.webp",
    link: { label: "Behance", href: "https://www.behance.net/gallery/229626315/Genesis-40-Brand-Identity" },
  },
  {
    slug: "hackerzstreet",
    title: "Creating Hackerzstreet 3.0",
    short: "Hackerzstreet 3.0",
    category: "Design",
    year: "2025",
    client: "IEEE CS MUJ",
    duration: "24-hour hackathon",
    summary:
      "Identity, posters, ID cards and photo boards for IEEE's 24-hour coding marathon held in the second week of April.",
    image: "/media/work-hs3.webp",
    link: null,
  },
  {
    slug: "bsm-model",
    title: "BSM Option Pricing Model",
    short: "BSM Pricing",
    category: "Finance · Python",
    year: "2025",
    client: "Me. I still need projects.",
    duration: "Web app",
    summary:
      "An interactive Streamlit tool that prices European calls and puts with the Black-Scholes-Merton model, complete with P&L heatmaps.",
    image: "/media/work-bsm.webp",
    link: { label: "GitHub", href: "https://github.com/aryannverse/BSM-Option-Pricing-Model" },
  },
];

export const stats = [
  { value: "20+", label: "Projects shipped" },
  { value: "5+", label: "Years of experience" },
  { value: "20+", label: "Years spent on Earth" },
  { value: "22%", label: "Happy clients" },
];

export const awards = [
  { title: "Paper accepted — ICAIN 2026", issuer: "Quantization vs. Clinical Safety: Benchmarking Sub-4B SLMs for Offline Rural Medical Triage · BITS Pilani Dubai Campus", year: "Nov 2026" },
  { title: "Dean's List ×3", issuer: "Manipal University Jaipur", year: "2024 — 2026" },
  { title: "SCSE Excellence Award ×2", issuer: "Manipal University Jaipur", year: "2025" },
  { title: "Patent filed — ISL translation", issuer: "LiDAR + CNN-Transformer", year: "2026" },
  { title: "NPTEL — ML & DAA", issuer: "Chennai Mathematical Institute", year: "2025" },
]

/** Chapter 6 — three rotating cards (mirrors "who it's for"). */
export const personalities = {
  title: ["Three", "Personalities"],
  lead: "One curious mind, three ways of working — each one feeding the next.",
  left: "For when the data needs a story",
  right: "Model, ship, iterate",
  cards: [
    { title: "Data Science & Analysis", text: "Uncovering patterns in complexity — rigorous EDA and feature engineering before a single model is trained." },
    { title: "ML, DL, NLP & GenAI", text: "CNNs, Transformers and LLMs — systems that learn and adapt. Always a work in progress." },
    { title: "Product Design & UI/UX", text: "Translating sophisticated backend logic into interfaces that feel effortless to use." },
  ],
};

/** Chapter 7 — experience (mirrors the sticky "clarity" words + 4 steps). */
export const experience = {
  title: ["Work", "With", "Clarity"],
  side: "Internships, leadership & the odd all-nighter",
  roles: [
    {
      word: "Ninebar",
      company: "Ninebar.ai",
      role: "AI Systems Engineering Intern",
      dates: "Aug 2026 — Present",
      text: "Building AI systems at Ninebar.ai. Full write-up coming soon.", // TODO: description from Aryan
    },
    {
      word: "Ericsson",
      company: "Ericsson, Noida",
      role: "AI & Integrations Intern",
      dates: "Jun — Aug 2026",
      text: "Built a Llama 3.3 log-analysis service used weekly by 12 engineers (root-cause time 50 → 18 min), custom MCP servers for SonarQube, Nexus and GitLab, and a three-environment CI/CD pipeline.",
    },
    {
      word: "Azalio",
      company: "Azalio Technologies",
      role: "AI/ML Intern",
      dates: "Dec 2025 — Mar 2026",
      text: "Shipped 10 production agents on LangChain and LangGraph with Gemini, with retries and human-in-the-loop approvals, removing 4 hours a week of manual data entry per client team.",
    },
    {
      word: "IEEE CS MUJ",
      company: "IEEE Computer Society MUJ",
      role: "Managing Director",
      dates: "May 2025 — Apr 2026",
      text: "Scaled the society to 150+ active team members and 1,500+ members, ran 10+ national hackathons, datathons and talks, and owned branding for every event.",
    },
  ],
};

/** Footer / contact. */
export const contact = {
  left: "Let's",
  right: "talk.",
  statements: [
    "Freelance? Short answer: yes.",
    "Open to ML, Data Science & Product roles.",
    "Based in New Delhi, available worldwide.",
  ],
  more: { label: "Download resume", href: person.resume },
  subs: ["© Aryan Verma", "Data science & analysis + UI/UX", "Made in New Delhi", "’26"],
};

/** Header navigation. */
export const nav = [
  { label: "Home", href: "/", cursor: "cursor-route" },
  { label: "Work", href: "/work", cursor: "cursor-route" },
  { label: "Experience", href: "/#experience", cursor: "cursor-route" },
];


/**
 * The "i" page (after the info pop-up on string-tune.fiddle.digital):
 * the whole site shrinks into a thumbnail and this sheet takes over.
 * Words between ** ** are highlighted.
 */
export const info = {
  about:
    "**Aryan Verma** is a final-year Computer Science student (AI & ML, CGPA 8.93, three-time Dean's List) who builds and ships working AI systems: LLM agents, retrieval pipelines and the interfaces people use them through. Now an AI systems engineering intern at **Ninebar.ai**, after **Ericsson** and **Azalio**; led the IEEE Computer Society at MUJ, and still designs everything twice.",
  copy: "© Aryan Verma · New Delhi, IN · Estd. 2005",
  nav: [
    { label: "Home", href: "/", kind: "route" },
    { label: "Work", href: "/work", kind: "route" },
    { label: "Experience", href: "/#experience", kind: "route" },
    { label: "Gallery", href: "#gallery", kind: "sheet", sheet: "gallery" },
    { sep: true },
    { label: "Resume", href: person.resume, kind: "newtab" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/aryannnnverma/", kind: "newtab" },
    { label: "Email me", href: `mailto:${person.email}`, kind: "newtab" },
    { sep: true },
    { label: "GitHub", href: "https://github.com/aryannverse", kind: "newtab", icon: "github" },
    { label: "Instagram", href: "https://www.instagram.com/aryannverse/", kind: "newtab", icon: "instagram" },
  ] as ({ sep: true } | { label: string; href: string; kind: "route" | "newtab" | "sheet"; sheet?: string; icon?: string; sep?: undefined })[],
};

/**
 * /work — the project hub (layout after string-tune.fiddle.digital/skill-hub).
 * Items without `image` get a generated cover (`cover` = diagram style).
 * `href: null` renders as "[soon]" and isn't clickable.
 */
export type WorkItem = {
  title: string; year: string; tags: string[]; blurb: string;
  image?: string; cover?: string;
  href: string | null; label?: string; soon?: string;
};
export const work = {
  title: ["Selected", "Work"],
  aside: "Builds & case studies",
  categories: [
    { name: "AI Systems & Agents", items: [
      { title: "LLMOps Guardrails", year: "2026", cover: "shield", tags: ["LLM security", "DeBERTa-v3", "PII", "Groq"],
        blurb: "Zero-trust gateway between untrusted prompts and LLM APIs: checksum-validated PII redaction, sliding-window injection detection, then the model.",
        href: "https://github.com/aryannverse/LLMOps-Guardrails-Gateway", label: "GitHub" },
      { title: "GitLab MCP Server", year: "2026", cover: "mcp", tags: ["MCP", "TypeScript", "GitLab", "Docker"],
        blurb: "Production MCP server for GitLab: 218 tools in 20 toolsets, safety tiers, on-demand loading, stdio / HTTP / SSE. Built for Antigravity and Claude Code.",
        href: "https://github.com/aryannverse/Custom-GitLab-MCP", label: "GitHub" },
      { title: "Veritas", year: "2026", cover: "rag", tags: ["Hybrid RAG", "Multi-agent", "FastAPI", "Next.js"],
        blurb: "Hybrid-retrieval RAG (BM25 + dense, RRF, cross-encoder) with three critic agents and an adjudicator that audits every answer.",
        href: "https://github.com/aryannverse/Veritas", label: "GitHub" },
      { title: "Custos", year: "2026", cover: "sql", tags: ["Text-to-SQL", "SQLGlot", "DuckDB", "Streamlit"],
        blurb: "Read-only AI database assistant: schema-aware text-to-SQL with AST-level guardrails, so no mutation ever slips through.",
        href: "https://github.com/aryannverse/custos", label: "GitHub" },
      { title: "Log Analysis", year: "2026", cover: "logs", tags: ["LLM", "Groq", "Ollama", "Anomaly triage"],
        blurb: "Interactive log-analysis dashboard with a real-time anomaly-triage pipeline powered by Qwen on Groq.",
        href: "https://github.com/aryannverse/Log-Analysis", label: "GitHub" },
      { title: "A/V Summarizer", year: "2026", cover: "wave", tags: ["Whisper", "Speech-to-text", "Streamlit"],
        blurb: "Real-time audio and video ingestion: local Whisper transcription, summarised as it plays.",
        href: "https://github.com/aryannverse/Real-Time-Audio-Video-Summarizer", label: "GitHub" },
      { title: "Gemini × OpenBnB", year: "2026", cover: "bnb", tags: ["Gemini 2.0", "MCP", "Full-stack"],
        blurb: "Full-stack agent that bridges Gemini 2.0 Flash with Airbnb listings through OpenBNB and the Model Context Protocol.",
        href: "https://github.com/aryannverse/Gemini-MCP-Openbnb", label: "GitHub" },
    ] },
    { name: "Research & Deep Learning", items: [
      { title: "SLM Clinical Safety", year: "2026", cover: "quant", tags: ["Paper · ICAIN 2026", "SLMs", "GGUF"],
        blurb: "Does quantization make small language models unsafe for rural triage? 24,000 generations across three sub-4B SLMs and bit-widths. Accepted at ICAIN 2026 (BITS Pilani Dubai).",
        href: "https://github.com/aryannverse/slm-clinical-safety-quantization", label: "GitHub" },
      { title: "Leukemia Detection", year: "2026", cover: "cells", tags: ["TensorFlow", "DenseNet121", "Streamlit"],
        blurb: "ALL-vs-HEM classifier on C-NMC microscopy, 95.5% on 1,600 held-out images, served live through Streamlit.",
        href: "https://github.com/aryannverse/Leukemia-Detection-Using-DenseNet121-CNN", label: "GitHub" },
      { title: "ISL Translation", year: "2026", cover: "isl", tags: ["LiDAR", "CNN-Transformer", "Patent"],
        blurb: "Two-way Indian Sign Language translation: RGB hand landmarks lifted to 3D with solid-state LiDAR, classified by a hybrid CNN-Transformer.",
        href: null, soon: "patent pending" },
      { title: "Quantum Lottery", year: "2026", cover: "qubit", tags: ["Quantum", "Grover's algorithm", "Python"],
        blurb: "A lottery drawn with quantum randomness, then found with Grover's search instead of brute force.",
        href: "https://github.com/aryannverse/Quantum-Lottery-System-using-Grovers-Algorithm", label: "GitHub" },
    ] },
    { name: "Data, Sport & Finance", items: [
      { title: "Neural Vol Surface", year: "2026", cover: "surface", tags: ["Neural nets", "Options", "Streamlit"],
        blurb: "Institutional-style research platform that forecasts the implied-volatility surface of options markets.",
        href: "https://github.com/aryannverse/Neural-Volatility-Surface-Forecaster", label: "GitHub" },
      { title: "FIFA 2026 Predictor", year: "2026", cover: "bracket", tags: ["Elo", "Monte Carlo", "Regression"],
        blurb: "Elo ratings, regression and Monte-Carlo simulation of the 2026 World Cup, as a live dashboard.",
        href: "https://github.com/aryannverse/FIFA-2026-WC-Prediction", label: "GitHub" },
      { title: "Offside Datathon", year: "2026", cover: "pitch", tags: ["Ensembles", "Football", "Kaggle-style"],
        blurb: "Ensemble that predicts whether a player scores in a match: 0.53 average precision on attackers.",
        href: "https://github.com/aryannverse/Offside-Datathon-CS", label: "GitHub" },
      { title: "BSM Option Pricing", year: "2025", cover: "option", tags: ["Python", "Black-Scholes", "Streamlit"],
        blurb: "Interactive Black-Scholes-Merton pricer with heatmaps for every Greek, live on Streamlit.",
        href: "https://github.com/aryannverse/BSM-Option-Pricing-Model", label: "GitHub" },
      { title: "F1 Race Predictor", year: "2025", cover: "track", tags: ["FastF1", "ML", "Streamlit"],
        blurb: "Predicts Formula 1 results from real qualifying data and live timing with FastF1 and machine learning.",
        href: "https://github.com/aryannverse/Formula-1-Prediction-Model", label: "GitHub" },
      { title: "F1NALYZE", year: "2025", cover: "laps", tags: ["EDA", "Pandas", "FastF1"],
        blurb: "Exploratory analysis of the 2024 British Grand Prix, lap by lap.",
        href: "https://github.com/aryannverse/F1NALYZE", label: "GitHub" },
    ] },
    { name: "Web & Apps", items: [
      { title: "Coinflow", year: "2026", cover: "coin", tags: ["Next.js", "TypeScript", "Fintech"],
        blurb: "Sets aside your bills and basics, then tells you, calmly, what's safe to spend until payday.",
        href: "https://github.com/aryannverse/coinflow", label: "GitHub" },
      { title: "Aether", year: "2026", cover: "synth", tags: ["MediaPipe", "Tone.js", "Vision"],
        blurb: "Touchless gesture synthesizer in the browser: MediaPipe hand tracking plays Tone.js sound.",
        href: "https://github.com/aryannverse/Aether", label: "GitHub" },
    ] },
    { name: "Product Design", items: [
      { title: "Miraki", year: "2025", cover: "match", tags: ["UX research", "UI", "Case study"],
        blurb: "A discovery engine that matches every student with their perfect project, built for the Microsoft SEFA program.",
        href: "https://www.behance.net/gallery/232511369/MIRAKI-Find-Your-Intellectual-Partner", label: "Behance" },
    ] },
    { name: "Branding", items: [
      { title: "Genesis 5.0", year: "2025", cover: "brand", tags: ["Identity", "Motion", "Print"],
        blurb: "Brand identity for IEEE CS MUJ's flagship tech fest, from logo system to stage visuals.",
        href: "https://www.behance.net/gallery/229626315/Genesis-40-Brand-Identity", label: "Behance" },
      { title: "Hackerzstreet 3.0", year: "2025", cover: "hack", tags: ["Identity", "Event", "Web"],
        blurb: "Visual identity and site for a national 36-hour hackathon.",
        href: null, soon: "case study soon" },
    ] },
  ] as { name: string; items: WorkItem[] }[],
};


/** Captures sheet (gallery): the old Framer frames mixed with newer ones (order is the display order). */
const g = (src: string, w: number, h: number, alt: string) => ({ src: `/media/gallery/${src}.webp`, w, h, alt });
export const captures = {
  title: "Captures",
  kicker: "Shot on whatever was in my pocket",
  photos: [
    g("dome-at-sunset", 1400, 788, "Dome silhouetted against a sunset"),
    g("jaipur-rooftops", 1400, 788, "Jaipur rooftops from a fort turret"),
    g("red-bull-f1-car", 863, 575, "With a Red Bull F1 show car"),
    g("osmo-camera", 788, 1400, "Filming on a DJI Osmo"),
    g("fest-night-gang", 1280, 1280, "The whole gang at the fest night"),
    g("fort-and-hills", 1400, 788, "Fort walls and the Aravalli hills"),
    g("pikachu-squishies", 787, 1400, "A handful of Pikachu squishies"),
    g("ieee-cs-team", 1400, 933, "The IEEE CS MUJ team"),
    g("mirror-selfie-blazer", 788, 1400, "Mirror selfie in a black blazer"),
    g("eye-macro", 1400, 788, "Macro of an eye"),
    g("concert-lights", 1400, 1400, "Selfie under concert lights"),
    g("green-atrium", 1400, 1333, "Thumbs up in a green atrium"),
    g("rooftop-above-the-city", 1400, 788, "On a rooftop above the city"),
    g("desk-and-coffee", 788, 1400, "Desk, laptop and a cup of coffee"),
    g("ethnic-trio", 1050, 1400, "Trio in ethnic wear"),
    g("crescent-moon", 788, 1400, "A crescent moon over the trees at dusk"),
    g("trustnet-26", 1400, 788, "Framed at TrustNet '26"),
    g("corridor-silhouette", 1050, 1400, "Silhouette at the end of a corridor"),
    g("rock-on-selfie", 1400, 1050, "Rock-on selfie with friends"),
    g("bw-suits-selfie", 1051, 1400, "Black-and-white mirror selfie in suits"),
    g("night-pavilion", 788, 1400, "A pavilion at night"),
    g("hackx-stamps", 788, 1400, "HackX “verified” stamps on wrists"),
    g("spidey-tee-cafe", 1050, 1400, "Spider-Man tee in a café"),
    g("paper-snake", 1400, 933, "A paper-cut snake"),
    g("palm-court-group", 1050, 1400, "Group photo under the palms"),
    g("tech-summit", 1051, 1400, "At the Tech Summit"),
    g("desk-with-a-view", 1400, 788, "Laptop on a desk by a high window"),
    g("fest-night-four", 1280, 1280, "Four friends at the fest night"),
    g("convener-pass", 1050, 1400, "Walkie-talkie and a convener pass"),
    g("ethnic-night-crowd", 1400, 1050, "Ethnic night crowd selfie"),
    g("india-gate", 1400, 630, "India Gate against a blue sky"),
    g("blue-hour-selfie", 788, 1400, "Mirror selfie in blue light"),
    g("mural-trio", 960, 1280, "Trio in front of a celestial mural"),
    g("fort-arch-selfie", 1400, 788, "Selfie with friends at the fort arches"),
    g("venom-desk", 1400, 933, "Desk with a Venom sketch"),
    g("suited-mirror-selfie", 744, 1116, "Suited-up mirror selfie"),
    g("concert-stage", 1400, 1400, "In front of the concert stage"),
    g("ieee-letters", 1400, 788, "Behind the IEEE letters"),
    g("ieee-summit-25", 1080, 1055, "On stage at IEEE Summit ’25"),
    g("dharma-hall-group", 780, 1040, "Group photo in the Dharma hall"),
    g("laptop-mirror", 787, 1400, "Selfie reflected in a laptop screen"),
    g("phone-camera-selfie", 1400, 788, "Selfie behind a phone camera"),
    g("night-crew", 1280, 1280, "The crew under stage lights at night"),
    g("ieee-cs-duo", 1400, 933, "IEEE CS MUJ duo"),
    g("ethnic-day-selfie", 1400, 1050, "Ethnic day selfie"),
    g("hackerzstreet-crew", 1400, 788, "The crew at Hackerzstreet 3.0"),
    g("fest-night-boys", 1280, 1280, "The boys at the fest night"),
    g("ieee-cs-family", 1400, 786, "The IEEE CS MUJ family, in black and white"),
  ],
};


/**
 * Apple Music card on the info sheet. Profile data from music.apple.com/profile/aryannverse.
 * Apple doesn't expose playlists on a signed-out profile, so list the public ones here:
 * { name, url, tracks? } — the card shows the first four.
 */
export const music = {
  name: "Aryan Verma",
  handle: "@aryannverse",
  url: "https://music.apple.com/profile/aryannverse",
  avatar: "/media/apple-music.webp",
  playlists: [
    { name: "Kashf // कश्फ़ 🪷", url: "https://music.apple.com/in/playlist/kashf-%E0%A4%95%E0%A4%B6-%E0%A4%AB/pl.u-MDAWvJDCAPqpz64", tracks: 50 },
    { name: "Cloud 9 ☁️", url: "https://music.apple.com/in/playlist/cloud-9/pl.u-XkD0vBrC2dZvr54", tracks: 46 },
  ] as { name: string; url: string; tracks?: number }[],
};
