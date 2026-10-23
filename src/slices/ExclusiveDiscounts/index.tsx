
"use client";

import { useEffect } from "react";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import styles from "./ExclusiveDiscounts.module.css";

type Props = SliceComponentProps<Content.ExclusiveDiscountsSlice>;

declare global {
  interface Window {
    hbspt?: {
      forms: {
        create: (options: {
          portalId: string;
          formId: string;
          region: string;
          target: string;
        }) => void;
      };
    };
  }
}

export default function ExclusiveDiscounts({
  slice,
}: Props) {
  useEffect(() => {
    let cancelled = false;

    const target = "#exclusive-discounts-form";

    const createForm = () => {
      if (cancelled || !window.hbspt) return;

      const container = document.querySelector(target);
      if (!container || container.childElementCount > 0) return;

      window.hbspt.forms.create({
        portalId: "3615782",
        formId: "20d345a5-c196-4f75-8bc8-95118727a2fd",
        region: "na1",
        target,
      });
    };

    if (window.hbspt) {
      createForm();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://js.hsforms.net/forms/embed/v2.js"]'
      );

      const script =
        existing ?? document.createElement("script");

      const handleLoad = () => createForm();

      script.addEventListener("load", handleLoad);

      if (!existing) {
        script.src =
          "https://js.hsforms.net/forms/embed/v2.js";
        script.async = true;
        document.body.appendChild(script);
      }

      return () => {
        cancelled = true;
        script.removeEventListener("load", handleLoad);
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>
          {slice.primary.heading}
        </h2>

        {slice.primary.details && (
          <div className={styles.details}>
            <PrismicRichText field={slice.primary.details} />
          </div>
        )}

        <div className={styles.formContainer}>
          <div id="exclusive-discounts-form" />
        </div>
      </div>
    </section>
  );
}
