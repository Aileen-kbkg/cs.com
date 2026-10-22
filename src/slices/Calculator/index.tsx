import { asText, Content, isFilled, KeyTextField, RichTextField } from "@prismicio/client";
import type { ImageField } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import Estimator, { type EstimatorContent, type EstimatorVariant } from "./Estimator";
import styles from "./Calculator.module.css";

/**
 * Props for `Calculator` ("Estimate Your First Year Tax Savings").
 */
export type CalculatorProps = SliceComponentProps<Content.CalculatorSlice>;

/**
 * Fields added to the model for the live estimator. Optional so this file
 * compiles before and after `prismicio-types.d.ts` is regenerated.
 *
 * `results_title` and `image` are used by the `classic` variation only.
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
  results_title?: KeyTextField;
  image?: ImageField;
};

type Primary = Omit<Content.CalculatorSlice["primary"], keyof Extras> & Extras;

/** One option per list item (paragraphs are accepted too). */
const toList = (field: RichTextField | undefined) =>
  (field ?? []).map((node) => ("text" in node ? node.text.trim() : "")).filter(Boolean);

/**
 * Live costsegregation.com text, used whenever the matching Prismic field is
 * missing or empty, so the section never renders blank labels.
 */
const LIVE_DEFAULTS = {
  estimateButtonLabel: "Estimate Savings",
  deductionsLabel: "Total Year 1 Deductions",
  deductionsDescription: "Deductions offset taxable income and reduce tax liability.",
  savingsLabel: "Year 1 Tax Savings From Depreciation",
  savingsNote:
    "Potential cash savings in your first year. State income tax benefits may be higher.",
  helperText: "Enter your property details and click Estimate Savings.",
  emailButtonLabel: "Email My Estimate",
  emailFormTitle: "Email Your Results",
  emailFormSubtitle:
    "You'll receive a professionally formatted email from CostSegregation.com with your complete estimate.",
  successMessage: "Email sent successfully! Check your inbox.",
  contactTitle: "Get Your Estimate",
  contactText:
    "Enter your info to instantly view your results! We'll also email you a detailed summary of tax benefits for your records.",
  contactButtonLabel: "View My Estimate",
  resultsTitle: "Estimated Savings",
  shortTermRentalTypes: [
    "Single Family Home",
    "Townhouse",
    "Condo - High Rise",
    "Condo - SFH",
    "ADU - Freestanding",
    "ADU - Interior Conversion",
    "Duplex",
    "Triplex",
    "Fourplex",
    "Apartment",
  ],
  discoverySources: [
    "ChatGPT/AI",
    "Conference/Event",
    "Postcard/Mail",
    "Marketing Email",
    "Online Advertising",
    "Organic Search",
    "Other",
    "Publication / PR",
    "Referral - Client",
    "Referral - CPA",
    "Referral - Internal",
    "Referral - Partner",
    "Sales Email / Outreach",
    "Social Media",
    "Webinar",
    "Influencer",
    "Podcast/Radio",
  ],
};

const listOr = (field: RichTextField | undefined, fallback: string[]) => {
  const list = toList(field);
  return list.length > 0 ? list : fallback;
};

const Calculator = ({ slice }: CalculatorProps) => {
  const p = slice.primary as Primary;

  const variant: EstimatorVariant =
    (slice.variation as string) === "classic" ? "classic" : "default";

  const d = LIVE_DEFAULTS;
  const content: EstimatorContent = {
    title: p.title,
    intro: isFilled.richText(p.intro) ? <PrismicRichText field={p.intro} /> : null,
    propertyTypes: toList(p.property_types),
    shortTermRentalTypes: listOr(p.short_term_rental_types, d.shortTermRentalTypes),
    discoverySources: listOr(p.discovery_sources, d.discoverySources),
    estimateButtonLabel: p.estimate_button_label || d.estimateButtonLabel,
    deductionsLabel: p.deductions_label || d.deductionsLabel,
    deductionsDescription: p.deductions_description || d.deductionsDescription,
    savingsLabel: p.savings_label || d.savingsLabel,
    savingsNote: p.savings_note || d.savingsNote,
    helperText: p.helper_text || d.helperText,
    disclaimer: asText(p.disclaimer),
    emailButtonLabel: p.email_button_label || d.emailButtonLabel,
    emailFormTitle: p.email_form_title || d.emailFormTitle,
    emailFormSubtitle: p.email_form_subtitle || d.emailFormSubtitle,
    successMessage: p.success_message || d.successMessage,
    contactTitle: p.contact_title || d.contactTitle,
    contactText: p.contact_text || d.contactText,
    contactButtonLabel: p.contact_button_label || d.contactButtonLabel,
    resultsTitle: p.results_title || d.resultsTitle,
    image:
      p.image && isFilled.image(p.image)
        ? { url: p.image.url as string, alt: p.image.alt || "" }
        : null,
  };

  return (
    <section
      id="calculator"
      className={styles.root}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className={styles.inner}>
        <Estimator content={content} variant={variant} />
      </div>
    </section>
  );
};

export default Calculator;