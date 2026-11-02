import {
  asText,
  Content,
  GroupField,
  ImageField,
  isFilled,
  KeyTextField,
  LinkField,
  SelectField,
} from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";

import { createClient } from "@/prismicio";

import styles from "./Footer.module.css";
import { SOCIAL_ICONS } from "./socialIcons";
import { postPath } from "@/lib/postUrl";

type LabelLink = { label: KeyTextField; link: LinkField };

/**
 * Footer fields added to `site_settings`. Declared as optional so the footer
 * compiles before and after `prismicio-types.d.ts` is regenerated.
 */
type FooterFields = {
  footer_logo?: ImageField;
  partner_logo?: ImageField;
  footer_tagline?: KeyTextField;
  copyright_text?: KeyTextField;
  contact_heading?: KeyTextField;
  contact_email?: KeyTextField;
  footer_navigation?: GroupField<LabelLink>;
  social_links?: GroupField<{
    platform: SelectField<"Instagram" | "Facebook" | "LinkedIn" | "X" | "YouTube">;
    link: LinkField;
  }>;
  footer_note?: KeyTextField;
  legal_links?: GroupField<LabelLink>;
  recent_news_heading?: KeyTextField;
  read_more_label?: KeyTextField;
  resources_heading?: KeyTextField;
  footer_resources?: GroupField<LabelLink>;
  stay_connected_heading?: KeyTextField;
  stay_connected_links?: GroupField<LabelLink>;
};

type SiteSettingsData = Omit<Content.SiteSettingsDocument["data"], keyof FooterFields> &
  FooterFields;

const POST_COUNT = 3; // live "Recent News" shows the 3 latest posts

const SocialIcon = ({ name }: { name: string }) => {
  const icon = SOCIAL_ICONS[name];
  if (!icon) return null;
  return (
    <svg aria-hidden="true" viewBox={icon.viewBox} xmlns="http://www.w3.org/2000/svg">
      <path d={icon.d} />
    </svg>
  );
};

const LinkItems = ({ items }: { items?: GroupField<LabelLink> }) =>
  items?.map((item, index) =>
    isFilled.link(item.link) ? (
      <p key={`${item.label ?? "link"}-${index}`}>
        <PrismicNextLink field={item.link}>{item.label}</PrismicNextLink>
      </p>
    ) : null,
  );

async function getFooterContent() {
  const client = createClient();

  const [settings, posts] = await Promise.all([
    client.getSingle("site_settings").catch(() => null),
    client
      .getAllByType("blog_post", {
        limit: POST_COUNT,
        orderings: [
          { field: "my.blog_post.date", direction: "desc" },
          { field: "document.first_publication_date", direction: "desc" },
        ],
      })
      .catch(() => [] as Content.BlogPostDocument[]),
  ]);

  return { data: (settings?.data ?? null) as SiteSettingsData | null, posts };
}

/**
 * Site footer, matching the live costsegregation.com footer. All content comes
 * from the `site_settings` singleton; "Recent News" lists the latest blog posts.
 */
export default async function Footer() {
  const { data, posts } = await getFooterContent();
  if (!data) return null;

  const logo = isFilled.image(data.footer_logo) ? data.footer_logo : null;
  const socialLinks = (data.social_links ?? []).filter((item) => isFilled.link(item.link));
  const hasLeftLinks = Boolean(data.legal_links?.length || data.footer_note);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.primary}>
          {(logo || isFilled.image(data.partner_logo)) && (
            <div className={styles.brandRow}>
              {logo && (
                <div className={styles.brandItem}>
                  <PrismicNextLink href="/" aria-label={logo.alt ?? "Home"}>
                    <PrismicNextImage field={logo} className={styles.logo} sizes="176px" />
                  </PrismicNextLink>
                </div>
              )}
              {logo && isFilled.image(data.partner_logo) && (
                <div className={styles.divider} aria-hidden="true">
                  <span />
                </div>
              )}
              {isFilled.image(data.partner_logo) && (
                <div className={styles.brandItem}>
                  <PrismicNextImage
                    field={data.partner_logo}
                    className={styles.partnerLogo}
                    unoptimized
                  />
                </div>
              )}
            </div>
          )}

          {(data.footer_tagline || data.copyright_text) && (
            <div className={styles.taglineRow}>
              {data.footer_tagline && (
                <div className={styles.taglineItem}>
                  <p>{data.footer_tagline}</p>
                </div>
              )}
              {data.copyright_text && (
                <div className={styles.taglineItem}>{data.copyright_text}</div>
              )}
            </div>
          )}

          <div className={styles.contact}>
            {data.contact_heading && <h6 className={styles.heading}>{data.contact_heading}</h6>}

            {isFilled.richText(data.footer_description) && (
              <div className={styles.contactText}>
                <PrismicRichText field={data.footer_description} />
              </div>
            )}

            {data.footer_navigation?.map((item, index) =>
              isFilled.link(item.link) ? (
                <p key={`${item.label ?? "nav"}-${index}`}>
                  <PrismicNextLink field={item.link} className={styles.whiteLink}>
                    {item.label}
                  </PrismicNextLink>
                </p>
              ) : null,
            )}

            {(socialLinks.length > 0 || data.contact_email) && (
              <ul className={styles.social}>
                {socialLinks.map((item, index) =>
                  item.platform ? (
                    <li key={`${item.platform}-${index}`}>
                      <PrismicNextLink
                        field={item.link}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        aria-label={item.platform}
                      >
                        <SocialIcon name={item.platform} />
                      </PrismicNextLink>
                    </li>
                  ) : null,
                )}
                {data.contact_email && (
                  <li>
                    <a href={`mailto:${data.contact_email}`} aria-label="Email">
                      <SocialIcon name="Email" />
                    </a>
                  </li>
                )}
              </ul>
            )}

            {hasLeftLinks && (
              <div className={styles.legal}>
                {/* <p aria-hidden="true">{"\u00a0"}</p> */}
                {data.footer_note && <p>{data.footer_note}</p>}
                {Boolean(data.legal_links?.length) && (
                  <p>
                    {data.legal_links?.map((item, index) =>
                      isFilled.link(item.link) ? (
                        <span key={`${item.label ?? "legal"}-${index}`}>
                          {index > 0 && " | "}
                          <PrismicNextLink field={item.link}>{item.label}</PrismicNextLink>
                        </span>
                      ) : null,
                    )}
                  </p>
                )}
                {/* <p aria-hidden="true">{"\u00a0"}</p> */}
              </div>
            )}
          </div>
        </div>

        <div className={styles.secondary}>
          {posts.length > 0 && (
            <div className={styles.column}>
              {data.recent_news_heading && (
                <h6 className={styles.heading}>{data.recent_news_heading}</h6>
              )}
              <ul className={styles.posts}>
                {posts.map((post) => {
                  const href = postPath(post.uid as string);
                  const title = asText(post.data.title);
                  return (
                    <li key={post.id}>
                      <p className={styles.postTitle}>
                        <PrismicNextLink href={href}>{title}</PrismicNextLink>
                      </p>
                      {data.read_more_label && (
                        <PrismicNextLink
                          href={href}
                          className={styles.readMore}
                          aria-label={`Read more about ${title}`}
                          tabIndex={-1}
                        >
                          {data.read_more_label}
                        </PrismicNextLink>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {(Boolean(data.footer_resources?.length) ||
            Boolean(data.stay_connected_links?.length)) && (
            <div className={styles.column}>
              {data.resources_heading && (
                <h6 className={styles.heading}>{data.resources_heading}</h6>
              )}
              <div className={styles.linkList}>
                <LinkItems items={data.footer_resources} />
              </div>
              {data.stay_connected_heading && (
                <h6 className={styles.heading}>{data.stay_connected_heading}</h6>
              )}
              <div className={styles.linkList}>
                <LinkItems items={data.stay_connected_links} />
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}