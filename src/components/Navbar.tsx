// components/Navbar.tsx — 1:1 match of costsegregation.com navbar. Uses inline styles
// so it renders correctly regardless of Tailwind config/scanning setup.
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import type { SettingsDocument } from "@/prismicio-types";

const LOGO_SRC = "https://www.costsegregation.com/wp-content/uploads/2025/10/CScom-Lock-up-484x238-1-300x148.png";
const NAVY = "#1a2e5a";
const NAVY_DARK = "#0f1e3d";

const NAV_LINKS = [
  { label: "For Tax Advisors", href: "/for-tax-advisors/" },
  { label: "Calculator",       href: "/#calculator" },
  { label: "Pricing",          href: "/#pricing" },
  { label: "FAQ",              href: "/faq/" },
];
const RESOURCES = [
  { label: "Blog",      href: "/resources/blog/" },
  { label: "Education", href: "/resources/what-is-cost-segregation/" },
];
const SIGN_IN     = "https://app.costsegregation.com/sign-in";
const GET_STARTED = "https://app.costsegregation.com/sign-up";

type Props = { settings: SettingsDocument | null };

export default function Navbar({ settings }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resOpen,    setResOpen]    = useState(false);
  const d = settings?.data;

  // Build nav items from Prismic or fallback
  const navItems = (d?.navigation as any[])?.length
    ? (d.navigation as any[])
    : NAV_LINKS.map(l => ({ label: l.label, link: { url: l.href }, has_dropdown: false }));

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, width: "100%" }}>

     

      {/* Main nav bar */}
      <nav style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0 }}>
            {d?.logo?.url ? (
              <PrismicNextImage field={d.logo as any}
                style={{ height: 48, width: "auto" }} />
            ) : (
              <Image src={LOGO_SRC} alt="CostSegregation.com" width={180} height={56}
                     style={{ height: 48, width: "auto" }} priority />
            )}
          </Link>

          {/* Desktop nav hidden on mobile via media query workaround using a class */}
          <ul className="cs-desktop-nav" style={{ display: "flex", alignItems: "center", gap: 24, listStyle: "none", margin: 0, padding: 0, fontSize: 15, fontWeight: 500, color: "#374151" }}>
            {navItems.map((item: any, i: number) => (
              item.has_dropdown ? null : (
                <li key={i}>
                  <Link href={item.link?.url ?? "#"}
                        style={{ color: "#374151", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.color = NAVY)}
                        onMouseLeave={e => (e.currentTarget.style.color = "#374151")}>
                    {item.label}
                  </Link>
                </li>
              )
            ))}

            {/* Resources dropdown */}
            <li style={{ position: "relative" }}
                onMouseEnter={() => setResOpen(true)}
                onMouseLeave={() => setResOpen(false)}>
              <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 15, fontWeight: 500, color: "#374151", padding: 0 }}>
                Resources
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transition: "transform .2s", transform: resOpen ? "rotate(180deg)" : "none" }}>
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {resOpen && (
                <ul style={{ position: "absolute", top: "100%", left: 0, width: 200, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,.1)", padding: "6px 0", listStyle: "none", margin: 0, zIndex: 100 }}>
                  {RESOURCES.map((r, i) => (
                    <li key={i}>
                      <Link href={r.href}
                            style={{ display: "block", padding: "8px 16px", fontSize: 14, color: "#374151", textDecoration: "none" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = NAVY; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#374151"; }}>
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li>
              <Link href="/about/"
                    style={{ color: "#374151", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.color = NAVY)}
                    onMouseLeave={e => (e.currentTarget.style.color = "#374151")}>
                About
              </Link>
            </li>
          </ul>

          {/* Desktop CTAs */}
          <div className="cs-desktop-nav" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href={d?.sign_in_link?.url ?? SIGN_IN}
               style={{ fontSize: 15, fontWeight: 500, color: "#374151", textDecoration: "none" }}
               onMouseEnter={e => (e.currentTarget.style.color = NAVY)}
               onMouseLeave={e => (e.currentTarget.style.color = "#374151")}>
              {d?.sign_in_label ?? "Sign In"}
            </a>
            <a href={d?.get_started_link?.url ?? GET_STARTED}
               style={{ backgroundColor: NAVY, color: "#fff", padding: "10px 20px", borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "background .2s" }}
               onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#253f7a")}
               onMouseLeave={e => (e.currentTarget.style.backgroundColor = NAVY)}>
              {d?.get_started_label ?? "Get Started"}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="cs-mobile-menu-btn"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(v => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {mobileOpen
                ? <path d="M6 6l12 12M6 18L18 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                : <path d="M3 6h18M3 12h18M3 18h18" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu  */}
        {mobileOpen && (
          <div style={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#fff", padding: "16px 24px 24px" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16, fontSize: 16, fontWeight: 500 }}>
              {NAV_LINKS.map((l, i) => (
                <li key={i}><Link href={l.href} onClick={() => setMobileOpen(false)} style={{ color: "#374151", textDecoration: "none" }}>{l.label}</Link></li>
              ))}
              <li>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", marginBottom: 8 }}>Resources</p>
                <ul style={{ listStyle: "none", padding: "0 0 0 12px", margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {RESOURCES.map((r, i) => (
                    <li key={i}><Link href={r.href} onClick={() => setMobileOpen(false)} style={{ color: "#374151", textDecoration: "none" }}>{r.label}</Link></li>
                  ))}
                </ul>
              </li>
              <li><Link href="/about/" onClick={() => setMobileOpen(false)} style={{ color: "#374151", textDecoration: "none" }}>About</Link></li>
              <li style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
                <a href={SIGN_IN} style={{ color: "#374151", textDecoration: "none", display: "block", marginBottom: 12 }}>Sign In</a>
                <a href={GET_STARTED}
                   style={{ backgroundColor: NAVY, color: "#fff", padding: "12px 20px", borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: "none", display: "block", textAlign: "center" }}>
                  Get Started
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>
 {/* Announcement bar */}
     <div
  style={{
    backgroundColor: "#277CE6",
    padding: "8px 16px",
    textAlign: "center",
    fontSize: 13,
    fontWeight: 500,
    color: "#fff",
  }}
>
        Join our newsletter to get the latest Cost Segregation insights{" "}|{" "}
        <button
          style={{ background: "none", border: "none", color: "#fff", fontWeight: 700, textDecoration: "underline", cursor: "pointer", padding: 0, fontSize: 13 }}
          onClick={() => {/* open newsletter modal */}}
        >
          Subscribe Here
        </button>
      </div>
      {/* Responsive: hide desktop nav on mobile, show hamburger */}
      <style>{`
        .cs-desktop-nav { display: flex !important; }
        .cs-mobile-menu-btn { display: none !important; }
        @media (max-width: 1023px) {
          .cs-desktop-nav { display: none !important; }
          .cs-mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}