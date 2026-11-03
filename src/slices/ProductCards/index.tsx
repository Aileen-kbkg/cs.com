import { Content, isFilled } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./ProductCards.module.css";
import { withCustomClass } from "@/lib/customClass";

export type ProductCardsProps = SliceComponentProps<Content.ProductCardsSlice>;

/** Font Awesome "chevron-right", the icon on the live Elementor buttons. */
const ChevronRight = () => (
	<svg viewBox="0 0 320 512" aria-hidden="true" focusable="false">
		<path
			d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
			fill="currentColor"
		/>
	</svg>
);

/**
 * "Other Tax Incentives" — bordered cards with a centred icon, heading,
 * body copy and an outlined "Learn More" button.
 */
const ProductCards = ({ slice }: ProductCardsProps) => {
	const primary = slice.primary;
	const items = slice.items;

	return (
		<section
			className={withCustomClass(styles.section, slice)}
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
					{items.map((item, index) => (
						<li key={`${item.title ?? "card"}-${index}`} className={styles.card}>
							{isFilled.image(item.image) && (
								<div className={styles.iconWrap}>
									<PrismicNextImage
										field={item.image}
										className={styles.icon}
										// Some pages show the icon up to ~183px wide (the
										// For CPAs logo), so ask for enough pixels to stay sharp.
										sizes="200px"
										fallbackAlt=""
									/>
								</div>
							)}

							{item.title && <h3 className={styles.cardTitle}>{item.title}</h3>}

							{isFilled.richText(item.text) && (
								<div className={styles.cardText}>
									<PrismicRichText field={item.text} />
								</div>
							)}

							{isFilled.link(item.link) && (
								<PrismicNextLink field={item.link} className={styles.button}>
									<span>{item.link_label || "Learn More"}</span>
									<span className={styles.buttonIcon}>
										<ChevronRight />
									</span>
								</PrismicNextLink>
							)}
						</li>
					))}
				</ul>

				{primary.button_text && isFilled.link(primary.button_link) && (
					<div className={styles.ctaWrap}>
						<PrismicNextLink field={primary.button_link} className={styles.cta}>
							<span>{primary.button_text}</span>
							<span className={styles.ctaIcon}>
								<ChevronRight />
							</span>
						</PrismicNextLink>
					</div>
				)}
			</div>
		</section>
	);
};

export default ProductCards;
