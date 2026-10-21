import { Content, isFilled, LinkField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";

import { createClient } from "@/prismicio";

import NavbarMenu, { type NavItem } from "./NavbarMenu";
import styles from "./Navbar.module.css";

type NavbarProps = {
  /** Optional: pass the site_settings document if the layout already fetched it. */
  settings?: Content.SiteSettingsDocument | null;
};

const linkOrNull = (field: LinkField | undefined) => (field && isFilled.link(field) ? field : null);

/**
 * Site header — matches the live costsegregation.com Elementor header (#11):
 * logo, horizontal menu with a Resources dropdown, Sign In / Get Started,
 * burger menu ≤1024px, and the blue newsletter bar. Content comes from the
 * `site_settings` singleton.
 */
export default async function Navbar({ settings }: NavbarProps = {}) {
  const doc =
    settings ??
    (await createClient()
      .getSingle("site_settings")
      .catch(() => null));
  if (!doc) return null;
  const data = doc.data;

  const items: NavItem[] = (data.navigation ?? [])
    .filter((item) => item.label)
    .map((item) => ({
      label: item.label as string,
      link: linkOrNull(item.link),
      children: item.has_dropdown
        ? [
            { label: item.dropdown_label_1, link: linkOrNull(item.dropdown_link_1) },
            { label: item.dropdown_label_2, link: linkOrNull(item.dropdown_link_2) },
          ]
            .filter((child) => child.label && child.link)
            .map((child) => ({ label: child.label as string, link: child.link as LinkField }))
        : [],
    }));

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.barInner}>
          <div className={styles.logoBox}>
            {isFilled.image(data.logo) && (
              <a href="/" className={styles.logoLink} aria-label="CostSegregation.com home">
                <PrismicNextImage
                  field={data.logo}
                  className={styles.logo}
                  sizes="205px"
                  priority
                  fallbackAlt=""
                />
              </a>
            )}
          </div>
          <NavbarMenu
            items={items}
            signIn={
              data.sign_in_label && linkOrNull(data.sign_in_link)
                ? { label: data.sign_in_label, link: data.sign_in_link }
                : null
            }
            getStarted={
              data.get_started_label && linkOrNull(data.get_started_link)
                ? { label: data.get_started_label, link: data.get_started_link }
                : null
            }
          />
        </div>
      </div>

      {isFilled.richText(data.announcement) && (
        <div className={styles.announcement}>
          <PrismicRichText field={data.announcement} />
        </div>
      )}
    </header>
  );
}
