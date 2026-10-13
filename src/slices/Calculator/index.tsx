import { asText, Content, isFilled, KeyTextField, RichTextField } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import Estimator, { type EstimatorContent } from "./Estimator";
import styles from "./Calculator.module.css";

/**
 * Props for `Calculator` ("Estimate Your First Year Tax Savings").
 */
export type CalculatorProps = SliceComponentProps<Content.CalculatorSlice>;

/**
 * Fields added to the model for the live estimator. Optional so this file
 * compiles before and after `prismicio-types.d.ts` is regenerated.
 */
type Extras = {
  estimate_button_label?: KeyTextField;
  deductions_label?: KeyTextField;
  deductions_description?: KeyTextField;
  savings_label?: KeyTextField;
  savings_note?: KeyTextField;
  helper_text?: KeyTextField;
  email_form_subtitle?: KeyTextField;
  contact_title?: KeyTextField;
  contact_text?: KeyTextField;
  contact_button_label?: KeyTextField;
  short_term_rental_types?: RichTextField;
  discovery_sources?: RichTextField;
};

type Primary = Omit<Content.CalculatorSlice["primary"], keyof Extras> & Extras;

/** One option per list item (paragraphs are accepted too). */
const toList = (field: RichTextField | undefined) =>
  (field ?? []).map((node) => ("text" in node ? node.text.trim() : "")).filter(Boolean);

const Calculator = ({ slice }: CalculatorProps) => {
  const p = slice.primary as Primary;

  const content: EstimatorContent = {
    title: p.title,
    intro: isFilled.richText(p.intro) ? <PrismicRichText field={p.intro} /> : null,
    propertyTypes: toList(p.property_types),
    shortTermRentalTypes: toList(p.short_term_rental_types),
    discoverySources: toList(p.discovery_sources),
    estimateButtonLabel: p.estimate_button_label || "Estimate Savings",
    deductionsLabel: p.deductions_label || "",
    deductionsDescription: p.deductions_description || "",
    savingsLabel: p.savings_label || "",
    savingsNote: p.savings_note || "",
    helperText: p.helper_text || "",
    disclaimer: asText(p.disclaimer),
    emailButtonLabel: p.email_button_label || "",
    emailFormTitle: p.email_form_title || "",
    emailFormSubtitle: p.email_form_subtitle || "",
    successMessage: p.success_message || "",
    contactTitle: p.contact_title || "",
    contactText: p.contact_text || "",
    contactButtonLabel: p.contact_button_label || "View My Estimate",
  };

  return (
    <section
      id="calculator"
      className={styles.root}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className={styles.inner}>
        <Estimator content={content} />
      </div>
    </section>
  );
};

export default Calculator;
