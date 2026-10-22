"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  getCookie,
  getPersistedAffiliateId,
  getPersistedGoogleClickParams,
  getPersistedUtmParams,
  GOOGLE_CLICK_TO_HS_FIELD,
  UTM_TO_HS_FIELD,
} from "./tracking";

/** Same values as the live estimator script. */
const TAX_RATE = 0.35;
const ESTIMATE_ENDPOINT = "/api/estimator";
const EMAIL_ENDPOINT = "/api/estimator/email";
const HUBSPOT_FORM_URL =
  "https://api.hsforms.com/submissions/v3/integration/submit/3615782/1883c298-1b07-4401-98fc-cd428ae7b37d";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * "default" — the current homepage layout: icon labels, Date before
 * Property Type, two green result cards, navy button.
 *
 * "classic" — the older landing-page layout: plain labels, Property Type
 * before Date, illustration and a single message panel, blue button.
 *
 * Both share all state, validation, the API call, the contact gate, the
 * HubSpot submission and the email flow.
 */
export type EstimatorVariant = "default" | "classic";

export type EstimatorContent = {
  title: string | null;
  intro: ReactNode;
  propertyTypes: string[];
  shortTermRentalTypes: string[];
  discoverySources: string[];
  estimateButtonLabel: string;
  deductionsLabel: string;
  deductionsDescription: string;
  savingsLabel: string;
  savingsNote: string;
  helperText: string;
  disclaimer: string;
  emailButtonLabel: string;
  emailFormTitle: string;
  emailFormSubtitle: string;
  successMessage: string;
  contactTitle: string;
  contactText: string;
  contactButtonLabel: string;
  /** classic only — heading above the message panel. */
  resultsTitle?: string;
  /** classic only — illustration above the results panel. */
  image?: { url: string; alt: string } | null;
};

type Result = { low: number; high: number };

const formatMoney = (value: number | null | undefined) =>
  value == null || Number.isNaN(value) ? "$0" : "$" + Math.round(value).toLocaleString("en-US");

const formatPriceInput = (value: string) => {
  const raw = value.replace(/[^0-9]/g, "");
  return raw === "" ? "" : parseInt(raw, 10).toLocaleString("en-US");
};

const formatDateInput = (value: string) => {
  const raw = value.replace(/[^0-9]/g, "");
  let formatted = raw.substring(0, 2);
  if (raw.length >= 3) formatted += "/" + raw.substring(2, 4);
  if (raw.length >= 5) formatted += "/" + raw.substring(4, 8);
  return formatted;
};

const isValidDate = (m: number, d: number, y: number) => {
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

const isValidDateString = (value: string) => {
  const parts = value.split("/");
  return (
    parts.length === 3 &&
    parts[2].length === 4 &&
    isValidDate(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2], 10))
  );
};

const yearFromDate = (value: string) => {
  const parts = value.split("/");
  return (parts.length === 3 && parseInt(parts[2], 10)) || new Date().getFullYear();
};

const formatDateDisplay = (value: string) => {
  const parts = value.split("/");
  if (parts.length !== 3) return value;
  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  let suffix = "th";
  if (d === 1 || d === 21 || d === 31) suffix = "st";
  else if (d === 2 || d === 22) suffix = "nd";
  else if (d === 3 || d === 23) suffix = "rd";
  return `${MONTHS[m - 1]} ${d}${suffix}, ${parts[2]}`;
};

const Svg = ({ children, className }: { children: ReactNode; className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const CalendarPaths = () => (
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </>
);

const MailPaths = () => (
  <>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </>
);

const SendIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 16, height: 16 }}
    aria-hidden="true"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

/**
 * Tax savings estimator — same fields, validation, API call, contact gate,
 * HubSpot submission and email flow as the live costsegregation.com widget.
 */
export default function Estimator({
  content,
  variant = "default",
}: {
  content: EstimatorContent;
  variant?: EstimatorVariant;
}) {
  const classic = variant === "classic";

  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [shortTerm, setShortTerm] = useState(false);
  const [strVisible, setStrVisible] = useState(true);
  const [errors, setErrors] = useState({ address: false, price: false, date: false, type: false });
  const [calculating, setCalculating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pending, setPending] = useState<Result>({ low: 0, high: 0 });
  const [result, setResult] = useState<Result | null>(null);

  const [contactOpen, setContactOpen] = useState(false);
  const [contact, setContact] = useState({ fname: "", lname: "", email: "", source: "" });
  const [contactErrors, setContactErrors] = useState({ fname: false, lname: false, email: false });
  const [contactError, setContactError] = useState(false);

  const [emailOpen, setEmailOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ fname: "", lname: "", email: "" });
  const [emailErrors, setEmailErrors] = useState({ fname: false, lname: false, email: false });
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [emailMessage, setEmailMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const dateHiddenRef = useRef<HTMLInputElement>(null);

  // Persist attribution params on load, as the live script does
  useEffect(() => {
    getPersistedAffiliateId();
    getPersistedGoogleClickParams();
  }, []);

  const resetResults = () => {
    setResult(null);
    setApiError(null);
  };

  const priceNumber = parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;

  const estimate = async () => {
    const nextErrors = {
      address: !address.trim(),
      price: priceNumber <= 0,
      date: !date.trim() || !isValidDateString(date.trim()),
      type: !propertyType,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setApiError(null);
    setCalculating(true);
    try {
      const response = await fetch(ESTIMATE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address.trim(),
          transactionType: "Acquired Property",
          propertyType,
          buildingType: "Freestanding/Detached",
          pisDate: date.trim(),
          currentTaxYear: yearFromDate(date.trim()),
          purchasePrice: priceNumber,
          estimatedLandValue: 0,
          shortTermRental: shortTerm,
          source: "Website",
        }),
      });
      if (!response.ok) throw new Error(`API request failed (status ${response.status})`);
      const data = await response.json();
      const low = data?.result?.estimatedAdditionalTaxDeductionsYear1Low;
      const high = data?.result?.estimatedAdditionalTaxDeductionsYear1High;
      if (low != null && high != null) {
        setPending({ low, high });
        setContactErrors({ fname: false, lname: false, email: false });
        setContactError(false);
        setContactOpen(true);
      } else {
        setApiError("Could not calculate estimate. Please check your inputs.");
      }
    } catch (error) {
      console.error("Estimator API error:", error);
      setApiError("Something went wrong. Please try again.");
    } finally {
      setCalculating(false);
    }
  };

  const submitToHubSpot = () => {
    const fields: { name: string; value: string }[] = [
      { name: "firstname", value: contact.fname.trim() },
      { name: "lastname", value: contact.lname.trim() },
      { name: "email", value: contact.email.trim() },
      { name: "discovery_source", value: contact.source },
      { name: "full_property_address", value: address.trim() },
      { name: "building_basis", value: String(priceNumber) },
      { name: "date_of_purchase", value: date.trim() },
      { name: "property_type_dropdown", value: propertyType },
      { name: "shortterm_or_vacation_rental", value: shortTerm ? "true" : "false" },
      {
        name: "cost_segregation_calculator_low_tax_deductions_year_1",
        value: String(Math.round(pending.low)),
      },
      {
        name: "cost_segregation_calculator_high_tax_deductions_year_1",
        value: String(Math.round(pending.high)),
      },
      { name: "year_1_tax_savings_low_end", value: String(Math.round(pending.low * TAX_RATE)) },
      { name: "year_1_tax_savings_high_end", value: String(Math.round(pending.high * TAX_RATE)) },
    ];
    const utms = getPersistedUtmParams();
    (Object.keys(UTM_TO_HS_FIELD) as (keyof typeof UTM_TO_HS_FIELD)[]).forEach((key) => {
      if (utms[key]) fields.push({ name: UTM_TO_HS_FIELD[key], value: utms[key] });
    });
    const affiliateId = getPersistedAffiliateId();
    if (affiliateId) fields.push({ name: "affiliate_id", value: affiliateId });
    const clicks = getPersistedGoogleClickParams();
    Object.keys(GOOGLE_CLICK_TO_HS_FIELD).forEach((key) => {
      if (clicks[key]) fields.push({ name: GOOGLE_CLICK_TO_HS_FIELD[key], value: clicks[key] });
    });
    const context: Record<string, string> = {
      pageUri: window.location.href,
      pageName: document.title,
    };
    const hutk = getCookie("hubspotutk");
    if (hutk) context.hutk = hutk;

    fetch(HUBSPOT_FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields, context }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `HubSpot submission failed (${response.status}): ${await response.text()}`,
          );
        }
      })
      .catch((error) => console.error("HubSpot submission error:", error));
  };

  const submitContact = () => {
    const nextErrors = {
      fname: !contact.fname.trim(),
      lname: !contact.lname.trim(),
      email: !EMAIL_PATTERN.test(contact.email.trim()),
    };
    setContactErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setContactError(true);
      return;
    }
    setContactError(false);
    setResult(pending);
    setContactOpen(false);
    setEmailForm({
      fname: contact.fname.trim(),
      lname: contact.lname.trim(),
      email: contact.email.trim(),
    });
    submitToHubSpot();
  };

  const openEmailModal = () => {
    setEmailErrors({ fname: false, lname: false, email: false });
    setEmailMessage(null);
    setEmailStatus("idle");
    setEmailOpen(true);
  };

  const strApplies = content.shortTermRentalTypes.includes(propertyType);
  const deductionsText = result
    ? `${formatMoney(result.low)} to ${formatMoney(result.high)}`
    : "$0";
  const savingsText = result
    ? `${formatMoney(result.low * TAX_RATE)} to ${formatMoney(result.high * TAX_RATE)}`
    : "$0";

  const sendEmail = async () => {
    const nextErrors = {
      fname: !emailForm.fname.trim(),
      lname: !emailForm.lname.trim(),
      email: !EMAIL_PATTERN.test(emailForm.email.trim()),
    };
    setEmailErrors(nextErrors);
    setEmailMessage(null);
    if (Object.values(nextErrors).some(Boolean)) {
      setEmailMessage({ type: "error", text: "Please fill in all fields with a valid email." });
      return;
    }
    setEmailStatus("sending");
    try {
      const response = await fetch(EMAIL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: emailForm.fname.trim(),
          lastName: emailForm.lname.trim(),
          email: emailForm.email.trim(),
          address: address.trim(),
          purchasePrice: formatMoney(priceNumber),
          propertyType,
          purchaseDate: formatDateDisplay(date.trim()),
          shortTermRental: strApplies ? (shortTerm ? "Yes" : "No") : "",
          deductions: deductionsText,
          savings: savingsText,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!data.success) throw new Error(data.data || "Failed to send email.");
      setEmailMessage({
        type: "success",
        text: content.successMessage || "Email sent successfully! Check your inbox.",
      });
      setEmailStatus("sent");
    } catch (error) {
      setEmailMessage({
        type: "error",
        text:
          error instanceof Error && error.message
            ? error.message
            : "Something went wrong. Please try again.",
      });
      setEmailStatus("idle");
    }
  };

  const errorClass = (show: boolean) => (show ? " kbkg-input-error" : "");

  /* ---------------------------------------------------------------- */
  /* Fields — declared once, ordered per variant below                */
  /* ---------------------------------------------------------------- */

  const addressField = (
    <div className="kbkg-field-group" key="address">
      <label className="kbkg-field-label" htmlFor="kbkg-address">
        {!classic && (
          <Svg className="kbkg-icon">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </Svg>
        )}{" "}
        {classic ? "Address" : "Property Address"}
      </label>
      <input
        type="text"
        className={"kbkg-field-input" + errorClass(errors.address)}
        id="kbkg-address"
        placeholder={classic ? "Property Address" : "123 Main Street, City, State"}
        autoComplete="street-address"
        value={address}
        onChange={(event) => {
          setAddress(event.target.value);
          setErrors((prev) => ({ ...prev, address: false }));
          resetResults();
        }}
      />
      <div className={"kbkg-field-error" + (errors.address ? " kbkg-visible" : "")}>
        Please enter a property address.
      </div>
    </div>
  );

  const priceField = (
    <div className="kbkg-field-group" key="price">
      <label className="kbkg-field-label" htmlFor="kbkg-price">
        {!classic && (
          <Svg className="kbkg-icon">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </Svg>
        )}{" "}
        Purchase Price (Less Land)
      </label>
      <div className="kbkg-input-with-prefix">
        <span className="kbkg-input-prefix">$</span>
        <input
          type="text"
          className={"kbkg-field-input" + errorClass(errors.price)}
          id="kbkg-price"
          placeholder={classic ? "0" : "1,500,000"}
          inputMode="numeric"
          value={price}
          onChange={(event) => {
            setPrice(formatPriceInput(event.target.value));
            setErrors((prev) => ({ ...prev, price: false }));
            resetResults();
          }}
        />
      </div>
      <div className={"kbkg-field-error" + (errors.price ? " kbkg-visible" : "")}>
        Please enter a valid purchase price.
      </div>
    </div>
  );

  const dateField = (
    <div className="kbkg-field-group" key="date">
      <label className="kbkg-field-label" htmlFor="kbkg-date">
        {!classic && (
          <Svg className="kbkg-icon">
            <CalendarPaths />
          </Svg>
        )}{" "}
        Date of Purchase
      </label>
      <div className="kbkg-date-wrapper">
        <input
          type="text"
          className={"kbkg-field-input kbkg-date-input" + errorClass(errors.date)}
          id="kbkg-date"
          placeholder={classic ? "mm/dd/yyyy" : "MM/DD/YYYY"}
          maxLength={10}
          autoComplete="off"
          data-lpignore="true"
          data-form-type="other"
          value={date}
          onChange={(event) => {
            setDate(formatDateInput(event.target.value));
            setErrors((prev) => ({ ...prev, date: false }));
            resetResults();
          }}
          onBlur={() => {
            const value = date.trim();
            setErrors((prev) => ({
              ...prev,
              date: value ? !isValidDateString(value) : false,
            }));
          }}
        />
        <button
          type="button"
          className="kbkg-date-cal-btn"
          title="Open calendar"
          onClick={(event) => {
            event.preventDefault();
            const hidden = dateHiddenRef.current;
            if (!hidden) return;
            if (typeof hidden.showPicker === "function") hidden.showPicker();
            else hidden.click();
          }}
        >
          <Svg>
            <CalendarPaths />
          </Svg>
        </button>
        <input
          ref={dateHiddenRef}
          type="date"
          style={{
            position: "absolute",
            opacity: 0,
            width: 0,
            height: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            const parts = event.target.value.split("-");
            if (parts.length === 3) {
              setDate(`${parts[1]}/${parts[2]}/${parts[0]}`);
              setErrors((prev) => ({ ...prev, date: false }));
              resetResults();
            }
          }}
        />
      </div>
      <div className={"kbkg-field-error" + (errors.date ? " kbkg-visible" : "")}>
        Please enter a valid date (MM/DD/YYYY).
      </div>
    </div>
  );

  const typeField = (
    <div className="kbkg-field-group" key="type">
      <label className="kbkg-field-label" htmlFor="kbkg-property-type">
        {!classic && (
          <Svg className="kbkg-icon">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <line x1="9" y1="6" x2="9" y2="6.01" />
            <line x1="15" y1="6" x2="15" y2="6.01" />
            <line x1="9" y1="10" x2="9" y2="10.01" />
            <line x1="15" y1="10" x2="15" y2="10.01" />
            <line x1="9" y1="14" x2="9" y2="14.01" />
            <line x1="15" y1="14" x2="15" y2="14.01" />
            <line x1="9" y1="18" x2="15" y2="18" />
          </Svg>
        )}{" "}
        Property Type
      </label>
      <select
        className={"kbkg-field-select" + errorClass(errors.type)}
        id="kbkg-property-type"
        value={propertyType}
        onChange={(event) => {
          const value = event.target.value;
          setPropertyType(value);
          setErrors((prev) => ({ ...prev, type: false }));
          const visible = content.shortTermRentalTypes.includes(value);
          setStrVisible(visible);
          if (!visible) setShortTerm(false);
          resetResults();
        }}
      >
        <option value="" disabled>
          Select property type...
        </option>
        {content.propertyTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <div className={"kbkg-field-error" + (errors.type ? " kbkg-visible" : "")}>
        Please select a property type.
      </div>
    </div>
  );

  // classic puts Property Type before Date; default is the reverse.
  const fields = classic
    ? [addressField, priceField, typeField, dateField]
    : [addressField, priceField, dateField, typeField];

  /* ---------------------------------------------------------------- */
  /* Results panel                                                    */
  /* ---------------------------------------------------------------- */

  const defaultResults = (
    <div className="kbkg-estimator-results" aria-live="polite">
      <div className="kbkg-result-card">
        <div className="kbkg-result-header">
          <div className="kbkg-result-icon">
            <Svg>
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </Svg>
          </div>
          <span className="kbkg-result-label">{content.deductionsLabel}</span>
        </div>
        <div className="kbkg-result-value">{deductionsText}</div>
        <div className="kbkg-result-description">{content.deductionsDescription}</div>
      </div>

      <div className="kbkg-result-card">
        <div className="kbkg-result-header">
          <div className="kbkg-result-icon">
            <Svg>
              <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2" />
              <circle cx="9" cy="12" r="1" />
            </Svg>
          </div>
          <span className="kbkg-result-label">{content.savingsLabel}</span>
        </div>
        <div className="kbkg-result-value">{savingsText}</div>
        <div className="kbkg-result-assumption">{result ? content.savingsNote : ""}</div>
      </div>

      <button
        type="button"
        className={"kbkg-email-btn" + (result ? " kbkg-shown" : "")}
        onClick={openEmailModal}
      >
        <Svg>
          <MailPaths />
        </Svg>{" "}
        {content.emailButtonLabel}
      </button>

      {apiError ? (
        <div className="kbkg-error-msg">{apiError}</div>
      ) : (
        !result && <div className="kbkg-results-helper">{content.helperText}</div>
      )}

      <div className="kbkg-disclaimer" style={{ display: result ? "block" : "none" }}>
        {content.disclaimer}
      </div>
    </div>
  );

  const classicResults = (
    <div className="kbkg-estimator-results kbkg-classic-results" aria-live="polite">
      {content.image?.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="kbkg-classic-illustration"
          src={content.image.url}
          alt={content.image.alt || ""}
        />
      )}

      <h3 className="kbkg-classic-results-title">
        {content.resultsTitle || "Estimated Savings"}
      </h3>

      {result ? (
        <div className="kbkg-classic-panel kbkg-classic-panel-filled">
          <div className="kbkg-classic-row">
            <span className="kbkg-classic-row-label">{content.deductionsLabel}</span>
            <span className="kbkg-classic-row-value">{deductionsText}</span>
          </div>
          <div className="kbkg-classic-row">
            <span className="kbkg-classic-row-label">{content.savingsLabel}</span>
            <span className="kbkg-classic-row-value">{savingsText}</span>
          </div>
        </div>
      ) : (
        <div className="kbkg-classic-panel">{apiError || content.helperText}</div>
      )}

      <button
        type="button"
        className={"kbkg-email-btn" + (result ? " kbkg-shown" : "")}
        onClick={openEmailModal}
      >
        <Svg>
          <MailPaths />
        </Svg>{" "}
        {content.emailButtonLabel}
      </button>

      <div className="kbkg-disclaimer" style={{ display: result ? "block" : "none" }}>
        {content.disclaimer}
      </div>
    </div>
  );

return (
  <>
    {classic && content.title && (
      <h2 className="kbkg-estimator-title kbkg-classic-title">{content.title}</h2>
    )}

    <div className={"kbkg-estimator-wrapper" + (classic ? " kbkg-classic" : "")}>
      {!classic && content.title && (
        <h2 className="kbkg-estimator-title">{content.title}</h2>
      )}
      {content.intro}
      <div className="kbkg-estimator-body">
          {/* LEFT: Form */}
          <div className="kbkg-estimator-form">
            {fields}

            <div className={"kbkg-toggle-row" + (strVisible ? "" : " kbkg-hidden")}>
              <span className="kbkg-toggle-label">
                {!classic && (
                  <Svg className="kbkg-icon">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </Svg>
                )}{" "}
                {classic
                  ? "Is the Property a Short-Term or Vacation Rental?"
                  : "Is this a Short-Term or Vacation Rental?"}
              </span>
              <div className="kbkg-toggle-control">
                <label className="kbkg-toggle">
                  <input
                    type="checkbox"
                    id="kbkg-short-term"
                    checked={shortTerm}
                    aria-label="Is this a Short-Term or Vacation Rental?"
                    onChange={(event) => {
                      setShortTerm(event.target.checked);
                      resetResults();
                    }}
                  />
                  <span className="kbkg-toggle-slider" />
                </label>
                <span className="kbkg-toggle-text">{shortTerm ? "Yes" : "No"}</span>
              </div>
            </div>

            <button
              type="button"
              className="kbkg-submit-btn"
              onClick={estimate}
              disabled={calculating}
            >
              {calculating ? "Calculating..." : content.estimateButtonLabel}
              {classic && " ›"}
            </button>
          </div>

          {/* RIGHT: Results */}
          {classic ? classicResults : defaultResults}
        </div>
      </div>

      {/* Email modal */}
      <div
        className={"kbkg-modal-overlay" + (emailOpen ? " kbkg-modal-open" : "")}
        onClick={(event) => {
          if (event.target === event.currentTarget) setEmailOpen(false);
        }}
      >
        <div
          className="kbkg-modal"
          role="dialog"
          aria-modal="true"
          aria-label={content.emailFormTitle}
        >
          <button type="button" className="kbkg-modal-close" onClick={() => setEmailOpen(false)}>
            ×
          </button>
          <div className="kbkg-modal-title">
            <Svg>
              <MailPaths />
            </Svg>{" "}
            {content.emailFormTitle}
          </div>
          {content.emailFormSubtitle && (
            <p className="kbkg-modal-subtitle">{content.emailFormSubtitle}</p>
          )}
          <div className="kbkg-modal-summary">
            <div className="kbkg-modal-summary-title">
              <Svg>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </Svg>{" "}
              Your email will include:
            </div>
            <div className="kbkg-modal-summary-row">
              <span className="kbkg-modal-summary-label">Property Address:</span>
              <span className="kbkg-modal-summary-value">{address.trim()}</span>
            </div>
            <div className="kbkg-modal-summary-row">
              <span className="kbkg-modal-summary-label">Purchase Price:</span>
              <span className="kbkg-modal-summary-value">{formatMoney(priceNumber)}</span>
            </div>
            <div className="kbkg-modal-summary-row">
              <span className="kbkg-modal-summary-label">Property Type:</span>
              <span className="kbkg-modal-summary-value">{propertyType}</span>
            </div>
            <div className="kbkg-modal-summary-row">
              <span className="kbkg-modal-summary-label">Purchase Date:</span>
              <span className="kbkg-modal-summary-value">{formatDateDisplay(date.trim())}</span>
            </div>
            {strApplies && (
              <div className="kbkg-modal-summary-row" style={{ display: "flex" }}>
                <span className="kbkg-modal-summary-label">Short-Term Rental:</span>
                <span className="kbkg-modal-summary-value">{shortTerm ? "Yes" : "No"}</span>
              </div>
            )}
            <hr className="kbkg-modal-summary-divider" />
            <div className="kbkg-modal-summary-row">
              <span className="kbkg-modal-summary-label">Year 1 Deductions:</span>
              <span className="kbkg-modal-summary-value kbkg-green">{deductionsText}</span>
            </div>
            <div className="kbkg-modal-summary-row">
              <span className="kbkg-modal-summary-label">Year 1 Tax Savings:</span>
              <span className="kbkg-modal-summary-value kbkg-green">{savingsText}</span>
            </div>
          </div>
          <div className="kbkg-modal-form-row">
            <div className="kbkg-modal-form-group">
              <label htmlFor="kbkg-modal-fname">First Name</label>
              <input
                type="text"
                id="kbkg-modal-fname"
                placeholder="John"
                className={emailErrors.fname ? "kbkg-input-error" : undefined}
                value={emailForm.fname}
                onChange={(event) =>
                  setEmailForm((prev) => ({ ...prev, fname: event.target.value }))
                }
              />
            </div>
            <div className="kbkg-modal-form-group">
              <label htmlFor="kbkg-modal-lname">Last Name</label>
              <input
                type="text"
                id="kbkg-modal-lname"
                placeholder="Smith"
                className={emailErrors.lname ? "kbkg-input-error" : undefined}
                value={emailForm.lname}
                onChange={(event) =>
                  setEmailForm((prev) => ({ ...prev, lname: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="kbkg-modal-form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="kbkg-modal-email">Email Address</label>
            <input
              type="email"
              id="kbkg-modal-email"
              placeholder="john@example.com"
              className={emailErrors.email ? "kbkg-input-error" : undefined}
              value={emailForm.email}
              onChange={(event) => setEmailForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>
          <div className="kbkg-modal-buttons">
            <button
              type="button"
              className="kbkg-modal-cancel-btn"
              onClick={() => setEmailOpen(false)}
            >
              × Cancel
            </button>
            <button
              type="button"
              className="kbkg-modal-send-btn"
              onClick={sendEmail}
              disabled={emailStatus !== "idle"}
            >
              {emailStatus === "sending" ? (
                "Sending..."
              ) : emailStatus === "sent" ? (
                "Sent!"
              ) : (
                <>
                  <SendIcon /> Send Results
                </>
              )}
            </button>
          </div>
          <div
            className="kbkg-modal-error"
            style={{ display: emailMessage?.type === "error" ? "block" : "none" }}
          >
            {emailMessage?.type === "error" ? emailMessage.text : ""}
          </div>
          <div
            className="kbkg-modal-success"
            style={{ display: emailMessage?.type === "success" ? "block" : "none" }}
          >
            {emailMessage?.type === "success" ? emailMessage.text : ""}
          </div>
          <div className="kbkg-modal-disclaimer">{content.disclaimer}</div>
        </div>
      </div>

      {/* Contact modal (shown before results) */}
      <div
        className={"kbkg-contact-modal-overlay" + (contactOpen ? " kbkg-modal-open" : "")}
        onClick={(event) => {
          if (event.target === event.currentTarget) setContactOpen(false);
        }}
      >
        <div
          className="kbkg-contact-modal"
          role="dialog"
          aria-modal="true"
          aria-label={content.contactTitle}
        >
          <button
            type="button"
            className="kbkg-contact-modal-close"
            onClick={() => setContactOpen(false)}
          >
            ×
          </button>
          <div className="kbkg-contact-modal-title">{content.contactTitle}</div>
          {content.contactText && (
            <div className="kbkg-contact-modal-info">
              <Svg>
                <MailPaths />
              </Svg>
              <p>{content.contactText}</p>
            </div>
          )}
          <div className="kbkg-contact-form-row">
            <div className="kbkg-contact-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="kbkg-contact-fname">First Name *</label>
              <input
                type="text"
                id="kbkg-contact-fname"
                placeholder="John"
                className={contactErrors.fname ? "kbkg-input-error" : undefined}
                value={contact.fname}
                onChange={(event) => setContact((prev) => ({ ...prev, fname: event.target.value }))}
              />
            </div>
            <div className="kbkg-contact-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="kbkg-contact-lname">Last Name *</label>
              <input
                type="text"
                id="kbkg-contact-lname"
                placeholder="Smith"
                className={contactErrors.lname ? "kbkg-input-error" : undefined}
                value={contact.lname}
                onChange={(event) => setContact((prev) => ({ ...prev, lname: event.target.value }))}
              />
            </div>
          </div>
          <div className="kbkg-contact-form-group">
            <label htmlFor="kbkg-contact-email">Email *</label>
            <input
              type="email"
              id="kbkg-contact-email"
              placeholder="john@example.com"
              className={contactErrors.email ? "kbkg-input-error" : undefined}
              value={contact.email}
              onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>
          {content.discoverySources.length > 0 && (
            <div className="kbkg-contact-form-group">
              <label htmlFor="kbkg-contact-source">
                How did you first hear about CostSegregation.com?
              </label>
              <select
                id="kbkg-contact-source"
                value={contact.source}
                onChange={(event) =>
                  setContact((prev) => ({ ...prev, source: event.target.value }))
                }
              >
                <option value="">Please Select</option>
                {content.discoverySources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button type="button" className="kbkg-contact-submit-btn" onClick={submitContact}>
            {content.contactButtonLabel}
          </button>
          <div className="kbkg-contact-error" style={{ display: contactError ? "block" : "none" }}>
            Please fill in all required fields.
          </div>
        </div>
      </div>
    </>
  );
}