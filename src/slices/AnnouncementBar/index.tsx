import { isFilled } from "@prismicio/client";
import type { KeyTextField, LinkField, RichTextField } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./AnnouncementBar.module.css";
import { withCustomClass } from "@/lib/customClass";

/**
 * Local type until `announcement_bar` is in types.generated.ts.
 */
type AnnouncementBarSlice = {
	id: string;
	slice_type: string;
	variation: string;
	primary: {
		text: RichTextField;
		link: LinkField;
		link_label: KeyTextField;
		/** "blue" (default) or "navy". */
		style: "blue" | "navy" | null;
	};
	items: never[];
};

export type AnnouncementBarProps = SliceComponentProps<AnnouncementBarSlice>;

/**
 * A link of `#hs-cta-<id>` turns the bar text into a HubSpot CTA trigger
 * (e.g. the newsletter pop-up). The HubSpot script in the root layout
 * opens the pop-up for elements with these classes, as on the live site.
 */
const HUBSPOT_CTA_PREFIX = "#hs-cta-";

const hubspotCtaId = (link: LinkField): string | null => {
	if (!isFilled.link(link) || !("url" in link) || !link.url) return null;

	return link.url.startsWith(HUBSPOT_CTA_PREFIX)
		? link.url.slice(HUBSPOT_CTA_PREFIX.length) || null
		: null;
};

/**
 * Promotional bar beneath the header.
 *
 * Added per page as a slice, so each page carries its own message — or
 * none. The navy variant is the campaign style used on the REI busy
 * season page; blue is the standard site bar.
 */
const AnnouncementBar = ({ slice }: AnnouncementBarProps) => {
	const primary = slice.primary;

	if (!isFilled.richText(primary.text)) return null;

	const theme = primary.style === "navy" ? styles.navy : styles.blue;
	const ctaId = hubspotCtaId(primary.link);

	return (
		<div
			className={withCustomClass(`${styles.bar} ${theme}`, slice)}
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
		>
			<div className={styles.inner}>
				{ctaId ? (
					<div
						className={`${styles.text} ${styles.ctaTrigger} hs-cta-trigger-button hs-cta-trigger-button-${ctaId}`}
						tabIndex={0}
						aria-haspopup="dialog"
					>
						<PrismicRichText field={primary.text} />
					</div>
				) : (
					<div className={styles.text}>
						<PrismicRichText field={primary.text} />
					</div>
				)}

				{/* Optional trailing link — the bar renders without it. */}
				{!ctaId && primary.link_label && isFilled.link(primary.link) && (
					<PrismicNextLink field={primary.link} className={styles.link}>
						{primary.link_label}
					</PrismicNextLink>
				)}
			</div>
		</div>
	);
};

export default AnnouncementBar;