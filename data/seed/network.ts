import type { Graph, Persona, Edge } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// SEED NETWORK — a believable, clustered warm-intro graph (~100 personas).
//
// This is the populated world the demo runs on. Personas are spread across 12
// communities with DECLARED two-sided offer/ask. Edges are CLUSTERED: dense
// inside a community, sparse bridges across — so 2nd-degree reach is rich and
// meaningful rather than random or fully-connected.
//
// GOLDEN PATH (must always hold): the ask
//   "a technical cofounder who knows payments infrastructure"
// returns Samuel Okoro (payments infra, ex-Adyen) as the top warm match, via
// Priya Nair (2nd degree). `me` connects to Priya; Priya connects to Samuel;
// `me` does NOT connect to Samuel directly. Curated demo asks are listed in the
// Track C summary.
//
// Avatar palette (community-keyed) keeps the viz legible.
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  founders: "#6366f1",
  fintech: "#ec4899",
  healthtech: "#f59e0b",
  ai: "#8b5cf6",
  design: "#14b8a6",
  infra: "#ef4444",
  growth: "#eab308",
  climate: "#22c55e",
  crypto: "#f97316",
  bio: "#06b6d4",
  investors: "#0ea5e9",
  recruiters: "#a855f7",
} as const;

export const PERSONAS: Persona[] = [
  // ── YOU ────────────────────────────────────────────────────────────────────
  {
    id: "me",
    name: "You",
    headline: "Founder, B2B SaaS",
    offer: "Generalist founder building a B2B SaaS for ops teams.",
    ask: "A technical cofounder who knows payments infrastructure.",
    community: "founders",
    avatarColor: COLORS.founders,
  },

  // ── FINTECH (golden-path cluster) ───────────────────────────────────────────
  {
    id: "priya",
    name: "Priya Nair",
    headline: "Product designer, fintech",
    offer:
      "Fintech-focused product designer, ex-Monzo. I design onboarding and money flows.",
    ask: "An intro to a healthtech operator.",
    community: "fintech",
    avatarColor: COLORS.fintech,
  },
  {
    id: "samuel",
    name: "Samuel Okoro",
    headline: "Payments infra eng, ex-Adyen",
    offer:
      "Payments infrastructure engineer. I built billing and ledger systems at Adyen.",
    ask: "An early-stage fintech to join as a technical cofounder.",
    community: "fintech",
    avatarColor: COLORS.fintech,
  },
  {
    id: "raj",
    name: "Raj Patel",
    headline: "Frontend engineer, dashboards",
    offer:
      "Frontend engineer specializing in fintech dashboards and data visualization.",
    ask: "Fractional frontend roles at a Series A startup.",
    community: "fintech",
    avatarColor: COLORS.fintech,
  },
  {
    id: "ethan",
    name: "Ethan Cole",
    headline: "Compliance lead, payments/KYC",
    offer: "Compliance lead for payments — KYC, licensing, and money transmitter rules.",
    ask: "Fintech advisory and fractional compliance roles.",
    community: "fintech",
    avatarColor: COLORS.fintech,
  },
  {
    id: "yuki",
    name: "Yuki Tanaka",
    headline: "Ledger engineer, ex-Wise",
    offer:
      "Backend engineer who builds double-entry ledgers and reconciliation pipelines, ex-Wise.",
    ask: "A staff engineering role at a payments company.",
    community: "fintech",
    avatarColor: COLORS.fintech,
  },
  {
    id: "carlos",
    name: "Carlos Mendes",
    headline: "Risk & fraud lead",
    offer: "Fraud and risk modeling lead — I cut chargebacks at two neobanks.",
    ask: "Fintechs scaling card programs who need fraud expertise.",
    community: "fintech",
    avatarColor: COLORS.fintech,
  },
  {
    id: "amara",
    name: "Amara Diallo",
    headline: "Fintech PM, lending",
    offer: "Product manager for consumer lending and BNPL products.",
    ask: "An intro to a fractional CFO for a seed-stage lender.",
    community: "fintech",
    avatarColor: COLORS.fintech,
  },
  {
    id: "sven",
    name: "Sven Larsson",
    headline: "Open banking engineer",
    offer:
      "Engineer specializing in open banking and PSD2 account-to-account integrations.",
    ask: "Contract work integrating banking APIs.",
    community: "fintech",
    avatarColor: COLORS.fintech,
  },

  // ── HEALTHTECH ──────────────────────────────────────────────────────────────
  {
    id: "dana",
    name: "Dana Levin",
    headline: "Healthtech operator",
    offer: "Healthtech operator — I scaled a digital clinic from 0 to 50 staff.",
    ask: "An intro to a great product designer.",
    community: "healthtech",
    avatarColor: COLORS.healthtech,
  },
  {
    id: "olu",
    name: "Olu Adeyemi",
    headline: "Founder, telehealth",
    offer:
      "Telehealth founder building remote patient monitoring for chronic care.",
    ask: "We are hiring a head of clinical operations in healthtech.",
    community: "healthtech",
    avatarColor: COLORS.healthtech,
  },
  {
    id: "rebecca",
    name: "Rebecca Stone",
    headline: "Clinical ops lead",
    offer: "Clinical operations lead — I stand up care teams and triage workflows.",
    ask: "A leadership role at a Series B telehealth company.",
    community: "healthtech",
    avatarColor: COLORS.healthtech,
  },
  {
    id: "imani",
    name: "Imani Brooks",
    headline: "Health data engineer",
    offer: "Data engineer for HL7/FHIR pipelines and EHR integrations.",
    ask: "An intro to a healthtech founder hiring engineers.",
    community: "healthtech",
    avatarColor: COLORS.healthtech,
  },
  {
    id: "tomas",
    name: "Tomas Vidal",
    headline: "Regulatory lead, medical devices",
    offer: "Regulatory affairs lead — FDA 510(k) submissions for medical devices.",
    ask: "Advisory roles with medtech startups.",
    community: "healthtech",
    avatarColor: COLORS.healthtech,
  },
  {
    id: "hannah",
    name: "Hannah Weiss",
    headline: "Behavioral health PM",
    offer: "Product manager for mental and behavioral health apps.",
    ask: "A senior PM role at a mission-driven health company.",
    community: "healthtech",
    avatarColor: COLORS.healthtech,
  },
  {
    id: "deepa",
    name: "Deepa Rao",
    headline: "Healthtech growth lead",
    offer: "Growth lead who scaled patient acquisition for two digital health brands.",
    ask: "An intro to a performance marketing agency for healthcare.",
    community: "healthtech",
    avatarColor: COLORS.healthtech,
  },

  // ── AI / ML ─────────────────────────────────────────────────────────────────
  {
    id: "wei",
    name: "Wei Zhang",
    headline: "ML engineer, LLM infra",
    offer:
      "Machine learning engineer building LLM serving and inference infrastructure.",
    ask: "A staff ML role at an applied AI startup.",
    community: "ai",
    avatarColor: COLORS.ai,
  },
  {
    id: "fatima",
    name: "Fatima Al-Rashid",
    headline: "Applied scientist, NLP",
    offer:
      "Applied scientist working on retrieval, RAG, and evaluation for NLP systems.",
    ask: "Research-adjacent roles at a frontier model lab.",
    community: "ai",
    avatarColor: COLORS.ai,
  },
  {
    id: "george",
    name: "George Nwosu",
    headline: "Founder, AI agents",
    offer: "Founder building autonomous AI agents for back-office automation.",
    ask: "A founding ML engineer who knows agent frameworks.",
    community: "ai",
    avatarColor: COLORS.ai,
  },
  {
    id: "lucia",
    name: "Lucia Ferrari",
    headline: "ML platform lead",
    offer: "I build feature stores and ML platforms for data science teams.",
    ask: "A head-of-platform role at a Series B AI company.",
    community: "ai",
    avatarColor: COLORS.ai,
  },
  {
    id: "ravi",
    name: "Ravi Krishnan",
    headline: "Computer vision engineer",
    offer: "Computer vision engineer for robotics and industrial inspection.",
    ask: "An intro to robotics founders building perception stacks.",
    community: "ai",
    avatarColor: COLORS.ai,
  },
  {
    id: "nadia",
    name: "Nadia Petrova",
    headline: "AI product lead",
    offer: "Product lead shipping LLM-powered features in consumer apps.",
    ask: "A head of product role at an AI-native startup.",
    community: "ai",
    avatarColor: COLORS.ai,
  },
  {
    id: "kojo",
    name: "Kojo Mensah",
    headline: "MLOps engineer",
    offer: "MLOps engineer automating training pipelines and model monitoring.",
    ask: "Contract MLOps work for teams putting models into production.",
    community: "ai",
    avatarColor: COLORS.ai,
  },

  // ── DESIGN ──────────────────────────────────────────────────────────────────
  {
    id: "mara",
    name: "Mara Quinn",
    headline: "Principal product designer",
    offer:
      "Principal product designer for complex B2B and data-heavy enterprise tools.",
    ask: "A staff design role at an infra or devtools company.",
    community: "design",
    avatarColor: COLORS.design,
  },
  {
    id: "ben",
    name: "Ben Carter",
    headline: "Brand & visual designer",
    offer: "Brand designer — identity systems, type, and visual language for startups.",
    ask: "A fractional brand lead engagement with a seed-stage company.",
    community: "design",
    avatarColor: COLORS.design,
  },
  {
    id: "sora",
    name: "Sora Kim",
    headline: "UX researcher",
    offer: "UX researcher running discovery and usability studies for fintech apps.",
    ask: "An intro to a fintech team that needs research support.",
    community: "design",
    avatarColor: COLORS.design,
  },
  {
    id: "diego",
    name: "Diego Ramos",
    headline: "Design systems engineer",
    offer: "Design engineer who builds component libraries and design systems in React.",
    ask: "A design-engineering role at a product-led startup.",
    community: "design",
    avatarColor: COLORS.design,
  },
  {
    id: "freya",
    name: "Freya Olsen",
    headline: "Motion & prototyping designer",
    offer: "Motion designer and prototyper — I make product interactions feel alive.",
    ask: "Freelance prototyping work for product launches.",
    community: "design",
    avatarColor: COLORS.design,
  },
  {
    id: "marco",
    name: "Marco Bianchi",
    headline: "Design lead, money flows",
    offer:
      "Product designer who has worked on money flows, checkout, and billing UX at two payments startups.",
    ask: "A lead design role at an early payments company.",
    community: "design",
    avatarColor: COLORS.design,
  },

  // ── INFRA / DEVTOOLS ────────────────────────────────────────────────────────
  {
    id: "lena",
    name: "Lena Fischer",
    headline: "Backend engineer, distributed systems",
    offer:
      "Backend engineer for distributed systems and high-throughput services.",
    ask: "A cofounder opportunity at an infrastructure startup.",
    community: "infra",
    avatarColor: COLORS.infra,
  },
  {
    id: "arjun",
    name: "Arjun Shah",
    headline: "Platform engineer, Kubernetes",
    offer: "Platform engineer — Kubernetes, observability, and developer tooling.",
    ask: "A staff platform role at a fast-growing devtools company.",
    community: "infra",
    avatarColor: COLORS.infra,
  },
  {
    id: "claire",
    name: "Claire Dubois",
    headline: "Founder, developer tools",
    offer: "Founder building a CI/CD developer-tools startup.",
    ask: "A founding backend engineer who loves developer experience.",
    community: "infra",
    avatarColor: COLORS.infra,
  },
  {
    id: "miguel",
    name: "Miguel Santos",
    headline: "Database engineer",
    offer: "Database internals engineer — query planners and storage engines.",
    ask: "Deep-tech infra roles working on databases.",
    community: "infra",
    avatarColor: COLORS.infra,
  },
  {
    id: "priscilla",
    name: "Priscilla Adeola",
    headline: "DevRel lead",
    offer: "Developer relations lead — docs, SDKs, and developer community growth.",
    ask: "A head of DevRel role at an API-first company.",
    community: "infra",
    avatarColor: COLORS.infra,
  },
  {
    id: "tom",
    name: "Tom Becker",
    headline: "Security engineer",
    offer: "Security engineer for application and cloud infrastructure hardening.",
    ask: "A fractional security engagement with a Series A startup.",
    community: "infra",
    avatarColor: COLORS.infra,
  },

  // ── GROWTH / MARKETING ──────────────────────────────────────────────────────
  {
    id: "marcus",
    name: "Marcus Reed",
    headline: "Growth marketer, B2B",
    offer: "B2B growth marketer — demand generation and lifecycle marketing.",
    ask: "A technical cofounder for a martech idea.",
    community: "growth",
    avatarColor: COLORS.growth,
  },
  {
    id: "nina",
    name: "Nina Kovač",
    headline: "Content & SEO lead",
    offer: "Content and SEO lead who grew organic traffic 10x at a SaaS company.",
    ask: "Fractional content strategy engagements.",
    community: "growth",
    avatarColor: COLORS.growth,
  },
  {
    id: "paolo",
    name: "Paolo Greco",
    headline: "Paid acquisition specialist",
    offer: "Performance marketer running paid acquisition across Meta and Google.",
    ask: "An intro to a DTC brand scaling paid spend.",
    community: "growth",
    avatarColor: COLORS.growth,
  },
  {
    id: "tara",
    name: "Tara O'Neill",
    headline: "Lifecycle & CRM lead",
    offer: "Lifecycle marketer — email, push, and retention systems.",
    ask: "A senior CRM role at a consumer subscription company.",
    community: "growth",
    avatarColor: COLORS.growth,
  },
  {
    id: "victor",
    name: "Victor Huang",
    headline: "Founder, martech",
    offer: "Founder building attribution and analytics tooling for marketers.",
    ask: "A growth advisor who has scaled B2B pipeline.",
    community: "growth",
    avatarColor: COLORS.growth,
  },

  // ── CLIMATE ─────────────────────────────────────────────────────────────────
  {
    id: "ingrid",
    name: "Ingrid Sorensen",
    headline: "Founder, carbon accounting",
    offer: "Founder building carbon accounting software for supply chains.",
    ask: "A founding engineer who cares about climate.",
    community: "climate",
    avatarColor: COLORS.climate,
  },
  {
    id: "kwame",
    name: "Kwame Boateng",
    headline: "Energy systems engineer",
    offer: "Engineer for grid software, battery storage, and energy optimization.",
    ask: "A climate-tech role working on the energy transition.",
    community: "climate",
    avatarColor: COLORS.climate,
  },
  {
    id: "elena",
    name: "Elena Marchetti",
    headline: "Climate VC associate",
    offer: "Investor focused on early-stage climate and decarbonization startups.",
    ask: "Founders building hard-tech climate solutions.",
    community: "climate",
    avatarColor: COLORS.climate,
  },
  {
    id: "jonas",
    name: "Jonas Heller",
    headline: "Sustainability lead",
    offer: "Sustainability operator — I run emissions reporting for mid-market firms.",
    ask: "An intro to a carbon accounting software founder.",
    community: "climate",
    avatarColor: COLORS.climate,
  },
  {
    id: "abby",
    name: "Abby Lin",
    headline: "Climate product manager",
    offer: "Product manager for climate-risk analytics and ESG data products.",
    ask: "A product role at a climate-data startup.",
    community: "climate",
    avatarColor: COLORS.climate,
  },

  // ── CRYPTO ──────────────────────────────────────────────────────────────────
  {
    id: "dmitri",
    name: "Dmitri Volkov",
    headline: "Smart contract engineer",
    offer: "Solidity engineer building DeFi protocols and on-chain settlement.",
    ask: "A protocol engineering role at a serious crypto team.",
    community: "crypto",
    avatarColor: COLORS.crypto,
  },
  {
    id: "sofia",
    name: "Sofia Reyes",
    headline: "Founder, stablecoin payments",
    offer: "Founder building stablecoin rails for cross-border payments.",
    ask: "A backend engineer who understands payment settlement.",
    community: "crypto",
    avatarColor: COLORS.crypto,
  },
  {
    id: "aron",
    name: "Aron Katz",
    headline: "Crypto compliance lead",
    offer: "Compliance lead for crypto — travel rule, AML, and exchange licensing.",
    ask: "Advisory roles with regulated crypto startups.",
    community: "crypto",
    avatarColor: COLORS.crypto,
  },
  {
    id: "mei",
    name: "Mei Lin",
    headline: "Web3 product lead",
    offer: "Product lead for consumer crypto wallets and on-ramps.",
    ask: "A head of product role at a crypto-payments company.",
    community: "crypto",
    avatarColor: COLORS.crypto,
  },

  // ── BIO ─────────────────────────────────────────────────────────────────────
  {
    id: "noemi",
    name: "Noemi Costa",
    headline: "Computational biologist",
    offer: "Computational biologist — genomics pipelines and protein modeling.",
    ask: "A role at a techbio startup applying ML to drug discovery.",
    community: "bio",
    avatarColor: COLORS.bio,
  },
  {
    id: "henry",
    name: "Henry Ofori",
    headline: "Founder, synthetic biology",
    offer: "Founder building engineered microbes for sustainable materials.",
    ask: "An intro to a deep-tech investor who backs synthetic biology.",
    community: "bio",
    avatarColor: COLORS.bio,
  },
  {
    id: "saanvi",
    name: "Saanvi Iyer",
    headline: "Bioinformatics engineer",
    offer: "Bioinformatics engineer building data tooling for wet-lab teams.",
    ask: "A software role bridging biology and engineering.",
    community: "bio",
    avatarColor: COLORS.bio,
  },
  {
    id: "luka",
    name: "Luka Novak",
    headline: "Lab automation engineer",
    offer: "Engineer automating lab workflows and robotic liquid handling.",
    ask: "An intro to a techbio founder hiring automation engineers.",
    community: "bio",
    avatarColor: COLORS.bio,
  },

  // ── INVESTORS ───────────────────────────────────────────────────────────────
  {
    id: "noor",
    name: "Noor Haddad",
    headline: "VC associate, fintech & infra",
    offer: "Early-stage VC associate focused on fintech and infrastructure.",
    ask: "Founders building in payments and developer tools.",
    community: "investors",
    avatarColor: COLORS.investors,
  },
  {
    id: "gabriel",
    name: "Gabriel Costa",
    headline: "Seed investor, B2B SaaS",
    offer: "Seed-stage investor writing first checks into B2B SaaS founders.",
    ask: "Technical founders raising a pre-seed or seed round.",
    community: "investors",
    avatarColor: COLORS.investors,
  },
  {
    id: "yara",
    name: "Yara Mansour",
    headline: "Angel investor & operator",
    offer: "Angel investor and former operator who backs healthtech and AI founders.",
    ask: "An intro to founders solving hard problems in healthcare.",
    community: "investors",
    avatarColor: COLORS.investors,
  },
  {
    id: "philip",
    name: "Philip Anderson",
    headline: "Growth-stage investor",
    offer: "Growth-stage investor helping Series B+ companies scale go-to-market.",
    ask: "Companies past product-market fit raising a growth round.",
    community: "investors",
    avatarColor: COLORS.investors,
  },
  {
    id: "renata",
    name: "Renata Silva",
    headline: "Fund-of-funds partner",
    offer: "Partner allocating capital to emerging venture managers.",
    ask: "First-time fund managers raising an inaugural fund.",
    community: "investors",
    avatarColor: COLORS.investors,
  },

  // ── RECRUITERS ──────────────────────────────────────────────────────────────
  {
    id: "mia",
    name: "Mia Sandoval",
    headline: "Recruiter, engineering talent",
    offer: "Technical recruiter placing senior engineers at startups.",
    ask: "Fast-growing startups hiring engineers.",
    community: "recruiters",
    avatarColor: COLORS.recruiters,
  },
  {
    id: "derek",
    name: "Derek Park",
    headline: "Exec recruiter, leadership",
    offer: "Executive recruiter placing VPs and C-suite at venture-backed companies.",
    ask: "Founders who need to hire their first executive team.",
    community: "recruiters",
    avatarColor: COLORS.recruiters,
  },
  {
    id: "anita",
    name: "Anita Desai",
    headline: "Recruiter, design & product",
    offer: "Recruiter specializing in product and design hires for startups.",
    ask: "An intro to startups scaling their product and design teams.",
    community: "recruiters",
    avatarColor: COLORS.recruiters,
  },
  {
    id: "leo",
    name: "Leo Martins",
    headline: "Technical sourcer",
    offer: "Technical sourcer who finds hard-to-reach ML and infra engineers.",
    ask: "Contract sourcing engagements with hiring teams.",
    community: "recruiters",
    avatarColor: COLORS.recruiters,
  },

  // ── OPERATORS / FOUNDERS (bridges) ──────────────────────────────────────────
  {
    id: "sara",
    name: "Sara Bergström",
    headline: "Chief of staff / ops",
    offer: "Operations generalist and chief of staff for early-stage founders.",
    ask: "A chief-of-staff role at a high-growth startup.",
    community: "founders",
    avatarColor: COLORS.founders,
  },
  {
    id: "oscar",
    name: "Oscar Mwangi",
    headline: "Two-time founder, marketplaces",
    offer: "Two-time founder who has built and sold a marketplace startup.",
    ask: "An intro to investors who back marketplace businesses.",
    community: "founders",
    avatarColor: COLORS.founders,
  },
  {
    id: "julia",
    name: "Julia Schmidt",
    headline: "Fractional COO",
    offer: "Fractional COO who builds operating cadence and finance hygiene for startups.",
    ask: "Seed-stage founders who need part-time operational leadership.",
    community: "founders",
    avatarColor: COLORS.founders,
  },
  {
    id: "felix",
    name: "Felix Wagner",
    headline: "Founder, vertical SaaS",
    offer: "Founder building vertical SaaS for the construction industry.",
    ask: "A technical cofounder with experience in vertical software.",
    community: "founders",
    avatarColor: COLORS.founders,
  },
  {
    id: "grace",
    name: "Grace Thompson",
    headline: "GTM advisor",
    offer: "Go-to-market advisor who helps founders find their first 10 customers.",
    ask: "Early-stage B2B founders figuring out sales.",
    community: "founders",
    avatarColor: COLORS.founders,
  },

  // ── EXPANSION — deepens existing clusters to ~95 personas total. None of
  //    these are wired directly to `me`, so the golden path is unaffected.
  //    A few are placed at 2nd degree to enrich reachable demo asks.

  // fintech (deepen)
  {
    id: "kenji",
    name: "Kenji Mori",
    headline: "Payments partnerships lead",
    offer: "Partnerships lead who has signed acquiring and card-issuing deals at a neobank.",
    ask: "Fintechs that need help landing payment partnerships.",
    community: "fintech",
    avatarColor: COLORS.fintech,
  },
  {
    id: "bianca",
    name: "Bianca Rossi",
    headline: "Treasury & ops, fintech",
    offer: "Treasury operations lead managing settlement, float, and banking relationships.",
    ask: "A treasury role at a high-growth payments company.",
    community: "fintech",
    avatarColor: COLORS.fintech,
  },
  {
    id: "omar",
    name: "Omar Haddad",
    headline: "Fintech data scientist",
    offer: "Data scientist building credit risk and underwriting models for lenders.",
    ask: "An intro to a lending startup that needs risk modeling.",
    community: "fintech",
    avatarColor: COLORS.fintech,
  },

  // healthtech (deepen — make the 'hiring in healthtech' ask richer)
  {
    id: "priyanka",
    name: "Priyanka Menon",
    headline: "Healthtech recruiter & talent",
    offer:
      "Talent lead hiring clinical and engineering teams for healthtech startups.",
    ask: "An intro to a healthtech founder who is hiring.",
    community: "healthtech",
    avatarColor: COLORS.healthtech,
  },
  {
    id: "samira",
    name: "Samira Nasser",
    headline: "Founder, women's health",
    offer: "Founder building a women's health platform; we're hiring across the team.",
    ask: "An intro to a healthtech-focused angel investor.",
    community: "healthtech",
    avatarColor: COLORS.healthtech,
  },
  {
    id: "patrick",
    name: "Patrick O'Brien",
    headline: "Health insurance product lead",
    offer: "Product lead for health insurance and claims-adjudication software.",
    ask: "A senior product role in healthtech or insurtech.",
    community: "healthtech",
    avatarColor: COLORS.healthtech,
  },

  // design (deepen)
  {
    id: "ines",
    name: "Inès Laurent",
    headline: "Product designer, fintech",
    offer:
      "Product designer who has shipped onboarding and money-movement flows at a challenger bank.",
    ask: "A senior design role at a payments or wealth startup.",
    community: "design",
    avatarColor: COLORS.design,
  },
  {
    id: "noah",
    name: "Noah Klein",
    headline: "Design systems lead",
    offer: "Design systems lead building tokens and component libraries at scale.",
    ask: "A staff design-systems role at a large product org.",
    community: "design",
    avatarColor: COLORS.design,
  },

  // growth (deepen)
  {
    id: "camila",
    name: "Camila Torres",
    headline: "B2B demand-gen lead",
    offer: "Demand-generation lead who builds pipeline engines for B2B SaaS.",
    ask: "A head of growth role at a Series A B2B company.",
    community: "growth",
    avatarColor: COLORS.growth,
  },
  {
    id: "hugo",
    name: "Hugo Almeida",
    headline: "Partnerships & BD",
    offer: "Business development lead who closes channel and reseller partnerships.",
    ask: "An intro to a SaaS company building a partner program.",
    community: "growth",
    avatarColor: COLORS.growth,
  },

  // ai (deepen)
  {
    id: "elias",
    name: "Elias Berg",
    headline: "Founder, AI for ops",
    offer: "Founder building AI copilots for finance and operations teams.",
    ask: "A founding engineer who has shipped LLM products.",
    community: "ai",
    avatarColor: COLORS.ai,
  },
  {
    id: "priya2",
    name: "Priya Subramanian",
    headline: "Data scientist, recsys",
    offer: "Data scientist building recommendation and ranking systems.",
    ask: "A senior DS role at a consumer marketplace.",
    community: "ai",
    avatarColor: COLORS.ai,
  },
  {
    id: "tobias",
    name: "Tobias Frei",
    headline: "AI infra engineer",
    offer: "Engineer building GPU scheduling and training infrastructure.",
    ask: "An infra role at a frontier AI company.",
    community: "ai",
    avatarColor: COLORS.ai,
  },

  // infra (deepen)
  {
    id: "ananya",
    name: "Ananya Bose",
    headline: "Site reliability engineer",
    offer: "SRE who builds incident response and reliability practice for platform teams.",
    ask: "A staff SRE role at an infrastructure company.",
    community: "infra",
    avatarColor: COLORS.infra,
  },
  {
    id: "marek",
    name: "Marek Nowak",
    headline: "API platform engineer",
    offer: "Engineer building API gateways, rate limiting, and developer platforms.",
    ask: "A platform role at an API-first startup.",
    community: "infra",
    avatarColor: COLORS.infra,
  },

  // climate (deepen)
  {
    id: "linnea",
    name: "Linnea Holm",
    headline: "Climate data scientist",
    offer: "Data scientist modeling emissions and climate risk for enterprises.",
    ask: "A climate-data role with measurable impact.",
    community: "climate",
    avatarColor: COLORS.climate,
  },
  {
    id: "obi",
    name: "Obi Eze",
    headline: "EV charging founder",
    offer: "Founder building software for EV charging networks.",
    ask: "A founding engineer for hardware-software integration.",
    community: "climate",
    avatarColor: COLORS.climate,
  },

  // crypto (deepen)
  {
    id: "lara",
    name: "Lara Beck",
    headline: "DeFi product lead",
    offer: "Product lead for lending and yield protocols in DeFi.",
    ask: "A product role at a credible DeFi team.",
    community: "crypto",
    avatarColor: COLORS.crypto,
  },
  {
    id: "ivan",
    name: "Ivan Petrov",
    headline: "Blockchain infra engineer",
    offer: "Engineer building node infrastructure and indexers for L2 chains.",
    ask: "An infra role at a serious blockchain company.",
    community: "crypto",
    avatarColor: COLORS.crypto,
  },

  // bio (deepen)
  {
    id: "maya",
    name: "Maya Sharma",
    headline: "Techbio founder",
    offer: "Founder applying machine learning to antibody discovery.",
    ask: "A founding ML scientist who knows biology.",
    community: "bio",
    avatarColor: COLORS.bio,
  },
  {
    id: "anders",
    name: "Anders Holt",
    headline: "Genomics platform engineer",
    offer: "Engineer building scalable genomics data platforms.",
    ask: "A platform role at a genomics company.",
    community: "bio",
    avatarColor: COLORS.bio,
  },

  // investors (deepen)
  {
    id: "talia",
    name: "Talia Rosen",
    headline: "Pre-seed investor, AI",
    offer: "Pre-seed investor writing first checks into technical AI founders.",
    ask: "Technical founders building applied AI companies.",
    community: "investors",
    avatarColor: COLORS.investors,
  },
  {
    id: "marcus2",
    name: "Marcus Webb",
    headline: "Fintech-focused VC",
    offer: "Venture investor backing early-stage fintech and payments companies.",
    ask: "Founders building the next generation of payments infrastructure.",
    community: "investors",
    avatarColor: COLORS.investors,
  },

  // recruiters (deepen)
  {
    id: "joy",
    name: "Joy Okafor",
    headline: "Recruiter, sales & GTM",
    offer: "Recruiter placing sales and go-to-market leaders at startups.",
    ask: "Startups building out their first sales team.",
    community: "recruiters",
    avatarColor: COLORS.recruiters,
  },

  // founders / operators (deepen — reachable bridges)
  {
    id: "daniel",
    name: "Daniel Fischer",
    headline: "Founder, B2B SaaS",
    offer: "Repeat founder building workflow software for operations teams.",
    ask: "An intro to a seed investor who backs B2B SaaS.",
    community: "founders",
    avatarColor: COLORS.founders,
  },
  {
    id: "aisha",
    name: "Aisha Khan",
    headline: "People & talent ops",
    offer: "People operations lead who builds hiring and onboarding for early teams.",
    ask: "A head-of-people role at a scaling startup.",
    community: "founders",
    avatarColor: COLORS.founders,
  },
  {
    id: "ryan",
    name: "Ryan Murphy",
    headline: "Finance & fundraising advisor",
    offer: "Fractional CFO who helps founders model and run fundraising processes.",
    ask: "Seed and Series A founders preparing to raise.",
    community: "founders",
    avatarColor: COLORS.founders,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EDGES — undirected. Dense intra-community, sparse cross-community bridges.
// `me` has 6 first-degree connections spanning founders, fintech, healthtech,
// growth, investors, and recruiters, so 2nd-degree reach is broad.
// ─────────────────────────────────────────────────────────────────────────────

export const EDGES: Edge[] = [
  // ── YOUR DIRECT CONNECTIONS (1st degree) ──
  { source: "me", target: "priya" }, // → fintech + design (golden path bridge)
  { source: "me", target: "dana" }, // → healthtech
  { source: "me", target: "marcus" }, // → growth
  { source: "me", target: "noor" }, // → investors + fintech
  { source: "me", target: "mia" }, // → recruiters
  { source: "me", target: "sara" }, // → founders/ops

  // ── FINTECH cluster (dense) ──
  { source: "priya", target: "samuel" }, // GOLDEN PATH connector
  { source: "priya", target: "raj" },
  { source: "priya", target: "marco" }, // bridge to design (money flows)
  { source: "samuel", target: "yuki" },
  { source: "samuel", target: "ethan" },
  { source: "samuel", target: "carlos" },
  { source: "yuki", target: "sven" },
  { source: "ethan", target: "amara" },
  { source: "carlos", target: "amara" },
  { source: "raj", target: "sven" },
  { source: "noor", target: "ethan" }, // investor ↔ fintech
  { source: "noor", target: "samuel" }, // cross-link for realism (still 2nd-degree via priya OR noor)
  { source: "noor", target: "amara" },

  // ── HEALTHTECH cluster (dense) ──
  { source: "dana", target: "olu" },
  { source: "dana", target: "rebecca" },
  { source: "dana", target: "imani" },
  { source: "olu", target: "rebecca" },
  { source: "olu", target: "imani" },
  { source: "olu", target: "hannah" },
  { source: "rebecca", target: "tomas" },
  { source: "imani", target: "deepa" },
  { source: "hannah", target: "deepa" },
  { source: "tomas", target: "yara" }, // bridge to investors

  // ── AI / ML cluster (dense) ──
  { source: "wei", target: "fatima" },
  { source: "wei", target: "george" },
  { source: "wei", target: "lucia" },
  { source: "fatima", target: "nadia" },
  { source: "george", target: "kojo" },
  { source: "george", target: "nadia" },
  { source: "lucia", target: "kojo" },
  { source: "ravi", target: "wei" },
  { source: "ravi", target: "luka" }, // bridge to bio (perception/robotics)

  // ── DESIGN cluster (dense) ──
  { source: "marco", target: "mara" },
  { source: "marco", target: "sora" }, // money-flows designer ↔ fintech researcher
  { source: "mara", target: "ben" },
  { source: "mara", target: "diego" },
  { source: "ben", target: "freya" },
  { source: "diego", target: "freya" },
  { source: "sora", target: "raj" }, // design ↔ fintech bridge
  { source: "diego", target: "arjun" }, // design-eng ↔ infra bridge

  // ── INFRA / DEVTOOLS cluster (dense) ──
  { source: "lena", target: "arjun" },
  { source: "lena", target: "claire" },
  { source: "arjun", target: "miguel" },
  { source: "claire", target: "priscilla" },
  { source: "miguel", target: "tom" },
  { source: "priscilla", target: "tom" },
  { source: "claire", target: "gabriel" }, // founder ↔ investor bridge
  { source: "marcus", target: "lena" }, // growth ↔ infra (existing spine link)

  // ── GROWTH cluster (dense) ──
  { source: "marcus", target: "nina" },
  { source: "marcus", target: "victor" },
  { source: "nina", target: "paolo" },
  { source: "paolo", target: "tara" },
  { source: "victor", target: "tara" },
  { source: "victor", target: "grace" }, // bridge to founders/GTM
  { source: "deepa", target: "paolo" }, // healthtech growth ↔ paid acquisition

  // ── CLIMATE cluster (dense) ──
  { source: "ingrid", target: "kwame" },
  { source: "ingrid", target: "jonas" },
  { source: "ingrid", target: "elena" },
  { source: "kwame", target: "abby" },
  { source: "jonas", target: "abby" },
  { source: "elena", target: "gabriel" }, // climate VC ↔ seed investor bridge

  // ── CRYPTO cluster (dense) ──
  { source: "dmitri", target: "sofia" },
  { source: "sofia", target: "mei" },
  { source: "sofia", target: "aron" },
  { source: "dmitri", target: "mei" },
  { source: "aron", target: "ethan" }, // crypto compliance ↔ fintech compliance bridge
  { source: "sofia", target: "yuki" }, // stablecoin ↔ ledger bridge

  // ── BIO cluster (dense) ──
  { source: "noemi", target: "henry" },
  { source: "noemi", target: "saanvi" },
  { source: "saanvi", target: "luka" },
  { source: "henry", target: "elena" }, // synthetic bio ↔ climate VC bridge
  { source: "noemi", target: "fatima" }, // techbio ↔ NLP/ML bridge

  // ── INVESTORS cluster (sparse, lots of bridges already above) ──
  { source: "noor", target: "gabriel" },
  { source: "gabriel", target: "yara" },
  { source: "yara", target: "philip" },
  { source: "philip", target: "renata" },
  { source: "gabriel", target: "oscar" }, // investor ↔ founder bridge

  // ── RECRUITERS cluster (dense) ──
  { source: "mia", target: "derek" },
  { source: "mia", target: "anita" },
  { source: "mia", target: "leo" },
  { source: "derek", target: "anita" },
  { source: "leo", target: "wei" }, // technical sourcer ↔ ML engineer bridge
  { source: "anita", target: "mara" }, // design recruiter ↔ principal designer bridge

  // ── FOUNDERS / OPERATORS cluster (bridges) ──
  { source: "sara", target: "oscar" },
  { source: "sara", target: "julia" },
  { source: "sara", target: "felix" },
  { source: "oscar", target: "grace" },
  { source: "julia", target: "felix" },
  { source: "felix", target: "claire" }, // founder ↔ devtools founder bridge
  { source: "grace", target: "gabriel" }, // GTM advisor ↔ investor
  { source: "sara", target: "dana" }, // ops ↔ healthtech operator

  // ── EXPANSION EDGES ──
  // fintech deepen
  { source: "kenji", target: "samuel" },
  { source: "kenji", target: "amara" },
  { source: "bianca", target: "yuki" },
  { source: "omar", target: "carlos" },
  { source: "omar", target: "amara" },

  // healthtech deepen — Priyanka & Samira become 2nd degree via Dana, so the
  // "hiring in healthtech" ask returns multiple strong warm matches.
  { source: "dana", target: "priyanka" }, // 2nd degree from me
  { source: "dana", target: "samira" }, // 2nd degree from me
  { source: "priyanka", target: "olu" },
  { source: "samira", target: "rebecca" },
  { source: "patrick", target: "hannah" },
  { source: "patrick", target: "tomas" },

  // design deepen — Inès (money-flows designer) becomes 2nd degree via Priya.
  { source: "priya", target: "ines" }, // 2nd degree from me
  { source: "ines", target: "marco" },
  { source: "noah", target: "diego" },
  { source: "noah", target: "mara" },

  // growth deepen — Camila & Hugo become 2nd degree via Marcus.
  { source: "marcus", target: "camila" }, // 2nd degree from me
  { source: "marcus", target: "hugo" }, // 2nd degree from me
  { source: "camila", target: "victor" },
  { source: "hugo", target: "grace" },

  // ai deepen
  { source: "elias", target: "george" },
  { source: "elias", target: "wei" },
  { source: "priya2", target: "lucia" },
  { source: "tobias", target: "wei" },
  { source: "tobias", target: "arjun" }, // ai ↔ infra bridge

  // infra deepen
  { source: "ananya", target: "arjun" },
  { source: "marek", target: "priscilla" },
  { source: "marek", target: "claire" },

  // climate deepen
  { source: "linnea", target: "abby" },
  { source: "obi", target: "kwame" },
  { source: "obi", target: "elena" },

  // crypto deepen
  { source: "lara", target: "dmitri" },
  { source: "ivan", target: "dmitri" },
  { source: "ivan", target: "miguel" }, // crypto ↔ infra bridge

  // bio deepen
  { source: "maya", target: "noemi" },
  { source: "maya", target: "talia" }, // bio ↔ investor bridge
  { source: "anders", target: "saanvi" },

  // investors deepen — Marcus Webb (payments VC) sits 2nd degree via Noor.
  { source: "noor", target: "marcus2" }, // 2nd degree from me
  { source: "talia", target: "gabriel" },
  { source: "marcus2", target: "gabriel" },

  // recruiters deepen — Joy becomes 2nd degree via Mia.
  { source: "mia", target: "joy" }, // 2nd degree from me
  { source: "joy", target: "derek" },

  // founders deepen — Daniel, Aisha, Ryan become 2nd degree via Sara.
  { source: "sara", target: "daniel" }, // 2nd degree from me
  { source: "sara", target: "aisha" }, // 2nd degree from me
  { source: "sara", target: "ryan" }, // 2nd degree from me
  { source: "daniel", target: "gabriel" },
  { source: "ryan", target: "gabriel" },
  { source: "aisha", target: "julia" },
];

export const NETWORK: Graph = {
  me: "me",
  personas: PERSONAS,
  edges: EDGES,
};
