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

const renderNote = (note: string, basis: string) => {
  const [before, after] = note.includes("{basis}") ? note.split("{basis}") : [note, null];
  if (after === null) return note;
  return (
    <>
      {before}
      <span>{basis}</span>
      {after}
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
