/**
 * Price rules reproduced from the live costsegregation.com calculators
 * (residential-/commercial-property-tax-calculator scripts):
 *
 *   basis <= base_limit            → base_price
 *   base_limit < basis <= cap_limit → base_price + rate_per_dollar × (basis − base_limit)
 *   basis > cap_limit              → cap_price
 *   result rounded to the nearest $5
 */
export type PriceRule = {
  basePrice: number;
  baseLimit: number;
  ratePerDollar: number;
  capLimit: number;
  capPrice: number;
};

export const calculatePrice = (basis: number, rule: PriceRule): number => {
  let price: number;
  if (basis <= rule.baseLimit) {
    price = rule.basePrice;
  } else if (basis <= rule.capLimit) {
    price = rule.basePrice + rule.ratePerDollar * (basis - rule.baseLimit);
  } else {
    price = rule.capPrice;
  }
  return Math.round(price / 5) * 5;
};

/** "$750,000" — same output as the live site's formatCurrency(). */
export const formatCurrency = (value: number): string => "$" + value.toLocaleString("en-US");

/** Slider end labels as shown on live: "$0", "$1.5M". */
export const formatCompact = (value: number): string =>
  value >= 1_000_000 ? `$${Number((value / 1_000_000).toFixed(2))}M` : formatCurrency(value);
