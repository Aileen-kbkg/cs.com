import type {
	ImageField,
	KeyTextField,
	LinkField,
	RichTextField,
} from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";

import styles from "./PropertyCards.module.css";
import { withCustomClass } from "@/lib/customClass";

/**
 * Property Cards — reads its cards from the `card` repeatable group
 * in `primary` (image, title, text, link, link_label).
 *
 * Local types until `property_cards` is in the generated Prismic types;
 * after "Pull to local" you can swap them for `Content.PropertyCardsSlice`.
 */
type PropertyCard = {
	image: ImageField;
	title: KeyTextField;
	text: RichTextField;
	link: LinkField;
	link_label: KeyTextField;
};

type PropertyCardsSlice = {
	id: string;
	slice_type: "property_cards";
	slice_label: string | null;
	variation: string;
	version: string;
	primary: {
		title: KeyTextField;
		intro: RichTextField;
		card: PropertyCard[];
	};
	items: never[];
};

export type PropertyCardsProps = SliceComponentProps<PropertyCardsSlice>;

const PropertyCards = ({ slice }: PropertyCardsProps) => {
	const { title, intro, card } = slice.primary;
	const cards = card ?? [];

	return (
		<section
			className={withCustomClass(styles.section, slice)}
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
		>
			<div className={styles.inner}>
				{title ? <h2 className={styles.heading}>{title}</h2> : null}

				{isFilled.richText(intro) ? (
					<div className={styles.intro}>
						<PrismicRichText field={intro} />
					</div>
				) : null}

				{cards.length > 0 ? (
					<ul className={styles.grid}>
						{cards.map((item, index) => (
							<li
								key={`${item.title ?? "card"}-${index}`}
								className={styles.card}
							>
								{isFilled.image(item.image) ? (
									<div className={styles.imageWrap}>
										<PrismicNextImage
											field={item.image}
											className={styles.image}
											sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 380px"
											fallbackAlt=""
										/>
									</div>
								) : null}

								{item.title ? (
									<h3 className={styles.cardTitle}>{item.title}</h3>
								) : null}

								{isFilled.richText(item.text) ? (
									<div className={styles.cardText}>
										<PrismicRichText field={item.text} />
									</div>
								) : null}

								{isFilled.link(item.link) ? (
									<PrismicNextLink field={item.link} className={styles.link}>
										{item.link_label || "Read More"}
									</PrismicNextLink>
								) : null}
							</li>
						))}
					</ul>
				) : null}
			</div>
		</section>
	);
};

export default PropertyCards;