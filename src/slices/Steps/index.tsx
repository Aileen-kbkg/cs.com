import { Content, isFilled } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./Steps.module.css";

/**
 * Props for `Steps` ("How it Works").
 */
export type StepsProps = SliceComponentProps<Content.StepsSlice>;

/**
 * Live step icons, used until a Step image is set in Prismic
 * (files in /public/icons/how-it-works, copied from costsegregation.com).
 */
const fallbackIcon = (stepNumber: number) =>
  stepNumber >= 1 && stepNumber <= 4 ? `/icons/how-it-works/step-${stepNumber}.svg` : null;

/**
 * "How it Works" — numbered steps joined by a line, matching the live
 * costsegregation.com section (horizontal on desktop/tablet, vertical ≤768px).
 */
const Steps = ({ slice }: StepsProps) => {
  const { primary, items } = slice;
  const hasCta = Boolean(primary.cta_label) && isFilled.link(primary.cta_link);

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
          <ol className={styles.steps}>
            {items.map((item, index) => {
              const stepNumber = index + 1;
              const fallback = fallbackIcon(stepNumber);

              return (
                <li key={`${item.step_title ?? "step"}-${index}`} className={styles.step}>
                  <div className={styles.highlight}>
                    <div className={styles.line} />
                    <div className={styles.icon}>
                      {isFilled.image(item.step_image) ? (
                        <PrismicNextImage
                          field={item.step_image}
                          className={styles.iconImage}
                          fallbackAlt=""
                          unoptimized
                        />
                      ) : (
                        fallback && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={fallback}
                            alt=""
                            width={48}
                            height={48}
                            className={styles.iconImage}
                          />
                        )
                      )}
                      <div className={styles.label}>{stepNumber}</div>
                    </div>
                    <div className={styles.line} />
                  </div>
                  <div className={styles.spacer} />
                  <div className={styles.content}>
                    {item.step_title && <div className={styles.title}>{item.step_title}</div>}
                    {isFilled.richText(item.step_text) && (
                      <div className={styles.text}>
                        <PrismicRichText field={item.step_text} />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {hasCta && (
          <PrismicNextLink field={primary.cta_link} className={styles.cta}>
            {primary.cta_label}
          </PrismicNextLink>
        )}
      </div>
    </section>
  );
};

export default Steps;
