"use client";

import { useEffect, useState } from "react";
import { isFilled } from "@prismicio/client";
import type { KeyTextField, LinkField, RichTextField } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";

import styles from "./PartnerOffer.module.css";

/**
 * Local type until `partner_offer` is pushed and types.generated.ts is
 * regenerated.
 */
type PartnerOfferSlice = {
	id: string;
	slice_type: string;
	variation: string;
	primary: {
		title: KeyTextField;
		text: RichTextField;
		code_label: KeyTextField;
		code: KeyTextField;
		code_note: KeyTextField;
		cta_label: KeyTextField;
		cta_link: LinkField;
	};
	items: never[];
};

export type PartnerOfferProps = SliceComponentProps<PartnerOfferSlice>;

const ChevronRight = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<path
			d="M9 5l7 7-7 7"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const CopyIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<rect
			x="9"
			y="9"
			width="11"
			height="11"
			rx="2"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
		/>
		<path
			d="M5 15V6a2 2 0 0 1 2-2h9"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
		/>
	</svg>
);

/**
 * Partnership section with a prominent promo code.
 *
 * The code is selectable text with a copy button beside it — the button
 * is a convenience, not the only way to get the code, so it degrades
 * cleanly where the clipboard API is unavailable.
 */
const PartnerOffer = ({ slice }: PartnerOfferProps) => {
	const primary = slice.primary;
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 2500);
		return () => clearTimeout(timer);
	}, [copied]);

	const copy = async () => {
		if (!primary.code || !navigator.clipboard) return;
		try {
			await navigator.clipboard.writeText(primary.code);
			setCopied(true);
		} catch {
			// Clipboard blocked — the code is still readable on screen.
		}
	};

	return (
		<section
			className={styles.section}
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

				{(primary.code || primary.code_note) && (
					<div className={styles.offer}>
						<p className={styles.codeRow}>
							{primary.code_label && (
								<span className={styles.codeLabel}>{primary.code_label}</span>
							)}
							<code className={styles.code}>{primary.code}</code>

							<button
								type="button"
								className={styles.copyButton}
								onClick={copy}
								aria-label={`Copy promo code ${primary.code}`}
							>
								<CopyIcon />
								<span>{copied ? "Copied" : "Copy"}</span>
							</button>
						</p>

						{/* Announced to screen readers without stealing focus. */}
						<span className={styles.srOnly} role="status" aria-live="polite">
							{copied ? `Promo code ${primary.code} copied` : ""}
						</span>

						{primary.code_note && (
							<p className={styles.codeNote}>{primary.code_note}</p>
						)}
					</div>
				)}

				{isFilled.link(primary.cta_link) && (
					<PrismicNextLink field={primary.cta_link} className={styles.button}>
						<span>{primary.cta_label || "Get Started"}</span>
						<span className={styles.buttonIcon}>
							<ChevronRight />
						</span>
					</PrismicNextLink>
				)}
			</div>
		</section>
	);
};

export default PartnerOffer;