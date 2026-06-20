/**
 * Seeded outcome history so the Sent-tab stats read believably in the demo (a
 * handful of live requests isn't a sample). The headline is the **vouch lift** —
 * acceptance rate with a vouch vs. without — the number that proves the core
 * insight (vouch = signal). Keep it honest-looking and modest.
 */
export const NETWORK_STATS = {
  vouched: { sent: 18, accepted: 14 }, // 78%
  unvouched: { sent: 22, accepted: 9 }, // 41%
};
