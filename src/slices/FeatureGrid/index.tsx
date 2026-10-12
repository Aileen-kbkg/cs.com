"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Content, isFilled, KeyTextField, RichTextField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./FeatureGrid.module.css";

/**
 * Props for `FeatureGrid` ("Why Choose CostSegregation.com?").
 */
export type FeatureGridProps = SliceComponentProps<Content.FeatureGridSlice>;

/**
 * Fields added to the FeatureGrid model for the live "Learn More" detail view.
 * Declared here as optional so this file compiles both before and after
 * `prismicio-types.d.ts` is regenerated from the updated model.
 */
type DetailPrimary = {
  cta_label?: KeyTextField;
  back_label?: KeyTextField;
  detail_eyebrow?: KeyTextField;
  detail_panel_title?: KeyTextField;
};

type DetailItem = {
  detail_intro?: KeyTextField;
  detail_list?: RichTextField;
  detail_paragraph?: RichTextField;
  detail_note?: KeyTextField;
};

type Item = Content.FeatureGridSlice["items"][number] & DetailItem;

const TRANSITION_MS = 300; // matches the live site's slide-out/slide-in timing

const slugify = (value: string | null | undefined) =>
  (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Card grid with a "Learn More >" detail view, reproducing the live
 * costsegregation.com section 1:1 (3/2/1 columns, slide transitions, back button).
 */
const FeatureGrid = ({ slice }: FeatureGridProps) => {
  const primary = slice.primary as Content.FeatureGridSlice["primary"] & DetailPrimary;
  const items = slice.items as Item[];

  const ctaLabel = primary.cta_label || "Learn More >";
  const backLabel = primary.back_label || "Back to all benefits";
  const eyebrow = primary.detail_eyebrow || "Feature";
  const panelTitle = primary.detail_panel_title || "What you get";

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [animation, setAnimation] = useState<"in" | "out" | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear any pending transition timers on unmount. The array is mutated in
  // place (never reassigned), so the captured reference stays current.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.length = 0;
    };
  }, []);

  const swap = useCallback((next: number | null) => {
    const pending = timers.current;
    pending.forEach(clearTimeout);
    pending.length = 0;
    setAnimation("out");
    pending.push(
      setTimeout(() => {
        setActiveIndex(next);
        setAnimation("in");
        pending.push(setTimeout(() => setAnimation(null), TRANSITION_MS));
      }, TRANSITION_MS),
    );
  }, []);

  const active: Item | null = activeIndex !== null ? items[activeIndex] ?? null : null;
  const animClass =
    animation === "out" ? styles.slideOut : animation === "in" ? styles.slideIn : "";

  return (
    <section
      className={styles.section}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          {primary.title && <h2 className={styles.heading}>{primary.title}</h2>}
          {isFilled.richText(primary.intro) && (
            <div className={styles.intro}>
              <PrismicRichText field={primary.intro} />
            </div>
          )}
        </div>

        {active === null ? (
          <div className={`${styles.grid} ${animClass}`}>
            {items.map((item, index) => (
              <article
                key={`${item.title ?? "card"}-${index}`}
                className={styles.card}
                data-id={slugify(item.title)}
                role="button"
                tabIndex={0}
                onClick={() => swap(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    swap(index);
                  }
                }}
              >
                {isFilled.image(item.icon) && (
                  <PrismicNextImage
                    field={item.icon}
                    className={styles.cardIcon}
                    fallbackAlt=""
                    unoptimized
                  />
                )}
                {item.title && <h3 className={styles.cardTitle}>{item.title}</h3>}
                {isFilled.richText(item.text) && (
                  <div className={styles.cardText}>
                    <PrismicRichText field={item.text} />
                  </div>
                )}
                <span className={styles.cardCta}>{ctaLabel}</span>
              </article>
            ))}
          </div>
        ) : (
          <div
            className={`${styles.detail} ${animClass}`}
            role="region"
            aria-label={active.title ?? undefined}
          >
            <button type="button" className={styles.backButton} onClick={() => swap(null)}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {backLabel}
            </button>

            <div className={styles.detailColumns}>
              <div className={styles.detailPrimary}>
                {isFilled.image(active.icon) && (
                  <div className={styles.detailIcon}>
                    <PrismicNextImage field={active.icon} fallbackAlt="" unoptimized />
                  </div>
                )}
                <p className={styles.eyebrow}>{eyebrow}</p>
                {active.title && <h3 className={styles.detailTitle}>{active.title}</h3>}
                {active.detail_intro && (
                  <p className={styles.detailDescription}>{active.detail_intro}</p>
                )}
                {active.detail_note && <p className={styles.detailNote}>{active.detail_note}</p>}
              </div>

              <div className={styles.detailSecondary}>
                <div className={styles.detailPanel}>
                  <h4 className={styles.detailPanelTitle}>{panelTitle}</h4>
                  {isFilled.richText(active.detail_list) ? (
                    <PrismicRichText field={active.detail_list} />
                  ) : (
                    isFilled.richText(active.detail_paragraph) && (
                      <PrismicRichText field={active.detail_paragraph} />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeatureGrid;