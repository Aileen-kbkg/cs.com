import { isFilled } from "@prismicio/client";
import type { ImageField, KeyTextField, RichTextField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";

import styles from "./ProcessSteps.module.css";

/**
 * Local type until `process_steps` is pushed and types.generated.ts is
 * regenerated.
 *
 * The cards live in `primary.card` — a Group — rather than the slice's
 * repeatable zone, so `items` is unused.
 */
type ProcessStepsSlice = {
	id: string;
	slice_type: string;
	variation: string;
	primary: {
		title: KeyTextField;
		intro: RichTextField;
		card: {
			image: ImageField;
			title: KeyTextField;
			text: RichTextField;
		}[];
	};
	items: never[];
};

export type ProcessStepsProps = SliceComponentProps<ProcessStepsSlice>;

/**
 * Numbered process steps — an illustration per step with a blue badge
 * overlapping its top-left corner, then a heading with a short rule
 * beneath it, then the description.
 *
 * Distinct from the `steps` slice, which draws a connected timeline.
 * This one is a plain three-column grid.
 */
const ProcessSteps = ({ slice }: ProcessStepsProps) => {
	const primary = slice.primary;
	const cards = primary.card ?? [];

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

				{cards.length > 0 && (
					<ol className={styles.grid}>
						{cards.map((card, index) => (
							<li key={`${card.title ?? "step"}-${index}`} className={styles.step}>
								<div className={styles.media}>
									{/* Decorative — the number also appears in the heading. */}
									{/* <span className={styles.badge} aria-hidden="true">
										{index + 1}
									</span> */}

									{isFilled.image(card.image) && (
										<PrismicNextImage
											field={card.image}
											className={styles.image}
											sizes="(max-width: 767px) 100vw, 33vw"
											fallbackAlt=""
										/>
									)}
								</div>

								{card.title && (
									<h3 className={styles.stepTitle}>
										{index + 1}. {card.title}
									</h3>
								)}

								{isFilled.richText(card.text) && (
									<div className={styles.stepText}>
										<PrismicRichText field={card.text} />
									</div>
								)}
							</li>
						))}
					</ol>
				)}
			</div>
		</section>
	);
};

export default ProcessSteps;