"use client";

import { useEffect, useId, useRef } from "react";

export type HubSpotTestFormProps = {
  portalId?: string;
  formId?: string;
  region?: string;
};

const DEFAULT_PORTAL_ID = "3615782";
const DEFAULT_FORM_ID = "fbcbae37-ed41-4167-975a-f3fa9a9944d4";
const DEFAULT_REGION = "na1";

const HUBSPOT_SCRIPT =
  "https://js.hsforms.net/forms/embed/v2.js";

export default function HubSpotTestForm({
  portalId = DEFAULT_PORTAL_ID,
  formId = DEFAULT_FORM_ID,
  region = DEFAULT_REGION,
}: HubSpotTestFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, "");
  const containerId = `hubspot-form-${reactId}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let script: HTMLScriptElement | null = null;

    const createForm = () => {
      if (
        cancelled ||
        !container.isConnected ||
        !window.hbspt?.forms
      ) {
        return;
      }

      container.innerHTML = "";

      window.hbspt.forms.create({
        portalId,
        formId,
        region,
        target: `#${containerId}`,
      });
    };

    if (window.hbspt?.forms) {
      createForm();
    } else {
      const existingScript =
        document.querySelector<HTMLScriptElement>(
          `script[src="${HUBSPOT_SCRIPT}"]`
        );

      if (existingScript) {
        script = existingScript;
        existingScript.addEventListener("load", createForm);
      } else {
        script = document.createElement("script");
        script.src = HUBSPOT_SCRIPT;
        script.async = true;
        script.onload = createForm;

        script.onerror = () => {
          console.error("Failed to load the HubSpot form script.");
        };

        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      script?.removeEventListener("load", createForm);

      if (container.isConnected) {
        container.innerHTML = "";
      }
    };
  }, [portalId, formId, region, containerId]);

  return (
    <div
      id={containerId}
      ref={containerRef}
      style={{
        width: "100%",
        minWidth: 0,
      }}
    />
  );
}