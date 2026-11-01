import { Content, isFilled } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./ProductCards.module.css";
import { withCustomClass } from "@/lib/customClass";

export type ProductCardsProps = SliceComponentProps<Content.ProductCardsSlice>;

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
										sizes="96px"
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
			</div>
		</section>
	);
};

export default ProductCards;