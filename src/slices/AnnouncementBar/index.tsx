"use client";

import { usePathname } from "next/navigation";
import { isFilled } from "@prismicio/client";
import type { KeyTextField, LinkField } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import styles from "./AnnouncementBar.module.css";

export type Announcement = {
	/** Route this applies to, e.g. "/rei-busyseason". Empty = site-wide default. */
	path: KeyTextField;
	text: KeyTextField;
	link: LinkField;
	link_label: KeyTextField;
	/** "blue" (default) or "navy". */
	background: string | null;
};

/**
 * Site-wide announcement bar with per-page overrides.
 *
 * Picks the row whose `path` matches the current route; falls back to the
 * row with no path set. Campaign pages can therefore run their own
 * message and colour without a separate layout.
 */
export default function AnnouncementBar({ items }: { items: Announcement[] }) {
	const pathname = usePathname();

	if (!items || items.length === 0) return null;

	const normalise = (value: string) =>
		value.replace(/\/+$/, "").toLowerCase() || "/";

	const current = normalise(pathname ?? "/");

	const match =
		items.find((item) => item.path && normalise(item.path) === current) ??
		items.find((item) => !item.path);

	if (!match || !match.text) return null;

	const theme =
		match.background === "navy" ? styles.announcementNavy : styles.announcementBlue;

	return (
		<div className={`${styles.announcement} ${theme}`}>
			<p>
				{isFilled.link(match.link) ? (
					<PrismicNextLink field={match.link}>
						{match.text}
						{match.link_label ? ` ${match.link_label}` : null}
					</PrismicNextLink>
				) : (
					match.text
				)}
			</p>
		</div>
	);
}