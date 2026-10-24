/**
 * Abu Dhabi Luxury Residential Facility Care - Conversion & Campaign Configuration
 * Easily configure Google Ads tracking keys, WhatsApp routing, and business metrics here.
 */

export const CAMPAIGN_CONFIG = {
  // Google Sheet Integration
  GOOGLE_SHEET_ID: "1CH_niZPYqwMc8gee07HyCpOXoRqJzRCd7_4Ih7kTU2A",
  GOOGLE_SHEET_URL: "https://docs.google.com/spreadsheets/d/1CH_niZPYqwMc8gee07HyCpOXoRqJzRCd7_4Ih7kTU2A/edit?usp=sharing",
  GOOGLE_SHEET_WEBHOOK_URL: "https://script.google.com/macros/s/AKfycbwlS4rsf0IpI6hJ4nzcb-mSGtfna0zy8lZdNjJpQk5RLo2m2GJRpk0TEDB0TlvcqsI/exec",

  // WhatsApp Configuration
  WHATSAPP_NUMBER: "+971564654450", // Client's active WhatsApp business number
  DEFAULT_WHATSAPP_MESSAGE: "Hi, I'd like to book a free inspection for my property in Abu Dhabi. I found you through Google.",

  // Google Ads Conversion Tracking Placeholders
  GOOGLE_ADS_CONVERSION_ID: "AW-0000000000",
  GOOGLE_ADS_CONVERSION_LABEL: "ABU_DHABI_LEAD_CONVERSION",

  // Business Credibility Facts (Strictly client-verified)
  PROJECTS_DELIVERED: "2700+",
  GOOGLE_RATING: "★★★★★",
  ISO_CERTIFIED: "ISO Certified 9001:2015",
  SOP_PROCESSED: "Architectural SOP Standard",

  // Supported Abu Dhabi Communities
  COMMUNITIES: [
    { name: "Yas Island", area: "Waterfront & Villa Enclaves" },
    { name: "Saadiyat Island", area: "Beach Residences & Estate Villas" },
    { name: "Abu Dhabi Marina", area: "Luxury High-Rise & Penthouses" },
    { name: "Bloom Gardens", area: "Private Family Estates" },
    { name: "Al Raha Beach", area: "Coastal Apartments & Villas" },
    { name: "Saadiyat Lagoons", area: "Sanctuary Villas" }
  ]
};

/**
 * Format timestamp in UAE Local Time (Asia/Dubai, UTC+4, Gulf Standard Time)
 * e.g. "2026-08-14 16:30:00 (UAE/GST +04:00)"
 */
export function getUAETimestamp(date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dubai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(date);
    const p = {};
    parts.forEach(({ type, value }) => { p[type] = value; });
    return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second} (UAE/GST +04:00)`;
  } catch (e) {
    const uaeDate = new Date(date.getTime() + (4 * 60 + date.getTimezoneOffset()) * 60000);
    return uaeDate.toISOString().replace('T', ' ').substring(0, 19) + ' (UAE/GST +04:00)';
  }
}

/**
 * Dispatch Google Ads / GTM dataLayer conversion events seamlessly
 */
export function trackEvent(eventName, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  const eventData = {
    event: eventName,
    timestamp: getUAETimestamp(),
    conversion_id: CAMPAIGN_CONFIG.GOOGLE_ADS_CONVERSION_ID,
    conversion_label: CAMPAIGN_CONFIG.GOOGLE_ADS_CONVERSION_LABEL,
    ...payload
  };

  window.dataLayer.push(eventData);
  console.log(`[CRO Conversion Tracked] ${eventName}:`, eventData);
}

/**
 * Helpers for persistent tracking cookies
 */
function getCookie(name) {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  } catch (e) {}
  return null;
}

function setCookie(name, value, days = 90) {
  try {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  } catch (e) {}
}

/**
 * Case-insensitive search for URL query or hash parameters
 */
function getQueryOrHashParam(paramNames) {
  const names = Array.isArray(paramNames) ? paramNames : [paramNames];

  // 1. Search in URL query parameters
  if (window.location.search) {
    const searchParams = new URLSearchParams(window.location.search);
    for (const name of names) {
      for (const [key, val] of searchParams.entries()) {
        if (key.toLowerCase() === name.toLowerCase() && val && val.trim() !== '') {
          return val.trim();
        }
      }
    }
  }

  // 2. Search in URL hash if params appended after hash
  if (window.location.hash) {
    const hashIndex = window.location.hash.indexOf('?');
    if (hashIndex !== -1) {
      const hashParams = new URLSearchParams(window.location.hash.substring(hashIndex));
      for (const name of names) {
        for (const [key, val] of hashParams.entries()) {
          if (key.toLowerCase() === name.toLowerCase() && val && val.trim() !== '') {
            return val.trim();
          }
        }
      }
    }
  }

  // 3. Search in document.referrer
  if (document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      for (const name of names) {
        for (const [key, val] of refUrl.searchParams.entries()) {
          if (key.toLowerCase() === name.toLowerCase() && val && val.trim() !== '') {
            return val.trim();
          }
        }
      }
    } catch (e) {}
  }

  return null;
}

/**
 * Extract GCLID from Google Tag Manager conversion linker cookie (_gcl_aw)
 */
function getGclidFromGtmCookie() {
  const gclAw = getCookie('_gcl_aw') || getCookie('_gcl_dc');
  if (gclAw) {
    const parts = gclAw.split('.');
    if (parts.length >= 3) {
      return parts.slice(2).join('.');
    }
    return gclAw;
  }
  return null;
}

/**
 * Comprehensive Ad Tracking Data Extractor & Local Persister
 */
export function getAdTrackingData() {
  // Check URL or GTM Cookie for Click IDs
  const freshGclid = getQueryOrHashParam(['gclid', 'gbraid', 'wbraid', 'dclid', 'msclkid', 'fbclid']) || getGclidFromGtmCookie();
  const freshWbraid = getQueryOrHashParam(['wbraid']);
  const freshGbraid = getQueryOrHashParam(['gbraid']);
  const freshUtmSource = getQueryOrHashParam(['utm_source', 'source']);
  const freshUtmMedium = getQueryOrHashParam(['utm_medium', 'medium']);
  const freshUtmCampaign = getQueryOrHashParam(['utm_campaign', 'campaign']);
  const freshUtmTerm = getQueryOrHashParam(['utm_term', 'term']);
  const freshUtmContent = getQueryOrHashParam(['utm_content', 'content']);

  // Persist if fresh values found
  if (freshGclid) {
    try { localStorage.setItem('g3_gclid', freshGclid); } catch (e) {}
    try { sessionStorage.setItem('g3_gclid', freshGclid); } catch (e) {}
    setCookie('g3_gclid', freshGclid);
  }
  if (freshWbraid) {
    try { localStorage.setItem('g3_wbraid', freshWbraid); } catch (e) {}
  }
  if (freshGbraid) {
    try { localStorage.setItem('g3_gbraid', freshGbraid); } catch (e) {}
  }
  if (freshUtmSource) {
    try { localStorage.setItem('g3_utm_source', freshUtmSource); } catch (e) {}
    try { sessionStorage.setItem('g3_utm_source', freshUtmSource); } catch (e) {}
    setCookie('g3_utm_source', freshUtmSource);
  }
  if (freshUtmMedium) {
    try { localStorage.setItem('g3_utm_medium', freshUtmMedium); } catch (e) {}
    try { sessionStorage.setItem('g3_utm_medium', freshUtmMedium); } catch (e) {}
    setCookie('g3_utm_medium', freshUtmMedium);
  }
  if (freshUtmCampaign) {
    try { localStorage.setItem('g3_utm_campaign', freshUtmCampaign); } catch (e) {}
    try { sessionStorage.setItem('g3_utm_campaign', freshUtmCampaign); } catch (e) {}
  }

  // Retrieve with hierarchical fallbacks
  const gclid = freshGclid || localStorage.getItem('g3_gclid') || sessionStorage.getItem('g3_gclid') || getCookie('g3_gclid') || '';
  const wbraid = freshWbraid || localStorage.getItem('g3_wbraid') || '';
  const gbraid = freshGbraid || localStorage.getItem('g3_gbraid') || '';
  const utmSource = freshUtmSource || localStorage.getItem('g3_utm_source') || sessionStorage.getItem('g3_utm_source') || getCookie('g3_utm_source') || (gclid ? 'google_ads' : 'direct');
  const utmMedium = freshUtmMedium || localStorage.getItem('g3_utm_medium') || sessionStorage.getItem('g3_utm_medium') || getCookie('g3_utm_medium') || (gclid ? 'cpc' : 'none');
  const utmCampaign = freshUtmCampaign || localStorage.getItem('g3_utm_campaign') || sessionStorage.getItem('g3_utm_campaign') || 'none';

  return {
    gclid,
    wbraid,
    gbraid,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_term: freshUtmTerm || '',
    utm_content: freshUtmContent || ''
  };
}

export async function submitLeadToGoogleSheet(leadPayload) {
  console.log(`[Lead Capture] Sending lead payload:`, leadPayload);

  // 1. LocalStorage fail-safe backup so NO LEAD IS EVER LOST
  try {
    const existing = JSON.parse(localStorage.getItem('g3_captured_leads') || '[]');
    existing.unshift({
      ...leadPayload,
      saved_at: getUAETimestamp()
    });
    localStorage.setItem('g3_captured_leads', JSON.stringify(existing.slice(0, 100)));
    console.log('[Lead Capture] Saved to local backup successfully');
  } catch (storageErr) {
    console.warn('[Lead Capture Storage]:', storageErr);
  }

  // 2. Submit to Google Apps Script / Webhook Endpoint
  if (CAMPAIGN_CONFIG.GOOGLE_SHEET_WEBHOOK_URL) {
    try {
      const timestampVal = leadPayload.timestamp || getUAETimestamp();
      const gclidVal = leadPayload.gclid || '';

      // Prevent Google Sheets formula #ERROR! by removing leading '+'
      const rawPhone = (leadPayload.phone || '').trim();
      const safePhone = rawPhone.replace(/^\+/, '');

      const params = new URLSearchParams();
      // Match all 14 requested columns: Timestamp, name, company, phone, service, property_type, approx_area, community, preferred_date, source, gclid, utm_source, utm_medium, utm_campaign
      params.append('Timestamp', timestampVal);
      params.append('timestamp', timestampVal);
      params.append('name', leadPayload.name || '');
      params.append('company', leadPayload.company || '');
      params.append('phone', safePhone);
      params.append('service', leadPayload.service || 'Commercial AC Duct Cleaning');
      params.append('property_type', leadPayload.property_type || '');
      params.append('approx_area', leadPayload.approx_area || '');
      params.append('community', leadPayload.community || '');
      params.append('preferred_date', leadPayload.preferred_date || '');
      params.append('source', leadPayload.source || 'hero_inline_form');
      params.append('gclid', gclidVal);
      params.append('GCLID', gclidVal);
      params.append('wbraid', leadPayload.wbraid || '');
      params.append('gbraid', leadPayload.gbraid || '');
      params.append('utm_source', leadPayload.utm_source || 'direct');
      params.append('utm_medium', leadPayload.utm_medium || 'none');
      params.append('utm_campaign', leadPayload.utm_campaign || 'none');
      params.append('utm_term', leadPayload.utm_term || '');
      params.append('utm_content', leadPayload.utm_content || '');
      if (leadPayload.sheet_name) params.append('sheet_name', leadPayload.sheet_name);
      if (leadPayload.tab_name) params.append('tab_name', leadPayload.tab_name);
      if (leadPayload.gid) params.append('gid', String(leadPayload.gid));

      // Dispatch a single reliable HTTP POST with keepalive: true
      await fetch(CAMPAIGN_CONFIG.GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        keepalive: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      console.log('[Google Sheet Sync] Sent 1 single lead submission with GCLID:', gclidVal);
    } catch (err) {
      console.warn('[Google Sheet Sync Warning]:', err);
    }
  }
}

/**
 * Generates direct WhatsApp chat URL with pre-filled lead context
 */
export function getWhatsAppLink(customMessage) {
  const cleanNumber = CAMPAIGN_CONFIG.WHATSAPP_NUMBER.replace(/[^\d+]/g, '');
  const message = encodeURIComponent(customMessage || CAMPAIGN_CONFIG.DEFAULT_WHATSAPP_MESSAGE);
  return `https://wa.me/${cleanNumber.replace('+', '')}?text=${message}`;
}
