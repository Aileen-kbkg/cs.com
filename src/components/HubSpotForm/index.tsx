"use client";

import { useEffect, useId, useRef } from "react";

const SCRIPT_ID = "hubspot-forms-script";
const SCRIPT_SRC = "https://js.hsforms.net/forms/embed/v2.js";

/** Calculator contact form — the default when no IDs are passed. */
const DEFAULT_PORTAL_ID = "3615782";
const DEFAULT_FORM_ID = "fbcbae37-ed41-4167-975a-f3fa9a9944d4";

type HubSpotWindow = Window & {
  hbspt?: {
    forms?: {
      create?: (options: {
        region: string;
        portalId: string;
        formId: string;
        target: string;
        onFormReady?: () => void;
        onFormSubmitted?: () => void;
      }) => void;
    };
  };
};

type HubSpotFormProps = {
  /**
   * Render only while the container is visible. The calculator passes
   * `active={contactOpen}` so the iframe is not fetched until the modal
   * opens; pages that always show a form can leave this alone.
   */
  active?: boolean;
  portalId?: string;
  formId?: string;
  region?: string;
  onSubmitted?: () => void;
};

/**
 * Embeds a HubSpot form.
 *
 * Used by the calculator's contact modal and by the For CPAs discounts
 * section, which use different forms — hence the IDs being props rather
 * than constants.
 */
export default function HubSpotForm({
  active = true,
  portalId = DEFAULT_PORTAL_ID,
  formId = DEFAULT_FORM_ID,
  region = "na1",
  onSubmitted,
}: HubSpotFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const createdRef = useRef(false);
  const submittedRef = useRef(onSubmitted);

  // A unique target per instance, so two forms on one page cannot
  // collide on the same DOM id. useId emits colons, which are invalid
  // in a CSS selector.
  const reactId = useId();
  const targetId = `hs-form-${reactId.replace(/[:]/g, "")}`;

  // Keeps the latest callback without re-running the effect, which would
  // tear the form down and rebuild it.
  useEffect(() => {
    submittedRef.current = onSubmitted;
  }, [onSubmitted]);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    const renderForm = () => {
      if (cancelled || createdRef.current) return;

      const hubspot = (window as HubSpotWindow).hbspt;
      if (!hubspot?.forms?.create) return;

      createdRef.current = true;

      hubspot.forms.create({
        region,
        portalId,
        formId,
        target: `#${targetId}`,
        onFormSubmitted: () => submittedRef.current?.(),
      });
    };

    const existing = (window as HubSpotWindow).hbspt;
    let script: HTMLScriptElement | null = null;

    if (existing?.forms?.create) {
      renderForm();
    } else {
      script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = SCRIPT_SRC;
        script.async = true;
        document.body.appendChild(script);
      }

      script.addEventListener("load", renderForm, { once: true });
    }

    return () => {
      cancelled = true;
      script?.removeEventListener("load", renderForm);
      createdRef.current = false;
      // Clears the iframe, so reopening renders one form rather than two.
      if (container) container.innerHTML = "";
    };
  }, [active, portalId, formId, region, targetId]);

  if (!active) return null;

  return <div id={targetId} ref={containerRef} />;
}