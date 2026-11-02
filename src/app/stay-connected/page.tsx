import type { Metadata } from "next";
import Script from "next/script";

import styles from "./StayConnected.module.css";

/** HubSpot embed details read from the live page's form frame. */
const HUBSPOT_PORTAL_ID = "3615782";
const HUBSPOT_FORM_ID = "78baeb82-b801-4ff3-aa58-10544a1369c8";
const HUBSPOT_REGION = "na1";

export const metadata: Metadata = {
	title: "Stay connected - Cost Segregation",
	description: "Sign Up for SMS Notifications",
	alternates: { canonical: "/stay-connected/" },
	// The live page is noindex, nofollow.
	robots: { index: false, follow: false },
	openGraph: {
		type: "article",
		title: "Stay connected - Cost Segregation",
		description: "Sign Up for SMS Notifications",
	},
};

export default function Page() {
	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<h1 className={styles.title}>Stay in the Loop</h1>
				<p className={styles.subtitle}>Sign Up for SMS Notifications</p>
			</header>

			<div className={styles.formCard}>
				<div
					className="hs-form-frame"
					data-region={HUBSPOT_REGION}
					data-form-id={HUBSPOT_FORM_ID}
					data-portal-id={HUBSPOT_PORTAL_ID}
				/>
				<Script
					src={`https://js.hsforms.net/forms/embed/${HUBSPOT_PORTAL_ID}.js`}
					strategy="afterInteractive"
				/>
			</div>
		</main>
	);
}