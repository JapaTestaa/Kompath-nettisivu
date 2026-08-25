// Shnyar Tahir - Main Applet Logic (Pure Static JS)
let currentLang = 'fi';

function getInitialLanguage() {
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam === 'en' || langParam === 'fi') {
    localStorage.setItem('kompath_therapy_lang', langParam);
    return langParam;
  }
  const storedLang = localStorage.getItem('kompath_therapy_lang');
  if (storedLang === 'en' || storedLang === 'fi') {
    return storedLang;
  }
  return 'fi';
}

function cleanUrlPath(pathname) {
  if (pathname.endsWith('/index.html')) {
    return pathname.slice(0, -10) || '/';
  }
  if (pathname === '/index.html' || pathname === 'index.html') {
    return '/';
  }
  return pathname;
}

function syncUrlWithLanguage(lang) {
  const url = new URL(window.location.href);
  if (lang === 'en') {
    url.searchParams.set('lang', 'en');
  } else {
    url.searchParams.delete('lang');
  }
  const cleanPath = cleanUrlPath(url.pathname);
  const newUrl = cleanPath + (url.search ? url.search : '') + (url.hash ? url.hash : '');
  if (window.location.pathname + window.location.search + window.location.hash !== newUrl) {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', newUrl);
    }
  }
}

function updateInternalPageLinks(lang) {
  const isHome = typeof isHomePage === 'function' ? isHomePage() : (window.location.pathname === '/' || window.location.pathname === '' || window.location.pathname.endsWith('/index.html'));
  const pageLinks = document.querySelectorAll('a[href]');
  pageLinks.forEach(link => {
    const rawHref = link.getAttribute('href');
    if (!rawHref) return;
    if (rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || rawHref.startsWith('http')) return;
    
    const [pathPart, hashPart] = rawHref.split('#');
    const [cleanPath] = pathPart.split('?');

    // Home links
    if (cleanPath === '' || cleanPath === '/' || cleanPath === 'index.html' || cleanPath === '/index.html' || cleanPath === './index.html') {
      let targetHref;
      if (isHome) {
        targetHref = hashPart ? '#' + hashPart : '/';
      } else {
        targetHref = hashPart ? '/#' + hashPart : '/';
      }
      if (lang === 'en') {
        if (isHome && hashPart) {
          targetHref = '#' + hashPart;
        } else if (hashPart) {
          targetHref = '/?lang=en#' + hashPart;
        } else {
          targetHref = '/?lang=en';
        }
      }
      link.setAttribute('href', targetHref);
      return;
    }

    if (cleanPath.endsWith('.html') || cleanPath === 'tietosuojaseloste.html' || cleanPath === 'omavalvontasuunnitelma.html') {
      let targetHref = cleanPath;
      if (lang === 'en') {
        targetHref += '?lang=en';
      }
      if (hashPart) {
        targetHref += '#' + hashPart;
      }
      link.setAttribute('href', targetHref);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Language Initialization
  currentLang = getInitialLanguage();
  syncUrlWithLanguage(currentLang);
  updateLanguageState(currentLang);

  // 2. Setup Language Switcher Handlers
  const langSwitchers = document.querySelectorAll('.lang-btn');
  langSwitchers.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextLang = btn.getAttribute('data-lang') || (currentLang === 'fi' ? 'en' : 'fi');
      if (nextLang === currentLang) return;
      currentLang = nextLang;
      localStorage.setItem('kompath_therapy_lang', nextLang);
      syncUrlWithLanguage(nextLang);
      updateLanguageState(nextLang);
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang') === 'en' ? 'en' : 'fi';
    if (langParam !== currentLang) {
      currentLang = langParam;
      localStorage.setItem('kompath_therapy_lang', langParam);
      updateLanguageState(langParam);
    }
  });

  // 3. Cookie Consent Banner Logic
  initCookieConsentBanner(currentLang);

  // 4. Page-Specific Initializations
  if (document.getElementById('services-grid')) {
    initServicesTabs(currentLang);
  }
  if (document.getElementById('faq-accordion')) {
    initPricingFAQs(currentLang);
  }
  if (document.getElementById('contact-form')) {
    initContactForm(currentLang);
  }
  if (document.getElementById('step-1-list')) {
    initBookingWizard(currentLang);
  }
  if (document.getElementById('education-items-list')) {
    renderAboutDynamics(currentLang);
  }
});

/* --- LOCAL SVG ICON HELPER --- */
function getIconSvg(name, extraClass = '') {
  const classAttr = extraClass ? ` class="${extraClass}"` : '';
  const baseAttr = `xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${classAttr}`;
  
  switch (name) {
    case 'check':
      return `<svg ${baseAttr}><path d="M20 6 9 17l-5-5"/></svg>`;
    case 'clock':
      return `<svg ${baseAttr}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
    case 'direction':
      return `<svg ${baseAttr}><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/></svg>`;
    case 'user':
      return `<svg ${baseAttr}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    case 'smile':
      return `<svg ${baseAttr}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>`;
    case 'heart':
      return `<svg ${baseAttr}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
    case 'shield-alert':
      return `<svg ${baseAttr}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`;
    case 'chevron-down':
      return `<svg ${baseAttr}><path d="m6 9 6 6 6-6"/></svg>`;
    case 'map-pin':
      return `<svg ${baseAttr}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;
    default:
      return '';
  }
}

/* --- LANGUAGE STATE MANAGEMENT & TRANSLATION ENGINE --- */
function updateLanguageState(lang) {
  // Translate all marked DOM nodes
  translateDOM(lang);

  // Trigger subcomponent re-renders if elements are present on the page
  if (document.getElementById('services-grid')) {
    renderServicesGrid(lang);
    renderChallengesList(lang);
  }
  if (document.getElementById('faq-accordion')) {
    renderPricingFAQs(lang);
  }
  if (document.getElementById('education-items-list')) {
    renderAboutDynamics(lang);
  }
  if (document.getElementById('step-1-list')) {
    updateBookingWizardLanguage(lang);
  }

  // Update internal page links to preserve active language parameter
  updateInternalPageLinks(lang);

  // Dispatch custom event for page-specific listeners
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

/* --- ABOUT PAGE DYNAMIC LISTS --- */
function renderAboutDynamics(lang) {
  const trans = lang === 'en' ? window.enTranslations : window.fiTranslations;
  if (!trans) return;

  // Render Education list
  const qualList = document.getElementById('education-items-list');
  if (qualList) {
    qualList.innerHTML = '';
    trans.about.educationItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'qual-item';
      li.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-1">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${item}</span>
      `;
      qualList.appendChild(li);
    });
  }

  // Render Experience list
  const expList = document.getElementById('experience-items-list');
  if (expList && trans.about.experienceItems) {
    expList.innerHTML = '';
    trans.about.experienceItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'qual-item';
      li.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-1">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${item}</span>
      `;
      expList.appendChild(li);
    });
  }

  // Render Core Values cards
  const valuesBox = document.getElementById('core-values-box');
  if (valuesBox) {
    valuesBox.innerHTML = '';
    trans.about.values.forEach((val, index) => {
      const card = document.createElement('div');
      card.className = 'value-card';
      
      // Assign different icons
      let iconSvg = '';
      if (index === 0) {
        iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>`;
      } else if (index === 1) {
        iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>`;
      } else {
        iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
      }

      card.innerHTML = `
        <div class="value-icon-box">${iconSvg}</div>
        <h4 class="value-card-title font-semibold">${val.title}</h4>
        <p class="value-card-desc">${val.desc || ''}</p>
      `;
      valuesBox.appendChild(card);
    });
  }

  // Translate the portraits dynamic badge
  const badgeTxt = document.querySelector('.badge-text');
  if (badgeTxt) {
    badgeTxt.textContent = lang === 'en' ? 'Accepting new clients' : 'Vastaanottaa uusia asiakkaita';
  }
  
  const locTitle = document.querySelector('.location-title');
  const locTxt = document.querySelector('.location-text');
  if (locTitle && locTxt) {
    locTitle.textContent = lang === 'en' ? 'Office location' : 'Vastaanotto';
    locTxt.textContent = lang === 'en' ? 'Mannerheimintie, Helsinki' : 'Mannerheimintie, Helsinki';
  }
}

function translateDOM(lang) {
  const schema = lang === 'en' ? window.enTranslations : window.fiTranslations;
  if (!schema) return;

  // Set HTML lang attribute
  document.documentElement.setAttribute('lang', lang);

  // Find all nodes with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const value = getNestedValue(schema, key);
    
    if (value !== undefined && value !== null) {
      if (value === '') {
        element.style.display = 'none';
      } else {
        element.style.display = '';
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.setAttribute('placeholder', value);
        } else {
          element.innerHTML = value;
        }
      }
    }
  });

  // Update Language switcher buttons UI
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const btnLang = btn.getAttribute('data-lang');
    if (btnLang) {
      if (btnLang === lang) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    }
  });
  document.querySelectorAll('.lang-code').forEach(el => {
    el.textContent = lang === 'en' ? 'en' : 'fi';
  });
}

function getNestedValue(obj, path) {
  const keys = path.split('.');
  let current = obj;
  for (const k of keys) {
    if (current && current[k] !== undefined) {
      current = current[k];
    } else {
      return undefined;
    }
  }
  return current;
}


/* --- PERSISTENT COOKIE CONSENT --- */
function initCookieConsentBanner(lang) {
  const banner = document.getElementById('cookie-consent');
  if (!banner) return;

  const consent = localStorage.getItem('kompath_cookie_consent');
  if (!consent) {
    banner.style.display = 'block';
    
    const acceptBtn = document.getElementById('cookie-accept');
    const declineBtn = document.getElementById('cookie-decline');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('kompath_cookie_consent', 'accepted');
        banner.style.display = 'none';
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        localStorage.setItem('kompath_cookie_consent', 'declined');
        banner.style.display = 'none';
      });
    }
  } else {
    banner.style.display = 'none';
  }
}


/* --- SERVICES RENDERING (services.html) --- */
function initServicesTabs(lang) {
  // Initial render of all services side-by-side
  renderServicesGrid(lang);
  renderChallengesList(lang);
}

function renderServicesGrid(lang) {
  const grid = document.getElementById('services-grid');
  if (!grid) return;

  const services = window.servicesData[lang];
  const translations = lang === 'en' ? window.enTranslations : window.fiTranslations;

  let html = '';
  services.forEach(s => {
    // Generate feature list bullets
    let featuresHTML = '';
    s.features.forEach(feat => {
      if (feat.endsWith(':')) {
        featuresHTML += `
          <li class="service-feature-item font-semibold mt-4 text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <span>${feat}</span>
          </li>
        `;
      } else {
        featuresHTML += `
          <li class="service-feature-item">
            ${getIconSvg('check', 'w-4 h-4 text-emerald-600 flex-shrink-0')}
            <span>${feat}</span>
          </li>
        `;
      }
    });

    // Handle VAT display label
    const vatLabel = s.category === 'individual' ? translations.services.vatIncluded : translations.services.vatExcluded;

    // Contact URL is just #contact on the same page
    const contactUrl = `#contact`;

    const isCompact = s.id === 'lapsiperheiden-palvelut' || s.id === 'brief-therapy-package';
    const showDuration = !isCompact;
    const showFooter = !isCompact;

    const durationBadgeHTML = showDuration ? `
            <span class="service-duration-badge">
               ${getIconSvg('clock')}
               <span>${translations.services.durationLabel}: ${s.duration}</span>
            </span>
    ` : '';

    const footerHTML = showFooter ? `
        <div class="service-card-bottom-footer font-sans">
          <div class="service-price-row" style="margin-bottom: 0;">
            <span class="service-price-label font-light">Fee</span>
            <div class="service-price-box">
              <span class="service-price-val font-serif">${s.price}</span>
              <p class="service-price-vat">${vatLabel}</p>
            </div>
          </div>
        </div>
    ` : '';

    if (isCompact) {
      const agreementHTML = s.agreement ? `
        <div class="service-agreement-section">
          <h4 class="service-agreement-title">${s.agreement.title}</h4>
          <ul class="service-agreement-list">
            ${s.agreement.points.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
      ` : '';

      html += `
        <div class="service-item-card special-compact-card animate-fade-in" id="service-card-${s.id}">
          <div class="compact-card-main-content">
            <div class="service-card-compact-header" style="margin-bottom: 1rem;">
              <h3 class="service-card-title font-serif font-light">${s.title}</h3>
              <div class="service-accent-dot flex-shrink-0">
                ${getIconSvg('direction', 'w-4 h-4')}
              </div>
            </div>

            <p class="service-card-desc font-sans" style="margin-bottom: 1rem;">${s.description}</p>

            <div class="service-features-divider" style="margin-bottom: 0; padding-top: 1rem;">
              <ul class="service-features-list font-sans font-light">
                ${featuresHTML}
              </ul>
            </div>
          </div>

          ${agreementHTML}
        </div>
      `;
    } else {
      html += `
        <div class="service-item-card animate-fade-in" id="service-card-${s.id}">
          <div>
            <div class="service-card-top-header">
              ${durationBadgeHTML}
              <div class="service-accent-dot">
                ${getIconSvg('direction', 'w-4 h-4')}
              </div>
            </div>

            <h3 class="service-card-title font-serif font-light">${s.title}</h3>
            <p class="service-card-desc font-sans">${s.description}</p>

            <div class="service-features-divider" style="${!showFooter ? 'margin-bottom: 0;' : ''}">
              <ul class="service-features-list font-sans font-light">
                ${featuresHTML}
              </ul>
            </div>
          </div>

          ${footerHTML}
        </div>
      `;
    }
  });

  grid.innerHTML = html;
}

function renderChallengesList(lang) {
  const grid = document.getElementById('challenges-grid');
  if (!grid) return;

  const translations = lang === 'en' ? window.enTranslations : window.fiTranslations;
  const challenges = translations.challenges;
  if (!challenges || !challenges.categories) return;

  let html = '';
  challenges.categories.forEach(cat => {
    let listItemsHtml = '';
    cat.items.forEach(item => {
      listItemsHtml += `
        <li class="challenge-category-item">
          ${getIconSvg('check')}
          <span>${item}</span>
        </li>
      `;
    });

    html += `
      <div class="challenge-category-card animate-fade-in">
        <div class="challenge-category-icon-wrap">
          ${getIconSvg(cat.icon)}
        </div>
        <h3 class="challenge-category-title font-serif font-medium text-stone-900">${cat.title}</h3>
        <ul class="challenge-category-list">
          ${listItemsHtml}
        </ul>
      </div>
    `;
  });

  grid.innerHTML = html;
}


/* --- ACCORDION FAQS (pricing.html) --- */
function initPricingFAQs(lang) {
  renderPricingFAQs(lang);
}

function renderPricingFAQs(lang) {
  const container = document.getElementById('faq-accordion');
  if (!container) return;

  const faqs = (lang === 'en' ? window.enTranslations : window.fiTranslations).pricing.faqs;
  container.innerHTML = '';

  faqs.forEach((faq, index) => {
    const item = document.createElement('div');
    item.className = 'faq-item';
    item.id = `faq-item-${index}`;

    item.innerHTML = `
      <button class="faq-btn font-sans font-medium" type="button" aria-expanded="false">
        <span>${faq.q}</span>
        ${getIconSvg('chevron-down', 'faq-chevron')}
      </button>
      <div class="faq-content">
        <div class="faq-content-inner font-sans font-light">
          <p>${faq.a}</p>
        </div>
      </div>
    `;

    // Toggle logic
    const btn = item.querySelector('.faq-btn');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      // Close all other items first for accordion behaviour
      document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-btn').setAttribute('aria-expanded', 'false');
        el.querySelector('.faq-content').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        const content = item.querySelector('.faq-content');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });

    container.appendChild(item);
  });
}


/* --- CONTACT FORM SUBMISSION (contact.html) --- */
function initContactForm(lang) {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('contact-alert');
  if (!form) return;

  // Pre-fill message if service parameter is in URL
  const params = new URLSearchParams(window.location.search);
  const serviceId = params.get('service');
  if (serviceId) {
    const services = window.servicesData[lang] || [];
    const matchedService = services.find(s => s.id === serviceId);
    if (matchedService) {
      const messageInput = document.getElementById('contact-message');
      if (messageInput) {
        if (lang === 'en') {
          messageInput.value = `Hello! I am interested in booking the service: "${matchedService.title}".\n\n`;
        } else {
          messageInput.value = `Hei! Olen kiinnostunut varaamaan palvelun: "${matchedService.title}".\n\n`;
        }
        // Focus on the textarea so the user can easily start typing
        messageInput.focus();
        // Set cursor to the end of text
        messageInput.setSelectionRange(messageInput.value.length, messageInput.value.length);
      }
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simple validation
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    if (name && email && message) {
      if (alertBox) {
        alertBox.classList.remove('hidden');
        // Clear inputs
        form.reset();
        
        // Hide success message after 8 seconds
        setTimeout(() => {
          alertBox.classList.add('hidden');
        }, 8000);
      }
    }
  });
}


/* --- MULTI-STEP BOOKING WIZARD ENGINE (booking.html) --- */
let bookingState = {
  step: 1,
  selectedServiceId: null,
  selectedDate: '',
  selectedTime: '',
  fullName: '',
  email: '',
  phone: '',
  additionalInfo: '',
  consentChecked: false,
};

function initBookingWizard(lang) {
  // Check if a service id is specified in URL query
  const params = new URLSearchParams(window.location.search);
  const serviceQuery = params.get('service');
  if (serviceQuery) {
    bookingState.selectedServiceId = serviceQuery;
    bookingState.step = 2; // Jump to date selection directly
  }

  renderBookingStep(lang);
}

function updateBookingWizardLanguage(lang) {
  // Translate static labels in wizard headers & indicators
  const translations = lang === 'en' ? window.enTranslations : window.fiTranslations;
  
  const indicatorLabel1 = document.getElementById('step-label-1');
  const indicatorLabel2 = document.getElementById('step-label-2');
  const indicatorLabel3 = document.getElementById('step-label-3');
  const indicatorLabel4 = document.getElementById('step-label-4');

  if (indicatorLabel1) indicatorLabel1.textContent = translations.booking.step1;
  if (indicatorLabel2) indicatorLabel2.textContent = translations.booking.step2;
  if (indicatorLabel3) indicatorLabel3.textContent = translations.booking.step3;
  if (indicatorLabel4) indicatorLabel4.textContent = translations.booking.step4;

  renderBookingStep(lang);
}

function renderBookingStep(lang) {
  const translations = lang === 'en' ? window.enTranslations : window.fiTranslations;
  const services = window.servicesData[lang];
  const selectedService = services.find(s => s.id === bookingState.selectedServiceId);

  // Update step indicators active styling
  for (let s = 1; s <= 4; s++) {
    const indicator = document.getElementById(`progress-step-${s}`);
    if (indicator) {
      indicator.classList.remove('active', 'completed');
      if (s === bookingState.step) {
        indicator.classList.add('active');
      } else if (s < bookingState.step) {
        indicator.classList.add('completed');
      }
    }
  }

  // Hide all step sections
  document.querySelectorAll('.booking-step-pane').forEach(el => el.classList.remove('active'));

  // Show active step section
  const activePane = document.getElementById(`booking-step-${bookingState.step}`);
  if (activePane) activePane.classList.add('active');

  // STEP-SPECIFIC RENDERERS
  if (bookingState.step === 1) {
    renderStep1ServicesList(lang, services);
  } else if (bookingState.step === 2) {
    renderStep2CalendarGrid(lang, selectedService);
  } else if (bookingState.step === 3) {
    renderStep3Form(lang, selectedService);
  } else if (bookingState.step === 4) {
    renderStep4Summary(lang, selectedService);
  }
}

// RENDER STEP 1
function renderStep1ServicesList(lang, services) {
  const listContainer = document.getElementById('step-1-list');
  if (!listContainer) return;

  listContainer.innerHTML = '';
  services.forEach(s => {
    const isSelected = bookingState.selectedServiceId === s.id;
    const btn = document.createElement('button');
    btn.className = `booking-service-btn ${isSelected ? 'selected' : ''}`;
    btn.type = 'button';
    btn.id = `booking-service-btn-${s.id}`;

    btn.innerHTML = `
      <div class="booking-serv-btn-text">
        <h4 class="booking-serv-title font-sans">${s.title}</h4>
        <p class="booking-serv-desc font-sans">${s.description}</p>
        <div class="booking-serv-meta font-sans font-light">
          <span>${s.duration}</span>
          <span>&bull;</span>
          <span class="font-semibold text-stone-900">${s.price}</span>
        </div>
      </div>
      <div class="booking-checkbox-circle">
        ${getIconSvg('check', 'w-3.5 h-3.5 text-stone-50')}
      </div>
    `;

    btn.addEventListener('click', () => {
      bookingState.selectedServiceId = s.id;
      // Auto advance to step 2 on service click!
      bookingState.step = 2;
      renderBookingStep(lang);
    });

    listContainer.appendChild(btn);
  });
}

// RENDER STEP 2
function generateAvailableDates() {
  const dates = [];
  const today = new Date();
  let count = 0;
  let daysToCheck = 0;
  
  while (count < 14 && daysToCheck < 30) {
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + daysToCheck);
    const day = nextDate.getDay();
    // Skip weekends (0=Sunday, 6=Saturday)
    if (day !== 0 && day !== 6) {
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDate.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
      count++;
    }
    daysToCheck++;
  }
  return dates;
}

const availableTimes = ['09:00', '10:00', '11:30', '13:00', '14:30', '16:00'];

function renderStep2CalendarGrid(lang, selectedService) {
  const badge = document.getElementById('step-2-service-badge');
  if (badge && selectedService) {
    badge.textContent = selectedService.title;
  }

  // Render Calendar dates
  const calContainer = document.getElementById('calendar-dates-wrap');
  if (!calContainer) return;

  calContainer.innerHTML = '';
  const dates = generateAvailableDates();
  
  dates.forEach(dateStr => {
    const isSelected = bookingState.selectedDate === dateStr;
    const d = new Date(dateStr);
    const dayNum = d.getDate();
    const dayLabel = d.toLocaleDateString(lang === 'en' ? 'en-US' : 'fi-FI', { weekday: 'short' });

    const btn = document.createElement('button');
    btn.className = `calendar-date-btn ${isSelected ? 'selected' : ''}`;
    btn.type = 'button';
    btn.id = `cal-date-btn-${dateStr}`;

    btn.innerHTML = `
      <span class="cal-day-name">${dayLabel}</span>
      <span class="cal-day-num">${dayNum}</span>
    `;

    btn.addEventListener('click', () => {
      bookingState.selectedDate = dateStr;
      bookingState.selectedTime = ''; // reset previous time
      renderStep2CalendarGrid(lang, selectedService);
    });

    calContainer.appendChild(btn);
  });

  // Render Time slots
  const timeContainer = document.getElementById('time-slots-wrap');
  if (!timeContainer) return;

  if (!bookingState.selectedDate) {
    timeContainer.innerHTML = `
      <div class="no-date-placeholder font-sans font-light">
        ${lang === 'en' ? 'Select a date first to view available hours' : 'Valitse ensin päivämäärä nähdäksesi kellonajat'}
      </div>
    `;
  } else {
    timeContainer.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'time-slots-grid font-sans';

    availableTimes.forEach(timeStr => {
      const isSelected = bookingState.selectedTime === timeStr;
      const btn = document.createElement('button');
      btn.className = `time-slot-btn ${isSelected ? 'selected' : ''}`;
      btn.type = 'button';
      btn.textContent = timeStr;

      btn.addEventListener('click', () => {
        bookingState.selectedTime = timeStr;
        renderStep2CalendarGrid(lang, selectedService);
      });

      grid.appendChild(btn);
    });

    timeContainer.appendChild(grid);
  }

  // Setup Next button state
  const nextBtn = document.getElementById('step-2-next');
  if (nextBtn) {
    nextBtn.disabled = !bookingState.selectedDate || !bookingState.selectedTime;
    
    // Clear old event listeners & bind click
    const cloned = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(cloned, nextBtn);
    cloned.addEventListener('click', () => {
      bookingState.step = 3;
      renderBookingStep(lang);
    });
  }

  // Setup Back button
  const backBtn = document.getElementById('step-2-back');
  if (backBtn) {
    const cloned = backBtn.cloneNode(true);
    backBtn.parentNode.replaceChild(cloned, backBtn);
    cloned.addEventListener('click', () => {
      bookingState.step = 1;
      renderBookingStep(lang);
    });
  }
}

// RENDER STEP 3
function renderStep3Form(lang, selectedService) {
  const badge = document.getElementById('step-3-service-badge');
  if (badge && selectedService) {
    badge.textContent = selectedService.title;
  }

  // Bind values to static form fields if they exist
  const nameInput = document.getElementById('booking-fullname');
  const emailInput = document.getElementById('booking-email');
  const phoneInput = document.getElementById('booking-phone');
  const infoTextarea = document.getElementById('booking-info');
  const consentCheckbox = document.getElementById('booking-consent');

  if (nameInput) {
    nameInput.value = bookingState.fullName;
    nameInput.oninput = (e) => {
      bookingState.fullName = e.target.value;
      validateStep3Form();
    };
  }

  if (emailInput) {
    emailInput.value = bookingState.email;
    emailInput.oninput = (e) => {
      bookingState.email = e.target.value;
      validateStep3Form();
    };
  }

  if (phoneInput) {
    phoneInput.value = bookingState.phone;
    phoneInput.oninput = (e) => {
      bookingState.phone = e.target.value;
      validateStep3Form();
    };
  }

  if (infoTextarea) {
    infoTextarea.value = bookingState.additionalInfo;
    infoTextarea.oninput = (e) => {
      bookingState.additionalInfo = e.target.value;
    };
  }

  if (consentCheckbox) {
    consentCheckbox.checked = bookingState.consentChecked;
    consentCheckbox.onchange = (e) => {
      bookingState.consentChecked = e.target.checked;
      validateStep3Form();
    };
  }

  function validateStep3Form() {
    const nextBtn = document.getElementById('step-3-next');
    if (nextBtn) {
      nextBtn.disabled = !bookingState.fullName || !bookingState.email || !bookingState.phone || !bookingState.consentChecked;
    }
  }

  validateStep3Form();

  // Setup Next button clicks
  const nextBtn = document.getElementById('step-3-next');
  if (nextBtn) {
    const cloned = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(cloned, nextBtn);
    cloned.addEventListener('click', () => {
      bookingState.step = 4;
      renderBookingStep(lang);
    });
  }

  // Setup Back button
  const backBtn = document.getElementById('step-3-back');
  if (backBtn) {
    const cloned = backBtn.cloneNode(true);
    backBtn.parentNode.replaceChild(cloned, backBtn);
    cloned.addEventListener('click', () => {
      bookingState.step = 2;
      renderBookingStep(lang);
    });
  }
}

// RENDER STEP 4
function renderStep4Summary(lang, selectedService) {
  const receiptContainer = document.getElementById('receipt-rows-box');
  if (!receiptContainer || !selectedService) return;

  const formatDateStr = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString(lang === 'en' ? 'en-US' : 'fi-FI', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const translations = lang === 'en' ? window.enTranslations : window.fiTranslations;

  receiptContainer.innerHTML = `
    <div class="receipt-item-row border-b">
      <span class="receipt-item-label font-sans">${translations.booking.selectedService}:</span>
      <span class="receipt-item-val font-sans">${selectedService.title}</span>
    </div>
    <div class="receipt-item-row border-b">
      <span class="receipt-item-label font-sans">${translations.booking.selectedDate}:</span>
      <span class="receipt-item-val font-sans">${formatDateStr(bookingState.selectedDate)}</span>
    </div>
    <div class="receipt-item-row border-b">
      <span class="receipt-item-label font-sans">${translations.booking.selectedTime}:</span>
      <span class="receipt-item-val font-sans">${bookingState.selectedTime} (${selectedService.duration})</span>
    </div>
    <div class="receipt-item-row border-b">
      <span class="receipt-item-label font-sans">${translations.booking.fullName}:</span>
      <span class="receipt-item-val font-sans">${bookingState.fullName}</span>
    </div>
    <div class="receipt-item-row border-b">
      <span class="receipt-item-label font-sans">${translations.booking.email}:</span>
      <span class="receipt-item-val font-sans">${bookingState.email}</span>
    </div>
    <div class="receipt-item-row border-b">
      <span class="receipt-item-label font-sans">${translations.booking.phone}:</span>
      <span class="receipt-item-val font-sans">${bookingState.phone}</span>
    </div>
    <div class="receipt-item-row">
      <span class="receipt-item-label font-sans">${lang === 'en' ? 'Fee Total' : 'Kokonaishinta'}:</span>
      <span class="receipt-item-val price font-serif font-semibold text-stone-950">${selectedService.price}</span>
    </div>
  `;

  // Setup Confirm button click
  const confirmBtn = document.getElementById('booking-confirm-submit');
  if (confirmBtn) {
    const cloned = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(cloned, confirmBtn);
    cloned.addEventListener('click', () => {
      // Trigger submission success view!
      showBookingSuccess(lang, selectedService);
    });
  }

  // Setup Back button
  const backBtn = document.getElementById('step-4-back');
  if (backBtn) {
    const cloned = backBtn.cloneNode(true);
    backBtn.parentNode.replaceChild(cloned, backBtn);
    cloned.addEventListener('click', () => {
      bookingState.step = 3;
      renderBookingStep(lang);
    });
  }
}

// SUCCESS VIEW RENDERER
function showBookingSuccess(lang, selectedService) {
  const wizardWrap = document.getElementById('booking-wizard-wrapper');
  const successWrap = document.getElementById('booking-success-wrapper');

  if (!wizardWrap || !successWrap) return;

  const translations = lang === 'en' ? window.enTranslations : window.fiTranslations;

  const formatDateStr = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString(lang === 'en' ? 'en-US' : 'fi-FI', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Populate success elements
  const receiptHTML = `
    <h3 class="receipt-details-title font-sans font-semibold">${lang === 'en' ? 'Reservation Receipt' : 'Varauksen tiedot'}</h3>
    <div class="receipt-details-rows font-sans">
      <div class="receipt-details-row text-stone-600">
        <span class="text-stone-400 font-light">${translations.booking.selectedService}:</span>
        <span class="font-semibold text-stone-900 text-right">${selectedService.title}</span>
      </div>
      <div class="receipt-details-row text-stone-600">
        <span class="text-stone-400 font-light">${translations.booking.selectedDate}:</span>
        <span class="font-semibold text-stone-900">${formatDateStr(bookingState.selectedDate)}</span>
      </div>
      <div class="receipt-details-row text-stone-600">
        <span class="text-stone-400 font-light">${translations.booking.selectedTime}:</span>
        <span class="font-semibold text-stone-900">${bookingState.selectedTime} (${selectedService.duration})</span>
      </div>
      <div class="receipt-details-row text-stone-600 total-row">
        <span class="text-stone-400 font-light">${translations.booking.fullName}:</span>
        <span class="font-semibold text-stone-900">${bookingState.fullName}</span>
      </div>
      <div class="receipt-details-row text-stone-600">
        <span class="text-stone-400 font-light">${translations.contact.emailLabel}:</span>
        <span class="font-semibold text-stone-900">${bookingState.email}</span>
      </div>
    </div>
    
    <div class="success-receipt-footer text-stone-400 font-light">
      ${getIconSvg('map-pin', 'w-4 h-4 flex-shrink-0 text-stone-400')}
      <span>
        ${lang === 'en'
          ? 'Office: Mannerheimintie 12 B, Helsinki (Floor 4). Remote video details are sent via email.'
          : 'Toimisto: Mannerheimintie 12 B, Helsinki (4. kerros). Etäyhteyslinkki toimitetaan sähköpostitse.'}
      </span>
    </div>
  `;

  const receiptBox = document.getElementById('success-receipt-box');
  if (receiptBox) receiptBox.innerHTML = receiptHTML;

  // Toggle sections
  wizardWrap.style.display = 'none';
  successWrap.style.display = 'block';

  // Setup Success Restart button click
  const restartBtn = document.getElementById('success-restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      // Reset state and restore display
      bookingState = {
        step: 1,
        selectedServiceId: null,
        selectedDate: '',
        selectedTime: '',
        fullName: '',
        email: '',
        phone: '',
        additionalInfo: '',
        consentChecked: false,
      };

      wizardWrap.style.display = 'block';
      successWrap.style.display = 'none';
      renderBookingStep(lang);
    });
  }
}
