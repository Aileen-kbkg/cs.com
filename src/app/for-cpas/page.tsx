import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import { components } from "@/slices";
import HubSpotTestForm from "@/components/HubSpotForm";

import styles from "./ForCpas.module.css";

/**
 * "Sign Up for Exclusive Discounts" form, read from the live page's
 * embed config. A different form from the calculator's contact form.
 */
const DISCOUNTS_PORTAL_ID = "3615782";
const DISCOUNTS_FORM_ID = "20d345a5-c196-4f75-8bc8-95118727a2fd";

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const page = await (client as any)
    .getSingle("for_cpas")
    .catch(() => null);

  if (!page) {
    return { title: "For CPAs | CostSegregation.com" };
  }

  return {
    title: page.data.meta_title || "For CPAs | CostSegregation.com",
    description: page.data.meta_description || undefined,
  };
}

export default async function ForCpasPage() {
  const client = createClient();
  const page = await (client as any)
    .getSingle("for_cpas")
    .catch(() => null);

  if (!page) {
    notFound();
  }

  const { button_text, button_link, form_heading } = page.data;

  // The form is not a slice, so it cannot sit inside the slice zone. On
  // the live page it follows the hero, so the zone is split: hero first,
  // then the form, then the rest.
  const slices = page.data.slices ?? [];
  const [heroSlice, ...restSlices] = slices;

  return (
    <main className={styles.page}>
      {heroSlice && (
        <SliceZone slices={[heroSlice]} components={components} />
      )}

      <section className={styles.formSection}>
        <div className={styles.formInner}>
          {form_heading && (
            <h2 className={styles.formHeading}>{form_heading}</h2>
          )}

          <div className={styles.formEmbed}>
            <HubSpotTestForm
              portalId={DISCOUNTS_PORTAL_ID}
              formId={DISCOUNTS_FORM_ID}
            />
          </div>
        </div>
      </section>

      {restSlices.length > 0 && (
        <SliceZone slices={restSlices} components={components} />
      )}

      {button_text && button_link && (
        <div className={styles.buttonWrapper}>
          <a
            href={button_link.url}
            className={styles.sectionButton}
            target={button_link.target || undefined}
            rel={
              button_link.target === "_blank"
                ? "noopener noreferrer"
                : undefined
            }
          >
            {button_text}
          </a>
        </div>
      )}
    </main>
  );
}