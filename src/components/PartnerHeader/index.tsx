import { isFilled } from "@prismicio/client";
import type { ImageField, KeyTextField, LinkField } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

import styles from "./PartnerHeader.module.css";

export type PartnerLogo = {
	logo: ImageField;
	link: LinkField;
};

export type PartnerHeaderProps = {
	/** CostSegregation.com logo, usually from site_settings. */
	logo: ImageField;
	/** Co-brand logos shown beside it. */
	partnerLogos: PartnerLogo[];
	signIn: { label: KeyTextField; link: LinkField } | null;
	getStarted: { label: KeyTextField; link: LinkField } | null;
};

const ChevronRight = () => (
	<svg viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
	</svg>
);

/**
 * Co-branded header for partner landing pages.
 *
 * No navigation menu — the reference page has none, and a landing page
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
}: PartnerHeaderProps) {
	return (
		<header className={styles.header}>
			<div className={styles.inner}>
				<div className={styles.logos}>
					{isFilled.image(logo) && (
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
								className={styles.partnerLogo}
								sizes="160px"
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

				<div className={styles.actions}>
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