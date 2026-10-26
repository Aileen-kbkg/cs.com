"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Routes that render their own header instead of the standard Navbar —
 * co-branded partner landing pages.
 *
 * The Navbar is still rendered on the server and passed in as children;
 * this only decides whether to mount it. That keeps the root layout a
 * server component and avoids moving every existing route into a group.
 */
const HEADERLESS_ROUTES = [
  "/empowered-investor",
  "/referral-roofstock",
  "/s8-acquisition",
];

export default function HeaderSlot({ children }: { children: ReactNode }) {
	const pathname = usePathname();

	const hidden = HEADERLESS_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);

	if (hidden) return null;

	return <>{children}</>;
}