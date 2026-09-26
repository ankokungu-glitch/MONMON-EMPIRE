// =========================================================
// MonMon Empire Printers — Site scripts
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Accessibility settings ---------- */
  const settingsStorageKey = 'monmon-accessibility-settings';
  const textSizeOptions = [
    { name: 'a', value: 1 },
    { name: 'a-plus', value: 1.1 },
    { name: 'a-double-plus', value: 1.2 }
  ];
  const defaultSettings = {
    textSize: 'a',
    highContrast: false,
    reduceMotion: false,
    underlineLinks: false
  };
  let settings = { ...defaultSettings };
  const accessibilityTools = document.querySelector('.accessibility-tools');
  const accessibilityToggle = document.getElementById('accessibilityToggle');
  const accessibilityPanel = document.getElementById('accessibilityPanel');

  try {
    const savedSettings = JSON.parse(localStorage.getItem(settingsStorageKey));
    if (savedSettings && typeof savedSettings === 'object') {
      settings = {
        textSize: textSizeOptions.some(option => option.name === savedSettings.textSize) ? savedSettings.textSize : 'a',
        highContrast: savedSettings.highContrast === true,
        reduceMotion: savedSettings.reduceMotion === true,
        underlineLinks: savedSettings.underlineLinks === true
      };
    }
  } catch {
    settings = { ...defaultSettings };
  }

  const applySettings = (persist = true) => {
    const textSize = textSizeOptions.find(option => option.name === settings.textSize) || textSizeOptions[0];
    const root = document.documentElement;
    root.style.setProperty('--text-scale', String(textSize.value));
    root.dataset.textSize = textSize.name;
    root.dataset.highContrast = String(settings.highContrast);
    root.dataset.reduceMotion = String(settings.reduceMotion);
    root.dataset.underlineLinks = String(settings.underlineLinks);
    document.querySelectorAll('[data-text-size]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.textSize === textSize.name));
    });
    document.getElementById('highContrast').setAttribute('aria-checked', String(settings.highContrast));
    document.getElementById('reduceMotion').setAttribute('aria-checked', String(settings.reduceMotion));
    document.getElementById('underlineLinks').setAttribute('aria-checked', String(settings.underlineLinks));
    if (persist) {
      try {
        localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
      } catch {
        // Preferences remain active for this page even if storage is unavailable.
      }
    }
  };

  applySettings(false);

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
    document.querySelectorAll('[data-text-size]').forEach(button => {
      button.addEventListener('click', () => {
        settings.textSize = button.dataset.textSize;
        applySettings();
      });
    });
    document.getElementById('highContrast').addEventListener('click', () => {
      settings.highContrast = !settings.highContrast;
      applySettings();
    });
    document.getElementById('reduceMotion').addEventListener('click', () => {
      settings.reduceMotion = !settings.reduceMotion;
      applySettings();
    });
    document.getElementById('underlineLinks').addEventListener('click', () => {
      settings.underlineLinks = !settings.underlineLinks;
      applySettings();
    });
    document.getElementById('accessibilityReset').addEventListener('click', () => {
      settings = { ...defaultSettings };
      applySettings();
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

});// =========================================================
// MonMon Empire Printers — Site scripts
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Accessibility settings ---------- */
  const settingsStorageKey = 'monmon-accessibility-settings';
  const textSizeOptions = [
    { name: 'a', value: 1 },
    { name: 'a-plus', value: 1.1 },
    { name: 'a-double-plus', value: 1.2 }
  ];
  const defaultSettings = {
    textSize: 'a',
    highContrast: false,
    reduceMotion: false,
    underlineLinks: false
  };
  let settings = { ...defaultSettings };
  const accessibilityTools = document.querySelector('.accessibility-tools');
  const accessibilityToggle = document.getElementById('accessibilityToggle');
  const accessibilityPanel = document.getElementById('accessibilityPanel');

  try {
    const savedSettings = JSON.parse(localStorage.getItem(settingsStorageKey));
    if (savedSettings && typeof savedSettings === 'object') {
      settings = {
        textSize: textSizeOptions.some(option => option.name === savedSettings.textSize) ? savedSettings.textSize : 'a',
        highContrast: savedSettings.highContrast === true,
        reduceMotion: savedSettings.reduceMotion === true,
        underlineLinks: savedSettings.underlineLinks === true
      };
    }
  } catch {
    settings = { ...defaultSettings };
  }

  const applySettings = (persist = true) => {
    const textSize = textSizeOptions.find(option => option.name === settings.textSize) || textSizeOptions[0];
    const root = document.documentElement;
    root.style.setProperty('--text-scale', String(textSize.value));
    root.dataset.textSize = textSize.name;
    root.dataset.highContrast = String(settings.highContrast);
    root.dataset.reduceMotion = String(settings.reduceMotion);
    root.dataset.underlineLinks = String(settings.underlineLinks);
    document.querySelectorAll('[data-text-size]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.textSize === textSize.name));
    });
    document.getElementById('highContrast').setAttribute('aria-checked', String(settings.highContrast));
    document.getElementById('reduceMotion').setAttribute('aria-checked', String(settings.reduceMotion));
    document.getElementById('underlineLinks').setAttribute('aria-checked', String(settings.underlineLinks));
    if (persist) {
      try {
        localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
      } catch {
        // Preferences remain active for this page even if storage is unavailable.
      }
    }
  };

  applySettings(false);

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
    document.querySelectorAll('[data-text-size]').forEach(button => {
      button.addEventListener('click', () => {
        settings.textSize = button.dataset.textSize;
        applySettings();
      });
    });
    document.getElementById('highContrast').addEventListener('click', () => {
      settings.highContrast = !settings.highContrast;
      applySettings();
    });
    document.getElementById('reduceMotion').addEventListener('click', () => {
      settings.reduceMotion = !settings.reduceMotion;
      applySettings();
    });
    document.getElementById('underlineLinks').addEventListener('click', () => {
      settings.underlineLinks = !settings.underlineLinks;
      applySettings();
    });
    document.getElementById('accessibilityReset').addEventListener('click', () => {
      settings = { ...defaultSettings };
      applySettings();
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

});// =========================================================
// MonMon Empire Printers — Site scripts
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Accessibility settings ---------- */
  const settingsStorageKey = 'monmon-accessibility-settings';
  const textSizeOptions = [
    { name: 'a', value: 1 },
    { name: 'a-plus', value: 1.1 },
    { name: 'a-double-plus', value: 1.2 }
  ];
  const defaultSettings = {
    textSize: 'a',
    highContrast: false,
    reduceMotion: false,
    underlineLinks: false
  };
  let settings = { ...defaultSettings };
  const accessibilityTools = document.querySelector('.accessibility-tools');
  const accessibilityToggle = document.getElementById('accessibilityToggle');
  const accessibilityPanel = document.getElementById('accessibilityPanel');

  try {
    const savedSettings = JSON.parse(localStorage.getItem(settingsStorageKey));
    if (savedSettings && typeof savedSettings === 'object') {
      settings = {
        textSize: textSizeOptions.some(option => option.name === savedSettings.textSize) ? savedSettings.textSize : 'a',
        highContrast: savedSettings.highContrast === true,
        reduceMotion: savedSettings.reduceMotion === true,
        underlineLinks: savedSettings.underlineLinks === true
      };
    }
  } catch {
    settings = { ...defaultSettings };
  }

  const applySettings = (persist = true) => {
    const textSize = textSizeOptions.find(option => option.name === settings.textSize) || textSizeOptions[0];
    const root = document.documentElement;
    root.style.setProperty('--text-scale', String(textSize.value));
    root.dataset.textSize = textSize.name;
    root.dataset.highContrast = String(settings.highContrast);
    root.dataset.reduceMotion = String(settings.reduceMotion);
    root.dataset.underlineLinks = String(settings.underlineLinks);
    document.querySelectorAll('[data-text-size]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.textSize === textSize.name));
    });
    document.getElementById('highContrast').setAttribute('aria-checked', String(settings.highContrast));
    document.getElementById('reduceMotion').setAttribute('aria-checked', String(settings.reduceMotion));
    document.getElementById('underlineLinks').setAttribute('aria-checked', String(settings.underlineLinks));
    if (persist) {
      try {
        localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
      } catch {
        // Preferences remain active for this page even if storage is unavailable.
      }
    }
  };

  applySettings(false);

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
    document.querySelectorAll('[data-text-size]').forEach(button => {
      button.addEventListener('click', () => {
        settings.textSize = button.dataset.textSize;
        applySettings();
      });
    });
    document.getElementById('highContrast').addEventListener('click', () => {
      settings.highContrast = !settings.highContrast;
      applySettings();
    });
    document.getElementById('reduceMotion').addEventListener('click', () => {
      settings.reduceMotion = !settings.reduceMotion;
      applySettings();
    });
    document.getElementById('underlineLinks').addEventListener('click', () => {
      settings.underlineLinks = !settings.underlineLinks;
      applySettings();
    });
    document.getElementById('accessibilityReset').addEventListener('click', () => {
      settings = { ...defaultSettings };
      applySettings();
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
