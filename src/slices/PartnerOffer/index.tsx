"use client";

import { useEffect, useState } from "react";
import { isFilled } from "@prismicio/client";
import type {
	ImageField,
	KeyTextField,
	LinkField,
	RichTextField,
	SelectField,
} from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";

import styles from "./PartnerOffer.module.css";
import { withCustomClass } from "@/lib/customClass";

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
		/** Small label above the offer, e.g. "Use code:". */
		eyebrow: RichTextField;
		/** Partner mark pinned to the offer panel's bottom-right corner. */
		offercard_icon: ImageField;
		/** Offer panel background. Defaults to orange when not set. */
		offer_color: SelectField<"orange" | "yellow">;
	};
	items: never[];
};

export type PartnerOfferProps = SliceComponentProps<PartnerOfferSlice>;

const ChevronRight = () => (
	<svg viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
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
 * Partnership section — description card on the left, offer panel on the
 * right.
 *
 * The offer panel holds a headline (code_label), an optional promo code
 * and a supporting note. S8 Acquisition has no code, Roofstock does, so
 * the code block is conditional. Its background colour (orange / yellow)
 * and corner icon both come from Prismic.
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
		if (!primary.code) return;
		try {
			await navigator.clipboard.writeText(primary.code);
			setCopied(true);
		} catch {
			// The async Clipboard API is missing or blocked (older browsers,
			// in-app browsers, insecure origins): fall back to a hidden
			// textarea and execCommand. If that fails too, the code is still
			// readable on screen.
			const field = document.createElement("textarea");
			field.value = primary.code;
			field.setAttribute("readonly", "");
			field.style.position = "fixed";
			field.style.opacity = "0";
			document.body.appendChild(field);
			field.select();
			try {
				if (document.execCommand("copy")) setCopied(true);
			} finally {
				field.remove();
			}
		}
	};

	const hasEyebrow = isFilled.richText(primary.eyebrow);

	const hasOffer = Boolean(
		hasEyebrow || primary.code_label || primary.code || primary.code_note,
	);

	const offerColorClass =
		primary.offer_color === "yellow" ? styles.offerYellow : styles.offerOrange;

	return (
		<section
			className={withCustomClass(styles.section, slice)}
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
		>
			<div className={styles.inner}>
				<div className={styles.card}>
					{primary.title && <h2 className={styles.title}>{primary.title}</h2>}

					{isFilled.richText(primary.text) && (
						<div className={styles.text}>
							<PrismicRichText field={primary.text} />
						</div>
					)}
				</div>

				{hasOffer && (
					<aside className={`${styles.offer} ${offerColorClass}`}>
						{hasEyebrow && (
							<div className={styles.offerEyebrow}>
								<PrismicRichText field={primary.eyebrow} />
							</div>
						)}

						{primary.code_label && (
							<h2 className={styles.offerHeading}>{primary.code_label}</h2>
						)}

						{primary.code && (
							<p className={styles.codeRow}>
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
						)}

						{/* Announced to screen readers without stealing focus. */}
						<span className={styles.srOnly} role="status" aria-live="polite">
							{copied ? `Promo code ${primary.code} copied` : ""}
						</span>

						{primary.code_note && (
							<p className={styles.offerNote}>{primary.code_note}</p>
						)}

						{isFilled.link(primary.cta_link) && (
							<PrismicNextLink field={primary.cta_link} className={styles.button}>
								<span>{primary.cta_label || "Get Started"}</span>
								<span className={styles.buttonIcon}>
									<ChevronRight />
								</span>
							</PrismicNextLink>
						)}

						{isFilled.image(primary.offercard_icon) && (
							<PrismicNextImage
								field={primary.offercard_icon}
								className={styles.offerIcon}
								sizes="160px"
								fallbackAlt=""
							/>
						)}
					</aside>
				)}
			</div>
		</section>
	);
};

export default PartnerOffer;