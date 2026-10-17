"use client";

import { useId, useState } from "react";
import { Content, isFilled } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./FaqAccordion.module.css";

export type FaqAccordionProps = SliceComponentProps<Content.FaqAccordionSlice>;

const Chevron = () => (
	<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
		<path
			d="M5 7.5 10 12.5 15 7.5"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

/**
 * Question-and-answer accordion. One slice renders one FAQ category:
 * `primary.title` is the section heading, `items` are the questions.
 *
 * Open/close animates with grid-template-rows 0fr → 1fr, which transitions
 * smoothly to content height without measuring pixels.
 */
const FaqAccordion = ({ slice }: FaqAccordionProps) => {
	const primary = slice.primary;
	const items = slice.items;
	const baseId = useId();

	const [openIndex, setOpenIndex] = useState<number | null>(null);

	return (
		<section
			className={styles.section}
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
		>
			{primary.title && <h2 className={styles.heading}>{primary.title}</h2>}

			{isFilled.richText(primary.intro) && (
				<div className={styles.intro}>
					<PrismicRichText field={primary.intro} />
				</div>
			)}

			<ul className={styles.list}>
				{items.map((item, index) => {
					const isOpen = openIndex === index;
					const buttonId = `${baseId}-q-${index}`;
					const panelId = `${baseId}-a-${index}`;

					return (
						<li key={`${item.question ?? "q"}-${index}`} className={styles.item}>
							<h3 className={styles.questionHeading}>
								<button
									type="button"
									id={buttonId}
									className={styles.question}
									aria-expanded={isOpen}
									aria-controls={panelId}
									onClick={() => setOpenIndex(isOpen ? null : index)}
								>
									<span
										className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
									>
										<Chevron />
									</span>
									<span className={styles.questionText}>{item.question}</span>
								</button>
							</h3>

							<div
								id={panelId}
								role="region"
								aria-labelledby={buttonId}
								className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
							>
								<div className={styles.panelInner}>
									<div className={styles.answer}>
										<PrismicRichText field={item.answer} />
									</div>
								</div>
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
};

export default FaqAccordion;