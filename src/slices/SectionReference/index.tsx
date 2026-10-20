import { Content } from "@prismicio/client";
import { SliceZone, SliceComponentProps } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

type SectionReferenceSlice = {
  id: string;
  slice_type: string;
  variation: string;
  primary: { section: { id?: string } | null };
  items: never[];
};

export type SectionReferenceProps = SliceComponentProps<SectionReferenceSlice>;
/**
 * Renders a `shared_section` document in place.
 *
 * Lets one piece of content — "Success Stories", say — live in a single
 * document and appear on several pages, instead of being duplicated into
 * each page's slice zone.
 *
 * This is an async server component: SliceZone renders it on the server,
 * so the extra fetch happens during render rather than in the browser.
 *
 * `shared_section` must NOT allow `section_reference` in its own slice
 * zone, or a section could reference itself and recurse.
 */
const SectionReference = async ({ slice }: SectionReferenceProps) => {
	const link = slice.primary.section as { id?: string } | null | undefined;
	const id = link?.id;

	if (!id) {
		return null;
	}

	const client = createClient();

	const section = await client.getByID(id).catch(() => null);

	if (!section) {
		// Linked document was unpublished or deleted — render nothing
		// rather than breaking the page.
		return null;
	}

	const sectionSlices = (section.data as { slices?: unknown }).slices ?? [];

	return (
		<SliceZone
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			slices={sectionSlices as any}
			components={components}
		/>
	);
};

export default SectionReference;