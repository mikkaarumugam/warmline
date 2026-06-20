import { NextResponse } from "next/server";
import { getGraph } from "@/lib/data";

// GET /api/personas → the full warm graph (nodes + edges) for the viz.
export function GET() {
  return NextResponse.json(getGraph());
}
