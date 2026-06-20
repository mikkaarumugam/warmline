---
marp: true
theme: default
paginate: true
style: |
  section {
    font-family: 'Inter', 'Helvetica Neue', sans-serif;
    background: #0f0f11;
    color: #f0f0f0;
    padding: 56px 72px;
  }
  h1 {
    font-size: 2.6rem;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.15;
    margin-bottom: 0.4em;
  }
  h2 {
    font-size: 1.9rem;
    font-weight: 700;
    color: #ffffff;
    border-bottom: 2px solid #6c47ff;
    padding-bottom: 0.25em;
    margin-bottom: 0.6em;
  }
  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #a78bfa;
    margin-bottom: 0.4em;
  }
  p {
    font-size: 1.15rem;
    line-height: 1.65;
    color: #d4d4d8;
  }
  ul {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #d4d4d8;
  }
  li {
    margin-bottom: 0.3em;
  }
  strong {
    color: #c4b5fd;
  }
  em {
    color: #a78bfa;
    font-style: normal;
  }
  .tag {
    display: inline-block;
    background: #6c47ff;
    color: #fff;
    padding: 2px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    margin-right: 6px;
  }
  section.title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: linear-gradient(135deg, #0f0f11 60%, #1a1230 100%);
  }
  section.title h1 {
    font-size: 3.6rem;
  }
  section.title .sub {
    font-size: 1.35rem;
    color: #a78bfa;
    margin-top: 0.8em;
    font-weight: 400;
  }
  section.title .oneliner {
    font-size: 1.15rem;
    color: #71717a;
    margin-top: 2.5em;
    border-left: 3px solid #6c47ff;
    padding-left: 1em;
  }
  blockquote {
    border-left: 4px solid #6c47ff;
    margin: 0;
    padding: 0.4em 1em;
    color: #a1a1aa;
    font-size: 1.05rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 1rem;
  }
  th {
    background: #1e1b4b;
    color: #c4b5fd;
    padding: 10px 16px;
    text-align: left;
    font-weight: 700;
  }
  td {
    padding: 10px 16px;
    border-bottom: 1px solid #27272a;
    color: #d4d4d8;
  }
---

<!-- _class: title -->

# Warmline

<div class="sub">The warm-intro marketplace</div>

<div class="oneliner">Post an ask. We find who in your warm network matches — then draft the intro your mutual friend would send.</div>

<!-- Speaker notes:
"Think of the best job, hire, or investor you ever landed. I'd bet it came through someone you knew."
Name the product, state the one-liner, move immediately to the problem.
-->

---

## The best opportunities come through warm intros

<br>

Warm introductions convert **up to 10x better** than cold outreach.

<br>

**Yet there is no marketplace for warm introductions.**

<br>

> "I need someone who knows payments infrastructure" — how do you even start?

<!-- Speaker notes:
Data point: warm intros convert 10x vs cold (common VC/hiring lore; own experience).
The gap is obvious once you say it out loud. Let it land before moving on.
-->

---

## Every incumbent is one-sided and inferred

| Product | How it works | The other side |
|---|---|---|
| LinkedIn | You search | Never opted in |
| Happenstance | Algorithm guesses | Data scraped |
| The Swarm | You browse | Profile inferred |
| Vieu | Contact scraping | No declaration |

<br>

**The person on the other end never raised their hand.**

<!-- Speaker notes:
Name the competitors directly — it shows we know the space.
The shared failure mode: one-sided + inferred. The data on the other person is harvested, not given.
"Every one of them works the same way: you search, the software guesses, and the person on the other end has no idea they're in the system."
-->

---

## Warmline flips it: two-sided + declared

Everyone declares **two** things:

- **Offer** — who you are and what you can help with
- **Ask** — what you need right now

<br>

Post an ask → **semantic match** against declared offers across your warm network (1st + 2nd degree) → see the **mutual who connects you** → one click drafts the intro.

<br>

**Both sides already raised their hand.** That's the difference.

<!-- Speaker notes:
Stress "declared, not inferred" — it's the IP moat and the trust argument.
Semantic match means zero shared keywords needed: "payments infra" matches "billing and ledger systems at Adyen."
The warm path + drafted intro removes all the friction that kills even good referrals.
-->

---

## Live demo — the golden path

**Ask:** *"a technical cofounder who knows payments infrastructure"*

<br>

1. Ranked warm matches → **Samuel Okoro**, ex-Adyen, **#1**
2. Zero shared keywords with *"billing and ledger systems at Adyen"* — **semantic**
3. Graph animates: **You → Priya Nair → Samuel**
4. One click → **Claude drafts the intro in Priya's voice**, double-opt-in

<br>

> No keyword overlap. Routed through the friend who can actually make the intro.

<!-- Speaker notes:
Drive the live product here — this is the money slide.
Points to land:
  1. Semantic matching (no keyword trick)
  2. The warm path visualization — you see the route, not just a name
  3. The drafted intro removes all friction for the mutual
  4. Fallback: if no API key, a clean templated draft fires — demo never hard-fails.
-->

---

## GTM & onboarding — where the graph comes from

**Step 1:** Import LinkedIn connections to map **who knows whom** (edges only).

**Step 2:** Each user declares their **offer** and **ask** — always explicit, never inferred.

<br>

**Who pays:**

- Recruiters filling senior roles
- Founders raising or hiring
- Sales and BD teams who live by warm intros

<br>

**Why it compounds:** every new declaration makes every existing match denser.

<!-- Speaker notes:
Address the cold-start question head-on — we seed the graph topology from existing connections, but intent is always declared.
The business model is straightforward: high-value use cases, recurring need, clear willingness to pay.
Network effect is real: a declared graph is a compounding asset.
-->

---

## Where Warmline goes

**A two-sided, declared layer over a warm second-degree graph.**

Nobody is doing this.

<br>

Next: **mobile + push notifications**

> *"Someone in your network can help with your ask."*

<br>

That's the whitespace. That's what we built.

<!-- Speaker notes:
Close confident, not breathless.
The push use case is powerful: it's pull-to-push — your declared ask becomes a standing query.
Leave them with the framing: two-sided + declared = the structural wedge that's undefended.
"Thank you."
-->
