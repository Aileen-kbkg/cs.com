import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asText } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, PrismicText } from "@prismicio/react";
import { createClient } from "@/prismicio";

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

	const title = post.data.meta_title || asText(post.data.title) || undefined;
	const description =
		post.data.meta_description || post.data.excerpt || undefined;
	const image = post.data.meta_image?.url || post.data.featured_image?.url;

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
			publishedTime: post.data.date ?? undefined,
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

	const published = formatDate(post.data.date);
	const faqs = post.data.faqs ?? [];

	return (
		<article>
			<header>
				<h1>
					<PrismicText field={post.data.title} />
				</h1>

				{published ? (
					<time dateTime={post.data.date ?? undefined}>{published}</time>
				) : null}

				{post.data.featured_image?.url ? (
					<PrismicNextImage
						field={post.data.featured_image}
						priority
						sizes="(max-width: 1024px) 100vw, 1024px"
					/>
				) : null}
			</header>

			<PrismicRichText
				field={post.data.body}
				components={{
					image: ({ node, key }) => (
						<PrismicNextImage key={key} field={node} sizes="100vw" />
					),
				}}
			/>

			{faqs.length > 0 ? (
				<section>
					<h2>{post.data.faq_title || "Frequently Asked Questions"}</h2>

					{faqs.map((faq, index) => (
						<details key={index}>
							<summary>{faq.question}</summary>
							<PrismicRichText field={faq.answer} />
						</details>
					))}
				</section>
			) : null}

			<PrismicRichText field={post.data.after_faq} />
		</article>
	);
}