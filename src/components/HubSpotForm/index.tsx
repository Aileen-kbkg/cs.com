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
        onFormReady?: (form: unknown) => void;
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
  /**
   * Values to fill in once the form renders, keyed by HubSpot field name.
   * Fields the form does not have, and empty values, are skipped.
   */
  fieldValues?: Record<string, string>;
};

/** Forms built in HubSpot's newer editor render inside a same-origin iframe. */
const findForm = (container: HTMLElement, form: unknown): HTMLFormElement | null => {
  if (form instanceof HTMLFormElement) return form;
  const jqueryForm = (form as { 0?: unknown } | null)?.[0];
  if (jqueryForm instanceof HTMLFormElement) return jqueryForm;
  const frame = container.querySelector("iframe");
  return frame?.contentDocument?.querySelector("form") ?? container.querySelector("form");
};

/**
 * Sets field values through the native setters and fires the events
 * HubSpot listens to, so its own validation sees them.
 */
const fillForm = (form: HTMLFormElement, values: Record<string, string>) => {
  const view = form.ownerDocument.defaultView ?? window;

  Object.entries(values).forEach(([name, value]) => {
    if (!value) return;
    const field = form.querySelector<HTMLInputElement | HTMLSelectElement>(
      `[name="${name}"]`,
    );
    if (!field) return;

    if (field instanceof view.HTMLInputElement && field.type === "checkbox") {
      if (field.checked !== (value === "true")) field.click();
      return;
    }

    const proto =
      field instanceof view.HTMLSelectElement
        ? view.HTMLSelectElement.prototype
        : view.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(field, value);
    field.dispatchEvent(new view.Event("input", { bubbles: true }));
    field.dispatchEvent(new view.Event("change", { bubbles: true }));
  });
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
  fieldValues,
}: HubSpotFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const createdRef = useRef(false);
  const submittedRef = useRef(onSubmitted);
  const valuesRef = useRef(fieldValues);

  // A unique target per instance, so two forms on one page cannot
  // collide on the same DOM id. useId emits colons, which are invalid
  // in a CSS selector.
  const reactId = useId();
  const targetId = `hs-form-${reactId.replace(/[:]/g, "")}`;

  // Keeps the latest callback without re-running the effect, which would
  // tear the form down and rebuild it.
  useEffect(() => {
    submittedRef.current = onSubmitted;
    valuesRef.current = fieldValues;
  }, [onSubmitted, fieldValues]);

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
        onFormReady: (form: unknown) => {
          const values = valuesRef.current;
          const element = values ? findForm(container, form) : null;
          if (element && values) fillForm(element, values);
        },
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