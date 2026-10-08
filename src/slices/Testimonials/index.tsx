import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

export type TestimonialsProps = SliceComponentProps<Content.TestimonialsSlice>;

const Testimonials: FC<TestimonialsProps> = ({ slice }) => {
  const p = slice.primary;
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-slate-50"
    >
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">{p.title}</h2>
        <p className="mt-2 text-slate-700">
          <strong className="text-slate-900">{p.rating}/5</strong> {p.source_label}
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {slice.items.map((item, i) => (
            <figure key={i} className="rounded-lg border border-slate-200 bg-white p-5">
              <blockquote className="text-sm text-slate-700">
                <PrismicRichText field={item.quote} />
              </blockquote>
              <figcaption className="mt-3 font-semibold text-slate-900">
                {item.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;