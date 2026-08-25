// Shnyar Tahir - Navigation & Scroll Interactions
document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileDrawer();
  initSmoothScroll();
  initActiveNavHighlight();
});

// Shrink header on scroll
function initStickyHeader() {
  const header = document.querySelector('header.sticky-header');
  if (!header) return;
  
  let headerTicking = false;
  function updateHeader() {
    if (window.scrollY > 20) {
      header.style.backgroundColor = 'rgba(252, 251, 249, 0.95)';
      header.style.boxShadow = 'var(--shadow-md)';
      header.style.height = '4.5rem';
    } else {
      header.style.backgroundColor = 'rgba(252, 251, 249, 0.8)';
      header.style.boxShadow = 'none';
      header.style.height = '5rem';
    }
    headerTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!headerTicking) {
      window.requestAnimationFrame(updateHeader);
      headerTicking = true;
    }
  });
}

// Mobile drawer toggle
function initMobileDrawer() {
  const openBtn = document.getElementById('mobile-menu-open');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-drawer');
  
  if (!drawer) return;
  
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      openBtn.classList.add('hidden');
      if (closeBtn) closeBtn.classList.remove('hidden');
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
      closeBtn.classList.add('hidden');
      if (openBtn) openBtn.classList.remove('hidden');
    });
  }
  
  // Close drawer on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
      if (closeBtn) closeBtn.classList.add('hidden');
      if (openBtn) openBtn.classList.remove('hidden');
    }
  });
}

function isHomePage() {
  const path = window.location.pathname;
  return path === '' || path === '/' || path.endsWith('/index.html') || path.endsWith('/koti') || (!path.includes('tietosuojaseloste') && !path.includes('omavalvontasuunnitelma'));
}

function scrollToSection(targetId) {
  if (!targetId || targetId === '#') return;
  const targetElement = document.querySelector(targetId);
  if (targetElement) {
    // Close mobile drawer if open
    const drawer = document.getElementById('mobile-drawer');
    const openBtn = document.getElementById('mobile-menu-open');
    const closeBtn = document.getElementById('mobile-menu-close');
    if (drawer && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
      if (closeBtn) closeBtn.classList.add('hidden');
      if (openBtn) openBtn.classList.remove('hidden');
    }

    const headerOffset = 72; // height of the sticky header
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: 'smooth'
    });

    updateActiveNav(targetId);
  }
}

// Smooth scrolling on anchor links
function initSmoothScroll() {
  // If page opened with a hash, scroll to it and clean the URL
  if (window.location.hash) {
    const initialHash = window.location.hash;
    setTimeout(() => {
      scrollToSection(initialHash);
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }, 150);
  }

  const anchors = document.querySelectorAll('a[href]');
  anchors.forEach(anchor => {
    const href = anchor.getAttribute('href');
    if (!href) return;

    if (href.startsWith('#')) {
      anchor.addEventListener('click', (e) => {
        if (href === '#') return;
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          scrollToSection(href);
        }
      });
      return;
    }

    if (href.includes('#')) {
      const parts = href.split('#');
      const linkPath = parts[0];
      const targetHash = '#' + parts[1];

      // If we are already on the home page and the link points to index.html#section or /#section or #section
      if (isHomePage() && (linkPath === '' || linkPath === '/' || linkPath === './' || linkPath === 'index.html' || linkPath === './index.html' || linkPath === '/koti')) {
        anchor.addEventListener('click', (e) => {
          const targetEl = document.querySelector(targetHash);
          if (targetEl) {
            e.preventDefault();
            scrollToSection(targetHash);
          }
        });
      }
    }
  });

  // Handle category selector tab trigger if clicked on card with data-tab-trigger
  const tabTriggers = document.querySelectorAll('a[data-tab-trigger]');
  tabTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetTab = trigger.getAttribute('data-tab-trigger');
      const tabBtn = document.querySelector(`.tab-btn[data-category="${targetTab}"]`);
      if (tabBtn) {
        tabBtn.click();
      }
    });
  });
}

// Highlight the current active section in navigation based on scroll position
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;
  const navLinks = document.querySelectorAll('.nav-links-desktop .nav-item-btn, .nav-links-desktop .nav-contact-cta, .mobile-drawer .mobile-nav-link, .mobile-drawer .mobile-nav-contact-cta');

  function onScroll() {
    let scrollPos = window.scrollY + 120; // offset to detect section entrance properly

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          const href = link.getAttribute('href');
          if (href === `#${id}` || href === `/#${id}` || href === `index.html#${id}` || (href && href.endsWith(`#${id}`))) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  let scrollTicking = false;
  function handleScroll() {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        onScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  window.addEventListener('scroll', handleScroll);
  onScroll(); // initial run
}

function updateActiveNav(targetId) {
  const cleanTarget = targetId.startsWith('#') ? targetId.slice(1) : targetId;
  const navLinks = document.querySelectorAll('.nav-links-desktop .nav-item-btn, .nav-links-desktop .nav-contact-cta, .mobile-drawer .mobile-nav-link, .mobile-drawer .mobile-nav-contact-cta');
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === targetId || href === `/#${cleanTarget}` || href === `index.html${targetId}` || (href && href.endsWith(`#${cleanTarget}`))) {
      link.classList.add('active');
    }
  });
}
