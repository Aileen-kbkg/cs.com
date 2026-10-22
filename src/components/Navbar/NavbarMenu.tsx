"use client";

import { LinkField } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { useEffect, useRef, useState } from "react";

import styles from "./Navbar.module.css";

export type NavItem = {
  label: string;
  link: LinkField | null;
  children: { label: string; link: LinkField }[];
};

type Cta = { label: string; link: LinkField } | null;

const CaretDown = () => (
  <svg viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z" />
  </svg>
);

const ChevronRight = () => (
  <svg viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
  </svg>
);

const MenuIcon = () => (
  <svg
    aria-hidden="true"
    className="e-font-icon-svg e-fas-align-right"
    viewBox="0 0 448 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M16 224h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16zm416 192H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm3.17-384H172.83A12.82 12.82 0 0 0 160 44.83v38.34A12.82 12.82 0 0 0 172.83 96h262.34A12.82 12.82 0 0 0 448 83.17V44.83A12.82 12.82 0 0 0 435.17 32zm0 256H172.83A12.82 12.82 0 0 0 160 300.83v38.34A12.82 12.82 0 0 0 172.83 352h262.34A12.82 12.82 0 0 0 448 339.17v-38.34A12.82 12.82 0 0 0 435.17 288z"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    aria-hidden="true"
    className="e-font-icon-svg e-fas-times"
    viewBox="0 0 352 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
    />
  </svg>
);

/** Menu, dropdown and header buttons (interactive part of the navbar). */
export default function NavbarMenu({
  items,
  signIn,
  getStarted,
}: {
  items: NavItem[];
  signIn: Cta;
  getStarted: Cta;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [openMobileSub, setOpenMobileSub] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const closeAll = () => {
    setOpenDropdown(null);
    setOpenMobileSub(null);
    setMobileOpen(false);
  };

  // Desktop dropdown closes on outside click. The mobile sheet has its own
  // close button and backdrop, so it is deliberately not closed here.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAll();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Lock page scroll behind the open sheet.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  // Close if the viewport grows past the burger breakpoint.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1025px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeAll();
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /* ---------------- Desktop menu ---------------- */

  const desktopMenu = (
    <ul className={styles.menu}>
      {items.map((item, index) => {
        const hasChildren = item.children.length > 0;
        const isOpen = openDropdown === index;
        return (
          <li
            key={`${item.label}-${index}`}
            className={styles.menuItem}
            onMouseEnter={hasChildren ? () => setOpenDropdown(index) : undefined}
            onMouseLeave={hasChildren ? () => setOpenDropdown(null) : undefined}
            onBlur={
              hasChildren
                ? (event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setOpenDropdown((current) => (current === index ? null : current));
                  }
                }
                : undefined
            }
          >
            <div className={styles.itemRow}>
              {item.link ? (
                <PrismicNextLink field={item.link} className={styles.item}>
                  {item.label}
                </PrismicNextLink>
              ) : (
                <span className={styles.item}>{item.label}</span>
              )}
              {hasChildren && (
                <button
                  type="button"
                  className={styles.subArrow}
                  aria-label={`${item.label} submenu`}
                  aria-expanded={isOpen}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenDropdown(isOpen ? null : index);
                  }}
                >
                  <CaretDown />
                </button>
              )}
            </div>
            {hasChildren && (
              <ul className={`${styles.subMenu} ${isOpen ? styles.subMenuOpen : ""}`}>
                {item.children.map((child) => (
                  <li key={child.label}>
                    <PrismicNextLink
                      field={child.link}
                      className={styles.subItem}
                      onClick={() => setOpenDropdown(null)}
                    >
                      {child.label}
                    </PrismicNextLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={styles.right} ref={navRef}>
      <nav className={styles.nav} aria-label="Main navigation">
        {desktopMenu}

        <button
          type="button"
          className={`${styles.toggle} cs-mobile-toggle`}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={(event) => {
            event.stopPropagation();
            setMobileOpen((open) => !open);
          }}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {signIn && (
        <PrismicNextLink
          field={signIn.link}
          className={styles.signIn}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          {signIn.label}
        </PrismicNextLink>
      )}
      {getStarted && (
        <PrismicNextLink
          field={getStarted.link}
          className={styles.getStarted}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          <span>{getStarted.label}</span>
          <span className={styles.getStartedIcon}>
            <ChevronRight />
          </span>
        </PrismicNextLink>
      )}

      {/* Mobile sheet. Rendered only when open */}
      {mobileOpen && (
        <div
          id="mobile-navigation"
          className={`${styles.sheet} cs-mobile-sheet`}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className={styles.sheetInner}>
            <ul className={styles.sheetMenu}>
              {items.map((item, index) => {
                const hasChildren = item.children.length > 0;
                const isOpen = openMobileSub === index;
                return (
                  <li key={`${item.label}-m-${index}`} className={styles.sheetItem}>
                    <div className={styles.sheetRow}>
                      {item.link ? (
                        <PrismicNextLink
                          field={item.link}
                          className={styles.sheetLink}
                          onClick={closeAll}
                        >
                          {item.label}
                        </PrismicNextLink>
                      ) : (
                        <span className={styles.sheetLink}>{item.label}</span>
                      )}

                      {hasChildren && (
                        <button
                          type="button"
                          className={`${styles.sheetCaret} ${isOpen ? styles.sheetCaretOpen : ""
                            }`}
                          aria-label={`${item.label} submenu`}
                          aria-expanded={isOpen}
                          onClick={() => setOpenMobileSub(isOpen ? null : index)}
                        >
                          <CaretDown />
                        </button>
                      )}
                    </div>

                    {hasChildren && isOpen && (
                      <ul className={styles.sheetSubMenu}>
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <PrismicNextLink
                              field={child.link}
                              className={styles.sheetSubLink}
                              onClick={closeAll}
                            >
                              {child.label}
                            </PrismicNextLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className={styles.sheetFooter}>
              {signIn && (
                <PrismicNextLink
                  field={signIn.link}
                  className={styles.sheetSignIn}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  onClick={closeAll}
                >
                  {signIn.label}
                </PrismicNextLink>
              )}
              {getStarted && (
                <PrismicNextLink
                  field={getStarted.link}
                  className={styles.sheetGetStarted}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  onClick={closeAll}
                >
                  <span>{getStarted.label}</span>
                  <span className={styles.getStartedIcon}>
                    <ChevronRight />
                  </span>
                </PrismicNextLink>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}