import {
	isFilled,
	type ImageField,
	type KeyTextField,
	type LinkField,
	type RichTextField,
} from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";

import { withCustomClass } from "@/lib/customClass";
import styles from "./TestimonialGrid.module.css";

/**
 * Local types until `testimonial_grid` is pushed to Prismic and the
 * generated types are refreshed. Then swap to
 * SliceComponentProps<Content.TestimonialGridSlice>.
 */
type TestimonialItem = {
	client_name: KeyTextField;
	company_name: KeyTextField;
	client_designation: KeyTextField;
	client_image: ImageField;
	testimonial: RichTextField;
	property_type: KeyTextField;
	video_url: LinkField;
};

type TestimonialGridSlice = {
	id: string;
	slice_type: "testimonial_grid";
	slice_label: string | null;
	variation: "default" | "featured";
	version: string;
	primary: {
		eyebrow: KeyTextField;
		title: KeyTextField;
		intro: RichTextField;
		custom_class?: KeyTextField;
	};
	items: TestimonialItem[];
};

export type TestimonialGridProps = SliceComponentProps<TestimonialGridSlice>;

const QuoteIcon = () => (
	<svg viewBox="0 0 448 512" aria-hidden="true" focusable="false">
		<path
			d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64h-64c-35.3 0-64-28.7-64-64V216z"
			fill="currentColor"
		/>
	</svg>
);

const PlayIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<path d="M8 5v14l11-7z" fill="currentColor" />
	</svg>
);

/** "Designation, Company" — whichever of the two the editor filled in. */
const roleLine = (item: TestimonialItem) =>
	[item.client_designation, item.company_name].filter(Boolean).join(", ");

/**
 * Client testimonials. `default` is a responsive grid of cards (3 / 2 / 1
 * columns); `featured` shows fewer, larger cards for longer quotes.
 * Every card field except the testimonial itself is optional.
 */
const TestimonialGrid = ({ slice }: TestimonialGridProps) => {
	const { eyebrow, title, intro } = slice.primary;
	const featured = slice.variation === "featured";
	const items = slice.items.filter(
		(item) => isFilled.richText(item.testimonial) || item.client_name,
	);

	return (
		<section
			className={withCustomClass(
				`${styles.section} ${featured ? styles.featured : ""}`,
				slice,
			)}
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
		>
			<div className={styles.inner}>
				{(eyebrow || title || isFilled.richText(intro)) && (
					<header className={styles.header}>
						{eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
						{title && <h2 className={styles.heading}>{title}</h2>}
						{isFilled.richText(intro) && (
							<div className={styles.intro}>
								<PrismicRichText field={intro} />
							</div>
						)}
					</header>
				)}

				{items.length > 0 && (
					<ul className={styles.grid}>
						{items.map((item, index) => {
							const role = roleLine(item);

							return (
								<li
									key={`${item.client_name ?? "testimonial"}-${index}`}
									className={styles.card}
								>
									<div className={styles.cardTop}>
										<span className={styles.quoteIcon}>
											<QuoteIcon />
										</span>
										{item.property_type && (
											<span className={styles.propertyType}>
												{item.property_type}
											</span>
										)}
									</div>

									{isFilled.richText(item.testimonial) && (
										<blockquote className={styles.quote}>
											<PrismicRichText field={item.testimonial} />
										</blockquote>
									)}

									<footer className={styles.client}>
										{isFilled.image(item.client_image) && (
											<PrismicNextImage
												field={item.client_image}
												className={styles.avatar}
												sizes="56px"
												fallbackAlt=""
											/>
										)}
										<div className={styles.clientText}>
											{item.client_name && (
												<p className={styles.name}>{item.client_name}</p>
											)}
											{role && <p className={styles.role}>{role}</p>}
										</div>
										{isFilled.link(item.video_url) && (
											<PrismicNextLink
												field={item.video_url}
												className={styles.video}
											>
												<PlayIcon />
												<span>Watch video</span>
											</PrismicNextLink>
										)}
									</footer>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</section>
	);
};

export default TestimonialGrid;
