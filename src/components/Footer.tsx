// components/Footer.tsx — Server Component (no event handlers).
// Hover states handled via CSS in a <style> tag.
import Link from "next/link";
import Image from "next/image";
import type { SettingsDocument } from "@/prismicio-types";

type Props = { settings: SettingsDocument | null };

const SOCIAL = [
  { name: "Instagram", href: "https://www.instagram.com/costsegregationdotcom" },
  { name: "Facebook",  href: "https://www.facebook.com/people/Cost-Seg-Pro/61583176327168/" },
  { name: "LinkedIn",  href: "https://www.linkedin.com/showcase/cost-seg-pro/" },
  { name: "X",         href: "https://x.com/KBKG" },
  { name: "YouTube",   href: "https://www.youtube.com/@KBKGTaxIncentives" },
  { name: "Email",     href: "mailto:info@costsegregation.com" },
];

function SocialIcon({ name }: { name: string }) {
  const p = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true as const };
  switch (name) {
    case "Instagram": return <svg {...p}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
    case "Facebook":  return <svg {...p}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
    case "LinkedIn":  return <svg {...p}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
    case "X":         return <svg {...p}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
    case "YouTube":   return <svg {...p}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
    default:          return <svg {...p}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>;
  }
}

export default function Footer({ settings }: Props) {
  return (
    <footer style={{ backgroundColor: "#1a2e5a", color: "#fff" }}>
      <style>{`
        .cs-footer-link { color: #c2d4ea; text-decoration: none; }
        .cs-footer-link:hover { color: #fff; }
        .cs-footer-social { color: #93afd4; display: flex; align-items: center; }
        .cs-footer-social:hover { color: #fff; }
        .cs-footer-legal { color: #6b8db5; text-decoration: none; }
        .cs-footer-legal:hover { color: #c2d4ea; }
        .cs-footer-news { color: #c2d4ea; text-decoration: none; display: block; margin-bottom: 2px; }
        .cs-footer-news:hover { color: #fff; }
      `}</style>

      {/* Banner */}
      <div style={{ backgroundColor: "#0f1e3d", padding: "12px 0", textAlign: "center", fontSize: 14, fontWeight: 500 }}>
        CostSegregation.com Now Includes Residential Cost Segregator®
      </div>

      {/* Main grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40 }}>

        {/* Col 1 — Brand + social */}
        <div>
          <Image src="https://www.costsegregation.com/wp-content/uploads/2025/10/CostSegregation_logo_white-1024x406.png"
            alt="CostSegregation.com" width={180} height={72}
            style={{ height: "auto", width: 160, marginBottom: 12 }} />
          <Image src="https://www.costsegregation.com/wp-content/uploads/2025/10/KBKG-PRINT-logo-white-1.svg"
            alt="KBKG" width={110} height={44}
            style={{ height: "auto", width: 100, marginBottom: 16 }} />
          <p style={{ fontSize: 13, color: "#93afd4", marginBottom: 4 }}>Residential Cost Segregator®</p>
          <p style={{ fontSize: 12, color: "#6b8db5", marginBottom: 20 }}>© 2026 all rights reserved</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {SOCIAL.map(s => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                 aria-label={s.name} className="cs-footer-social">
                <SocialIcon name={s.name} />
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — Contact */}
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#93afd4", marginBottom: 16 }}>Contact Us</h3>
          <div style={{ fontSize: 14, color: "#c2d4ea", lineHeight: 1.75 }}>
            <p>For technical or product related questions contact{" "}
              <a href="mailto:Support@costsegregation.com" style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}>Support@costsegregation.com</a>
            </p>
            <p style={{ marginTop: 8 }}>For general inquiries contact{" "}
              <a href="mailto:Info@costsegregation.com" style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}>Info@costsegregation.com</a>
            </p>
            <p style={{ marginTop: 8, fontSize: 12, color: "#6b8db5" }}>
              Please note, we currently provide support via email and do not offer phone support.
            </p>
            <p style={{ marginTop: 12 }}>
              <Link href="/affiliate-program/" className="cs-footer-link" style={{ textDecoration: "underline" }}>Affiliate Program</Link>
            </p>
          </div>
        </div>

        {/* Col 3 — Recent News */}
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#93afd4", marginBottom: 16 }}>Recent News</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { title: "Case Study: Cost Segregation for a $1,200,000 Office Building", href: "/resources/cost-segregation-office-building/" },
              { title: "Cost Segregation vs. Bonus Depreciation: What's the Difference?", href: "/resources/cost-segregation-vs-bonus-depreciation/" },
              { title: "Cost Segregation for a Prior-Year Property: How to Catch Up with Form 3115", href: "/resources/cost-segregation-for-prior-year/" },
            ].map(post => (
              <li key={post.href}>
                <Link href={post.href} className="cs-footer-news">{post.title}</Link>
                <Link href={post.href} style={{ fontSize: 12, color: "#6b8db5", textDecoration: "none" }}>Read More »</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Software + Stay connected */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#93afd4", marginBottom: 16 }}>Software</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <li><a href="https://www.kbkg.com/481a-calculator" target="_blank" rel="noopener noreferrer" className="cs-footer-link">481(a)</a></li>
              <li><a href="https://www.kbkg.com/partial-disposition-calculator" target="_blank" rel="noopener noreferrer" className="cs-footer-link">Partial Disposition Calculator</a></li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#93afd4", marginBottom: 16 }}>Stay Connected</h3>
            <Link href="/stay-connected/" className="cs-footer-link" style={{ fontSize: 14, textDecoration: "underline" }}>
              Subscribe to SMS Notifications
            </Link>
          </div>
        </div>
      </div>

      {/* Legal bar */}
      <div style={{ borderTop: "1px solid #2d4a7a", padding: "20px 32px", display: "flex", justifyContent: "center", gap: 24, fontSize: 12, flexWrap: "wrap" }}>
        <a href="https://privacy.cptn.co/privacy-policy/f7adcbbd-7982-4fab-92ad-efc8b1cb7ed8" target="_blank" rel="noopener noreferrer" className="cs-footer-legal">Privacy Policy</a>
        <span style={{ color: "#6b8db5" }}>|</span>
        <a href="https://www.kbkg.com/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="cs-footer-legal">Terms and Conditions</a>
      </div>
    </footer>
  );
}