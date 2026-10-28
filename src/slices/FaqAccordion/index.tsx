"use client";

import { useId, useState } from "react";
import { Content, isFilled } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./FaqAccordion.module.css";

export type FaqAccordionProps = SliceComponentProps<Content.FaqAccordionSlice>;

const Chevron = () => (
	<svg viewBox="0 0 448 512" aria-hidden="true" focusable="false">
  <path
    d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"
    fill="currentColor"
  />
</svg>
);

/**
 * Question-and-answer accordion. One slice renders one FAQ category:
 * `primary.title` is the section heading, `primary.items` are the questions.
 *
 * Open/close animates with grid-template-rows 0fr → 1fr, which transitions
 * smoothly to content height without measuring pixels.
 */
const FaqAccordion = ({ slice }: FaqAccordionProps) => {
	const primary = slice.primary;
	const baseId = useId();

	/**
	 * Questions live in the `items` group inside `primary`. The cast can go
	 * once prismicio-types.d.ts is regenerated via "Pull to local".
	 */
	const items =
		((primary as unknown as {
			items?: { question: string | null; answer: never }[];
		}).items ?? []) as { question: string | null; answer: never }[];

	const [openIndex, setOpenIndex] = useState<number | null>(null);

	return (
		<section
  className={styles.section}
  id={(primary as { anchor?: string }).anchor || undefined}
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
										<PrismicRichText
  field={item.answer}
  components={{
    label: ({ node, children, key }) =>
      node.data.label === "underline" ? (
        <u key={key}>{children}</u>
      ) : (
        <span key={key}>{children}</span>
      ),
  }}
/>
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