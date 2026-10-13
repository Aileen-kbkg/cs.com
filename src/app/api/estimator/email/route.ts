import { NextResponse } from "next/server";

/**
 * Sends the "Email My Estimate" request to the same backend the live site
 * uses: the WordPress AJAX action `kbkg_send_estimate_email`.
 *
 * Set ESTIMATE_EMAIL_ENDPOINT to the URL of the WordPress admin-ajax.php that
 * hosts that action. Once costsegregation.com points at this Next.js app, the
 * default URL below no longer reaches WordPress, so the variable must point at
 * the WordPress server (or a replacement email service with the same contract).
 */
const EMAIL_ENDPOINT =
  process.env.ESTIMATE_EMAIL_ENDPOINT ?? "https://www.costsegregation.com/wp-admin/admin-ajax.php";

const FIELDS = [
  "firstName",
  "lastName",
  "email",
  "address",
  "purchasePrice",
  "propertyType",
  "purchaseDate",
  "shortTermRental",
  "deductions",
  "savings",
] as const;

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, data: "Invalid request." }, { status: 400 });
  }

  const form = new URLSearchParams({ action: "kbkg_send_estimate_email" });
  FIELDS.forEach((key) => form.append(key, String(payload[key] ?? "")));

  try {
    const upstream = await fetch(EMAIL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      cache: "no-store",
    });
    const data = await upstream.json().catch(() => null);
    if (data && typeof data === "object") return NextResponse.json(data);
    return NextResponse.json(
      { success: false, data: "Something went wrong. Please try again." },
      { status: 502 },
    );
  } catch (error) {
    console.error("Estimate email proxy error:", error);
    return NextResponse.json(
      { success: false, data: "Something went wrong. Please try again." },
      { status: 502 },
    );
  }
}
