import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";

export type PricingProps = SliceComponentProps<Content.PricingSlice>;

const usd = (n: number | null) =>
  n === null ? "" : n >= 1_000_000 ? `$${n / 1_000_000}M` : `$${n.toLocaleString("en-US")}`;

const Pricing: FC<PricingProps> = ({ slice }) => {
  const p = slice.primary;
  return (
    <section
      id="pricing"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-white"
    >
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">{p.title}</h2>

        <div className="mt-6 rounded-lg bg-slate-50 p-6">
          <h3 className="font-semibold text-slate-900">{p.included_title}</h3>
          <div className="mt-2 text-slate-700 [&_ul]:grid [&_ul]:gap-x-8 [&_ul]:gap-y-1 [&_ul]:sm:grid-cols-2 [&_li]:list-inside [&_li]:list-disc">
            <PrismicRichText field={p.included_features} />
          </div>
          <div className="mt-3 font-medium text-blue-800">
            <PrismicRichText field={p.loyalty_note} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {slice.items.map((item, i) => (
            <article key={i} className="rounded-lg border border-slate-200 p-6">
              <h3 className="text-xl font-semibold text-slate-900">{item.plan_name}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.property_type}</p>
              <p className="mt-4 text-4xl font-bold text-slate-900">{item.price}</p>
              <p className="text-sm text-slate-600">{item.price_note}</p>
              <p className="mt-4 text-sm text-slate-700">
                {item.basis_label}: {usd(p.slider_min)} to {usd(p.slider_max)}
              </p>
              <PrismicNextLink
                field={item.cta_link}
                className="mt-6 inline-block rounded-md bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800"
              >
                {item.cta_label}
              </PrismicNextLink>
            </article>
          ))}
        </div>

        {p.custom_quote_label && (
          <div className="mt-8">
            <PrismicNextLink
              field={p.custom_quote_link}
              className="font-semibold text-blue-700 underline underline-offset-4"
            >
              {p.custom_quote_label}
            </PrismicNextLink>
          </div>
        )}
      </div>
    </section>
  );
};

export default Pricing;