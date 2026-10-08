import { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

export type CalculatorProps = SliceComponentProps<Content.CalculatorSlice>;

const Calculator: FC<CalculatorProps> = ({ slice }) => {
  const p = slice.primary;
  return (
    <section
      id="calculator"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-slate-50"
    >
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">{p.title}</h2>
        <div className="mt-3 text-slate-700">
          <PrismicRichText field={p.intro} />
        </div>
        <details className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer font-semibold text-slate-900">
            Supported property types
          </summary>
          <div className="mt-3 text-sm text-slate-700 [&_ul]:grid [&_ul]:gap-1 [&_ul]:sm:grid-cols-2 [&_li]:list-inside [&_li]:list-disc">
            <PrismicRichText field={p.property_types} />
          </div>
        </details>
        <div className="mt-6 text-xs text-slate-600">
          <PrismicRichText field={p.disclaimer} />
        </div>
      </div>
    </section>
  );
};

export default Calculator;