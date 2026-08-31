(() => {
  "use strict";

  const I18N = window.CDO_I18N;
  const root = document.documentElement;
  const THEME_KEY = "cdo-theme";
  const LANG_KEY = "cdo-lang";
  let currentLang = localStorage.getItem(LANG_KEY) || I18N.defaultLang;

  /* ------------------------------------------------------------------ */
  /* Theme toggle                                                       */
  /* ------------------------------------------------------------------ */
  const themeToggle = document.getElementById("theme-toggle");

  function themeLabel(theme) {
    const dict = I18N.translations[currentLang] || I18N.translations.fr;
    return theme === "dark" ? dict.themeLight : dict.themeDark;
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    themeToggle.setAttribute("aria-label", themeLabel(theme));
  }

  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme) applyTheme(storedTheme);
  else applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  /* ------------------------------------------------------------------ */
  /* Language switcher                                                   */
  /* ------------------------------------------------------------------ */
  const langToggle = document.getElementById("lang-toggle");
  const langCode = document.getElementById("lang-code");
  const langMenu = document.getElementById("lang-menu");
  const langOptions = document.querySelectorAll(".lang-option");

  function applyLanguage(lang) {
    const dict = I18N.translations[lang] || I18N.translations[I18N.defaultLang];
    currentLang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });
    document.querySelectorAll("[data-i18n-label]").forEach((el) => {
      const key = el.getAttribute("data-i18n-label");
      if (dict[key] !== undefined) el.setAttribute("aria-label", dict[key]);
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      const key = el.getAttribute("data-i18n-alt");
      if (dict[key] !== undefined) el.setAttribute("alt", dict[key]);
    });

    if (dict.pageTitle) document.title = dict.pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict.pageDescription) metaDesc.setAttribute("content", dict.pageDescription);

    root.setAttribute("lang", lang);
    langCode.textContent = lang.toUpperCase();
    themeToggle.setAttribute("aria-label", themeLabel(root.getAttribute("data-theme")));
    menuToggle.setAttribute("aria-label", menuLabel(appEl.classList.contains("sidebar-open")));

    langOptions.forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", active);
      btn.closest("li").setAttribute("aria-selected", String(active));
    });

    localStorage.setItem(LANG_KEY, lang);
    restartTypedWords();
  }

  function closeLangMenu() {
    langMenu.hidden = true;
    langToggle.setAttribute("aria-expanded", "false");
  }
  function openLangMenu() {
    langMenu.hidden = false;
    langToggle.setAttribute("aria-expanded", "true");
  }

  langToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (langMenu.hidden) openLangMenu();
    else closeLangMenu();
  });

  langOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLanguage(btn.dataset.lang);
      closeLangMenu();
      langToggle.focus();
    });
  });

  document.addEventListener("click", (e) => {
    if (!langMenu.hidden && !e.target.closest(".lang-switch")) closeLangMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !langMenu.hidden) {
      closeLangMenu();
      langToggle.focus();
    }
  });

  /* ------------------------------------------------------------------ */
  /* Mobile sidebar drawer                                               */
  /* ------------------------------------------------------------------ */
  const appEl = document.querySelector(".app");
  const menuToggle = document.getElementById("menu-toggle");
  const sidebarBackdrop = document.getElementById("sidebar-backdrop");

  function menuLabel(open) {
    const dict = I18N.translations[currentLang] || I18N.translations.fr;
    return open ? dict.menuClose : dict.menuOpen;
  }

  function closeSidebar() {
    appEl.classList.remove("sidebar-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", menuLabel(false));
  }
  function openSidebar() {
    appEl.classList.add("sidebar-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", menuLabel(true));
  }

  menuToggle.addEventListener("click", () => {
    if (appEl.classList.contains("sidebar-open")) closeSidebar();
    else openSidebar();
  });
  sidebarBackdrop.addEventListener("click", closeSidebar);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && appEl.classList.contains("sidebar-open")) {
      closeSidebar();
      menuToggle.focus();
    }
  });

  /* ------------------------------------------------------------------ */
  /* Hero typed word rotation                                            */
  /* ------------------------------------------------------------------ */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const typedEl = document.getElementById("typed-word");
  const typedLabelEl = document.getElementById("typed-label");
  let typedInterval = null;
  let typedIndex = 0;

  function restartTypedWords() {
    if (!typedEl) return;
    const words = I18N.typedWords[currentLang] || I18N.typedWords[I18N.defaultLang];
    typedIndex = 0;
    typedEl.textContent = words[0].word;
    typedEl.style.opacity = "1";
    if (typedLabelEl) {
      typedLabelEl.textContent = words[0].label;
      typedLabelEl.style.opacity = "1";
    }

    if (typedInterval) clearInterval(typedInterval);
    if (prefersReducedMotion) return;

    typedEl.style.transition = "opacity 200ms ease";
    if (typedLabelEl) typedLabelEl.style.transition = "opacity 200ms ease";
    typedInterval = setInterval(() => {
      const list = I18N.typedWords[currentLang] || I18N.typedWords[I18N.defaultLang];
      typedIndex = (typedIndex + 1) % list.length;
      typedEl.style.opacity = "0";
      if (typedLabelEl) typedLabelEl.style.opacity = "0";
      setTimeout(() => {
        typedEl.textContent = list[typedIndex].word;
        typedEl.style.opacity = "1";
        if (typedLabelEl) {
          typedLabelEl.textContent = list[typedIndex].label;
          typedLabelEl.style.opacity = "1";
        }
      }, 200);
    }, 2600);
  }

  /* ------------------------------------------------------------------ */
  /* Main tabs                                                           */
  /* ------------------------------------------------------------------ */
  const tabButtons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".panel");

  tabButtons.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabButtons.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
        t.setAttribute("tabindex", "-1");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      tab.setAttribute("tabindex", "0");

      const targetId = tab.getAttribute("aria-controls");
      panels.forEach((panel) => {
        const active = panel.id === targetId;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });

      document.getElementById("panels").scrollTo({ top: 0, behavior: "auto" });

      updateConnectorLines();
    });
  });

  /* ------------------------------------------------------------------ */
  /* Connecting lines (Formation timeline & Quick profile)               */
  /* ------------------------------------------------------------------ */
  function updateConnectorLine(lineSelector, nodeSelector) {
    const line = document.querySelector(lineSelector);
    const nodes = document.querySelectorAll(nodeSelector);
    const container = line ? line.parentElement : null;
    if (!line || !container || nodes.length < 2) return;
    if (container.closest(".panel").hidden) return;

    const containerTop = container.getBoundingClientRect().top;
    const firstRect = nodes[0].getBoundingClientRect();
    const lastRect = nodes[nodes.length - 1].getBoundingClientRect();
    const firstCenter = firstRect.top + firstRect.height / 2 - containerTop;
    const lastCenter = lastRect.top + lastRect.height / 2 - containerTop;

    line.style.top = `${firstCenter}px`;
    line.style.height = `${lastCenter - firstCenter}px`;
  }

  function updateConnectorLines() {
    updateConnectorLine("#panel-edu .edu-line", "#panel-edu .edu-dot");
    updateConnectorLine("#panel-profile .quickprofile-line", "#panel-profile .quickprofile-node");
  }

  window.addEventListener("load", updateConnectorLines);
  window.addEventListener("resize", updateConnectorLines);

  /* ------------------------------------------------------------------ */
  /* Timeline accordion                                                  */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll("button.timeline-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".timeline-item");
      const isOpen = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  });

  /* ------------------------------------------------------------------ */
  /* Career helix (Mon parcours)                                         */
  /* ------------------------------------------------------------------ */
  const helixWrap = document.querySelector(".helix-v-wrap");
  if (helixWrap) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduceMotion && "IntersectionObserver" in window) {
      helixWrap.classList.add("reveal-pending");
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            helixWrap.classList.add("is-visible");
            observer.disconnect();
          }
        });
      }, { threshold: 0.35 });
      observer.observe(helixWrap);
    }

    const parallaxEl = helixWrap.querySelector(".helix-parallax");
    if (parallaxEl && !reduceMotion) {
      let ticking = false;
      const updateParallax = () => {
        ticking = false;
        const rect = helixWrap.getBoundingClientRect();
        const viewportH = window.innerHeight || document.documentElement.clientHeight;
        if (rect.bottom < 0 || rect.top > viewportH) return;
        const center = rect.top + rect.height / 2;
        const progress = (center - viewportH / 2) / viewportH;
        const offset = Math.max(-16, Math.min(16, progress * -16));
        parallaxEl.style.transform = `translateY(${offset}px)`;
      };
      const requestTick = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateParallax);
        }
      };
      document.getElementById("panels")?.addEventListener("scroll", requestTick, { passive: true });
      window.addEventListener("scroll", requestTick, { passive: true });
      window.addEventListener("resize", requestTick);
      updateParallax();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Portfolio filter                                                    */
  /* ------------------------------------------------------------------ */
  const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll("#portfolio-grid .card");
  const emptyState = document.getElementById("filter-empty");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");

      const filter = btn.dataset.filter;
      let visibleCount = 0;
      cards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !match);
        if (match) visibleCount++;
      });
      emptyState.hidden = visibleCount !== 0;
    });
  });

  /* ------------------------------------------------------------------ */
  /* Skills explorer                                                     */
  /* ------------------------------------------------------------------ */
  const skillCatButtons = document.querySelectorAll(".skill-cat-btn");
  const skillCatPanels = document.querySelectorAll(".skill-cat-panel");

  skillCatButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      skillCatButtons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      const cat = btn.dataset.cat;
      skillCatPanels.forEach((panel) => {
        panel.hidden = panel.dataset.catPanel !== cat;
      });
    });
  });

  /* ------------------------------------------------------------------ */
  /* Gradient bar color shuffle                                          */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll(".gradient-bar span").forEach((span, i) => {
    span.dataset.hue = String(i + 1);
    span.addEventListener("click", () => {
      const current = Number(span.dataset.hue);
      let next = current;
      while (next === current) next = 1 + Math.floor(Math.random() * 5);
      span.style.backgroundColor = `var(--hue${next})`;
      span.dataset.hue = String(next);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */
  applyLanguage(currentLang);
  updateConnectorLines();

  setTimeout(() => document.body.classList.remove("intro-run"), 2400);
})();
