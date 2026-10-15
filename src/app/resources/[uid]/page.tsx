import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
	asText,
	type GroupField,
	type ImageField,
	type KeyTextField,
	type RichTextField,
} from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, PrismicText } from "@prismicio/react";
import { createClient } from "@/prismicio";

/**
 * Fields that exist on the `blog_post` custom type in Prismic but are missing
 * from the generated types. Remove this once prismicio-types.d.ts is
 * regenerated from the current custom type definition.
 */
type BlogPostExtras = {
	faq_title: KeyTextField;
	faqs: GroupField<{
		question: KeyTextField;
		answer: RichTextField;
	}>;
	after_faq: RichTextField;
	meta_title: KeyTextField;
	meta_description: KeyTextField;
	meta_image: ImageField;
};

type Props = {
	params: Promise<{ uid: string }>;
};

function formatDate(date: string | null) {
	if (!date) return null;

	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(new Date(date));
}

export async function generateStaticParams() {
	const client = createClient();
	const posts = await client.getAllByType("blog_post");

	return posts.map((post) => ({ uid: post.uid as string }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { uid } = await params;
	const client = createClient();

	const post = await client.getByUID("blog_post", uid).catch(() => null);

	if (!post) {
		return { title: "Post not found" };
	}

	const data = post.data as typeof post.data & BlogPostExtras;

	const title = data.meta_title || asText(data.title) || undefined;
	const description = data.meta_description || data.excerpt || undefined;
	const image = data.meta_image?.url || data.featured_image?.url;

	return {
		title,
		description,
		alternates: {
			canonical: `/resources/${post.uid}`,
		},
		openGraph: {
			type: "article",
			title,
			description,
			publishedTime: data.date ?? undefined,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function Page({ params }: Props) {
	const { uid } = await params;
	const client = createClient();

	const post = await client.getByUID("blog_post", uid).catch(() => null);

	if (!post) {
		notFound();
	}

	const data = post.data as typeof post.data & BlogPostExtras;

	const published = formatDate(data.date);
	const faqs = data.faqs ?? [];

	return (
		<article>
			<header>
				<h1>
					<PrismicText field={data.title} />
				</h1>

				{published ? (
					<time dateTime={data.date ?? undefined}>{published}</time>
				) : null}

				{data.featured_image?.url ? (
					<PrismicNextImage
						field={data.featured_image}
						priority
						sizes="(max-width: 1024px) 100vw, 1024px"
					/>
				) : null}
			</header>

			<PrismicRichText
				field={data.body}
				components={{
					image: ({ node, key }) => (
						<PrismicNextImage key={key} field={node} sizes="100vw" />
					),
				}}
			/>

			{faqs.length > 0 ? (
				<section>
					<h2>{data.faq_title || "Frequently Asked Questions"}</h2>

					{faqs.map((faq, index) => (
						<details key={index}>
							<summary>{faq.question}</summary>
							<PrismicRichText field={faq.answer} />
						</details>
					))}
				</section>
			) : null}

			<PrismicRichText field={data.after_faq} />
		</article>
	);
}