// components/Navbar.tsx — 1:1 rebuild of the costsegregation.com navbar.
// Renders from the Prismic "settings" singleton when available, falling back
// to the exact live-site content/links so the nav is correct even before
// the settings singleton is wired up in Prismic.
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Content } from "@prismicio/client";
import { PrismicLink } from "@prismicio/react";

// ---- Fallback content, copied verbatim from the live site ----------------
const FALLBACK = {
  logo: "/logo.png", // replace with the real asset once uploaded to Prismic
  links: [
    { label: "For Tax Advisors", url: "/for-tax-advisors/" },
    { label: "Calculator", url: "/#calculator" },
    { label: "Pricing", url: "/#pricing" },
    { label: "FAQ", url: "/faq/" },
  ],
  resourcesDropdown: [
    { label: "Blog", url: "/resources/blog/" },
    { label: "Education", url: "/resources/what-is-cost-segregation/" },
  ],
  about: { label: "About", url: "/about/" },
  signIn: "https://app.costsegregation.com/sign-in",
  getStarted: "https://app.costsegregation.com/sign-up",
  newsletterText: "Join our newsletter to get the latest Cost Segregation insights",
  newsletterCta: "Subscribe Here",
};

export type NavbarProps = {
  settings?: Content.SettingsDocument | null;
  onNewsletterClick?: () => void;
};

export default function Navbar({ settings, onNewsletterClick }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const data = settings?.data;
  const navLinks = data?.nav_links?.length
    ? data.nav_links
    : FALLBACK.links.map((l) => ({ label: l.label, link: { url: l.url } }));
  const resourcesLinks = data?.resources_dropdown?.length
    ? data.resources_dropdown
    : FALLBACK.resourcesDropdown.map((l) => ({ label: l.label, link: { url: l.url } }));

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      {/* Top utility bar */}
      <div className="bg-[#0a1f44] px-4 py-2 text-center text-sm text-white">
        {FALLBACK.newsletterText}{" "}
        <button
          type="button"
          onClick={onNewsletterClick}
          className="font-semibold underline underline-offset-2"
        >
          {FALLBACK.newsletterCta}
        </button>
      </div>

      {/* Main nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src={FALLBACK.logo}
            alt="CostSegregation.com"
            width={180}
            height={56}
            priority
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 text-sm font-medium text-zinc-800 lg:flex">
          {navLinks.map((item, i) => (
            <li key={i}>
              {"link" in item ? (
                <PrismicLink field={item.link} className="hover:text-[#0a1f44]">
                  {item.label}
                </PrismicLink>
              ) : (
                <Link href={item.url} className="hover:text-[#0a1f44]">
                  {item.label}
                </Link>
              )}
            </li>
          ))}

          {/* Resources dropdown */}
          <li
            className="relative"
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 hover:text-[#0a1f44]"
              aria-expanded={resourcesOpen}
            >
              Resources
              <svg
                className={`h-3 w-3 transition-transform ${resourcesOpen ? "rotate-180" : ""}`}
                viewBox="0 0 12 8"
                fill="none"
                aria-hidden="true"
              >
                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            {resourcesOpen && (
              <ul className="absolute left-0 top-full w-56 rounded-md border border-zinc-100 bg-white py-2 shadow-lg">
                {resourcesLinks.map((item, i) => (
                  <li key={i}>
                    <Link
                      href={"url" in item ? item.url : "#"}
                      className="block px-4 py-2 hover:bg-zinc-50"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li>
            <Link href={FALLBACK.about.url} className="hover:text-[#0a1f44]">
              {FALLBACK.about.label}
            </Link>
          </li>
        </ul>

        {/* Right-side CTAs */}
        <div className="hidden items-center gap-4 lg:flex">
          <a href={FALLBACK.signIn} className="text-sm font-medium text-zinc-800 hover:text-[#0a1f44]">
            Sign In
          </a>
          <a
            href={FALLBACK.getStarted}
            className="rounded-full bg-[#0a1f44] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#13326b]"
          >
            Get Started
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex items-center lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-zinc-100 bg-white px-6 py-4 lg:hidden">
          <ul className="flex flex-col gap-4 text-base font-medium text-zinc-800">
            {navLinks.map((item, i) => (
              <li key={i}>
                <Link
                  href={"link" in item ? item.link.url ?? "#" : item.url}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <span className="text-sm font-semibold text-zinc-500">Resources</span>
              <ul className="mt-2 flex flex-col gap-3 pl-4">
                {resourcesLinks.map((item, i) => (
                  <li key={i}>
                    <Link
                      href={"url" in item ? item.url : "#"}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link href={FALLBACK.about.url} onClick={() => setMobileOpen(false)}>
                {FALLBACK.about.label}
              </Link>
            </li>
            <li className="pt-2">
              <a href={FALLBACK.signIn} className="block">
                Sign In
              </a>
            </li>
            <li>
              <a
                href={FALLBACK.getStarted}
                className="block rounded-full bg-[#0a1f44] px-5 py-2.5 text-center text-sm font-semibold text-white"
              >
                Get Started
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}