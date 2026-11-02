"use client";

import { asLink, ImageField, isFilled, LinkField } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./Navbar.module.css";

export type NavItem = {
  label: string;
  link: LinkField | null;
  children: { label: string; link: LinkField }[];
};

type Cta = { label: string; link: LinkField } | null;

/** Live smartmenus timing: open 250ms after hover, close 500ms after leaving. */
const SHOW_DELAY = 250;
const HIDE_DELAY = 500;

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

/** Font Awesome "align-right", the live header's menu icon. */
const MenuIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 224h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16zm416 192H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm3.17-384H172.83A12.82 12.82 0 0 0 160 44.83v38.34A12.82 12.82 0 0 0 172.83 96h262.34A12.82 12.82 0 0 0 448 83.17V44.83A12.82 12.82 0 0 0 435.17 32zm0 256H172.83A12.82 12.82 0 0 0 160 300.83v38.34A12.82 12.82 0 0 0 172.83 352h262.34A12.82 12.82 0 0 0 448 339.17v-38.34A12.82 12.82 0 0 0 435.17 288z" />
  </svg>
);

/** Elementor's popup close icon (eicon-close). */
const CloseIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
    <path d="M742 167L500 408 258 167C246 154 233 150 217 150 196 150 179 158 167 167 154 179 150 196 150 212 150 229 154 242 171 254L408 500 167 742C138 771 138 800 167 829 196 858 225 858 254 829L496 587 738 829C750 842 767 846 783 846 800 846 817 842 829 829 842 817 846 804 846 783 846 767 842 750 829 737L588 500 833 258C863 229 863 200 833 171 804 137 775 137 742 167Z" />
  </svg>
);

/** "/faq/" → "/faq"; anchors and query strings are kept separately. */
const splitUrl = (link: LinkField | null) => {
  const url = link ? asLink(link) : null;
  if (!url) return null;
  try {
    const parsed = new URL(url, "https://www.costsegregation.com");
    const external =
      /^https?:/i.test(url) && !/(^|\.)costsegregation\.com$/i.test(parsed.hostname);
    if (external) return null;
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    return { path, hash: parsed.hash.replace(/^#/, "") };
  } catch {
    return null;
  }
};

/**
 * Live (WordPress) marks the item for the current page and the parent of a
 * current child. Anchor items (/#calculator) only light up on the home
 * page while their section is on screen, as Elementor's scroll spy does.
 */
const useActiveItem = (items: NavItem[]) => {
  const pathname = (usePathname() || "/").replace(/\/+$/, "") || "/";
  const [anchorInView, setAnchorInView] = useState<string | null>(null);

  const anchors = items
    .map((item) => splitUrl(item.link))
    .filter((url): url is { path: string; hash: string } => Boolean(url?.hash))
    .filter((url) => url.path === pathname)
    .map((url) => url.hash);
  const anchorKey = anchors.join(",");

  // The section under the middle of the viewport. Looked up on every check,
  // because the home page renders its sections on the client.
  useEffect(() => {
    if (!anchorKey) return;
    const ids = anchorKey.split(",");
    const check = () => {
      const middle = window.innerHeight / 2;
      const current = ids.find((id) => {
        const box = document.getElementById(id)?.getBoundingClientRect();
        return Boolean(box && box.top <= middle && box.bottom > middle);
      });
      setAnchorInView(current ?? null);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      setAnchorInView(null);
    };
  }, [anchorKey]);

  const matches = (link: LinkField | null) => {
    const url = splitUrl(link);
    if (!url || url.path === "/" && !url.hash) return false;
    if (url.hash) return url.path === pathname && url.hash === anchorInView;
    return url.path === pathname;
  };

  return (item: NavItem) => {
    if (matches(item.link)) return true;
    if (item.children.some((child) => matches(child.link))) return true;
    // A section item also covers its articles: /resources/<uid>.
    const url = splitUrl(item.link);
    return Boolean(
      item.children.length && url && !url.hash && url.path !== "/" &&
        pathname.startsWith(`${url.path}/`),
    );
  };
};

/** Menu, dropdown, header buttons and the mobile menu popup. */
export default function NavbarMenu({
  items,
  logo,
  signIn,
  getStarted,
}: {
  items: NavItem[];
  logo: ImageField | null;
  signIn: Cta;
  getStarted: Cta;
}) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileSub, setOpenMobileSub] = useState<number | null>(null);
  const timer = useRef<number | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isActive = useActiveItem(items);
  const pathname = usePathname();

  const clearTimer = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  const openSoon = (index: number) => {
    clearTimer();
    timer.current = window.setTimeout(() => setOpenDropdown(index), SHOW_DELAY);
  };

  const closeSoon = () => {
    clearTimer();
    timer.current = window.setTimeout(() => setOpenDropdown(null), HIDE_DELAY);
  };

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setOpenMobileSub(null);
  }, []);

  // Escape closes the dropdown and the mobile menu.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenDropdown(null);
      if (mobileOpen) {
        closeMobile();
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, closeMobile]);

  useEffect(() => clearTimer, []);

  // A new route closes everything.
  useEffect(() => {
    setOpenDropdown(null);
    closeMobile();
  }, [pathname, closeMobile]);

  // Mobile menu: lock the page behind it, focus the close button.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  // The popup only exists at burger widths.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1025px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeMobile();
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [closeMobile]);

  return (
    <div className={styles.right}>
      <nav className={styles.nav} aria-label="Main navigation">
        <ul className={styles.menu}>
          {items.map((item, index) => {
            const hasChildren = item.children.length > 0;
            const isOpen = openDropdown === index;
            const active = isActive(item);
            const itemClass = [
              styles.item,
              active ? styles.itemActive : "",
              isOpen ? styles.itemHighlighted : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <li
                key={`${item.label}-${index}`}
                className={styles.menuItem}
                onMouseEnter={hasChildren ? () => openSoon(index) : undefined}
                onMouseLeave={hasChildren ? closeSoon : undefined}
                onFocus={hasChildren ? () => setOpenDropdown(index) : undefined}
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
                {item.link ? (
                  <PrismicNextLink
                    field={item.link}
                    className={itemClass}
                    aria-current={active ? "page" : undefined}
                    aria-haspopup={hasChildren ? "true" : undefined}
                    aria-expanded={hasChildren ? isOpen : undefined}
                  >
                    {item.label}
                    {hasChildren && (
                      <span className={styles.subArrow}>
                        <CaretDown />
                      </span>
                    )}
                  </PrismicNextLink>
                ) : (
                  <span className={itemClass}>{item.label}</span>
                )}

                {hasChildren && (
                  <ul
                    className={`${styles.subMenu} ${isOpen ? styles.subMenuOpen : ""}`}
                    onMouseEnter={clearTimer}
                  >
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

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
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

      {/* Mobile menu — the live Elementor popup #927 */}
      {mobileOpen && (
        <div
          className={styles.popup}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeMobile();
          }}
        >
          <div
            id="mobile-navigation"
            className={styles.popupPanel}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <button
              ref={closeRef}
              type="button"
              className={styles.popupClose}
              aria-label="Close menu"
              onClick={() => {
                closeMobile();
                toggleRef.current?.focus();
              }}
            >
              <CloseIcon />
            </button>

            <div className={styles.popupInner}>
              {logo && isFilled.image(logo) && (
                <a href="/" className={styles.popupLogo} onClick={closeMobile}>
                  <PrismicNextImage field={logo} sizes="200px" fallbackAlt="" />
                </a>
              )}

              <ul className={styles.popupMenu}>
                {items.map((item, index) => {
                  const hasChildren = item.children.length > 0;
                  const isOpen = openMobileSub === index;
                  const active = isActive(item);
                  return (
                    <li key={`${item.label}-m-${index}`}>
                      <div className={styles.popupRow}>
                        {item.link ? (
                          <PrismicNextLink
                            field={item.link}
                            className={styles.popupLink}
                            aria-current={active ? "page" : undefined}
                            onClick={closeMobile}
                          >
                            {item.label}
                          </PrismicNextLink>
                        ) : (
                          <span className={styles.popupLink}>{item.label}</span>
                        )}
                        {hasChildren && (
                          <button
                            type="button"
                            className={`${styles.popupCaret} ${isOpen ? styles.popupCaretOpen : ""}`}
                            aria-label={`${item.label} submenu`}
                            aria-expanded={isOpen}
                            aria-controls={`mobile-sub-${index}`}
                            onClick={() => setOpenMobileSub(isOpen ? null : index)}
                          >
                            <CaretDown />
                          </button>
                        )}
                      </div>

                      {hasChildren && isOpen && (
                        <ul id={`mobile-sub-${index}`} className={styles.popupSubMenu}>
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <PrismicNextLink
                                field={child.link}
                                className={styles.subItem}
                                onClick={closeMobile}
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

              <div className={styles.popupDivider} aria-hidden="true" />

              <div className={styles.popupButtons}>
                {signIn && (
                  <PrismicNextLink
                    field={signIn.link}
                    className={`${styles.signIn} ${styles.popupSignIn}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    onClick={closeMobile}
                  >
                    {signIn.label}
                  </PrismicNextLink>
                )}
                {getStarted && (
                  <PrismicNextLink
                    field={getStarted.link}
                    className={`${styles.getStarted} ${styles.popupGetStarted}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    onClick={closeMobile}
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
        </div>
      )}
    </div>
  );
}
