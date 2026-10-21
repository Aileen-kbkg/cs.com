import { Content, isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./CtaBanner.module.css";

export type CtaBannerProps = SliceComponentProps<Content.CtaBannerSlice>;

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

/**
 * Closing call-to-action banner.
 *
 * `primary.style` picks the background: "brand" (navy, white text) is the
 * default, with "light" and "dark" as alternatives.
 */
const CtaBanner = ({ slice }: CtaBannerProps) => {
	const primary = slice.primary;

	const styleName = (primary.style as string) || "brand";
	const themeClass =
		styleName === "light"
			? styles.light
			: styleName === "dark"
				? styles.dark
				: styles.brand;

	return (
		<section
			className={`${styles.section} ${themeClass}`}
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
		>
			<div className={styles.inner}>
				{primary.title && <h2 className={styles.title}>{primary.title}</h2>}

				{isFilled.richText(primary.text) && (
					<div className={styles.text}>
						<PrismicRichText field={primary.text} />
					</div>
				)}

				{primary.cta_label && isFilled.link(primary.cta_link) && (
					<PrismicNextLink field={primary.cta_link} className={styles.button}>
						<span>{primary.cta_label}</span>
						<span className={styles.buttonIcon}>
							<ChevronRight />
						</span>
					</PrismicNextLink>
				)}

				{primary.small_print && (
					<p className={styles.smallPrint}>{primary.small_print}</p>
				)}
			</div>
		</section>
	);
};

export default CtaBanner;