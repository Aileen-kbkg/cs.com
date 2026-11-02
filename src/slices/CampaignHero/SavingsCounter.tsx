"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./CampaignHero.module.css";

export type SavingsCounterProps = {
	/** Numeric target, e.g. 23600. */
	value: number;
	prefix?: string;
	suffix?: string;
	heading?: string;
	footnote?: string;
	/** Count-up duration in ms. The live page uses 4000. */
	duration?: number;
};

/**
 * Counts up to `value` once the panel scrolls into view, as the live
 * Elementor counter does. The final figure is rendered until then, so
 * the server HTML, crawlers and anything that never scrolls the panel
 * into view show the real amount rather than $0. Reduced motion skips
 * the count entirely.
 */
export default function SavingsCounter({
	value,
	prefix = "$",
	suffix = "*",
	heading,
	footnote,
	duration = 4000,
}: SavingsCounterProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [display, setDisplay] = useState(value);
	const [started, setStarted] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node || started) return;

		const reduced =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		if (reduced) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setStarted(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.3 },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [started, value]);

	useEffect(() => {
		if (!started) return;

		let frame = 0;
		const start = performance.now();

		const tick = (now: number) => {
			const progress = Math.min((now - start) / duration, 1);
			// easeOutExpo — fast then settling, matching the live counter
			const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
			setDisplay(Math.round(value * eased));
			if (progress < 1) frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [started, value, duration]);

	return (
		<div className={styles.counterPanel} ref={ref}>
			<p className={styles.counterNumber}>
				{prefix && <span className={styles.counterPrefix}>{prefix}</span>}
				<span>{display.toLocaleString("en-US")}</span>
				{suffix && <span className={styles.counterSuffix}>{suffix}</span>}
			</p>

			{heading && <p className={styles.counterHeading}>{heading}</p>}
			{footnote && <p className={styles.counterFootnote}>{footnote}</p>}
		</div>
	);
}