"use client";

import { useId, useState } from "react";
import { isFilled } from "@prismicio/client";
import type { KeyTextField, RichTextField } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";

import styles from "./FaqList.module.css";

export type FaqItem = {
	question: KeyTextField;
	answer: RichTextField;
};

export type FaqListProps = {
	items: FaqItem[];
	/** Optional section heading. Omit to render the list on its own. */
	title?: string | null;
	className?: string;
};

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
 * Accessible question-and-answer accordion.
 *
 * Shared so the FAQ markup lives in one place — used by the
 * `faq_accordion` slice, the `faq` group on For Tax Advisors, and the
 * `faqs` group on blog posts.
 *
 * Open/close animates with grid-template-rows 0fr → 1fr, which
 * transitions to content height without measuring pixels.
 */
const FaqList = ({ items, title, className }: FaqListProps) => {
	const baseId = useId();
	// The first answer starts open, as on the live page.
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	if (!items?.length) return null;

	return (
		<section className={`${styles.section} ${className ?? ""}`}>
			{title ? <h2 className={styles.title}>{title}</h2> : null}

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
									{isFilled.richText(item.answer) && (
										<div className={styles.answer}>
											<PrismicRichText field={item.answer} />
										</div>
									)}
								</div>
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
};

export default FaqList;