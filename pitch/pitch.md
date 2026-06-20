# Pitch — Warmline

> Working name: **Warmline** — the warm-intro marketplace. (Backups: Vouch, Conduit.)
> Target bounty: **Solvimon — "most likely to be a successful business."**
> Format: 3-minute stage pitch + live demo. Judging: creativity, technical skill,
> usability, startup potential.
>
> **One-liner:** A two-sided, declared marketplace for warm introductions — post an
> ask, and we route it through the mutual friend who can actually make the intro.

---

## The 2-minute spoken pitch (memorize the bold beats)

> **Think of the best job, hire, or investor you ever landed — I'd bet it came through
> someone you knew.** Warm intros convert up to 10x better than cold outreach. Yet there's
> no marketplace for them.
>
> Today, LinkedIn, Happenstance, The Swarm — they all work **one way**: *you* search, and the
> software *guesses* who in your network might help by scraping their data. **The other person
> never raised their hand.** They don't even know they're in the system.
>
> **We flip that.** Everyone declares two things: an **offer** — who they are and what they can
> help with — and an **ask** — what they need right now. When you post an ask, we search your
> *warm* network — friends, and friends-of-friends — for whoever's declared offer matches,
> **semantically**. So *"I need someone who knows payments infrastructure"* matches *"I built
> billing systems at Adyen"* — zero shared keywords.
>
> Then the magic: instead of dropping a stranger on you, we show you the **mutual contact who
> connects you** — the warm path — and **draft the intro for them in one click.**
>
> So it's **two-sided and declared**: both people already raised their hand. A warm-intro
> marketplace, not a contact scraper.
>
> *"Where does the network come from?"* You import connections to map who-knows-who — but the
> offer and ask are **always declared, never inferred.**
>
> Who pays? **Recruiters, founders raising, anyone in sales or BD** — people who live and die by
> warm intros. And every person who joins makes the graph more valuable for everyone.
>
> **That two-sided declared layer over a warm second-degree graph — nobody's doing it. That's
> the whitespace, and that's what we built.**

**10-sec hallway version:** *"It's a warm-intro marketplace. Both sides declare what they offer
and what they need, and we route every match through the mutual friend who can introduce you —
then write the intro for them. Two-sided and opt-in, not LinkedIn scraping."*

---

## 3-minute demo + slide order
1. **Hook** (20s): the warm-intro / 10x line.
2. **Problem** (20s): incumbents are one-sided + inferred; the other side never opted in.
3. **Live demo** (90s): post the ask → ranked warm matches → click Samuel → graph animates
   the path You → Priya → Samuel → "Draft intro" → Claude writes it in Priya's voice.
4. **GTM/onboarding** (20s): the "import LinkedIn to seed edges, both sides declare intent"
   screen — answers "where does the graph come from?"
5. **Business** (20s): who pays (recruiters, founders, BD); the declared graph compounds.
6. **Where it goes** (10s): mobile + push ("someone in your network can help with your ask").

## Live-demo script (the seed graph is populated — ~94 people, 12 communities)

Hero ask (THE one — rehearse this): type
> **"a technical cofounder who knows payments infrastructure"**
→ **Samuel Okoro** (payments infra, ex-Adyen) ranks #1 **via Priya Nair** (2nd degree).
The point to land: *zero shared keywords with "billing and ledger systems at Adyen" —
this is semantic, and it's routed through the friend who can introduce you.*

Backup asks (all return clean, on-stage-safe results on the seed graph):
- **"an intro to someone hiring in healthtech"** → **Priyanka Menon** #1 (healthtech talent
  lead) via **Dana Levin**; Dana and two more healthtech people follow.
- **"a designer who has worked on money flows"** → **Marco Bianchi** #1 (money-flows / billing
  UX) via **Priya Nair**; **Inès Laurent** #2 (money-movement flows) via Priya.
- **"a B2B growth marketer who can build pipeline"** → **Marcus Reed** #1 (direct, 1st degree),
  **Camila Torres** #2 (demand-gen) via Marcus.

Then click the top result → the React Flow path animates You → mutual → target → hit
**"Draft intro"** → Claude writes the double-opt-in note in the *mutual's* voice. (No API key
on stage? It falls back to a clean templated draft — the demo never hard-fails.)

## Likely judge Qs (have answers ready)
- *Isn't this just LinkedIn?* No — LinkedIn is inferred and one-sided. Here both sides declare
  intent; we only use connections for the *graph topology*, never to guess profiles.
- *Cold start?* The declared layer compounds within communities; seed by importing edges, then
  each declaration makes matches denser. (Demo shows a populated world.)
- *Why warm vs cold?* Conversion. A mutual's intro is the highest-trust channel that exists.
