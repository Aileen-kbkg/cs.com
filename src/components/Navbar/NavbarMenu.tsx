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
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2" y="5" width="20" height="2" rx="1" />
    <rect x="2" y="11" width="20" height="2" rx="1" />
    <rect x="2" y="17" width="20" height="2" rx="1" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5.3 5.3a1 1 0 0 1 1.4 0L12 10.6l5.3-5.3a1 1 0 1 1 1.4 1.4L13.4 12l5.3 5.3a1 1 0 0 1-1.4 1.4L12 13.4l-5.3 5.3a1 1 0 0 1-1.4-1.4l5.3-5.3-5.3-5.3a1 1 0 0 1 0-1.4z" />
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
  const navRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click / Escape
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const renderItems = (variant: "main" | "dropdown") => (
    <ul className={variant === "main" ? styles.menu : styles.mobileMenu}>
      {items.map((item, index) => {
        const hasChildren = item.children.length > 0;
        const isOpen = openDropdown === index;
        return (
          <li
            key={`${item.label}-${index}`}
            className={styles.menuItem}
            onMouseEnter={
              variant === "main" && hasChildren ? () => setOpenDropdown(index) : undefined
            }
            onMouseLeave={
              variant === "main" && hasChildren ? () => setOpenDropdown(null) : undefined
            }
          >
            <div className={styles.itemRow}>
              {item.link ? (
                <PrismicNextLink
                  field={item.link}
                  className={styles.item}
                  onClick={() => setMobileOpen(false)}
                >
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
                      onClick={() => {
                        setOpenDropdown(null);
                        setMobileOpen(false);
                      }}
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
        {renderItems("main")}
        <button
          type="button"
          className={styles.toggle}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={(event) => {
            event.stopPropagation();
            setMobileOpen((open) => !open);
          }}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <div className={`${styles.mobilePanel} ${mobileOpen ? styles.mobilePanelOpen : ""}`}>
          {renderItems("dropdown")}
        </div>
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
    </div>
  );
}
