"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./CampaignHero.module.css";

const DURATION_MS = 4000;

export type SavingsCounterProps = {
	prefix?: string | null;
	value: number;
	suffix?: string | null;
	heading?: string | null;
	footnote?: string | null;
};

/** easeOutExpo — fast start, long settle, matching the Elementor counter. */
const ease = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Counts up to `value` the first time the panel scrolls into view.
 * Honours prefers-reduced-motion by showing the final figure outright.
 */
export default function SavingsCounter({
	prefix,
	value,
	suffix,
	heading,
	footnote,
}: SavingsCounterProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [display, setDisplay] = useState(0);
	const started = useRef(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reduced) {
			setDisplay(value);
			return;
		}

		let frame = 0;

		const run = () => {
			const start = performance.now();
			const tick = (now: number) => {
				const progress = Math.min((now - start) / DURATION_MS, 1);
				setDisplay(Math.round(ease(progress) * value));
				if (progress < 1) frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		};

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !started.current) {
						started.current = true;
						run();
						observer.disconnect();
					}
				});
			},
			{ threshold: 0.4 },
		);

		observer.observe(node);

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, [value]);

	return (
		<div className={styles.counter} ref={ref}>
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