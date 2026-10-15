import { Content, isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./ExpertGrid.module.css";

export type ExpertGridProps = SliceComponentProps<Content.ExpertGridSlice>;

/**
 * "Meet Our Experts" — portrait grid of team members.
 */
const ExpertGrid = ({ slice }: ExpertGridProps) => {
  const primary = slice.primary;
  const experts = primary.experts ?? [];

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

        <ul className={styles.grid}>
          {experts.map((expert, index) => (
            <li key={`${expert.name ?? "expert"}-${index}`} className={styles.person}>
              {isFilled.image(expert.photo) && (
                <PrismicNextImage
                  field={expert.photo}
                  className={styles.photo}
                  sizes="144px"
                  fallbackAlt=""
                />
              )}

              {expert.name && <h3 className={styles.name}>{expert.name}</h3>}

              {expert.credentials && (
                <p className={styles.credentials}>{expert.credentials}</p>
              )}
              {expert.experience && (
                <p className={styles.meta}>{expert.experience}</p>
              )}
              {expert.location && <p className={styles.meta}>{expert.location}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ExpertGrid;