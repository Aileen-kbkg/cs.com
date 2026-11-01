import { Content, isFilled } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./TextWithImage.module.css";

export type TextWithImageProps =
	SliceComponentProps<Content.TextWithImageSlice>;

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
 * Two-column text and image.
 *
 * Text comes first in the DOM for screen readers. When
 * `primary.image_position` is "left" the image column is pulled ahead
 * visually with `order: -1`; on mobile that is reset so text always leads.
 *
 * The first slice on a page renders its title as <h1>, the rest as <h2>.
 */
const TextWithImage = ({ slice, index }: TextWithImageProps) => {
	const primary = slice.primary;
	const imageLeft = primary.image_position === "left";
	const Heading = index === 0 ? "h1" : "h2";

	return (
		<section
			className={`${styles.section} ${index === 0 ? styles.sectionBand : ""} `}
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
			data-image-position={imageLeft ? "left" : "right"}
		>
			<div
  className={`${styles.inner} ${
    imageLeft ? styles.innerImageLeft : styles.innerImageRight
  } ${index === 0 ? styles.innerHero : ""}${
    primary.custom_css_class || ""
  }`}
>
				<div className={styles.body}>
					{primary.eyebrow && (
						<p className={styles.eyebrow}>
							<span className={styles.eyebrowIcon}>
								<TrendIcon />
							</span>
							<span>{primary.eyebrow}</span>
						</p>
					)}

					{primary.title && (
						<Heading className={styles.title}>{primary.title}</Heading>
					)}

					{isFilled.richText(primary.text) && (
						<div className={styles.text}>
							<PrismicRichText field={primary.text} />
						</div>
					)}

					{primary.cta_label && isFilled.link(primary.cta_link) && (
						<PrismicNextLink field={primary.cta_link} className={styles.cta}>
							<span>{primary.cta_label}</span>
							<span className={styles.ctaIcon}>
								<ChevronRight />
							</span>
						</PrismicNextLink>
					)}
				</div>

				{isFilled.image(primary.image) && (
					<div
						className={`${styles.media} ${imageLeft ? styles.mediaLeft : ""}`}
					>
						<PrismicNextImage
							field={primary.image}
							className={styles.image}
							sizes="(max-width: 767px) 100vw, 50vw"
							priority={index === 0}
							fallbackAlt=""
						/>
					</div>
				)}
			</div>
		</section>
	);
};

export default TextWithImage;
