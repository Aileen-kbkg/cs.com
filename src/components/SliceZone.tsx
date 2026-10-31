import type { ComponentProps } from "react";
import { SliceZone as PrismicSliceZone } from "@prismicio/react";

const ANNOUNCEMENT_BAR = "announcement_bar";

type PrismicSliceZoneProps = ComponentProps<typeof PrismicSliceZone>;
type SliceLike = PrismicSliceZoneProps["slices"] extends
	| readonly (infer S)[]
	| undefined
	? S
	: never;

const isAnnouncementBar = (slice: SliceLike) =>
	(slice as { slice_type?: string } | null)?.slice_type === ANNOUNCEMENT_BAR;

export function splitAnnouncementBar<T extends SliceLike>(
	slices: readonly T[] | null | undefined,
): { announcementBar: T[]; rest: T[] } {
	const list = slices ?? [];
	const first = list.find(isAnnouncementBar);

	return {
		announcementBar: first ? [first] : [],
		rest: list.filter((slice) => !isAnnouncementBar(slice)),
	};
}

export function orderAnnouncementBarFirst<T extends SliceLike>(
	slices: readonly T[] | null | undefined,
): T[] {
	const { announcementBar, rest } = splitAnnouncementBar(slices);
	return [...announcementBar, ...rest];
}

export default function SliceZone({ slices, ...rest }: PrismicSliceZoneProps) {
	return (
		<PrismicSliceZone {...rest} slices={orderAnnouncementBarFirst(slices)} />
	);
}