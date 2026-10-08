import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";

export type FeatureGridProps = SliceComponentProps<Content.FeatureGridSlice>;

const cols: Record<string, string> = {
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-3",
  "4": "md:grid-cols-4",
};

const FeatureGrid: FC<FeatureGridProps> = ({ slice }) => {
  const p = slice.primary;
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-white"
    >
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">{p.title}</h2>
        <div className="mt-3 max-w-2xl text-slate-700">
          <PrismicRichText field={p.intro} />
        </div>
        {slice.items.length > 0 && (
          <ul className={`mt-10 grid gap-8 ${cols[p.columns ?? "3"]}`}>
            {slice.items.map((item, i) => (
              <li key={i}>
                <PrismicNextImage field={item.icon} className="mb-3 h-10 w-10" />
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <div className="mt-1 text-slate-700">
                  <PrismicRichText field={item.text} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default FeatureGrid;