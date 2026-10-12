
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import type { SiteSettingsDocument } from "../../types.generated";

const LOGO_SRC = "/images/logo.svg";

const NAVY = "#102A43";
const NAVY_DARK = "#0B1F33";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const RESOURCES = [
  { label: "Help Center", href: "/help-center" },
  { label: "Resources", href: "/resources" },
];

const SIGN_IN = "https://accounts.accessbit.io";
const GET_STARTED = "https://accessbit.io/#waitlist";

type Props = {
  settings: SiteSettingsDocument | null;
};

export default function Navbar({ settings }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const d = settings?.data;

  const navigation = d?.navigation
    ? (d.navigation as any[])
    : NAV_LINKS;

  const signInUrl = isFilled.link(d?.sign_in_link)
    ? d.sign_in_link.url
    : SIGN_IN;

  const getStartedUrl = isFilled.link(d?.get_started_link)
    ? d.get_started_link.url
    : GET_STARTED;

  return (
    <>
     

      {/* Navbar */}
      <header
        style={{
          position: "relative",
          zIndex: 100,
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px",
            width: "auto",
    height: "auto",
            
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="Cost Segregation home"
            style={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            {d?.logo ? (
              <PrismicNextImage
                field={d.logo}
                style={{
                  width: "180px",
                  height: "auto",
                  display: "block",
                }}
              />
            ) : (
              <Image
                src={LOGO_SRC}
                alt="Cost Segregation"
                width={180}
                height={50}
                priority
                style={{
                  width: "180px",
                  height: "auto",
                }}
              />
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="desktop-nav"
            aria-label="Main navigation"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "30px",
            }}
          >
            {navigation.map((item: any, index: number) => {
              const label = item?.label ?? item?.name ?? "";
              const href = item?.link?.url ?? item?.href ?? "#";

              if (!label) return null;

              return (
                <Link
                  key={`${label}-${index}`}
                  href={href}
                  style={{
                    color: NAVY,
                    textDecoration: "none",
                    fontSize: "15px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </Link>
              );
            })}

            {/* Resources */}
            <div
              style={{
                position: "relative",
              }}
              onMouseEnter={() => setResourcesOpen(true)}
              onMouseLeave={() => setResourcesOpen(false)}
            >
              <button
                type="button"
                aria-expanded={resourcesOpen}
                onClick={() => setResourcesOpen((value) => !value)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: NAVY,
                  fontSize: "15px",
                  fontWeight: 500,
                  cursor: "pointer",
                  padding: "8px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Resources
                <span
                  style={{
                    fontSize: "11px",
                    transform: resourcesOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  ▼
                </span>
              </button>

              {resourcesOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "-20px",
                    minWidth: "190px",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
                    padding: "8px",
                  }}
                >
                  {RESOURCES.map((resource) => (
                    <Link
                      key={resource.label}
                      href={resource.href}
                      onClick={() => setResourcesOpen(false)}
                      style={{
                        display: "block",
                        padding: "10px 12px",
                        color: NAVY,
                        textDecoration: "none",
                        fontSize: "14px",
                        borderRadius: "5px",
                      }}
                    >
                      {resource.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop CTA Buttons */}
          <div
            className="desktop-actions"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <a
              href={signInUrl}
              style={{
                color: NAVY,
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
                padding: "11px 17px",
                border: `1px solid ${NAVY}`,
                borderRadius: "6px",
                whiteSpace: "nowrap",
              }}
            >
              Sign In
            </a>

            <a
              href={getStartedUrl}
              style={{
                color: "#fff",
                background: NAVY,
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
                padding: "12px 18px",
                border: `1px solid ${NAVY}`,
                borderRadius: "6px",
                whiteSpace: "nowrap",
              }}
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
            style={{
              display: "none",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            <span
              style={{
                display: "block",
                width: "25px",
                height: "2px",
                background: NAVY,
                marginBottom: "5px",
              }}
            />
            <span
              style={{
                display: "block",
                width: "25px",
                height: "2px",
                background: NAVY,
                marginBottom: "5px",
              }}
            />
            <span
              style={{
                display: "block",
                width: "25px",
                height: "2px",
                background: NAVY,
              }}
            />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div
            className="mobile-nav"
            style={{
              background: "#fff",
              borderTop: "1px solid #e5e7eb",
              padding: "20px 24px 25px",
            }}
          >
            <nav
              aria-label="Mobile navigation"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {navigation.map((item: any, index: number) => {
                const label = item?.label ?? item?.name ?? "";
                const href = item?.link?.url ?? item?.href ?? "#";

                if (!label) return null;

                return (
                  <Link
                    key={`${label}-${index}`}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      color: NAVY,
                      textDecoration: "none",
                      fontSize: "16px",
                      fontWeight: 500,
                      padding: "12px 0",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}

              {/* Mobile Resources */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setResourcesOpen((value) => !value)
                  }
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    color: NAVY,
                    cursor: "pointer",
                    padding: "12px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "16px",
                    fontWeight: 500,
                  }}
                >
                  Resources
                  <span
                    style={{
                      fontSize: "11px",
                      transform: resourcesOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </span>
                </button>

                {resourcesOpen && (
                  <div
                    style={{
                      paddingLeft: "15px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {RESOURCES.map((resource) => (
                      <Link
                        key={resource.label}
                        href={resource.href}
                        onClick={() => {
                          setMobileOpen(false);
                          setResourcesOpen(false);
                        }}
                        style={{
                          color: NAVY,
                          textDecoration: "none",
                          fontSize: "15px",
                          padding: "10px 0",
                        }}
                      >
                        {resource.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Buttons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                <a
                  href={signInUrl}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    color: NAVY,
                    textDecoration: "none",
                    textAlign: "center",
                    fontSize: "15px",
                    fontWeight: 600,
                    padding: "12px 18px",
                    border: `1px solid ${NAVY}`,
                    borderRadius: "6px",
                  }}
                >
                  Sign In
                </a>

                <a
                  href={getStartedUrl}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    color: "#fff",
                    background: NAVY,
                    textDecoration: "none",
                    textAlign: "center",
                    fontSize: "15px",
                    fontWeight: 600,
                    padding: "13px 18px",
                    border: `1px solid ${NAVY}`,
                    borderRadius: "6px",
                  }}
                >
                  Get Started
                </a>
              </div>
            </nav>
          </div>
        )}
         {/* Announcement Bar */}
    {d?.announcement && (
  <div
    style={{
      background: "#277CE6",
      color: "#fff",
      textAlign: "center",
      padding: "9px 20px",
      fontSize: "13px",
      lineHeight: "1.4",
    }}
  >
    <PrismicRichText field={d.announcement} />
  </div>
)}
      </header>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 991px) {
          .desktop-nav,
          .desktop-actions {
            display: none !important;
          }

          .mobile-menu-button {
            display: block !important;
          }
        }

        @media (min-width: 992px) {
          .mobile-nav,
          .mobile-menu-button {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          header > div:first-child {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>
    </>
  );
}

