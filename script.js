// =========================================================
// MonMon Empire Printers — Site scripts
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Accessibility scale ---------- */
  const scaleLevels = [
    { name: 'compact', label: 'Compact', value: 0.82 },
    { name: 'small', label: 'Small', value: 0.92 },
    { name: 'default', label: 'Default', value: 1 },
    { name: 'large', label: 'Large', value: 1.15 }
  ];
  const scaleStorageKey = 'monmon-ui-scale';
  const accessibilityTools = document.querySelector('.accessibility-tools');
  const accessibilityToggle = document.getElementById('accessibilityToggle');
  const accessibilityPanel = document.getElementById('accessibilityPanel');
  const scaleStatus = document.getElementById('scaleStatus');
  let savedScale = null;

  try {
    savedScale = localStorage.getItem(scaleStorageKey);
  } catch {
    savedScale = null;
  }

  let hasSavedScale = scaleLevels.some(level => level.name === savedScale);
  const automaticScale = () => {
    if (window.matchMedia('(max-width: 600px)').matches) return 'compact';
    if (window.matchMedia('(max-width: 1024px)').matches) return 'small';
    return 'default';
  };
  let currentScale = hasSavedScale ? savedScale : automaticScale();

  const applyScale = (name, persist = true) => {
    const level = scaleLevels.find(item => item.name === name) || scaleLevels[0];
    currentScale = level.name;
    document.documentElement.style.setProperty('--ui-scale', String(level.value));
    document.documentElement.dataset.uiScale = level.name;
    if (scaleStatus) scaleStatus.textContent = `${level.label} scale`;
    if (persist) {
      try {
        localStorage.setItem(scaleStorageKey, level.name);
        hasSavedScale = true;
      } catch {
        hasSavedScale = false;
      }
    }
  };

  applyScale(currentScale, false);

  if (accessibilityToggle && accessibilityPanel && accessibilityTools) {
    let panelCloseTimer;
    const setPanelOpen = (isOpen) => {
      window.clearTimeout(panelCloseTimer);
      accessibilityToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        accessibilityPanel.hidden = false;
        requestAnimationFrame(() => accessibilityPanel.classList.add('is-open'));
      } else {
        accessibilityPanel.classList.remove('is-open');
        panelCloseTimer = window.setTimeout(() => {
          if (!accessibilityPanel.classList.contains('is-open')) accessibilityPanel.hidden = true;
        }, 200);
      }
    };

    accessibilityToggle.addEventListener('click', () => {
      setPanelOpen(accessibilityToggle.getAttribute('aria-expanded') !== 'true');
    });
    document.getElementById('scaleDown')?.addEventListener('click', () => {
      const index = scaleLevels.findIndex(level => level.name === currentScale);
      applyScale(scaleLevels[Math.max(0, index - 1)].name);
    });
    document.getElementById('scaleDefault')?.addEventListener('click', () => applyScale('default'));
    document.getElementById('scaleUp')?.addEventListener('click', () => {
      const index = scaleLevels.findIndex(level => level.name === currentScale);
      applyScale(scaleLevels[Math.min(scaleLevels.length - 1, index + 1)].name);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && accessibilityToggle.getAttribute('aria-expanded') === 'true') {
        setPanelOpen(false);
        accessibilityToggle.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (!accessibilityTools.contains(event.target) && accessibilityToggle.getAttribute('aria-expanded') === 'true') {
        setPanelOpen(false);
      }
    });
  }

  window.addEventListener('resize', () => {
    if (!hasSavedScale) applyScale(automaticScale(), false);
  });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    const setMenuOpen = (isOpen) => {
      navLinks.classList.toggle('open', isOpen);
      navLinks.setAttribute('aria-hidden', String(!isOpen && window.innerWidth <= 860));
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    };

    navLinks.setAttribute('aria-hidden', String(window.innerWidth <= 860));

    menuToggle.addEventListener('click', () => {
      setMenuOpen(!navLinks.classList.contains('open'));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.querySelector('.btn-quote')?.addEventListener('click', () => setMenuOpen(false));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navLinks.classList.contains('open')) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('#siteNav') && navLinks.classList.contains('open')) {
        setMenuOpen(false);
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860 && navLinks.classList.contains('open')) setMenuOpen(false);
    });
  }

  /* ---------- Sticky nav shadow on scroll ---------- */
  const siteNav = document.getElementById('siteNav');
  const onScroll = () => {
    if (!siteNav) return;
    if (window.scrollY > 12) {
      siteNav.style.boxShadow = '0 10px 30px -20px rgba(0,0,0,.6)';
    } else {
      siteNav.style.boxShadow = 'none';
    }
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll(
    '.service-card, .m-item, .why-item, .process-list li, .testi-card, .about-content, .about-visual, .contact-form, .contact-side, .offer-inner'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(el => observer.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Quote form ---------- */
  const quoteForm = document.getElementById('quoteForm');
  const formNote = document.getElementById('formNote');

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = quoteForm.name.value.trim();
      const phone = quoteForm.phone.value.trim();

      if (!name || !phone) {
        formNote.textContent = 'Please fill in your name and phone number.';
        return;
      }

      // Build a WhatsApp message from the form so the request reaches
      // MonMon Empire Printers instantly, with no backend required.
      const service = quoteForm.service.value;
      const quantity = quoteForm.quantity.value.trim();
      const message = quoteForm.message.value.trim();

      const text = [
        "Hi MonMon Empire Printers, I'd like a detailed quote for my project.",
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Service: ${service}`,
        quantity ? `Quantity: ${quantity}` : '',
        message ? `Project details: ${message}` : '',
        'Please include the total price, available customization options, estimated production time, and delivery or pickup details.',
        'Please let me know if you need any artwork or other information to prepare the quote.'
      ].filter(Boolean).join('\n');

      formNote.style.color = '#2f7a3d';
      formNote.textContent = 'Thanks! Opening WhatsApp so you can send us your request…';

      window.open(`https://wa.me/254758630928?text=${encodeURIComponent(text)}`, '_blank');
      quoteForm.reset();
    });
  }

});
