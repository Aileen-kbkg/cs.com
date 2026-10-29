import {
  Content,
  GroupField,
  ImageField,
  isFilled,
  KeyTextField,
  LinkField,
  NumberField,
  RichTextField,
} from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import type { CSSProperties } from "react";

import HeroCounter from "./HeroCounter";
import styles from "./Hero.module.css";

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * Fields added for the live hero (eyebrow, badges, stat card, promo bar).
 * Optional so this file compiles before and after `prismicio-types.d.ts`
 * is regenerated.
 */
type Extras = {
  eyebrow?: KeyTextField;
  badges?: GroupField<{ label: KeyTextField }>;
  stat_prefix?: KeyTextField;
  stat_value?: NumberField;
  stat_suffix?: KeyTextField;
  stat_title?: KeyTextField;
  stat_note?: KeyTextField;
  promo_image?: ImageField;
  promo_text?: RichTextField;
  promo_cta_label?: KeyTextField;
  promo_cta_link?: LinkField;
};

type Primary = Omit<Content.HeroSlice["primary"], keyof Extras> & Extras;

/** Live hero copy, used when the matching Prismic field is still empty. */
const LIVE_DEFAULTS = {
  eyebrow: "Maximize Your Tax Savings",
  badges: ["IRS Audit Ready", "Audit Defense Included"],
  statPrefix: "$",
  statValue: 23600,
  statSuffix: "*",
  statTitle: "Average First Year Tax Savings",
  statNote: "*Based on $300,000 Building Purchase",
};

const TrendIcon = () => (
  <svg viewBox="0 0 19 9" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M0.676422 7.1272L6.82513 1.48014L11.1025 7.1272L16.6764 1.1272"
      stroke="#277CE6"
      strokeWidth="2"
    />
    <path d="M11.4205 1.82202L16.0163 1.10768L17.2517 5.25181" stroke="#277CE6" strokeWidth="2" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M6.92603 0.520094C6.03066 1.06932 4.44866 1.72572 2.01249 1.72572C1.57579 1.72572 1.12261 1.70429 0.658446 1.65874C0.619995 1.65606 0.581543 1.66678 0.551332 1.69357C0.52112 1.71768 0.50464 1.75519 0.50464 1.7927C0.493654 2.6795 0.496401 3.94407 0.578797 4.92733C0.957818 9.57301 2.61947 12.0727 6.93153 14.4812C6.9535 14.492 6.97822 14.5 7.00019 14.5C7.02216 14.5 7.04688 14.4946 7.06885 14.4812C11.3809 12.0727 13.0426 9.57301 13.4216 4.92733C13.5012 3.94407 13.5067 2.6795 13.4957 1.7927C13.4957 1.75519 13.4793 1.71768 13.449 1.69357C13.4188 1.66678 13.3804 1.65606 13.3419 1.65874C12.8805 1.70161 12.4246 1.72572 11.9879 1.72572C9.55172 1.72572 7.96972 1.06932 7.07435 0.520094C7.02766 0.493302 6.96998 0.493302 6.92603 0.520094ZM13.1442 4.90589C12.7707 9.47924 11.2189 11.8342 7.00019 14.2053C2.78152 11.8342 1.22973 9.47924 0.856197 4.90589C0.78204 3.98426 0.773801 2.81346 0.78204 1.94273C1.20226 1.97756 1.61424 1.99632 2.00974 1.99632C4.44866 1.99632 6.05813 1.35332 6.99744 0.793369C7.93676 1.35332 9.54897 1.99632 11.9851 1.99632C12.3834 1.99632 12.7954 1.97756 13.2128 1.94273C13.2211 2.81346 13.2128 3.98426 13.1387 4.90589H13.1442Z"
      fill="#277CE6"
      stroke="#277CE6"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
  </svg>
);

/** Live headline breaks after the first sentence ("Don’t Wait 30+ Years. <br> Put…"). */
const splitHeadline = (text: string) => {
  const index = text.indexOf(". ");
  return index > 0 && index < text.length - 2
    ? [text.slice(0, index + 1), text.slice(index + 2)]
    : [text];
};

/**
 * Hero — matches the live costsegregation.com hero (Elementor 458bc5b):
 * eyebrow pill, headline, description, audit badges, green CTA, the
 * frosted "$23,600*" stat card over the illustration, and the track750
 * promo bar beneath.
 */
const Hero = ({ slice }: HeroProps) => {
  const p = slice.primary as Primary;
  const d = LIVE_DEFAULTS;

  const badges = (p.badges ?? []).map((b) => b.label).filter((l): l is string => Boolean(l));
  const badgeList = badges.length > 0 ? badges : d.badges;
  const statValue = typeof p.stat_value === "number" ? p.stat_value : d.statValue;
  const headline = p.head ? splitHeadline(p.head) : [];

  const backgroundStyle: CSSProperties | undefined = isFilled.image(p.banner_image)
    ? { ["--hero-bg" as string]: `url("${p.banner_image.url}")` }
    : undefined;

  const hasPromo =
    isFilled.image(p.promo_image) ||
    isFilled.richText(p.promo_text) ||
    Boolean(p.promo_cta_label);

  return (
    <section
      className={styles.section}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className={styles.inner}>
        <div className={styles.content} style={backgroundStyle}>
          <div className={styles.left}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowIcon}>
                <TrendIcon />
              </span>
              <p className={styles.eyebrowText}>{p.eyebrow || d.eyebrow}</p>
            </div>

            {headline.length > 0 && (
              <h1 className={styles.title}>
                {headline[0]}
                {headline[1] && (
                  <>
                    {" "}
                    <br />
                    {headline[1]}
                  </>
                )}
              </h1>
            )}

            <div className={styles.badges}>
              {badgeList.map((label, index) => (
                <div
                  key={`${label}-${index}`}
                  className={`${styles.badge} ${index === 0 ? styles.badgeFirst : styles.badgeSecond}`}
                >
                  <span className={styles.badgeIcon}>
                    <ShieldIcon />
                  </span>
                  <p className={styles.badgeText}>{label}</p>
                </div>
              ))}
            </div>

            {isFilled.richText(p.description) && (
              <div className={styles.description}>
                <PrismicRichText field={p.description} />
              </div>
            )}

            {p.cta_label && isFilled.link(p.cta_link) && (
              <PrismicNextLink field={p.cta_link} className={styles.cta}>
                <span>{p.cta_label}</span>
                <span className={styles.ctaIcon}>
                  <ChevronRightIcon />
                </span>
              </PrismicNextLink>
            )}
          </div>

          <div className={styles.right}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>
                <span className={styles.statPrefix}>{p.stat_prefix ?? d.statPrefix}</span>
                <HeroCounter value={statValue} />
                <span className={styles.statSuffix}>{p.stat_suffix ?? d.statSuffix}</span>
              </div>
              <div className={styles.statTitle}>
                <p>
                  <strong>{p.stat_title || d.statTitle}</strong>
                </p>
              </div>
              <div className={styles.statNote}>{p.stat_note || d.statNote}</div>
            </div>
          </div>
        </div>

        {/* track750 promo bar, below the hero content. */}
        {hasPromo && (
          <div className={styles.promo}>
            {isFilled.image(p.promo_image) && (
              <PrismicNextImage
                field={p.promo_image}
                className={styles.promoBadge}
                sizes="230px"
                fallbackAlt=""
              />
            )}

            {isFilled.richText(p.promo_text) && (
  <div className={styles.promoText}>
    <PrismicRichText
      field={p.promo_text}
      components={{
        strong: ({ node, key }) => {
  const text = "text" in node ? node.text : "";

  return (
    <span key={key} className={styles.promoWave}>
      {text.split("").map((char, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.05}s` }}>
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
    </span>
  );
},
      }}
    />
  </div>
)}

            {p.promo_cta_label && isFilled.link(p.promo_cta_link) && (
              <PrismicNextLink field={p.promo_cta_link} className={styles.promoCta}>
                <span>{p.promo_cta_label}</span>
                <span className={styles.ctaIcon}>
                  <ChevronRightIcon />
                </span>
              </PrismicNextLink>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;