"use client";

import { useRef } from "react";

/** Clicks this close to the bottom land on the native control bar. */
const CONTROLS_HEIGHT = 56;

type TutorialVideoProps = {
	src: string;
	poster?: string;
	className?: string;
};

/**
 * Native video player that also plays or pauses when the picture is
 * clicked, as the live page does. Clicks on the control bar are left to
 * the browser, and browsers that already toggle on click are not
 * toggled twice.
 */
export default function TutorialVideo({
	src,
	poster,
	className,
}: TutorialVideoProps) {
	const pausedAtPress = useRef(true);

	return (
		<video
			className={className}
			src={src}
			poster={poster}
			controls
			preload="none"
			controlsList="nodownload"
			playsInline
			onPointerDown={(event) => {
				pausedAtPress.current = event.currentTarget.paused;
			}}
			onClick={(event) => {
				const video = event.currentTarget;
				const { top, height } = video.getBoundingClientRect();

				if (event.clientY > top + height - CONTROLS_HEIGHT) return;

				// Let the browser's own toggle, if any, run first.
				window.setTimeout(() => {
					if (video.paused !== pausedAtPress.current) return;

					if (video.paused) {
						void video.play();
					} else {
						video.pause();
					}
				}, 0);
			}}
		/>
	);
}
