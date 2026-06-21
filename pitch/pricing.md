# Warmline — Pricing rationale

*The thinking behind the numbers on the Business-model slide. Not vibe-coded: every price
is anchored to a comparable and a value-metric argument. Use this for judge Q&A.*

---

## 1. What is the unit of value?

The thing a customer actually buys is **a warm connection that converts** — a hire, a
customer, an investor, a key partner. Warm intros convert up to ~10x cold outreach, so the
*value per successful intro* is high and lumpy: one good one can be worth thousands to
hundreds of thousands. Pricing should let us **capture a sliver of that**, two ways:
- **Subscription** (predictable, low-friction) for the people who need intros continuously.
- **Success fee** (value-aligned) for the highest-value, meterable outcome: hiring.

## 2. Who pays, and how much is an intro worth to them?

| Segment | Why they pay | Value of one good intro |
|---|---|---|
| **Founders** (raising / hiring / first customers) | Fundraising + first 10 customers run on warm intros | An investor or design-partner intro = the company's trajectory |
| **B2B sales / BD** | Warm path into an account beats cold every time | One closed deal = thousands–tens of thousands ACV |
| **Recruiters / talent** | Warm intro to a passive candidate | A hire avoids a 15–25%-of-salary agency fee (~$20–40k) |
| **Communities** (accelerators, VC funds, alumni nets) | Warm intros are the *core promise* they make to members | Retention / differentiation of their whole program |

## 3. Comparables (what the market already pays)

- **LinkedIn Sales Navigator** — ~$99/mo Core, ~$160/mo Advanced. This is the anchor: it's
  **cold + inferred**, and people pay $99/mo for it. Warmline is **warm + consented** — a
  better product on the axis that matters — so $49/seat is deliberately *under* the anchor
  to win adoption while signalling "serious tool."
- **LinkedIn Recruiter Lite** — ~$170/mo. Recruiters have proven high WTP for reach.
- **Superhuman** — $30/mo prosumer productivity. Floor for "tool a professional pays for
  themselves."
- **Apollo / Outreach / Lemlist** (sales engagement) — ~$49–99/seat/mo. Confirms the
  $49 seat band for go-to-market tooling.
- **Affinity** (relationship-intelligence CRM for VC/PE) — enterprise, roughly $2k+/seat/yr.
  Funds *already* pay a lot to manage their warm network — the ceiling for the community/org
  tier.
- **Recruiting agencies** — 15–25% of first-year salary per hire. The benchmark the success
  fee undercuts dramatically.

## 4. The tiers (and why each number)

### Free — $0
Acquisition + the network-effect engine. You can join, declare offer/ask, receive intros,
and send a **capped** number per month. Rationale: the product only works if the graph is
dense, so removing the join barrier is worth more than the lost revenue. The vouch inbox
pulls free users back (re-engagement). Caps create the natural upgrade trigger.

### Pro — $49 / seat / mo
The prosumer/team workhorse: unlimited asks, priority ranking in recipients' inboxes,
vouch-lift analytics. **Anchored below Sales Navigator's $99** — warm + consented beats
cold + inferred, so we can charge a premium-feeling price at a value price. ROI story is
trivial: one landed intro (a hire, a customer, a check) pays for **a year or more**, so the
$49 decision is a no-brainer for the target user. (Annual discount → ~$39/mo to pull
forward commitment.)

### Community — from ~$12k / yr (scales with size)
The real business. Accelerators, VC platform teams, and alumni networks **license Warmline
for their members.** Why this is the strong tier:
- They *already promise* warm intros to members — and deliver them manually, expensively
  (a VC platform hire costs six figures to do this by hand). Warmline productizes that
  promise.
- It's **recurring**, **sticky** (the consented graph is the switching cost), and it
  **grows with the community** — land a 50-founder cohort, expand as alumni compound.
- Pricing: a platform fee that scales with member count. ~$12k/yr for a small cohort
  (~50–100 members ≈ $120–240/member/yr) is cheap next to what a fund pays for Affinity, and
  trivial as a member-retention line item. Cold-start GTM (community-first) and the revenue
  model are the **same motion** — that's the unlock.

### + Success fee (enterprise / recruiting) — per booked hire-intro
Value-aligned upside for the highest-value, meterable outcome. Charge a **flat fee or sub-1%
on a booked hire-intro** — a fraction of the 15–25% agency fee it replaces, still
high-margin. We can meter it precisely because **we own the booking handoff** (the
accept → book-a-call step is in-product). Fundraising intros are higher-value but harder to
attribute cleanly → keep those on the subscription, not the success fee, for now.

## 5. Why this monetizes a defensible business (the Solvimon point)

- **Land-and-expand:** free → Pro seats (bottoms-up) → Community licenses (top-down) is a
  proven SaaS shape with two acquisition motions feeding one graph.
- **Aligned upside:** the success fee means we win when the user wins — and we can only
  charge it because we own the trust + booking layer (not the chat).
- **Moat → pricing power:** the consented, declared graph is a data network effect
  competitors who *infer* can't copy, which protects the premium over time.

## 6. Open questions to pressure-test post-hackathon
- Seat vs usage for Pro (do heavy senders cost us more? embeddings are client-side, so
  marginal cost ≈ 0 → seat-based is fine).
- Exact Community price metric: per-member-per-year vs flat tiers by cohort size.
- Whether the success fee should extend to closed sales deals (attribution is the hard part).
