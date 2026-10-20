import {
	isFilled,
	type ImageField,
	type KeyTextField,
	type LinkField,
	type RichTextField,
} from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./PageHero.module.css";

/**
 * Local type until `page_hero` is pushed to Prismic and
 * prismicio-types.d.ts is regenerated. Then swap back to
 * SliceComponentProps<Content.PageHeroSlice>.
 */
type PageHeroSlice = {
	id: string;
	slice_type: string;
	variation: string;
	primary: {
		eyebrow: KeyTextField;
		heading: KeyTextField;
		text: RichTextField;
		image: ImageField;
		image_position: "left" | "right" | null;
		cta_label: KeyTextField;
		cta_link: LinkField;
		cta_note: KeyTextField;
	};
	items: never[];
};

export type PageHeroProps = SliceComponentProps<PageHeroSlice>;

const ChevronRight = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<path
			d="M9 5l7 7-7 7"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const TrendIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<path
			d="M3 17l6-6 4 4 7-7"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M15 7h5v5"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

/**
 * Split page hero — illustration on one side, eyebrow pill, large
 * heading, body copy and a CTA with an optional note on the other.
 *
 * `primary.image_position` picks the side; on mobile the text always
 * comes first.
 */
const PageHero = ({ slice }: PageHeroProps) => {
	const primary = slice.primary;
	const imageLeft = primary.image_position !== "right";

	return (
		<section
			className={styles.section}
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
		>
			<div
				className={`${styles.inner} ${
					imageLeft ? styles.innerImageLeft : styles.innerImageRight
				}`}
			>
				{isFilled.image(primary.image) && (
					<div className={styles.media}>
						<PrismicNextImage
							field={primary.image}
							className={styles.image}
							sizes="(max-width: 1023px) 100vw, 50vw"
							priority
							fallbackAlt=""
						/>
					</div>
				)}

				<div className={styles.body}>
					{primary.eyebrow && (
						<p className={styles.eyebrow}>
							<span className={styles.eyebrowIcon}>
								<TrendIcon />
							</span>
							<span>{primary.eyebrow}</span>
						</p>
					)}

					{primary.heading && (
						<h1 className={styles.heading}>{primary.heading}</h1>
					)}

					{isFilled.richText(primary.text) && (
						<div className={styles.text}>
							<PrismicRichText field={primary.text} />
						</div>
					)}

					{isFilled.link(primary.cta_link) || primary.cta_note ? (
  <div className={styles.ctaRow}>
    {isFilled.link(primary.cta_link) && (
      <PrismicNextLink field={primary.cta_link} className={styles.button}>
        <span>{primary.cta_label || "Get Started"}</span>
        <span className={styles.buttonIcon}>
          <ChevronRight />
        </span>
      </PrismicNextLink>
    )}

    {primary.cta_note && (
      <p className={styles.ctaNote}>{primary.cta_note}</p>
    )}
  </div>
) : null}
				</div>
			</div>
		</section>
	);
};

export default PageHero;