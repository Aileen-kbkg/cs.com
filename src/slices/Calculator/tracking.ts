/**
 * Lead-attribution helpers ported from the live estimator script:
 * UTM parameters, affiliate id and Google click ids, persisted in
 * sessionStorage, plus the HubSpot tracking cookie.
 */

const UTM_KEYS = ["utm_campaign", "utm_source", "utm_medium", "utm_content"] as const;

export const UTM_TO_HS_FIELD: Record<(typeof UTM_KEYS)[number], string> = {
  utm_campaign: "sfdc_utm_campaign",
  utm_source: "sfdc_utm_source",
  utm_medium: "sfdc_utm_medium",
  utm_content: "sfdc_utm_content",
};

export const GOOGLE_CLICK_TO_HS_FIELD: Record<string, string> = {
  gclid: "google_gclid",
  gbraid: "google_gbraid",
  wbraid: "google_wbraid",
};

type KbkgConsentManager = { getUtmParams?: () => Record<string, string> | null };

const consentManager = (): KbkgConsentManager | undefined =>
  (window as unknown as { kbkgConsentManager?: KbkgConsentManager }).kbkgConsentManager;

export const getCookie = (name: string): string => {
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : "";
};

const params = () => new URLSearchParams(window.location.search || "");

const readKbkgVisitUtms = (): Record<string, string> => {
  try {
    const raw = getCookie("kbkgvisit");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && parsed.kbkgUtm ? parsed.kbkgUtm : {};
  } catch {
    return {};
  }
};

const hasUtms = (utms: Record<string, string>) => UTM_KEYS.some((key) => Boolean(utms[key]));

export const getPersistedUtmParams = (): Record<string, string> => {
  let utms: Record<string, string> = {};
  try {
    utms = consentManager()?.getUtmParams?.() ?? {};
  } catch {
    utms = {};
  }
  if (!hasUtms(utms)) utms = readKbkgVisitUtms();
  if (!hasUtms(utms)) {
    utms = {};
    const query = params();
    UTM_KEYS.forEach((key) => {
      const value = query.get(key);
      if (value) utms[key] = value;
    });
  }
  return utms;
};

export const getPersistedAffiliateId = (): string => {
  try {
    const query = params();
    let affiliateId =
      query.get("affiliate_id") || query.get("awinaffid") || query.get("sv_campaign_id") || "";
    if (!affiliateId) affiliateId = consentManager()?.getUtmParams?.()?.sv_campaign_id ?? "";
    if (!affiliateId) affiliateId = readKbkgVisitUtms().sv_campaign_id ?? "";
    if (affiliateId) {
      sessionStorage.setItem("kbkg_affiliate_id", affiliateId);
      return affiliateId;
    }
    return sessionStorage.getItem("kbkg_affiliate_id") || "";
  } catch {
    return "";
  }
};

export const getPersistedGoogleClickParams = (): Record<string, string> => {
  const values: Record<string, string> = {};
  try {
    const query = params();
    Object.keys(GOOGLE_CLICK_TO_HS_FIELD).forEach((key) => {
      const value = query.get(key);
      if (value) {
        values[key] = value;
        sessionStorage.setItem("kbkg_" + key, value);
      } else {
        const stored = sessionStorage.getItem("kbkg_" + key);
        if (stored) values[key] = stored;
      }
    });
  } catch {
    /* storage unavailable */
  }
  return values;
};
