import type { Graph } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// SMALL mock graph for the spine. Track C replaces this with 80–120 personas in
// /data/seed/*. Shape matches the frozen contract so frontend + engine can build
// immediately. Includes a deliberate GOLDEN PATH for the demo:
//   You → Priya (1st degree) → Samuel (2nd degree, "payments infra, ex-Adyen")
// so the ask "technical cofounder who knows payments infra" returns Samuel #1.
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_GRAPH: Graph = {
  me: "me",
  personas: [
    {
      id: "me",
      name: "You",
      headline: "Founder, B2B SaaS",
      offer: "Generalist founder building a B2B SaaS for ops teams.",
      ask: "A technical cofounder who knows payments infrastructure.",
      community: "founders",
      avatarColor: "#6366f1",
    },
    {
      id: "priya",
      name: "Priya Nair",
      headline: "Product designer, fintech",
      offer: "Fintech-focused product designer, ex-Monzo. I design onboarding and money flows.",
      ask: "An intro to a healthtech operator.",
      community: "fintech",
      avatarColor: "#ec4899",
    },
    {
      id: "samuel",
      name: "Samuel Okoro",
      headline: "Payments infra eng, ex-Adyen",
      offer: "Payments infrastructure engineer. I built billing and ledger systems at Adyen.",
      ask: "An early-stage fintech to join as a technical cofounder.",
      community: "fintech",
      avatarColor: "#0ea5e9",
    },
    {
      id: "raj",
      name: "Raj Patel",
      headline: "Frontend engineer, dashboards",
      offer: "Frontend engineer specializing in fintech dashboards and data viz.",
      ask: "Fractional frontend roles.",
      community: "fintech",
      avatarColor: "#14b8a6",
    },
    {
      id: "dana",
      name: "Dana Levin",
      headline: "Healthtech operator",
      offer: "Healthtech operator, scaled a digital clinic from 0 to 50 staff.",
      ask: "An intro to a great product designer.",
      community: "healthtech",
      avatarColor: "#f59e0b",
    },
    {
      id: "marcus",
      name: "Marcus Reed",
      headline: "Growth marketer, B2B",
      offer: "B2B growth marketer, demand gen and lifecycle.",
      ask: "A technical cofounder for a martech idea.",
      community: "growth",
      avatarColor: "#8b5cf6",
    },
    {
      id: "lena",
      name: "Lena Fischer",
      headline: "Backend engineer, distributed systems",
      offer: "Backend engineer, distributed systems and high-throughput services.",
      ask: "A cofounder opportunity at an infra startup.",
      community: "infra",
      avatarColor: "#ef4444",
    },
    {
      id: "noor",
      name: "Noor Haddad",
      headline: "VC associate, fintech & infra",
      offer: "Early-stage VC associate focused on fintech and infrastructure.",
      ask: "Founders building in payments.",
      community: "fintech",
      avatarColor: "#22c55e",
    },
    {
      id: "ethan",
      name: "Ethan Cole",
      headline: "Compliance lead, payments/KYC",
      offer: "Compliance lead for payments, KYC and licensing.",
      ask: "Fintech advisory roles.",
      community: "fintech",
      avatarColor: "#a855f7",
    },
    {
      id: "mia",
      name: "Mia Sandoval",
      headline: "Recruiter, engineering talent",
      offer: "Technical recruiter placing senior engineers at startups.",
      ask: "Fast-growing startups hiring engineers.",
      community: "growth",
      avatarColor: "#eab308",
    },
  ],
  edges: [
    // Your direct connections (1st degree)
    { source: "me", target: "priya" },
    { source: "me", target: "dana" },
    { source: "me", target: "marcus" },
    { source: "me", target: "noor" },
    { source: "me", target: "mia" },
    // Friends-of-friends (2nd degree)
    { source: "priya", target: "samuel" }, // golden path connector
    { source: "priya", target: "raj" },
    { source: "marcus", target: "lena" },
    { source: "noor", target: "ethan" },
    { source: "noor", target: "samuel" }, // cross-link for realism
    { source: "dana", target: "mia" },
  ],
};
