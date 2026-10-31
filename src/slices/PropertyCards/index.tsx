import type { ImageField, KeyTextField, LinkField, RichTextField } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import ProductCards from "../ProductCards";

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
	primary: { title: KeyTextField; intro: RichTextField; card: PropertyCard[] };
	items: never[];
};

type ProductCardsProps = Parameters<typeof ProductCards>[0];

/** property_cards keeps its cards in `primary.card`; ProductCards reads `items`. */
const PropertyCards = ({ slice, ...rest }: SliceComponentProps<PropertyCardsSlice>) => (
	<ProductCards
		{...(rest as Omit<ProductCardsProps, "slice">)}
		slice={{ ...slice, items: slice.primary.card ?? [] } as unknown as ProductCardsProps["slice"]}
	/>
);

export default PropertyCards;