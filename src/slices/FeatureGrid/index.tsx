"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isFilled } from "@prismicio/client";
import type { KeyTextField, RichTextField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import type { FeatureGridSlice } from "../../../types.generated";

import styles from "./FeatureGrid.module.css";
import { LIVE_ICONS, liveIdFromTitle } from "./liveIcons";
import { withCustomClass } from "@/lib/customClass";

export type FeatureGridProps = SliceComponentProps<FeatureGridSlice>;

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

type Item = FeatureGridSlice["items"][number] & DetailItem;
type Block = RichTextField[number];

const getText = (value: KeyTextField | null | undefined, fallback: string) =>
  value || fallback;

/**
 * Splits a card into what shows on the card and what shows in its detail
 * view. Cards whose `text` is a single paragraph have no detail content,
 * so they render without the "Learn More" affordance.
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
      intro: item.detail_intro || null,
      list: (item.detail_list ?? []) as RichTextField,
      paragraph: (item.detail_paragraph ?? []) as RichTextField,
    };
  }

  const firstParagraph = text.findIndex((block) => block.type === "paragraph");

  const cardText = (
    firstParagraph >= 0 ? [text[firstParagraph]] : []
  ) as RichTextField;

  const rest = text.filter((_, index) => index !== firstParagraph);

  const introIndex = rest.findIndex((block) => block.type === "paragraph");

  const intro =
    introIndex >= 0 && "text" in rest[introIndex]
      ? String((rest[introIndex] as { text: string }).text)
      : null;

  const remaining = rest.filter((_, index) => index !== introIndex);

  return {
    cardText,
    intro,
    list: remaining.filter(
      (block) => block.type === "list-item",
    ) as RichTextField,
    paragraph: remaining.filter(
      (block) => block.type === "paragraph",
    ) as RichTextField,
  };
};

const TRANSITION_MS = 300;

const CardIcon = ({
  item,
  className,
}: {
  item: Item;
  className?: string;
}) => {
  if (isFilled.image(item.icon)) {
    return (
      <PrismicNextImage
        field={item.icon}
        className={className}
        fallbackAlt=""
        unoptimized
      />
    );
  }

  const id = liveIdFromTitle(item.title);

  if (!id) return null;

  const iconMarkup = LIVE_ICONS[id];

  if (!iconMarkup) return null;

  return (
    <span
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: iconMarkup }}
    />
  );
};

const FeatureGridAbout = ({ slice }: FeatureGridProps) => {
  const primary = slice.primary;
  const items = slice.items as Item[];

  return (
    <section
      className={withCustomClass(styles.aboutSection, slice)}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          {primary.title && (
            <h2 className={styles.heading}>{primary.title}</h2>
          )}

          {isFilled.richText(primary.intro) && (
            <div className={styles.intro}>
              <PrismicRichText field={primary.intro} />
            </div>
          )}
        </div>

        <ul className={styles.peopleGrid}>
          {items.map((item, index) => (
            <li
              key={`${item.title || "person"}-${index}`}
              className={styles.person}
            >
              {isFilled.image(item.icon) && (
                <PrismicNextImage
                  field={item.icon}
                  className={styles.personPhoto}
                  sizes="144px"
                  fallbackAlt=""
                />
              )}

              {item.title && (
                <h3 className={styles.personName}>{item.title}</h3>
              )}

              {isFilled.richText(item.text) && (
                <div className={styles.personMeta}>
                  <PrismicRichText field={item.text} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

const FeatureGridDefault = ({ slice, context }: FeatureGridProps) => {
  const primary = slice.primary as FeatureGridSlice["primary"] & DetailPrimary;
  const items = slice.items as Item[];

  // A page can pass `context={{ fullCardText: true }}` to its SliceZone to
  // show every paragraph on the card instead of a "Learn More" detail view.
  const fullCardText =
    (context as { fullCardText?: boolean } | undefined)?.fullCardText === true;

  const ctaLabel = getText(primary.cta_label, "Learn More >");
  const backLabel = getText(primary.back_label, "Back to all benefits");
  const eyebrow = getText(primary.detail_eyebrow, "Feature");
  const panelTitle = getText(primary.detail_panel_title, "What you get");

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [animation, setAnimation] = useState<"in" | "out" | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

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

        pending.push(
          setTimeout(() => {
            setAnimation(null);
          }, TRANSITION_MS),
        );
      }, TRANSITION_MS),
    );
  }, []);

  const active: Item | null =
    activeIndex !== null ? (items[activeIndex] ?? null) : null;

  const detail = active ? resolveCard(active) : null;

  const animClass =
    animation === "out"
      ? styles.slideOut
      : animation === "in"
        ? styles.slideIn
        : "";

  return (
    <section
      className={withCustomClass(styles.section, slice)}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          {primary.title && (
            <h2 className={styles.heading}>{primary.title}</h2>
          )}

          {isFilled.richText(primary.intro) && (
            <div className={styles.intro}>
              <PrismicRichText field={primary.intro} />
            </div>
          )}
        </div>

        {active === null ? (
          <div className={`${styles.grid} ${animClass}`}>
            {items.map((item, index) => {
              const resolved = resolveCard(item);
              const cardText = fullCardText
                ? ((item.text ?? []) as RichTextField)
                : resolved.cardText;

              // Only cards with something behind them are clickable and
              // show the "Learn More" link.
              const hasDetail =
                !fullCardText &&
                (Boolean(resolved.intro) ||
                  isFilled.richText(resolved.list) ||
                  isFilled.richText(resolved.paragraph));

              return (
                <article
                  key={`${item.title ?? "card"}-${index}`}
                  className={styles.card}
                  data-id={liveIdFromTitle(item.title) ?? undefined}
                  role={hasDetail ? "button" : undefined}
                  tabIndex={hasDetail ? 0 : undefined}
                  onClick={hasDetail ? () => swap(index) : undefined}
                  onKeyDown={
                    hasDetail
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            swap(index);
                          }
                        }
                      : undefined
                  }
                >
                  <CardIcon item={item} className={styles.cardIcon} />

                  {item.title && (
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                  )}

                  {isFilled.richText(cardText) && (
                    <PrismicRichText
                      field={cardText}
                      components={{
                        paragraph: ({ children }) => (
                          <p className={styles.cardText}>{children}</p>
                        ),
                      }}
                    />
                  )}

                  {hasDetail && (
                    <span className={styles.cardCta}>{ctaLabel}</span>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div
            className={`${styles.detail} ${animClass}`}
            role="region"
            aria-label={active.title || "Feature details"}
          >
            <button
              type="button"
              className={styles.backButton}
              onClick={() => swap(null)}
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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

                {active.title && (
                  <h3 className={styles.detailTitle}>{active.title}</h3>
                )}

                {detail?.intro && (
                  <p className={styles.detailDescription}>{detail.intro}</p>
                )}

                {active.detail_note && (
                  <p className={styles.detailNote}>{active.detail_note}</p>
                )}
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

const FeatureGrid = (props: FeatureGridProps) => {
  if ((props.slice.variation as string) === "about") {
    return <FeatureGridAbout {...props} />;
  }
  return <FeatureGridDefault {...props} />;
};

export default FeatureGrid;