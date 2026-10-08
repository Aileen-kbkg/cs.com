import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";

export type StepsProps = SliceComponentProps<Content.StepsSlice>;

const Steps: FC<StepsProps> = ({ slice }) => {
  const p = slice.primary;
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-slate-50"
    >
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">{p.title}</h2>
        <div className="mt-3 max-w-2xl text-slate-700">
          <PrismicRichText field={p.intro} />
        </div>
        <ol className="mt-10 grid gap-6 md:grid-cols-4">
          {slice.items.map((item, i) => (
            <li key={i} className="rounded-lg border border-slate-200 bg-white p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 font-semibold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{item.step_title}</h3>
              <div className="mt-1 text-sm text-slate-700">
                <PrismicRichText field={item.step_text} />
              </div>
            </li>
          ))}
        </ol>
        {p.cta_label && (
          <PrismicNextLink
            field={p.cta_link}
            className="mt-10 inline-block rounded-md bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
          >
            {p.cta_label}
          </PrismicNextLink>
        )}
      </div>
    </section>
  );
};

export default Steps;