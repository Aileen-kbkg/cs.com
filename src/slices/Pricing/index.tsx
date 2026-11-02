import {
  Content,
  ImageField,
  isFilled,
  KeyTextField,
  LinkField,
  NumberField,
  RichTextField,
} from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";

import { CheckCircleIcon, ChevronRightIcon } from "./icons";
import PlanCalculator from "./PlanCalculator";
import type { PriceRule } from "./pricing";
import styles from "./Pricing.module.css";
import { withCustomClass } from "@/lib/customClass";

/**
 * Props for `Pricing` ("Transparent, All Inclusive Pricing").
 */
export type PricingProps = SliceComponentProps<Content.PricingSlice>;

/**
 * Fields added to the Pricing model for the live layout and price rules.
 * Declared optional so this file compiles before and after
 * `prismicio-types.d.ts` is regenerated.
 */
type PricingPrimaryExtras = {
  loyalty_image?: ImageField;
  loyalty_cta_label?: KeyTextField;
  loyalty_cta_link?: LinkField;
  custom_quote_title?: KeyTextField;
  custom_quote_text?: RichTextField;
  /**
   * Notes under the plan buttons ("Loyalty discounts for repeat users!"):
   * the first note goes under the first plan, the second under the second.
   * A single note goes under every plan.
   */
  note_under_the_button?: Array<{ plan_note?: KeyTextField }>;
};

type PricingItemExtras = {
  plan_icon?: ImageField;
  property_types_text?: RichTextField;
  default_basis?: NumberField;
  base_price?: NumberField;
  base_limit?: NumberField;
  rate_per_dollar?: NumberField;
  cap_limit?: NumberField;
  cap_price?: NumberField;
};

type Primary = Omit<Content.PricingSlice["primary"], keyof PricingPrimaryExtras> &
  PricingPrimaryExtras;
type Item = Omit<Content.PricingSlice["items"][number], keyof PricingItemExtras> &
  PricingItemExtras;

/** Live plan icons, used until a Plan icon is set in Prismic. */
const FALLBACK_ICONS = ["/icons/pricing/residential.svg", "/icons/pricing/commercial.svg"];

const num = (value: NumberField | undefined) => (typeof value === "number" ? value : null);

const getRule = (item: Item): PriceRule | null => {
  const basePrice = num(item.base_price);
  const baseLimit = num(item.base_limit);
  const ratePerDollar = num(item.rate_per_dollar);
  const capLimit = num(item.cap_limit);
  const capPrice = num(item.cap_price);
  if (
    basePrice === null ||
    baseLimit === null ||
    ratePerDollar === null ||
    capLimit === null ||
    capPrice === null
  ) {
    return null;
  }
  return { basePrice, baseLimit, ratePerDollar, capLimit, capPrice };
};

/** Splits the included features into columns of two, as on the live site. */
const toColumns = (field: RichTextField, size = 2) => {
  const items = field.filter((node) => node.type === "list-item" && "text" in node) as Array<
    RichTextField[number] & { text: string }
  >;
  const columns: (typeof items)[] = [];
  for (let i = 0; i < items.length; i += size) columns.push(items.slice(i, i + size));
  return columns;
};

const Pricing = ({ slice }: PricingProps) => {
  const primary = slice.primary as Primary;
  const items = slice.items as Item[];

  const notes = (primary.note_under_the_button ?? []).map((note) => note.plan_note || null);
  const filledNotes = notes.filter(Boolean);
  const planNote = (index: number) =>
    filledNotes.length === 1 ? filledNotes[0] : (notes[index] ?? null);

  const min = num(primary.slider_min) ?? 0;
  const max = num(primary.slider_max) ?? 1_500_000;
  const step = num(primary.slider_step) || 10_000;

  const featureColumns = isFilled.richText(primary.included_features)
    ? toColumns(primary.included_features)
    : [];
  const hasLoyalty =
    isFilled.image(primary.loyalty_image) ||
    Boolean(primary.loyalty_cta_label) ||
    isFilled.richText(primary.loyalty_note);
  const hasCustomQuote =
    Boolean(primary.custom_quote_title) ||
    isFilled.richText(primary.custom_quote_text) ||
    (Boolean(primary.custom_quote_label) && isFilled.link(primary.custom_quote_link));

  return (
    <section
      id="pricing"
      className={withCustomClass(styles.section, slice)}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className={styles.inner}>
        {primary.title && <h2 className={styles.heading}>{primary.title}</h2>}
        {isFilled.richText(primary.intro) && (
          <div className={styles.intro}>
            <PrismicRichText field={primary.intro} />
          </div>
        )}

        {(featureColumns.length > 0 || hasLoyalty) && (
          <div className={styles.summary}>
            {featureColumns.length > 0 && (
              <div className={styles.included}>
                {primary.included_title && (
                  <h6 className={styles.includedTitle}>{primary.included_title}</h6>
                )}
                <div className={styles.featureLists}>
                  {featureColumns.map((column, columnIndex) => (
                    <ul key={columnIndex} className={styles.featureList}>
                      {column.map((feature, index) => (
                        <li key={`${feature.text}-${index}`} className={styles.featureItem}>
                          <span className={styles.featureIcon}>
                            <CheckCircleIcon />
                          </span>
                          <span className={styles.featureText}>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            )}

            {hasLoyalty && (
              <div className={styles.loyalty}>
                {isFilled.image(primary.loyalty_image) && (
                  <div className={styles.medal}>
                    <PrismicNextImage field={primary.loyalty_image} fallbackAlt="" width={300} />
                  </div>
                )}
                <div className={styles.loyaltyContent}>
                  {primary.loyalty_cta_label && isFilled.link(primary.loyalty_cta_link) && (
                    <div className={styles.center}>
                      <PrismicNextLink
                        field={primary.loyalty_cta_link}
                        className={`${styles.button} ${styles.loyaltyButton}`}
                      >
                        {primary.loyalty_cta_label}
                      </PrismicNextLink>
                    </div>
                  )}
                  {isFilled.richText(primary.loyalty_note) && (
                    <div className={styles.loyaltyNote}>
                      <PrismicRichText field={primary.loyalty_note} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {items.length > 0 && (
          <div className={styles.plans}>
            {items.map((item, index) => {
              const rule = getRule(item);
              const fallbackIcon = FALLBACK_ICONS[index];
              const defaultBasis = num(item.default_basis) ?? min;

              return (
                <div key={`${item.plan_name ?? "plan"}-${index}`} className={styles.plan}>
                  <div className={styles.planHeader}>
                    <div className={styles.planIcon}>
                      {isFilled.image(item.plan_icon) ? (
                        <PrismicNextImage field={item.plan_icon} fallbackAlt="" unoptimized />
                      ) : (
                        fallbackIcon && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={fallbackIcon} alt="" width={50} height={50} />
                        )
                      )}
                    </div>
                    <div className={styles.planText}>
                      {item.plan_name && <h2 className={styles.planName}>{item.plan_name}</h2>}
                      {isFilled.richText(item.property_types_text) ? (
                        <div className={styles.planTypes}>
                          <PrismicRichText field={item.property_types_text} />
                        </div>
                      ) : (
                        item.property_type && (
                          <div className={styles.planTypes}>
                            <p>{item.property_type}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {rule ? (
                    <PlanCalculator
                      rule={rule}
                      defaultBasis={defaultBasis}
                      min={min}
                      max={max}
                      step={step}
                      basisLabel={item.basis_label || primary.slider_label || ""}
                      priceNote={item.price_note || ""}
                    />
                  ) : (
                    (item.price || item.price_note) && (
                      <div className={styles.calculator}>
                        <div className={styles.priceBlock}>
                          {item.price && <p className={styles.price}>{item.price}</p>}
                          {item.price_note && <p className={styles.priceNote}>{item.price_note}</p>}
                        </div>
                      </div>
                    )
                  )}

                  {item.cta_label && isFilled.link(item.cta_link) && (
                    <div className={styles.center}>
                      <PrismicNextLink
                        field={item.cta_link}
                        className={`${styles.button} ${styles.planButton}`}
                      >
                        <span>{item.cta_label}</span>
                        <span className={styles.buttonIcon}>
                          <ChevronRightIcon />
                        </span>
                      </PrismicNextLink>
                    </div>
                  )}

                  {planNote(index) && <p className={styles.planNote}>{planNote(index)}</p>}
                </div>
              );
            })}
          </div>
        )}

        {hasCustomQuote && (
          <div className={styles.customQuote}>
            {primary.custom_quote_title && (
              <h5 className={styles.customQuoteTitle}>{primary.custom_quote_title}</h5>
            )}
            {isFilled.richText(primary.custom_quote_text) && (
              <div className={styles.customQuoteText}>
                <PrismicRichText field={primary.custom_quote_text} />
              </div>
            )}
            {primary.custom_quote_label && isFilled.link(primary.custom_quote_link) && (
              <PrismicNextLink
                field={primary.custom_quote_link}
                className={`${styles.button} ${styles.quoteButton}`}
              >
                <span>{primary.custom_quote_label}</span>
                <span className={styles.buttonIcon}>
                  <ChevronRightIcon />
                </span>
              </PrismicNextLink>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Pricing;
