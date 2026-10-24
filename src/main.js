import { CAMPAIGN_CONFIG, trackEvent, getWhatsAppLink, submitLeadToGoogleSheet, getUAETimestamp, getAdTrackingData } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  initAdTracking();
  initHeaderScroll();
  initUAEPhoneInputs();
  initWhatsAppLinks();
  initLeadModal();
  initHeroInlineForm();
  initFAQAccordion();
  initProcessDetailsToggle();
  initHashDeepLink();
  initDailyOfferTimer();
  initScrollAnimations();
  initParallaxScroll();
  initThankYouModal();
});

/**
 * Dynamic Transparent -> Glassmorphic White Header Transition on Scroll
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const updateHeaderHeight = () => {
    const h = header.offsetHeight;
    if (h > 0) {
      document.documentElement.style.setProperty('--header-height', `${h}px`);
    }
  };

  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight);

  const handleScroll = () => {
    if (window.scrollY > 35) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
    updateHeaderHeight();
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Parallax Scroll Movement for Hero Background
 */
function initParallaxScroll() {
  const bg = document.querySelector('.hero-parallax-bg');
  if (!bg) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        if (scrolled < 1000) {
          bg.style.transform = `translate3d(0, ${scrolled * 0.35}px, 0)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/**
 * Update all WhatsApp CTAs with prefilled message & dynamic link
 */
function initWhatsAppLinks() {
  const whatsappElements = document.querySelectorAll('[data-whatsapp-cta]');
  
  whatsappElements.forEach(el => {
    const customMsg = el.getAttribute('data-whatsapp-msg');
    el.href = getWhatsAppLink(customMsg);
    
    el.addEventListener('click', () => {
      trackEvent('whatsapp_click', {
        cta_location: el.getAttribute('data-cta-location') || 'general',
        destination_url: el.href
      });
    });
  });
}

/**
 * Inline Hero Lead Form Handler
 */
function initHeroInlineForm() {
  const heroForm = document.getElementById('heroInlineForm');

  if (!heroForm) return;

  let isSubmitting = false;

  heroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    isSubmitting = true;

    const submitBtn = heroForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
    }

    const formData = new FormData(heroForm);
    const trackingData = getAdTrackingData();
    const isCommercial = !!document.getElementById('heroCompany') || window.location.pathname.includes('commercial');
    const leadPayload = {
      name: formData.get('name'),
      company: formData.get('company') || formData.get('company_name') || '',
      phone: formData.get('phone'),
      service: formData.get('service') || (isCommercial ? 'Commercial AC Duct Cleaning' : 'Villa & Apartment Deep Clean'),
      property_type: formData.get('property_type') || '',
      approx_area: formData.get('approx_area') || formData.get('area') || '',
      community: formData.get('community') || formData.get('location') || '',
      preferred_date: formData.get('preferred_date'),
      gclid: formData.get('gclid') || trackingData.gclid || '',
      wbraid: trackingData.wbraid || '',
      gbraid: trackingData.gbraid || '',
      timestamp: formData.get('timestamp') || getUAETimestamp(),
      utm_source: formData.get('utm_source') || trackingData.utm_source || 'direct',
      utm_medium: formData.get('utm_medium') || trackingData.utm_medium || 'none',
      utm_campaign: formData.get('utm_campaign') || trackingData.utm_campaign || 'none',
      utm_term: trackingData.utm_term || '',
      utm_content: trackingData.utm_content || '',
      source: 'hero_inline_form',
      sheet_name: isCommercial ? 'AC Duct Cleaning Leads' : 'Deep Cleaning Leads',
      gid: isCommercial ? '803808413' : '0'
    };

    trackEvent('lead_form_submit', leadPayload);
    try {
      sessionStorage.setItem('last_submitted_lead', JSON.stringify(leadPayload));
    } catch (e) {}

    try {
      await submitLeadToGoogleSheet(leadPayload);
    } catch (err) {
      console.warn('Google Sheet submission warning:', err);
    }

    // Always redirect to Thank You Page
    window.location.href = './thank-you.html';
  });
}

/**
 * Handle Modal Drawer Lifecycle & Form Submission
 */
function initLeadModal() {
  const modalBackdrop = document.getElementById('leadModal');
  const openButtons = document.querySelectorAll('[data-open-modal]');
  const closeButtons = document.querySelectorAll('[data-close-modal]');
  const leadForm = document.getElementById('leadInspectionForm');

  if (!modalBackdrop) return;

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const triggerLocation = btn.getAttribute('data-cta-location') || 'unknown';
      const serviceName = btn.getAttribute('data-service-name');
      const propertyType = btn.getAttribute('data-property-type');
      
      trackEvent('book_free_inspection_click', {
        cta_location: triggerLocation,
        service_name: serviceName || 'default',
        property_type: propertyType || 'default'
      });

      if (serviceName) {
        const serviceSelect = modalBackdrop.querySelector('#leadService');
        if (serviceSelect) {
          serviceSelect.value = serviceName;
        }
      }

      if (propertyType) {
        const propertySelect = modalBackdrop.querySelector('#leadPropertyType');
        if (propertySelect) {
          propertySelect.value = propertyType;
        }
      }

      const phoneInput = modalBackdrop.querySelector('input[type="tel"]');
      if (phoneInput && (!phoneInput.value || !phoneInput.value.startsWith('+971'))) {
        phoneInput.value = '+971 ';
      }

      modalBackdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';

      const firstInput = modalBackdrop.querySelector('input');
      if (firstInput) setTimeout(() => firstInput.focus(), 150);
    });
  });

  const closeModal = () => {
    modalBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  closeButtons.forEach(btn => btn.addEventListener('click', closeModal));

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) {
      closeModal();
    }
  });

  if (leadForm) {
    let isModalSubmitting = false;

    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (isModalSubmitting) return;
      isModalSubmitting = true;

      const submitBtn = leadForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
      }

      const formData = new FormData(leadForm);
      const trackingData = getAdTrackingData();
      const isCommercial = !!leadForm.querySelector('#leadCompany') || window.location.pathname.includes('commercial');
      const leadPayload = {
        name: formData.get('name'),
        company: formData.get('company') || formData.get('company_name') || '',
        phone: formData.get('phone'),
        service: formData.get('service') || (isCommercial ? 'Commercial AC Duct Cleaning' : 'Villa & Apartment Deep Clean'),
        property_type: formData.get('property_type') || '',
        approx_area: formData.get('approx_area') || formData.get('area') || '',
        community: formData.get('community') || formData.get('location') || '',
        preferred_date: formData.get('preferred_date'),
        gclid: formData.get('gclid') || trackingData.gclid || '',
        wbraid: trackingData.wbraid || '',
        gbraid: trackingData.gbraid || '',
        timestamp: formData.get('timestamp') || getUAETimestamp(),
        utm_source: formData.get('utm_source') || trackingData.utm_source || 'direct',
        utm_medium: formData.get('utm_medium') || trackingData.utm_medium || 'none',
        utm_campaign: formData.get('utm_campaign') || trackingData.utm_campaign || 'none',
        utm_term: trackingData.utm_term || '',
        utm_content: trackingData.utm_content || '',
        source: 'modal_drawer_form',
        sheet_name: isCommercial ? 'AC Duct Cleaning Leads' : 'Deep Cleaning Leads',
        gid: isCommercial ? '803808413' : '0'
      };

      trackEvent('lead_form_submit', leadPayload);
      try {
        sessionStorage.setItem('last_submitted_lead', JSON.stringify(leadPayload));
      } catch (e) {}

      try {
        await submitLeadToGoogleSheet(leadPayload);
      } catch (err) {
        console.warn('Google Sheet submission warning:', err);
      }

      // Always redirect to Thank You Page
      window.location.href = './thank-you.html';
    });
  }
}

/**
 * Show High-Converting Luxury Thank You Popup Modal
 */
export function showThankYouPopup(leadPayload = {}) {
  const thankYouModal = document.getElementById('thankYouModal');
  const leadModal = document.getElementById('leadModal');

  if (leadModal && leadModal.classList.contains('is-open')) {
    leadModal.classList.remove('is-open');
  }

  if (!thankYouModal) return;

  const nameEl = document.getElementById('thankYouName');
  const serviceEl = document.getElementById('thankYouService');
  const locationEl = document.getElementById('thankYouLocation');
  const whatsappBtn = document.getElementById('thankYouWhatsAppBtn');

  if (nameEl) nameEl.textContent = leadPayload.name || 'Valued Client';
  if (serviceEl) serviceEl.textContent = leadPayload.service || 'Villa & Apartment Deep Clean';
  if (locationEl) locationEl.textContent = leadPayload.community || 'Abu Dhabi';

  if (whatsappBtn) {
    const customMsg = `Hi, I just submitted an inspection request for my property in ${leadPayload.community || 'Abu Dhabi'} (Name: ${leadPayload.name || ''}, Phone: ${leadPayload.phone || ''}).`;
    whatsappBtn.href = getWhatsAppLink(customMsg);
  }

  thankYouModal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

/**
 * Initialize Thank You Modal Close & Backdrop Handlers
 */
function initThankYouModal() {
  const thankYouModal = document.getElementById('thankYouModal');
  if (!thankYouModal) return;

  const closeBtns = thankYouModal.querySelectorAll('[data-close-thank-you]');
  const closeThankYou = () => {
    thankYouModal.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  closeBtns.forEach(btn => btn.addEventListener('click', closeThankYou));
  
  thankYouModal.addEventListener('click', (e) => {
    if (e.target === thankYouModal) closeThankYou();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && thankYouModal.classList.contains('is-open')) {
      closeThankYou();
    }
  });
}

/**
 * FAQ Accordions with Accessibility Attributes
 */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-card-item, .faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger') || item;
    const content = item.querySelector('.faq-content');

    if (!trigger || !content) return;

    const toggleAccordion = (e) => {
      if (e) e.preventDefault();
      const isOpen = item.classList.contains('active');

      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          const otherContent = otherItem.querySelector('.faq-content');
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = (content.scrollHeight + 30) + 'px';

        trackEvent('faq_accordion_open', {
          question: item.querySelector('.faq-q-text')?.textContent.trim() || 'faq'
        });
      }
    };

    trigger.addEventListener('click', toggleAccordion);
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.faq-trigger')) {
        toggleAccordion(e);
      }
    });
  });
}

/**
 * Scroll Entrance Animations
 */
function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const animateElements = document.querySelectorAll('.trust-bar, .community-card, .process-card, .review-featured, .review-card-sm, .faq-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });
}

/**
 * Interactive Process Card Details Expander
 */
function initProcessDetailsToggle() {
  const processCards = document.querySelectorAll('[data-process-card]');

  processCards.forEach(card => {
    const toggleBtn = card.querySelector('[data-toggle-details]');
    if (!toggleBtn) return;

    const toggleCard = () => {
      const isExpanded = card.classList.contains('is-expanded');
      
      if (isExpanded) {
        card.classList.remove('is-expanded');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.querySelector('span').textContent = 'View Details';
      } else {
        card.classList.add('is-expanded');
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.querySelector('span').textContent = 'Hide Details';
        
        trackEvent('process_details_view', {
          step: card.querySelector('.process-title')?.textContent.trim()
        });
      }
    };

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCard();
    });

    card.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      toggleCard();
    });
  });
}

/**
 * Ad Group Anchor Deep-Linking (#kitchen, #bathroom, #sofa, #carpet, #villa, #moveout)
 */
function initHashDeepLink() {
  const handleHash = () => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    const targetCard = document.getElementById(hash);
    if (targetCard) {
      document.querySelectorAll('.service-card-item').forEach(c => c.classList.remove('is-highlighted'));
      targetCard.classList.add('is-highlighted');

      setTimeout(() => {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      trackEvent('ad_deeplink_land', { target_hash: hash });
    }
  };

  window.addEventListener('load', handleHash);
  window.addEventListener('hashchange', handleHash);
}

/**
 * Daily 24-Hour Offer Countdown Timer (Resets Daily at Midnight)
 */
function initDailyOfferTimer() {
  const hoursEl = document.getElementById('dailyHours');
  const minutesEl = document.getElementById('dailyMinutes');
  const secondsEl = document.getElementById('dailySeconds');

  if (!hoursEl || !minutesEl || !secondsEl) return;

  const updateTimer = () => {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let diffMs = endOfDay - now;

    if (diffMs <= 0) {
      diffMs = 0;
    }

    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);

    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  };

  updateTimer();
  setInterval(updateTimer, 1000);
}

/**
 * Auto-capture GCLID (Google Click ID) & Timestamp for Ad Lead Tracking
 */
function initAdTracking() {
  const updateHiddenFormFields = () => {
    const tracking = getAdTrackingData();
    const currentTimestamp = getUAETimestamp();

    document.querySelectorAll('input[name="gclid"]').forEach(el => el.value = tracking.gclid || '');
    document.querySelectorAll('input[name="timestamp"]').forEach(el => el.value = currentTimestamp);
    document.querySelectorAll('input[name="utm_source"]').forEach(el => el.value = tracking.utm_source || 'direct');
    document.querySelectorAll('input[name="utm_medium"]').forEach(el => el.value = tracking.utm_medium || 'none');
    document.querySelectorAll('input[name="utm_campaign"]').forEach(el => el.value = tracking.utm_campaign || 'none');
  };

  updateHiddenFormFields();

  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', () => {
      updateHiddenFormFields();
    });
  });
}

/**
 * Auto-format & enforce UAE Phone Number Prefix (+971) by default across all forms
 */
function initUAEPhoneInputs() {
  const phoneInputs = document.querySelectorAll('input[type="tel"], #heroPhone, #leadPhone');

  phoneInputs.forEach(input => {
    // 1. Initialize with UAE prefix if empty or non-UAE
    if (!input.value || !input.value.trim().startsWith('+971')) {
      input.value = '+971 ';
    }

    // 2. On focus, ensure +971 is present and cursor placed after prefix
    input.addEventListener('focus', () => {
      if (!input.value || input.value.trim() === '+' || input.value.trim() === '+971') {
        input.value = '+971 ';
      }
      setTimeout(() => {
        const len = input.value.length;
        input.setSelectionRange(len, len);
      }, 10);
    });

    // 3. On input, preserve prefix and normalize UAE numbers
    input.addEventListener('input', () => {
      let val = input.value;
      if (!val.startsWith('+971')) {
        let digits = val.replace(/[^\d]/g, '');
        if (digits.startsWith('971')) {
          digits = digits.substring(3);
        } else if (digits.startsWith('0')) {
          digits = digits.substring(1);
        }
        input.value = '+971 ' + digits;
      }
    });

    // 4. Prevent deleting "+971 " with Backspace
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        const selStart = input.selectionStart;
        const selEnd = input.selectionEnd;
        if (selStart <= 5 && selEnd <= 5) {
          e.preventDefault();
        }
      }
    });
  });
}
