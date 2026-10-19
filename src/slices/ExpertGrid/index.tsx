"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Content, isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./ExpertGrid.module.css";

export type ExpertGridProps = SliceComponentProps<Content.ExpertGridSlice>;

const Arrow = ({ direction }: { direction: "prev" | "next" }) => (
	<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<path
			d={direction === "prev" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"}
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

/**
 * "Meet Our Experts" — horizontal carousel.
 *
 * Scrolling is native (scroll-snap), so it works with touch, trackpad and
 * keyboard without a carousel library. The arrows and dots drive the same
 * scroll container.
 */
const ExpertGrid = ({ slice }: ExpertGridProps) => {
	const primary = slice.primary;
	const experts = primary.experts ?? [];

	const trackRef = useRef<HTMLUListElement>(null);
	const [activeIndex, setActiveIndex] = useState(0);

	/** Width of one slide including the gap. */
	const slideStep = useCallback(() => {
		const track = trackRef.current;
		if (!track) return 0;
		const first = track.firstElementChild as HTMLElement | null;
		if (!first) return 0;
		const gap = Number.parseFloat(getComputedStyle(track).columnGap || "0");
		return first.getBoundingClientRect().width + (Number.isNaN(gap) ? 0 : gap);
	}, []);

	const scrollToIndex = useCallback(
		(index: number) => {
			const track = trackRef.current;
			if (!track) return;
			track.scrollTo({ left: slideStep() * index, behavior: "smooth" });
		},
		[slideStep],
	);

	const step = useCallback(
		(direction: -1 | 1) => {
			const next = Math.min(
				Math.max(activeIndex + direction, 0),
				Math.max(experts.length - 1, 0),
			);
			scrollToIndex(next);
		},
		[activeIndex, experts.length, scrollToIndex],
	);

	// Keep the dots in step with manual scrolling.
	useEffect(() => {
		const track = trackRef.current;
		if (!track) return;

		let frame = 0;
		const onScroll = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				const stepWidth = slideStep();
				if (!stepWidth) return;
				setActiveIndex(Math.round(track.scrollLeft / stepWidth));
			});
		};

		track.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			track.removeEventListener("scroll", onScroll);
		};
	}, [slideStep]);

	if (experts.length === 0) return null;

	return (
		<section
			className={styles.section}
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
		>
			<div className={styles.inner}>
				{primary.title && <h2 className={styles.heading}>{primary.title}</h2>}

				{isFilled.richText(primary.intro) && (
					<div className={styles.intro}>
						<PrismicRichText field={primary.intro} />
					</div>
				)}

				<div className={styles.carousel}>
					<button
						type="button"
						className={`${styles.arrow} ${styles.arrowPrev}`}
						aria-label="Previous experts"
						onClick={() => step(-1)}
						disabled={activeIndex === 0}
					>
						<Arrow direction="prev" />
					</button>

					<ul className={styles.track} ref={trackRef}>
						{experts.map((expert, index) => (
							<li
								key={`${expert.name ?? "expert"}-${index}`}
								className={styles.slide}
							>
								{isFilled.image(expert.photo) && (
									<PrismicNextImage
										field={expert.photo}
										className={styles.photo}
										sizes="(max-width: 639px) 70vw, (max-width: 1023px) 40vw, 300px"
										fallbackAlt=""
									/>
								)}

								<p className={styles.name}>
									{expert.name}
									{expert.credentials ? (
										<span className={styles.credentials}>
											, {expert.credentials}
										</span>
									) : null}
								</p>

								{expert.experience && (
									<p className={styles.meta}>{expert.experience}</p>
								)}
								{expert.location && (
									<p className={styles.meta}>{expert.location}</p>
								)}
							</li>
						))}
					</ul>

					<button
						type="button"
						className={`${styles.arrow} ${styles.arrowNext}`}
						aria-label="Next experts"
						onClick={() => step(1)}
						disabled={activeIndex >= experts.length - 1}
					>
						<Arrow direction="next" />
					</button>
				</div>

				<div className={styles.dots} role="tablist" aria-label="Experts">
					{experts.map((expert, index) => (
						<button
							key={`dot-${expert.name ?? index}`}
							type="button"
							role="tab"
							aria-selected={index === activeIndex}
							aria-label={`Show ${expert.name ?? `expert ${index + 1}`}`}
							className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
							onClick={() => scrollToIndex(index)}
						/>
					))}
				</div>
			</div>
		</section>
	);
};

export default ExpertGrid;