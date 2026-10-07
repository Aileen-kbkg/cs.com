// slices/Hero/index.tsx — renders the "hero" shared slice from Prismic.
import type { Content } from "@prismicio/client";
import { PrismicRichText, PrismicLink, SliceComponentProps } from "@prismicio/react";

export type HeroProps = SliceComponentProps<Content.HeroSlice>;

export default function Hero({ slice }: HeroProps) {
  const { head, description, cta_label, cta_link } = slice.primary;

  return (
    <section
      data-slice-type={slice.slice_type}
      className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left"
    >
      <h1 className="max-w-md text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
        {head}
      </h1>
      <div className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400 [&_p]:mb-4 [&_p:last-child]:mb-0">
        <PrismicRichText field={description} />
      </div>
      {cta_link && cta_label && (
        <PrismicLink
          field={cta_link}
          className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-base font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          {cta_label}
        </PrismicLink>
      )}
    </section>
  );
}