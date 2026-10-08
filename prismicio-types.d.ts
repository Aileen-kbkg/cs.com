// prismicio-types.d.ts
// Minimal hand-written types for the settings singleton.
// Replace this file by running: npx prismic-ts-codegen
import type {
	PrismicDocumentWithoutUID,
	ImageField,
	KeyTextField,
	LinkField,
	GroupField,
	Simplify,
} from "@prismicio/client";

export type NavLinkItem = Simplify<{
	label: KeyTextField;
	link: LinkField;
}>;

export type ResourceItem = Simplify<{
	label: KeyTextField;
	link: LinkField;
}>;

export type SettingsDocumentData = {
	logo: ImageField;
	announcement_text: KeyTextField;
	announcement_cta_label: KeyTextField;
	announcement_cta_link: LinkField;
	nav_links: GroupField<NavLinkItem>;
	resources_label: KeyTextField;
	resources_items: GroupField<ResourceItem>;
	about_label: KeyTextField;
	about_link: LinkField;
	primary_cta_label: KeyTextField;
	primary_cta_link: LinkField;
	secondary_cta_label: KeyTextField;
	secondary_cta_link: LinkField;
};

export type SettingsDocument =
	PrismicDocumentWithoutUID<SettingsDocumentData, "settings">;

declare module "@prismicio/client" {
	interface CreateClient {
		(repositoryNameOrEndpoint: string, options?: object): import("@prismicio/client").Client;
	}
	interface Content {
		SettingsDocument: SettingsDocument;
	}
}