"use client";

import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { Content, isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import styles from "./ExpertGrid.module.css";
import { withCustomClass } from "@/lib/customClass";

export type ExpertGridProps = SliceComponentProps<Content.ExpertGridSlice>;

/** Most cards ever visible at once (desktop) — also the clones added on each side. */
const MAX_VISIBLE = 3;
const AUTOPLAY_DELAY = 3000;
/** How long scrolling must be idle before we treat it as finished (browsers without `scrollend`). */
const SCROLL_IDLE_MS = 120;
/** Give up waiting for a programmatic scroll to finish after this long. */
const SCROLL_TIMEOUT_MS = 1200;

/**
 * Slides are a fixed 420px, as on the live page (narrower only when the
 * track itself is), so 3 fit at 1280px and fewer below.
 */
const SLIDE_WIDTH = 420;

const useIsomorphicLayoutEffect =
	typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Modulo that stays positive for negative numbers. */
const mod = (value: number, length: number) =>
	((value % length) + length) % length;

/** How many whole slides fit in a track of this width (1 to MAX_VISIBLE). */
const getVisibleCount = (trackWidth: number, gap: number) =>
	Math.max(
		1,
		Math.min(
			MAX_VISIBLE,
			Math.floor((trackWidth + gap) / (SLIDE_WIDTH + gap)),
		),
	);

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
 * "Meet Our Experts" — infinite-loop carousel.
 *
 * Scrolling stays native (scroll-snap), so touch, trackpad and keyboard keep
 * working. For the loop, MAX_VISIBLE cloned slides sit on each side of the real
 * ones; whenever scrolling comes to rest on a clone, the track jumps instantly
 * to the identical real slide, so the seam is invisible.
 */
const ExpertGrid = ({ slice }: ExpertGridProps) => {
	const primary = slice.primary;
	const experts = primary.experts ?? [];
	const count = experts.length;

	const trackRef = useRef<HTMLUListElement>(null);

	const [visible, setVisible] = useState(MAX_VISIBLE);
	const [gap, setGap] = useState(0);
	const [activeIndex, setActiveIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const [isInteracting, setIsInteracting] = useState(false);
	const [pageHidden, setPageHidden] = useState(false);
	// Bumped on manual navigation so autoplay waits a full delay afterwards.
	const [autoplayKey, setAutoplayKey] = useState(0);

	// Loop only when there are more experts than visible slots.
	const loop = count > visible;
	const clones = loop ? MAX_VISIBLE : 0;

	const activeRef = useRef(0);
	const scrollingRef = useRef(false);
	const timeoutRef = useRef<number | undefined>(undefined);

	/* ---------- geometry ---------- */

	/** scrollLeft that puts track position `position` at the start of the view. */
	const offsetFor = useCallback((position: number) => {
		const track = trackRef.current;
		const first = track?.children[0] as HTMLElement | undefined;
		const target = track?.children[position] as HTMLElement | undefined;
		if (!first || !target) return 0;
		return target.offsetLeft - first.offsetLeft;
	}, []);

	/** Track position currently at the start of the view. */
	const currentPosition = useCallback(() => {
		const track = trackRef.current;
		if (!track || track.children.length < 2) return 0;
		const step = offsetFor(1);
		return step ? Math.round(track.scrollLeft / step) : 0;
	}, [offsetFor]);

	const jumpTo = useCallback(
		(position: number) => {
			const track = trackRef.current;
			if (!track) return;
			track.scrollTo({ left: offsetFor(position), behavior: "instant" });
		},
		[offsetFor],
	);

	/* ---------- settle after scrolling ---------- */

	/** Scrolling stopped: sync the dots and, if parked on a clone, swap to the real slide. */
	const settle = useCallback(() => {
		window.clearTimeout(timeoutRef.current);
		scrollingRef.current = false;
		setIsInteracting(false);

		if (!count) return;
		const position = currentPosition();
		const real = loop ? mod(position - clones, count) : Math.min(position, count - 1);
		activeRef.current = real;
		setActiveIndex(real);

		if (loop && position !== real + clones) jumpTo(real + clones);
	}, [count, loop, clones, currentPosition, jumpTo]);

	/** Smoothly scroll to a track position (ignored while a previous scroll is running). */
	const scrollToPosition = useCallback(
		(position: number) => {
			const track = trackRef.current;
			if (!track || scrollingRef.current) return;
			if (position === currentPosition()) return;
			scrollingRef.current = true;
			track.scrollTo({ left: offsetFor(position), behavior: "smooth" });
			window.clearTimeout(timeoutRef.current);
			timeoutRef.current = window.setTimeout(settle, SCROLL_TIMEOUT_MS);
		},
		[currentPosition, offsetFor, settle],
	);

	const move = useCallback(
		(direction: -1 | 1) => {
			if (!loop) return;
			scrollToPosition(currentPosition() + direction);
		},
		[loop, scrollToPosition, currentPosition],
	);

	/* ---------- layout: breakpoints, gap, resize ---------- */

	useIsomorphicLayoutEffect(() => {
		const update = () => {
			const track = trackRef.current;
			if (!track) return;

			const value = Number.parseFloat(getComputedStyle(track).columnGap);
			const trackGap = Number.isNaN(value) ? 0 : value;
			setGap(trackGap);
			setVisible(getVisibleCount(track.clientWidth, trackGap));
		};
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	// Whenever the layout changes (first paint, breakpoint, resize, clones on/off),
	// put the active expert back at the start of the view without animating.
	useIsomorphicLayoutEffect(() => {
		const track = trackRef.current;
		if (!track) return;

		const realign = () => {
			window.clearTimeout(timeoutRef.current);
			scrollingRef.current = false;
			const real = Math.min(activeRef.current, Math.max(count - 1, 0));
			jumpTo(loop ? real + clones : 0);
		};

		realign();
		const observer = new ResizeObserver(realign);
		observer.observe(track);
		return () => observer.disconnect();
	}, [visible, gap, loop, clones, count, jumpTo]);

	/* ---------- scroll tracking ---------- */

	useEffect(() => {
		const track = trackRef.current;
		if (!track) return;

		let frame = 0;
		let idle: number | undefined;

		const onScroll = () => {
			// Live dot sync while scrolling.
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				if (!count) return;
				const position = currentPosition();
				setActiveIndex(
					loop ? mod(position - clones, count) : Math.min(position, count - 1),
				);
			});
			// Fallback for browsers without `scrollend`.
			window.clearTimeout(idle);
			idle = window.setTimeout(settle, SCROLL_IDLE_MS);
		};

		const onScrollEnd = () => {
			window.clearTimeout(idle);
			settle();
		};

		track.addEventListener("scroll", onScroll, { passive: true });
		track.addEventListener("scrollend", onScrollEnd);
		return () => {
			cancelAnimationFrame(frame);
			window.clearTimeout(idle);
			track.removeEventListener("scroll", onScroll);
			track.removeEventListener("scrollend", onScrollEnd);
		};
	}, [count, loop, clones, currentPosition, settle]);

	/* ---------- autoplay ---------- */

	useEffect(() => {
		const onVisibility = () => setPageHidden(document.hidden);
		onVisibility();
		document.addEventListener("visibilitychange", onVisibility);
		return () => document.removeEventListener("visibilitychange", onVisibility);
	}, []);

	useEffect(() => {
		if (!loop || isPaused || isInteracting || pageHidden) return;
		const interval = window.setInterval(() => move(1), AUTOPLAY_DELAY);
		return () => window.clearInterval(interval);
	}, [loop, isPaused, isInteracting, pageHidden, move, autoplayKey]);

	useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

	if (count === 0) return null;

	/* ---------- render ---------- */

	const slides = loop
		? Array.from({ length: count + clones * 2 }, (_, position) => {
				const realIndex = mod(position - clones, count);
				const isClone = position < clones || position >= clones + count;
				const key =
					position < clones
						? `clone-start-${position}`
						: position >= clones + count
							? `clone-end-${position - clones - count}`
							: `expert-${realIndex}`;
				return { expert: experts[realIndex], key, isClone };
			})
		: experts.map((expert, realIndex) => ({
				expert,
				key: `expert-${realIndex}`,
				isClone: false,
			}));

	// Exactly `visible` cards per view: 3 desktop / 2 tablet / 1 mobile.
	const slideBasis = `min(${SLIDE_WIDTH}px, calc((100% - ${(visible - 1) * gap}px) / ${visible}))`;

	const handleArrow = (direction: -1 | 1) => {
		move(direction);
		setAutoplayKey((key) => key + 1);
	};

	const handleDot = (realIndex: number) => {
		scrollToPosition(realIndex + clones);
		setAutoplayKey((key) => key + 1);
	};

	return (
		<section
			className={withCustomClass(styles.section, slice)}
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

				<div
					className={styles.carousel}
					onMouseEnter={() => setIsPaused(true)}
					onMouseLeave={() => setIsPaused(false)}
					onFocus={() => setIsPaused(true)}
					onBlur={(event) => {
						if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
							setIsPaused(false);
						}
					}}
				>
					{loop && (
						<button
							type="button"
							className={`${styles.arrow} ${styles.arrowPrev}`}
							aria-label="Previous experts"
							onClick={() => handleArrow(-1)}
						>
							<Arrow direction="prev" />
						</button>
					)}

					<ul
						className={styles.track}
						ref={trackRef}
						onPointerDown={() => setIsInteracting(true)}
						style={loop ? undefined : { justifyContent: "center" }}
					>
						{slides.map(({ expert, key, isClone }) => (
							<li
								key={key}
								className={styles.slide}
								aria-hidden={isClone || undefined}
								style={{ flex: `0 0 ${slideBasis}`, maxWidth: slideBasis }}
							>
								{isFilled.image(expert.photo) && (
									<PrismicNextImage
										field={expert.photo}
										className={styles.photo}
										sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
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

					{loop && (
						<button
							type="button"
							className={`${styles.arrow} ${styles.arrowNext}`}
							aria-label="Next experts"
							onClick={() => handleArrow(1)}
						>
							<Arrow direction="next" />
						</button>
					)}
				</div>

				{loop && (
					<div className={styles.dots} role="tablist" aria-label="Experts">
						{experts.map((expert, index) => (
							<button
								key={`dot-${index}`}
								type="button"
								role="tab"
								aria-selected={index === activeIndex}
								aria-label={`Show ${expert.name ?? `expert ${index + 1}`}`}
								className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
								onClick={() => handleDot(index)}
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
};

export default ExpertGrid;