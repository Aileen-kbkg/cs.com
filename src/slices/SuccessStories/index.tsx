import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

export type SuccessStoriesProps = SliceComponentProps<Content.SuccessStoriesSlice>;

const SuccessStories: FC<SuccessStoriesProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-white"
    >
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">{slice.primary.title}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {slice.items.map((item, i) => (
            <article key={i} className="rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900">{item.property_type}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {item.purchase_price} purchase price (less land)
              </p>
              <p className="mt-5 text-4xl font-bold text-blue-800">
                {item.first_year_deduction}
              </p>
              <p className="text-sm text-slate-600">First year tax deductions</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;