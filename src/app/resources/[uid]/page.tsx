import type { Metadata } from "next";
import Link from "next/link";
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

import styles from "./Article.module.css";

/**
 * Absolute base used in the "Email this insight" link. Set
 * NEXT_PUBLIC_SITE_URL in Vercel once a custom domain is attached.
 */
const siteUrl =
	process.env.NEXT_PUBLIC_SITE_URL ?? "https://cost-segregation.vercel.app";

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

const EnvelopeIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.2-8 4.8-8-4.8V6l8 4.8L20 6v2.2z" />
	</svg>
);

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
		alternates: { canonical: `/resources/${post.uid}` },
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
	const faqs: Array<{
        question: KeyTextField;
        answer: RichTextField;
}> = data.faqs ?? [];
	const headline = asText(data.title);
	const canonical = `${siteUrl}/resources/${post.uid}`;

	const mailto = `mailto:?subject=${encodeURIComponent(
		headline,
	)}&body=${encodeURIComponent(
		`${data.excerpt ? `${data.excerpt}\n\n` : ""}${canonical}`,
	)}`;

	// Three most recent posts, excluding this one.
	const latest = await client.getByType("blog_post", {
		orderings: [{ field: "my.blog_post.date", direction: "desc" }],
		pageSize: 4,
	});
	const related = latest.results
		.filter((item) => item.uid !== post.uid)
		.slice(0, 3);

	return (
		<main className={styles.page}>
			<section className={styles.hero}>
				<div className={styles.heroInner}>
					<h1 className={styles.title}>
						<PrismicText field={data.title} />
					</h1>

					{published ? (
						<time className={styles.date} dateTime={data.date ?? undefined}>
							{published}
						</time>
					) : null}

					<nav className={styles.breadcrumb} aria-label="Breadcrumb">
						<Link href="/">Home</Link>
						<span className={styles.breadcrumbSep}>-</span>
						<Link href="/resources/blog">Resources</Link>
						<span className={styles.breadcrumbSep}>-</span>
						<span>{headline}</span>
					</nav>
				</div>
			</section>

			{data.featured_image?.url ? (
				<div className={styles.featuredWrap}>
					<PrismicNextImage
						field={data.featured_image}
						className={styles.featuredImage}
						priority
						sizes="(max-width: 560px) 100vw, 520px"
					/>
				</div>
			) : null}

			<div className={styles.shareWrap}>
				<a className={styles.emailButton} href={mailto}>
					<span className={styles.emailIcon}>
						<EnvelopeIcon />
					</span>
					<span className={styles.emailLabel}>Email this insight</span>
				</a>
			</div>

			<article className={styles.article}>
				<div className={styles.body}>
					<PrismicRichText
						field={data.body}
						components={{
							image: ({ node, key }) => (
								<PrismicNextImage key={key} field={node} sizes="100vw" />
							),
						}}
					/>
				</div>

				{faqs.length > 0 ? (
					<section className={styles.faqs}>
						<h2 className={styles.faqsTitle}>
							{data.faq_title || "Frequently Asked Questions"}
						</h2>

						{faqs.map((faq, index) => (
							<details key={index} className={styles.faq}>
								<summary className={styles.faqQuestion}>{faq.question}</summary>
								<div className={styles.faqAnswer}>
									<PrismicRichText field={faq.answer} />
								</div>
							</details>
						))}
					</section>
				) : null}

				{data.after_faq?.length ? (
					<section className={styles.afterFaq}>
						<PrismicRichText field={data.after_faq} />
					</section>
				) : null}
			</article>

			{related.length > 0 ? (
				<section className={styles.related}>
					<h2 className={styles.relatedTitle}>Our latest entries</h2>

					<ul className={styles.relatedGrid}>
						{related.map((item) => (
							<li key={item.id} className={styles.relatedCard}>
								{item.data.featured_image?.url ? (
									<Link
										href={`/resources/${item.uid}`}
										className={styles.relatedImageLink}
										tabIndex={-1}
										aria-hidden="true"
									>
										<PrismicNextImage
											field={item.data.featured_image}
											className={styles.relatedImage}
											sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
										/>
									</Link>
								) : null}

								<div className={styles.relatedBody}>
									<h3 className={styles.relatedCardTitle}>
										<Link href={`/resources/${item.uid}`}>
											<PrismicText field={item.data.title} />
										</Link>
									</h3>

									{item.data.excerpt ? (
										<p className={styles.relatedExcerpt}>{item.data.excerpt}</p>
									) : null}

									<Link
										href={`/resources/${item.uid}`}
										className={styles.relatedMore}
									>
										Learn more
									</Link>
								</div>
							</li>
						))}
					</ul>

					<Link href="/resources/blog" className={styles.viewAll}>
						View All Articles
					</Link>
				</section>
			) : null}
		</main>
	);
}