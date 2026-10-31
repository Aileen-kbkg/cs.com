import type { CSSProperties } from "react";
import { isFilled } from "@prismicio/client";
import type {
	ImageField,
	KeyTextField,
	LinkField,
	NumberField,
	RichTextField,
} from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";

import SavingsCounter from "./SavingsCounter";


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
		badges: { label: KeyTextField; icon?: ImageField }[];
		image: ImageField;
		cta_label: KeyTextField;
		cta_link: LinkField;
		secondary_label: KeyTextField;
		secondary_link: LinkField;
		counter_value: NumberField;
		counter_heading: KeyTextField;
		counter_footnote: KeyTextField;
	};
	items: never[];
};

/**
 * Optional SliceZone context. The S8 Acquisition page passes
 * `{ page: "s8-acquisition" }` to opt into its own tablet/mobile layout;
 * every other page passes nothing and renders exactly as before.
 */
type CampaignHeroContext = { page?: string } | undefined;

export type CampaignHeroProps = SliceComponentProps<
	CampaignHeroSlice,
	CampaignHeroContext
>;

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

const TrendIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<path
			d="M3 17l6-6 4 4 7-7"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M15 7h5v5"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

/**
 * Fallback badge marks, used when a badge has no icon image set. The live
 * page uses a shield, a shield, a star and a dollar sign in that order.
 */
const FALLBACK_BADGE_ICONS = [
	// shield
	<path key="s1" d="M12 3l7 3v5c0 4.4-3 8.3-7 10-4-1.7-7-5.6-7-10V6l7-3z" />,
	// shield
	<path key="s2" d="M12 3l7 3v5c0 4.4-3 8.3-7 10-4-1.7-7-5.6-7-10V6l7-3z" />,
	// star
	<path
		key="st"
		d="M12 3.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.9L12 3.5z"
	/>,
	// dollar
	<g key="d">
		<line x1="12" y1="2.5" x2="12" y2="21.5" />
		<path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
	</g>,
];

const BadgeIcon = ({
	badge,
	index,
}: {
	badge: { icon?: ImageField };
	index: number;
}) => {
	if (badge.icon && isFilled.image(badge.icon)) {
		return (
			<PrismicNextImage
				field={badge.icon}
				className={styles.badgeImage}
				sizes="22px"
				fallbackAlt=""
			/>
		);
	}

	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
			<g
				fill="none"
				stroke="currentColor"
				strokeWidth="1.7"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				{FALLBACK_BADGE_ICONS[index % FALLBACK_BADGE_ICONS.length]}
			</g>
		</svg>
	);
};

/**
 * Promotional hero — headline, sub-headline, supporting copy, trust
 * badges and CTAs on the left; the illustration sits as the section's
 * background on the right, with the savings counter over it.
 *
 * The illustration is decorative, so a CSS background is appropriate —
 * it carries no information the copy does not already state.
 */
const CampaignHero = ({ slice, context }: CampaignHeroProps) => {
	const primary = slice.primary;
	const badges = primary.badges ?? [];
	const imageUrl = isFilled.image(primary.image) ? primary.image.url : null;

	// S8 Acquisition only: its own tablet/mobile rules (.s8 in the CSS).
	const isS8 = context?.page === "s8-acquisition";

	// The live S8 heading breaks after its first sentence on tablet and
	// mobile ("Don’t Wait 30+ Years. / Put Your Money to Work Now!"). The
	// second sentence goes in a span that becomes a block at ≤1024px and
	// stays inline on desktop, so desktop is unchanged.
	const headingParts =
		isS8 && primary.heading
			? primary.heading.match(/^(.+?[.!?])\s+(.+)$/)
			: null;

	const sectionStyle = imageUrl
		? ({ "--ch-hero-image": `url("${imageUrl}")` } as CSSProperties)
		: undefined;

	const sectionClass = [
		styles.section,
		imageUrl ? styles.hasImage : "",
		isS8 ? styles.s8 : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<section
			className={sectionClass}
			style={sectionStyle}
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
		>
			<div className={styles.inner}>
				<div className={styles.body}>
					{primary.eyebrow && (
						<p className={styles.eyebrow}>
							<span className={styles.eyebrowIcon}>
								<TrendIcon />
							</span>
							<span>{primary.eyebrow}</span>
						</p>
					)}

					{primary.heading && (
						<h1 className={styles.heading}>
							{headingParts ? (
								<>
									{headingParts[1]}{" "}
									<span className={styles.headingLine}>{headingParts[2]}</span>
								</>
							) : (
								primary.heading
							)}
						</h1>
					)}

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
								<li
									key={`${badge.label ?? "badge"}-${index}`}
									className={styles.badge}
								>
									<span className={styles.badgeIcon}>
										<BadgeIcon badge={badge} index={index} />
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

				{/* Right column: holds the counter over the background artwork. */}
				<div className={styles.media}>
					<SavingsCounter
						value={Number(primary.counter_value) || 23600}
						heading={primary.counter_heading || "Average First Year Tax Savings"}
						footnote={
							primary.counter_footnote || "*Based on $300,000 Building Purchase"
						}
					/>
				</div>
			</div>
		</section>
	);
};

export default CampaignHero;