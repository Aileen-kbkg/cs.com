import { Content, asText } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";
import { createClient } from "@/prismicio";
import { withCustomClass } from "@/lib/customClass";

export type PostListProps = SliceComponentProps<Content.PostListSlice>;

const PostList = async ({ slice }: PostListProps) => {
  const p = slice.primary;
  const client = createClient();
  const posts = await client
    .getAllByType("blog_post", {
      limit: p.post_count ?? 3,
      orderings: [{ field: "my.blog_post.date", direction: "desc" }],
    })
    .catch(() => []);

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={withCustomClass("bg-white", slice)}
    >
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">{p.title}</h2>
        <div className="mt-3 text-slate-700">
          <PrismicRichText field={p.intro} />
        </div>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id} className="rounded-lg border border-slate-200 p-5">
              <a
                href={`/resources/${post.uid}/`}
                className="font-semibold text-slate-900 hover:text-blue-700"
              >
                {asText(post.data.title)}
              </a>
              {post.data.excerpt && (
                <p className="mt-2 text-sm text-slate-700">{post.data.excerpt}</p>
              )}
            </li>
          ))}
        </ul>
        {p.view_all_label && (
          <PrismicNextLink
            field={p.view_all_link}
            className="mt-6 inline-block font-semibold text-blue-700 underline underline-offset-4"
          >
            {p.view_all_label}
          </PrismicNextLink>
        )}
      </div>
    </section>
  );
};

export default PostList;