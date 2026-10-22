import { isFilled } from "@prismicio/client";
import type { ImageField, KeyTextField, LinkField, RichTextField } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";

import styles from "./CampaignHero.module.css";

/**
 * Local type until `campaign_hero` is pushed and types.generated.ts is
 * regenerated. Then swap to SliceComponentProps<CampaignHeroSlice>.
 */
type CampaignHeroSlice = {
	id: string;
	slice_type: string;
	variation: string;
	primary: {
		eyebrow: KeyTextField;
		heading: KeyTextField;
		subheading: KeyTextField;
		text: RichTextField;
		badges: { label: KeyTextField }[];
		image: ImageField;
		cta_label: KeyTextField;
		cta_link: LinkField;
		secondary_label: KeyTextField;
		secondary_link: LinkField;
	};
	items: never[];
};

export type CampaignHeroProps = SliceComponentProps<CampaignHeroSlice>;

const CheckIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<path
			d="M20 6 9 17l-5-5"
			fill="none"
			stroke="currentColor"
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const ChevronRight = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<path
			d="M9 5l7 7-7 7"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

/**
 * Promotional hero — headline, sub-headline, supporting copy, a grid of
 * trust badges, a primary CTA and a secondary text link, with an
 * illustration alongside.
 */
const CampaignHero = ({ slice }: CampaignHeroProps) => {
	const primary = slice.primary;
	const badges = primary.badges ?? [];

	return (
		<section
			className={styles.section}
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
		>
			<div className={styles.inner}>
				<div className={styles.body}>
					{primary.eyebrow && <p className={styles.eyebrow}>{primary.eyebrow}</p>}

					{primary.heading && <h1 className={styles.heading}>{primary.heading}</h1>}

					{primary.subheading && (
						<p className={styles.subheading}>{primary.subheading}</p>
					)}

					{isFilled.richText(primary.text) && (
						<div className={styles.text}>
							<PrismicRichText field={primary.text} />
						</div>
					)}

					{badges.length > 0 && (
						<ul className={styles.badges}>
							{badges.map((badge, index) => (
								<li key={`${badge.label ?? "badge"}-${index}`} className={styles.badge}>
									<span className={styles.badgeIcon}>
										<CheckIcon />
									</span>
									<span>{badge.label}</span>
								</li>
							))}
						</ul>
					)}

					<div className={styles.ctaRow}>
						{isFilled.link(primary.cta_link) && (
							<PrismicNextLink field={primary.cta_link} className={styles.button}>
								<span>{primary.cta_label || "Get Started"}</span>
								<span className={styles.buttonIcon}>
									<ChevronRight />
								</span>
							</PrismicNextLink>
						)}

						{isFilled.link(primary.secondary_link) && primary.secondary_label && (
							<PrismicNextLink
								field={primary.secondary_link}
								className={styles.secondary}
							>
								{primary.secondary_label}
							</PrismicNextLink>
						)}
					</div>
				</div>

				{isFilled.image(primary.image) && (
					<div className={styles.media}>
						<PrismicNextImage
							field={primary.image}
							className={styles.image}
							sizes="(max-width: 1023px) 100vw, 50vw"
							priority
							fallbackAlt=""
						/>
					</div>
				)}
			</div>
		</section>
	);
};

export default CampaignHero;