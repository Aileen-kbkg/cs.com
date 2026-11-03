import { Fragment } from "react";
import { Content, isFilled, KeyTextField, LinkField, NumberField } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import { ChevronRightIcon, FiveStarsIcon, QuoteIcon, StarIcon } from "./icons";
import TestimonialCarousel from "./TestimonialCarousel";
import styles from "./Testimonials.module.css";
import { withCustomClass } from "@/lib/customClass";

/**
 * Props for `Testimonials` ("What Our Clients Are Saying").
 */
export type TestimonialsProps = SliceComponentProps<Content.TestimonialsSlice>;

/**
 * "Leave a Review" button fields added to the model. Optional so this file
 * compiles before and after `prismicio-types.d.ts` is regenerated.
 */
type ReviewCta = {
  review_cta_label?: KeyTextField;
  review_cta_link?: LinkField;
  /** Non-repeating group: `random_count` reviews picked at random per visit. */
  reviews_per_visit?: Array<{ random_count?: NumberField }>;
};

type Primary = Omit<Content.TestimonialsSlice["primary"], keyof ReviewCta> & ReviewCta;

const Testimonials = ({ slice }: TestimonialsProps) => {
  const primary = slice.primary as Primary;
  const reviews = slice.items.filter((item) => isFilled.richText(item.quote) || item.author);
  const hasRating = typeof primary.rating === "number" || Boolean(primary.source_label);
  // Skip the "4.9/5" prefix when the label already contains it; the
  // value inside the label is bolded instead, as on the live site.
  const ratingValue = typeof primary.rating === "number" ? `${primary.rating}/5` : "";
  const showRating = Boolean(ratingValue) && !primary.source_label?.includes(ratingValue);
  const labelParts =
    ratingValue && primary.source_label?.includes(ratingValue)
      ? primary.source_label.split(ratingValue)
      : null;

  const cards = reviews.map((item, index) => (
    <div key={`${item.author ?? "review"}-${index}`} className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.cardIcons}>
          <span className={styles.quoteIcon}>
            <QuoteIcon />
          </span>
          <span className={styles.stars}>
            <FiveStarsIcon />
          </span>
        </div>
        {isFilled.richText(item.quote) && (
          <div className={styles.quote}>
            <PrismicRichText field={item.quote} />
          </div>
        )}
      </div>
      {(item.author || item.role) && (
        <div>
          {item.author && <h6 className={styles.author}>{item.author}</h6>}
          {item.role && <p className={styles.role}>{item.role}</p>}
        </div>
      )}
    </div>
  ));

  return (
    <section
      className={withCustomClass(styles.section, slice)}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className={styles.inner}>
        {primary.title && <h2 className={styles.heading}>{primary.title}</h2>}

        {hasRating && (
          <div className={styles.rating}>
            <span className={styles.ratingStar}>
              <StarIcon />
            </span>
            <p className={styles.ratingText}>
              {showRating && <strong>{ratingValue}</strong>}
              {showRating && primary.source_label && " "}
              {labelParts
                ? labelParts.map((part, index) => (
                    <Fragment key={index}>
                      {index > 0 && <strong>{ratingValue}</strong>}
                      {part}
                    </Fragment>
                  ))
                : primary.source_label}
            </p>
          </div>
        )}

        {cards.length > 0 && (
          <TestimonialCarousel
            slides={cards}
            pick={primary.reviews_per_visit?.[0]?.random_count ?? undefined}
          />
        )}

        {primary.review_cta_label && isFilled.link(primary.review_cta_link) && (
          <div className={styles.ctaWrap}>
            <PrismicNextLink field={primary.review_cta_link} className={styles.cta}>
              <span>{primary.review_cta_label}</span>
              <span className={styles.ctaIcon}>
                <ChevronRightIcon />
              </span>
            </PrismicNextLink>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
