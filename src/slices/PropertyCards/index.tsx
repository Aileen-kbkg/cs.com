import type {
	ImageField,
	KeyTextField,
	LinkField,
	RichTextField,
} from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import ProductCards from "../ProductCards";

/**
 * `property_cards` stores its cards in a repeatable group, `primary.card`,
 * not in `items`. The fields are the same as ProductCards' items
 * (image, title, text, link, link_label), so this hands the group to the
 * existing ProductCards component as its items — same markup, same styles.
 *
 * Local type until `property_cards` is in the generated Prismic types.
 */
type PropertyCard = {
	image: ImageField;
	title: KeyTextField;
	text: RichTextField;
	link: LinkField;
	link_label: KeyTextField;
};

type PropertyCardsSlice = {
	id: string;
	slice_type: "property_cards";
	slice_label: string | null;
	variation: string;
	version: string;
	primary: {
		title: KeyTextField;
		intro: RichTextField;
		card: PropertyCard[];
	};
	items: never[];
};

export type PropertyCardsProps = SliceComponentProps<PropertyCardsSlice>;

type ProductCardsProps = Parameters<typeof ProductCards>[0];

const PropertyCards = ({ slice, ...rest }: PropertyCardsProps) => {
	const asProductCards = {
		...slice,
		items: slice.primary.card ?? [],
	} as unknown as ProductCardsProps["slice"];

	return (
		<ProductCards
			{...(rest as Omit<ProductCardsProps, "slice">)}
			slice={asProductCards}
		/>
	);
};

export default PropertyCards;