import type { Metadata } from "next";
import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicText } from "@prismicio/react";
import { createClient } from "@/prismicio";
import styles from "./Blog.module.css";

const POSTS_PER_PAGE = 6;

export const metadata: Metadata = {
	title: "Blog - Cost Segregation",
	description:
		"Written by the experts at CostSegregation.com, this page contains cost segregation insights, guides, and much more!",
	alternates: {
		canonical: "/resources/blog/",
	},
	openGraph: {
		title: "Blog - Cost Segregation",
		description:
			"Written by the experts at CostSegregation.com, this page contains cost segregation insights, guides, and much more!",
		type: "article",
	},
};

type Props = {
	searchParams: Promise<{ page?: string }>;
};

export default async function Page({ searchParams }: Props) {
	const { page } = await searchParams;
	const currentPage = Math.max(1, Number(page) || 1);

	const client = createClient();

	const response = await client.getByType("blog_post", {
		orderings: [{ field: "my.blog_post.date", direction: "desc" }],
		page: currentPage,
		pageSize: POSTS_PER_PAGE,
	});

	const posts = response.results;
	const totalPages = response.total_pages;

	return (
		<main className={styles.page}>
			<header className={styles.intro}>
				<h1 className={styles.heading}>
					Cost Segregation for Real Estate Investors
				</h1>
				<p className={styles.subheading}>
					Explore expert articles on cost segregation, depreciation strategies
					and other tax-saving opportunities for modern property investors in
					short-term rentals, single-family homes and more.
				</p>
			</header>

			{posts.length === 0 ? (
				<p className={styles.empty}>No posts published yet.</p>
			) : (
				<ul className={styles.grid}>
					{posts.map((post) => (
						<li key={post.id} className={styles.card}>
							{post.data.featured_image?.url ? (
								<Link
									href={`/resources/${post.uid}`}
									className={styles.imageLink}
									tabIndex={-1}
									aria-hidden="true"
								>
									<PrismicNextImage
										field={post.data.featured_image}
										className={styles.image}
										sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
									/>
								</Link>
							) : null}

							<div className={styles.body}>
								<h3 className={styles.cardTitle}>
									<Link href={`/resources/${post.uid}`}>
										<PrismicText field={post.data.title} />
									</Link>
								</h3>

								{post.data.excerpt ? (
									<p className={styles.excerpt}>{post.data.excerpt}</p>
								) : null}

								<Link href={`/resources/${post.uid}`} className={styles.more}>
									Learn more
								</Link>
							</div>
						</li>
					))}
				</ul>
			)}

			{totalPages > 1 ? (
				<nav className={styles.pagination} aria-label="Blog pagination">
					{Array.from({ length: totalPages }, (_, index) => index + 1).map(
						(pageNumber) =>
							pageNumber === currentPage ? (
								<span
									key={pageNumber}
									className={styles.pageCurrent}
									aria-current="page"
								>
									<span className={styles.srOnly}>Page </span>
									{pageNumber}
								</span>
							) : (
								<Link
									key={pageNumber}
									href={
										pageNumber === 1
											? "/resources/blog"
											: `/resources/blog?page=${pageNumber}`
									}
									className={styles.pageLink}
								>
									<span className={styles.srOnly}>Page </span>
									{pageNumber}
								</Link>
							),
					)}
				</nav>
			) : null}
		</main>
	);
}