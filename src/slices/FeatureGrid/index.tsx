"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Content, isFilled, KeyTextField, RichTextField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./FeatureGrid.module.css";
import { LIVE_ICONS, liveIdFromTitle } from "./liveIcons";

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

type Block = RichTextField[number];

/**
 * Splits a card into what the live site shows on the card and in its detail view.
 *
 * - Updated model: card = `text`, detail = `detail_*` fields.
 * - Current content (before the model push): everything lives in `text` as
 *   [card description, detail intro, bullets | closing paragraph]. The card
 *   shows only the first paragraph and the rest feeds the detail view, so the
 *   section renders correctly from Prismic either way.
 */
const resolveCard = (item: Item) => {
  const text = (item.text ?? []) as Block[];
  const hasDetailFields =
    Boolean(item.detail_intro) ||
    isFilled.richText(item.detail_list) ||
    isFilled.richText(item.detail_paragraph);

  if (hasDetailFields) {
    return {
      cardText: text as RichTextField,
      intro: item.detail_intro ?? null,
      list: (item.detail_list ?? []) as RichTextField,
      paragraph: (item.detail_paragraph ?? []) as RichTextField,
    };
  }

  const firstParagraph = text.findIndex((block) => block.type === "paragraph");
  const cardText = (firstParagraph >= 0 ? [text[firstParagraph]] : []) as RichTextField;
  const rest = text.filter((_, index) => index !== firstParagraph);
  const introIndex = rest.findIndex((block) => block.type === "paragraph");
  const intro =
    introIndex >= 0 && "text" in rest[introIndex]
      ? (rest[introIndex] as { text: string }).text
      : null;
  const remaining = rest.filter((_, index) => index !== introIndex);

  return {
    cardText,
    intro,
    list: remaining.filter((block) => block.type === "list-item") as RichTextField,
    paragraph: remaining.filter((block) => block.type === "paragraph") as RichTextField,
  };
};

const TRANSITION_MS = 300; // matches the live site's slide-out/slide-in timing

/**
 * Card icon: the Prismic image when one is set, otherwise the live site's
 * inline SVG for that card (same markup as WordPress).
 */
const CardIcon = ({ item, className }: { item: Item; className?: string }) => {
  if (isFilled.image(item.icon)) {
    return <PrismicNextImage field={item.icon} className={className} fallbackAlt="" unoptimized />;
  }
  const id = liveIdFromTitle(item.title);
  if (!id) return null;
  return (
    <span
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: LIVE_ICONS[id] }}
    />
  );
};

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

  const active: Item | null = activeIndex !== null ? (items[activeIndex] ?? null) : null;
  const detail = active ? resolveCard(active) : null;
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
            {items.map((item, index) => {
              const { cardText } = resolveCard(item);
              return (
                <article
                  key={`${item.title ?? "card"}-${index}`}
                  className={styles.card}
                  data-id={liveIdFromTitle(item.title) ?? undefined}
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
                  <CardIcon item={item} className={styles.cardIcon} />
                  {item.title && <h3 className={styles.cardTitle}>{item.title}</h3>}
                  {isFilled.richText(cardText) && (
                    <PrismicRichText
                      field={cardText}
                      components={{
                        paragraph: ({ children }) => <p className={styles.cardText}>{children}</p>,
                      }}
                    />
                  )}
                  <span className={styles.cardCta}>{ctaLabel}</span>
                </article>
              );
            })}
          </div>
        ) : (
          <div
            className={`${styles.detail} ${animClass}`}
            role="region"
            aria-label={active.title ?? undefined}
          >
            <button type="button" className={styles.backButton} onClick={() => swap(null)}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {backLabel}
            </button>

            <div className={styles.detailColumns}>
              <div className={styles.detailPrimary}>
                <div className={styles.detailIcon}>
                  <CardIcon item={active} />
                </div>
                <p className={styles.eyebrow}>{eyebrow}</p>
                {active.title && <h3 className={styles.detailTitle}>{active.title}</h3>}
                {detail?.intro && <p className={styles.detailDescription}>{detail.intro}</p>}
                {active.detail_note && <p className={styles.detailNote}>{active.detail_note}</p>}
              </div>

              <div className={styles.detailSecondary}>
                <div className={styles.detailPanel}>
                  <h4 className={styles.detailPanelTitle}>{panelTitle}</h4>
                  {detail && isFilled.richText(detail.list) ? (
                    <PrismicRichText field={detail.list} />
                  ) : (
                    detail &&
                    isFilled.richText(detail.paragraph) && (
                      <PrismicRichText field={detail.paragraph} />
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