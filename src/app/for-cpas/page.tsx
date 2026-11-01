import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import type { SliceComponentProps, SliceZoneComponents } from "@prismicio/react";

import { createClient } from "@/prismicio";
import { components } from "@/slices";
import HubSpotTestForm from "@/components/HubSpotForm";
import { ChevronRightIcon } from "@/slices/Testimonials/icons";

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

  // The form is not a slice, but on the live page it follows the hero.
  // It is rendered after the hero from inside one slice zone, so slice
  // indexes stay page-wide and only the hero gets the page's h1. The hero
  // is the first slice that isn't the announcement bar, which may come in
  // directly or through a shared section.
  const slices: { slice_type: string }[] = page.data.slices ?? [];
  const heroIndex = slices.findIndex(
    (slice) =>
      slice.slice_type !== "announcement_bar" &&
      slice.slice_type !== "section_reference",
  );
  const heroType = slices[heroIndex]?.slice_type;

  const discountsForm = (
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
  );

  const sliceComponents = components as unknown as SliceZoneComponents;
  const pageComponents: SliceZoneComponents = heroType
    ? {
        ...sliceComponents,
        [heroType]: function HeroWithForm(props: SliceComponentProps) {
          const Slice = sliceComponents[heroType] as ComponentType<SliceComponentProps>;

          return (
            <>
              <Slice {...props} />
              {props.index === heroIndex && discountsForm}
            </>
          );
        },
      }
    : sliceComponents;

  return (
    <main className={styles.page}>
      <SliceZone slices={slices as never} components={pageComponents} />

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
            <span>{button_text}</span>
            <ChevronRightIcon />
          </a>
        </div>
      )}
    </main>
  );
}
