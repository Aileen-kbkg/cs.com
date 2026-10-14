import type { Metadata } from "next";
import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicText } from "@prismicio/react";
import { createClient } from "@/prismicio";

export const metadata: Metadata = {
	title: "Blog | CostSegregation.com",
	description:
		"Guides, case studies, and answers on cost segregation for real estate investors.",
	alternates: {
		canonical: "/resources/blog",
	},
};

function formatDate(date: string | null) {
	if (!date) return null;

	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(new Date(date));
}

export default async function Page() {
	const client = createClient();

	const posts = await client.getAllByType("blog_post", {
		orderings: [{ field: "my.blog_post.date", direction: "desc" }],
	});

	return (
		<main>
			<h1>Blog</h1>

			{posts.length === 0 ? (
				<p>No posts published yet.</p>
			) : (
				<ul>
					{posts.map((post) => {
						const published = formatDate(post.data.date);

						return (
							<li key={post.id}>
								<Link href={`/resources/${post.uid}`}>
									{post.data.featured_image?.url ? (
										<PrismicNextImage
											field={post.data.featured_image}
											sizes="(max-width: 768px) 100vw, 33vw"
										/>
									) : null}

									<h2>
										<PrismicText field={post.data.title} />
									</h2>

									{published ? (
										<time dateTime={post.data.date ?? undefined}>
											{published}
										</time>
									) : null}

									{post.data.excerpt ? <p>{post.data.excerpt}</p> : null}
								</Link>
							</li>
						);
					})}
				</ul>
			)}
		</main>
	);
}