import type { CSSProperties } from "react";
import { isFilled } from "@prismicio/client";
import type { ImageField, KeyTextField, LinkField } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

import styles from "./PartnerHeader.module.css";

export type PartnerLogo = {
	logo: ImageField;
	link: LinkField;
};

export type PartnerHeaderProps = {
	/**
	 * CostSegregation.com logo, usually from site_settings. Omit where the
	 * partner artwork is a combined lockup that already contains it — the
	 * S8 Acquisition page, for instance.
	 */
	logo?: ImageField | null;
	/** Co-brand logos shown beside it, or on their own. */
	partnerLogos: PartnerLogo[];
	signIn: { label: KeyTextField; link: LinkField } | null;
	getStarted: { label: KeyTextField; link: LinkField } | null;
	/**
	 * Caps the partner artwork's height, in px. Defaults to 44 — enough for
	 * a small partner mark, but a combined lockup needs more.
	 */
	partnerLogoHeight?: number;
	/**
	 * Extra class for the partner logo image, from the calling page's own
	 * CSS Module. Added alongside `.partnerLogo`, never instead of it.
	 */
	partnerLogoClassName?: string;
	/**
	 * Extra class for the Sign In / Get Started group, from the calling
	 * page's own CSS Module. Added alongside `.actions`, never instead of it.
	 */
	actionsClassName?: string;
};

const ChevronRight = () => (
	<svg viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
	</svg>
);

/**
 * Co-branded header for partner landing pages.
 *
 * No navigation menu — the reference pages have none, and a landing page
 * is deliberately low-exit. Logos on the left, Sign In and Get Started
 * on the right.
 *
 * Scoped to partner pages; the standard Navbar is untouched.
 */
export default function PartnerHeader({
	logo,
	partnerLogos,
	signIn,
	getStarted,
	partnerLogoHeight,
	partnerLogoClassName,
	actionsClassName,
}: PartnerHeaderProps) {
	// Read by .partnerLogo as --ph-partner-logo-height, so the cap stays in
	// CSS and only the value is set per page.
	const headerStyle = partnerLogoHeight
		? ({
				"--ph-partner-logo-height": `${partnerLogoHeight}px`,
			} as CSSProperties)
		: undefined;

	const partnerLogoClass = partnerLogoClassName
		? `${styles.partnerLogo} ${partnerLogoClassName}`
		: styles.partnerLogo;

	const actionsClass = actionsClassName
		? `${styles.actions} ${actionsClassName}`
		: styles.actions;

	return (
		<header className={styles.header} style={headerStyle}>
			<div className={styles.inner}>
				<div className={styles.logos}>
					{logo && isFilled.image(logo) && (
						<a href="/" className={styles.logoLink} aria-label="CostSegregation.com home">
							<PrismicNextImage
								field={logo}
								className={styles.logo}
								sizes="180px"
								priority
								fallbackAlt=""
							/>
						</a>
					)}

					{partnerLogos.map((partner, index) => {
						if (!isFilled.image(partner.logo)) return null;

						const image = (
							<PrismicNextImage
								field={partner.logo}
								className={partnerLogoClass}
								sizes="400px"
								priority
								fallbackAlt=""
							/>
						);

						return isFilled.link(partner.link) ? (
							<PrismicNextLink
								key={index}
								field={partner.link}
								className={styles.logoLink}
							>
								{image}
							</PrismicNextLink>
						) : (
							<span key={index} className={styles.logoLink}>
								{image}
							</span>
						);
					})}
				</div>

				<div className={actionsClass}>
					{signIn && isFilled.link(signIn.link) && (
						<PrismicNextLink
							field={signIn.link}
							className={styles.signIn}
							target="_blank"
							rel="noopener noreferrer nofollow"
						>
							{signIn.label}
						</PrismicNextLink>
					)}

					{getStarted && isFilled.link(getStarted.link) && (
						<PrismicNextLink
							field={getStarted.link}
							className={styles.getStarted}
							target="_blank"
							rel="noopener noreferrer nofollow"
						>
							<span>{getStarted.label}</span>
							<span className={styles.getStartedIcon}>
								<ChevronRight />
							</span>
						</PrismicNextLink>
					)}
				</div>
			</div>
		</header>
	);
}