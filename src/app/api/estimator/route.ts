import { NextResponse } from "next/server";

/**
 * Server-side proxy for the KBKG quick-estimator API used by the live
 * costsegregation.com calculator. Proxying avoids browser CORS limits when
 * the site is served from a different origin (e.g. Vercel preview URLs).
 */
const ESTIMATOR_API_URL =
  process.env.KBKG_ESTIMATOR_API_URL ??
  "https://app.costsegregation.com/api/project/v1/rcs-quick-estimator";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const upstream = await fetch(ESTIMATOR_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
    });
  } catch (error) {
    console.error("Estimator proxy error:", error);
    return NextResponse.json({ error: "Estimator service unavailable" }, { status: 502 });
  }
}
