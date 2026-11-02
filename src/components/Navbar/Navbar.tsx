import { Content, isFilled, LinkField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";

import { createClient } from "@/prismicio";

import NavbarMenu, { type NavItem } from "./NavbarMenu";
import "./MainNavigation.css";

type NavbarProps = {
  /** Optional: pass the site_settings document if the layout already fetched it. */
  settings?: Content.SiteSettingsDocument | null;
};

const linkOrNull = (field: LinkField | undefined) => (field && isFilled.link(field) ? field : null);

/**
 * Site header — matches the live costsegregation.com Elementor header (#11):
 * logo, horizontal menu with a Resources dropdown and Sign In / Get Started,
 * and the menu icon with the full-screen menu popup ≤1024px. Content comes
 * from the `site_settings` singleton.
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
    <header className="cs-header-wrapper">
      <div className="cs-header__bar">
        <div className="cs-header__bar-inner">
          <div className="cs-header__logo-box">
            {isFilled.image(data.logo) && (
              <a
                href="/"
                className="cs-header__logo-link"
                aria-label="CostSegregation.com home"
              >
                <PrismicNextImage
                  field={data.logo}
                  className="cs-header__logo"
                  sizes="205px"
                  priority
                  fallbackAlt=""
                />
              </a>
            )}
          </div>

          <NavbarMenu
            items={items}
            logo={isFilled.image(data.logo) ? data.logo : null}
            signIn={
              data.sign_in_label && linkOrNull(data.sign_in_link)
                ? {
                  label: data.sign_in_label,
                  link: data.sign_in_link,
                }
                : null
            }
            getStarted={
              data.get_started_label && linkOrNull(data.get_started_link)
                ? {
                  label: data.get_started_label,
                  link: data.get_started_link,
                }
                : null
            }
          />
        </div>
      </div>
    </header>
  );
}
