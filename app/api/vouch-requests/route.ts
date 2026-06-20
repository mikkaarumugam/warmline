import { NextResponse } from "next/server";
import { getGraph } from "@/lib/data";
import { VOUCH_REQUESTS } from "@/data/seed/vouches";
import type { VouchRequestView } from "@/lib/types";

// GET /api/vouch-requests → inbound vouch requests addressed to "you",
// with requester + target personas resolved for the inbox UI.
export function GET() {
  const byId = new Map(getGraph().personas.map((p) => [p.id, p]));
  const views: VouchRequestView[] = VOUCH_REQUESTS.flatMap((vr) => {
    const requester = byId.get(vr.requesterId);
    const target = byId.get(vr.targetId);
    if (!requester || !target) return [];
    return [{ id: vr.id, requester, target, context: vr.context }];
  });
  return NextResponse.json({ requests: views });
}
