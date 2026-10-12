"use client";

import { useId, useState } from "react";

import { calculatePrice, formatCompact, formatCurrency, PriceRule } from "./pricing";
import styles from "./Pricing.module.css";

type PlanCalculatorProps = {
  rule: PriceRule;
  defaultBasis: number;
  min: number;
  max: number;
  step: number;
  basisLabel: string;
  /** Text around the basis, e.g. "For {basis} tax basis". */
  priceNote: string;
};

/**
 * Renders the note under the price with the current basis. Supports the
 * "{basis}" placeholder; a note that still holds a fixed amount
 * (e.g. "For $750,000 tax basis") has that amount replaced, so the text
 * always follows the slider instead of showing a stale value.
 */
const CURRENCY_AMOUNT = /\$[\d,]+(?:\.\d+)?/;

const renderNote = (note: string, basis: string) => {
  let parts: string[] | null = null;
  if (note.includes("{basis}")) {
    parts = note.split("{basis}");
  } else {
    const match = note.match(CURRENCY_AMOUNT);
    if (match && match.index !== undefined) {
      parts = [note.slice(0, match.index), note.slice(match.index + match[0].length)];
    }
  }
  if (!parts) return note;
  return (
    <>
      {parts[0]}
      <span>{basis}</span>
      {parts.slice(1).join(basis)}
    </>
  );
};

/** Basis slider + live price, matching the live site's calculator widget. */
export default function PlanCalculator({
  rule,
  defaultBasis,
  min,
  max,
  step,
  basisLabel,
  priceNote,
}: PlanCalculatorProps) {
  const [basis, setBasis] = useState(defaultBasis);
  const inputId = useId();

  const price = calculatePrice(basis, rule);
  const basisText = formatCurrency(basis);
  const percentage = max > min ? ((basis - min) / (max - min)) * 100 : 0;

  return (
    <div className={styles.calculator}>
      <div className={styles.priceBlock}>
        <p className={styles.price} aria-live="polite">
          {formatCurrency(price)}
        </p>
        <p className={styles.priceNote}>{renderNote(priceNote, basisText)}</p>
      </div>
      <div className={styles.sliderBlock}>
        <div className={styles.sliderHeader}>
          <label htmlFor={inputId} className={styles.sliderText}>
            {basisLabel}
          </label>
          <p className={styles.sliderText}>{basisText}</p>
        </div>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${percentage}%` }} />
          <input
            id={inputId}
            type="range"
            className={styles.range}
            min={min}
            max={max}
            step={step}
            value={basis}
            onChange={(event) => setBasis(parseInt(event.target.value, 10))}
          />
        </div>
        <div className={styles.sliderEnds}>
          <span>{formatCompact(min)}</span>
          <span>{formatCompact(max)}</span>
        </div>
      </div>
    </div>
  );
}