import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import type { QuoteWithImageSlice } from "../../../types.generated";

import styles from "./QuoteWithImage.module.css";

export type QuoteWithImageProps = SliceComponentProps<QuoteWithImageSlice>;

/**
 * Pull quote in a tinted card with a supporting image alongside.
 *
 * `primary.image_position` picks the side; on mobile the quote always
 * comes first.
 */
const QuoteWithImage = ({ slice }: QuoteWithImageProps) => {
	const primary = slice.primary;
	const imageLeft = primary.image_position === "left";

	return (
		<section
			className={styles.section}
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
		>
			<div
				className={`${styles.card} ${
					imageLeft ? styles.cardImageLeft : styles.cardImageRight
				}`}
			>
				{isFilled.richText(primary.quote) && (
					<div className={styles.quote}>
						<PrismicRichText field={primary.quote} />
					</div>
				)}

				{isFilled.image(primary.image) && (
					<div className={styles.media}>
						<PrismicNextImage
							field={primary.image}
							className={styles.image}
							sizes="(max-width: 1023px) 100vw, 50vw"
							fallbackAlt=""
						/>
					</div>
				)}
			</div>
		</section>
	);
};

export default QuoteWithImage;