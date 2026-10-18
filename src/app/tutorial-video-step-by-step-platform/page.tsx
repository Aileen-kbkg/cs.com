import type { Metadata } from "next";
import Link from "next/link";

import styles from "./Tutorial.module.css";

/**
 * Video is still served from the WordPress origin. Move it to Prismic's
 * media library (or another host) before the old site is decommissioned,
 * then swap these two constants.
 */
const VIDEO_SRC =
	"https://www.costsegregation.com/wp-content/uploads/2025/12/cost-segregation-com-tutorial.mp4";
const VIDEO_POSTER =
	"https://www.costsegregation.com/wp-content/uploads/2025/12/Step-by-step-platform-tutorial.png";

export const metadata: Metadata = {
	title:
		"CostSegregation.com Platform Step-by-Step Tutorial Video - Cost Segregation",
	description:
		"A step-by-step video tutorial showing how to complete a cost segregation study using the CostSegregation.com platform.",
	alternates: { canonical: "/tutorial-video-step-by-step-platform" },
	openGraph: {
		type: "article",
		title:
			"CostSegregation.com Platform Step-by-Step Tutorial Video - Cost Segregation",
		description:
			"A step-by-step video tutorial showing how to complete a cost segregation study using the CostSegregation.com platform.",
		images: [{ url: VIDEO_POSTER }],
	},
};

export default function Page() {
	return (
		<main className={styles.page}>
			<section className={styles.hero}>
				<div className={styles.heroInner}>
					<h1 className={styles.title}>
						CostSegregation.com Step-by-Step Tutorial Video
					</h1>

					<div className={styles.videoWrap}>
						{/* eslint-disable-next-line jsx-a11y/media-has-caption */}
						<video
							className={styles.video}
							src={VIDEO_SRC}
							poster={VIDEO_POSTER}
							controls
							preload="none"
							controlsList="nodownload"
							playsInline
						/>
					</div>
				</div>
			</section>

			<div className={styles.content}>
				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>How to Use CostSegregation.com</h2>
					<p>
						This step-by-step tutorial shows you how to complete a cost
						segregation study using the CostSegregation.com platform. You will
						learn how to enter your property information, review available
						property data, complete the required questions and generate a
						detailed cost segregation report.
					</p>
					<p>
						CostSegregation.com is designed to simplify the cost segregation
						process for owners of qualifying residential and commercial
						investment properties. The self-guided platform walks you through
						each step and helps identify property components that may qualify
						for shorter depreciation periods.
					</p>
				</section>

				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>What This Tutorial Covers</h2>
					<p>The video demonstrates how to:</p>
					<ul className={styles.list}>
						<li>Enter the property address and begin a new study</li>
						<li>Review property information identified by the platform</li>
						<li>Provide the required purchase and building details</li>
						<li>
							Add information about the property&rsquo;s components and
							improvements
						</li>
						<li>Invite your CPA to review information when needed</li>
						<li>Review the completed cost segregation results</li>
						<li>Download the final report and supporting schedules</li>
					</ul>
				</section>

				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>
						What to Have Available Before Starting
					</h2>
					<p>
						Having your basic property and purchase information ready will make
						the process faster. This may include the property address, purchase
						date, purchase price, estimated land value, property type and
						details about renovations or improvements.
					</p>
					<p>
						The platform supports qualifying properties with up to $1.5 million
						in building basis, excluding land. Larger or unusually complex
						properties may be better suited for a traditional
						engineering-based cost segregation study.
					</p>
				</section>

				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>
						Review Your Results Before Purchasing
					</h2>
					<p>
						You can work through the CostSegregation.com platform and review
						your property-specific results before deciding whether to purchase
						the completed report. No credit card is required to begin.
					</p>
					<p>
						Every purchased report includes supporting depreciation schedules
						and access to report corrections and audit support. Your tax advisor
						should review the completed report and determine how the resulting
						depreciation deductions apply to your specific tax situation.
					</p>
				</section>

				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>Ready to Start Your Study?</h2>
					<p>
						Use CostSegregation.com to enter your property information and
						evaluate your potential accelerated depreciation deductions.
					</p>
					<p>
						<Link href="/" className={styles.cta}>
							Start your cost segregation study today.
						</Link>
					</p>
				</section>
			</div>
		</main>
	);
}