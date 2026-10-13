import { Content, ImageField, isFilled, KeyTextField } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./SuccessStories.module.css";

/**
 * Props for `SuccessStories`.
 */
export type SuccessStoriesProps = SliceComponentProps<Content.SuccessStoriesSlice>;

/**
 * Fields added to the model for the live card design. Optional so this file
 * compiles before and after `prismicio-types.d.ts` is regenerated.
 */
type PrimaryExtras = {
  price_label?: KeyTextField;
  price_note?: KeyTextField;
  deduction_label?: KeyTextField;
};
type ItemExtras = { image?: ImageField };

type Primary = Omit<Content.SuccessStoriesSlice["primary"], keyof PrimaryExtras> & PrimaryExtras;
type Item = Omit<Content.SuccessStoriesSlice["items"][number], keyof ItemExtras> & ItemExtras;

/**
 * "Success Stories" — three stat cards matching the live costsegregation.com
 * section: photo header with property-type pill and purchase-price band,
 * then the first-year deduction figure.
 */
const SuccessStories = ({ slice }: SuccessStoriesProps) => {
  const primary = slice.primary as Primary;
  const items = slice.items as Item[];

  return (
    <section
      className={styles.section}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className={styles.inner}>
        {primary.title && <h2 className={styles.heading}>{primary.title}</h2>}
        {isFilled.richText(primary.intro) && (
          <div className={styles.intro}>
            <PrismicRichText field={primary.intro} />
          </div>
        )}

        {items.length > 0 && (
          <div className={styles.grid}>
            {items.map((item, index) => {
              const card = (
                <>
                  <div className={styles.media}>
                    {isFilled.image(item.image) && (
                      <PrismicNextImage
                        field={item.image}
                        fill
                        sizes="(max-width: 767px) 100vw, 33vw"
                        className={styles.mediaImage}
                        fallbackAlt=""
                      />
                    )}
                    {item.property_type && (
                      <div className={styles.pill}>
                        <p>{item.property_type}</p>
                      </div>
                    )}
                    {(item.purchase_price || primary.price_note) && (
                      <div className={styles.band}>
                        <p>
                          {item.purchase_price && (
                            <strong>
                              {item.purchase_price}
                              {primary.price_label ? ` ${primary.price_label}` : ""}
                            </strong>
                          )}
                          {primary.price_note ? ` ${primary.price_note}` : ""}
                        </p>
                      </div>
                    )}
                  </div>
                  {primary.deduction_label && (
                    <div className={styles.label}>{primary.deduction_label}</div>
                  )}
                  {item.first_year_deduction && (
                    <h2 className={styles.amount}>{item.first_year_deduction}</h2>
                  )}
                </>
              );

              const key = `${item.property_type ?? "story"}-${index}`;
              return isFilled.link(item.link) ? (
                <PrismicNextLink key={key} field={item.link} className={styles.card}>
                  {card}
                </PrismicNextLink>
              ) : (
                <div key={key} className={styles.card}>
                  {card}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default SuccessStories;
