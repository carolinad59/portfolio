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

      document.body.classList.toggle("show-cv-subtabs", targetId === "panel-classique");

      document.getElementById("panels").scrollTo({ top: 0, behavior: "auto" });

      updateConnectorLines();
    });
  });

  /* ------------------------------------------------------------------ */
  /* "CV classique" sub-tabs — Expérience / Compétences / Projets /       */
  /* Formation, shown one at a time inside the merged tab.                */
  /* ------------------------------------------------------------------ */
  const subtabButtons = document.querySelectorAll(".subtab-btn");
  const subpanels = document.querySelectorAll(".cv-classique-subpanel");

  subtabButtons.forEach((tab) => {
    tab.addEventListener("click", () => {
      subtabButtons.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
        t.setAttribute("tabindex", "-1");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      tab.setAttribute("tabindex", "0");

      const targetId = tab.getAttribute("aria-controls");
      subpanels.forEach((panel) => {
        const active = panel.id === targetId;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });

      document.getElementById("panels").scrollTo({ top: 0, behavior: "auto" });

      if (targetId === "panel-edu") updateConnectorLines();
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

    /* Touch devices don't have a real :hover, and the replication-fork
       animation depends on it staying engaged for its whole (~1s+) timed
       sequence — a tap's :hover is too short-lived/unreliable for that.
       Tapping a node toggles a real .is-active class instead (the CSS
       already treats it exactly like :hover/:focus-visible everywhere),
       tapping it again or tapping elsewhere closes it. */
    const helixNodes = helixWrap.querySelectorAll(".helix-node");
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;
    const TOUCH_MOVE_THRESHOLD = 10; // px — beyond this, it's a scroll/drag, not a tap
    let lastToggleAt = 0;
    const TOGGLE_DEBOUNCE_MS = 400; // guards against a duplicate touch→click firing twice
    let forkOpenTimer = null;
    const isMobileHelix = () => window.matchMedia("(max-width: 640px)").matches;

    /* The strand-unwind shape, set via the CSS `d` property in style.css,
       wasn't rendering on some real iOS Safari devices even though it
       tested fine elsewhere — each path also carries a presentation
       `transform="translate(...)"` attribute, and that specific
       combination (CSS `d` override + attribute `transform`) is a
       plausible repaint gap in WebKit. Setting the `d` *attribute*
       directly is the oldest, most universally-supported way to change
       an SVG path's shape, so it sidesteps that combination entirely. */
    const FORK_OPEN_D_A = "M -107.5 -0.0 L -96.8 -36.6 L -86.0 -73.3 L -75.2 -75.0 L -64.5 -75.0 L -53.8 -75.0 L -43.0 -75.0 L -32.2 -75.0 L -21.5 -75.0 L -10.8 -75.0 L 0.0 -75.0 L 10.8 -75.0 L 21.5 -75.0 L 32.2 -75.0 L 43.0 -75.0 L 53.8 -75.0 L 64.5 -75.0 L 75.2 -75.0 L 86.0 -73.3 L 96.8 -36.6 L 107.5 -0.0";
    const FORK_OPEN_D_B = "M -107.5 0.0 L -96.8 36.6 L -86.0 73.3 L -75.2 75.0 L -64.5 75.0 L -53.8 75.0 L -43.0 75.0 L -32.2 75.0 L -21.5 75.0 L -10.8 75.0 L 0.0 75.0 L 10.8 75.0 L 21.5 75.0 L 32.2 75.0 L 43.0 75.0 L 53.8 75.0 L 64.5 75.0 L 75.2 75.0 L 86.0 73.3 L 96.8 36.6 L 107.5 0.0";
    const forkOriginalD = new WeakMap();
    const closeForkOpen = () => {
      helixNodes.forEach((n) => {
        n.classList.remove("fork-open");
        const a = n.querySelector(".helix-fork-morph-a");
        const b = n.querySelector(".helix-fork-morph-b");
        if (a && forkOriginalD.has(a)) a.setAttribute("d", forkOriginalD.get(a));
        if (b && forkOriginalD.has(b)) b.setAttribute("d", forkOriginalD.get(b));
      });
    };
    const openForkFor = (node) => {
      const a = node.querySelector(".helix-fork-morph-a");
      const b = node.querySelector(".helix-fork-morph-b");
      if (a && !forkOriginalD.has(a)) forkOriginalD.set(a, a.getAttribute("d"));
      if (b && !forkOriginalD.has(b)) forkOriginalD.set(b, b.getAttribute("d"));
      node.classList.add("fork-open");
      if (a) a.setAttribute("d", FORK_OPEN_D_A);
      if (b) b.setAttribute("d", FORK_OPEN_D_B);
    };

    helixNodes.forEach((node) => {
      node.addEventListener("touchstart", (e) => {
        touchMoved = false;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      node.addEventListener("touchmove", (e) => {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        if (Math.hypot(dx, dy) > TOUCH_MOVE_THRESHOLD) touchMoved = true;
      }, { passive: true });

      node.addEventListener("click", (e) => {
        if (touchMoved) {
          touchMoved = false;
          return;
        }
        /* On some iOS Safari versions a single tap can dispatch a second,
           near-instant "click" (e.g. a touch-derived one followed by a
           synthetic mouse-compat one). That second call would immediately
           re-toggle .is-active off — invisible for the hydrogen bonds
           (their fade has no delay) but fatal for the strand-unwind
           animation, which only starts 0.46s later and would never get to
           render at all. Ignoring a repeat within 400ms fixes both. */
        const now = performance.now();
        if (now - lastToggleAt < TOGGLE_DEBOUNCE_MS) return;
        lastToggleAt = now;
        const willOpen = !node.classList.contains("is-active");
        helixNodes.forEach((n) => n.classList.remove("is-active"));
        clearTimeout(forkOpenTimer);
        closeForkOpen();
        if (willOpen) {
          node.classList.add("is-active");
          if (isMobileHelix()) {
            /* node.scrollIntoView() lets the browser pick which ancestor to
               scroll and how — on iOS Safari that can silently misbehave
               inside a -webkit-overflow-scrolling: touch container, so
               instead this scrolls .helix-v-wrap itself directly, by
               exactly the distance needed to center the tapped node. */
            const wrapRect = helixWrap.getBoundingClientRect();
            const nodeRect = node.getBoundingClientRect();
            const delta = (nodeRect.left + nodeRect.width / 2) - (wrapRect.left + wrapRect.width / 2);
            helixWrap.scrollBy({ left: delta, behavior: "smooth" });

            /* The strand-unwind reveal is driven here instead of by CSS
               transition-delay (see style.css) — .is-active alone no
               longer shows it on mobile, this timer is what does. */
            forkOpenTimer = setTimeout(() => {
              openForkFor(node);
            }, 120);
          }
        }
        e.stopPropagation();
      });
    });
    document.addEventListener("click", () => {
      helixNodes.forEach((n) => n.classList.remove("is-active"));
      clearTimeout(forkOpenTimer);
      closeForkOpen();
    });
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
  /* Compétences 2 — interactive workstation scene                       */
  /* Hover shows a popup pinned beside the object and auto-hides on      */
  /* mouseleave; a click pins it until explicitly closed. Click always   */
  /* wins over hover — once pinned, hover/focus changes elsewhere are    */
  /* ignored until the popup is closed via the × or an outside click.    */
  /* ------------------------------------------------------------------ */
  const comp2Panel = document.getElementById("panel-comp2");
  if (comp2Panel) {
    const popup = document.getElementById("comp2Popup");
    const popupCat = document.getElementById("comp2PopupCat");
    const popupSkills = document.getElementById("comp2PopupSkills");
    const popupClose = document.getElementById("comp2PopupClose");
    const dataRoot = comp2Panel.querySelector(".comp2-data");
    let pinned = false;
    let activeEl = null;
    let hideTimer = null;

    function positionPopup(el) {
      const rect = el.getBoundingClientRect();
      const margin = 12;
      const edge = 10;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const popRect = popup.getBoundingClientRect();
      const spaceRight = vw - rect.right;
      const spaceLeft = rect.left;
      let left;
      if (spaceRight >= popRect.width + margin || spaceRight >= spaceLeft) {
        left = rect.right + margin;
        if (left + popRect.width > vw - edge) left = vw - popRect.width - edge;
      } else {
        left = rect.left - margin - popRect.width;
      }
      left = Math.max(edge, Math.min(left, vw - popRect.width - edge));
      let top = rect.top + rect.height / 2 - popRect.height / 2;
      top = Math.max(edge, Math.min(top, vh - popRect.height - edge));
      popup.style.left = `${left}px`;
      popup.style.top = `${top}px`;
    }

    function fillContent(el) {
      const key = el.dataset.skill;
      const cat = el.dataset.cat;
      const catEl = dataRoot.querySelector(`.comp2-cat-label[data-cat="${cat}"]`);
      const skillsEl = dataRoot.querySelector(`ul[data-key="${key}"]`);
      popupCat.textContent = catEl ? catEl.textContent : "";
      popupSkills.innerHTML = skillsEl ? skillsEl.innerHTML : "";
      popup.style.setProperty("--comp2-cat-color", `var(--comp2-${cat})`);
    }

    function openFor(el, pin) {
      if (pinned && !pin && el !== activeEl) return;
      clearTimeout(hideTimer);
      activeEl = el;
      if (pin) pinned = true;
      fillContent(el);
      popup.hidden = false;
      requestAnimationFrame(() => {
        positionPopup(el);
        popup.classList.add("is-open");
      });
    }

    function closePopup(force) {
      if (pinned && !force) return;
      pinned = false;
      activeEl = null;
      popup.classList.remove("is-open");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (!popup.classList.contains("is-open")) popup.hidden = true;
      }, 200);
    }

    comp2Panel.querySelectorAll(".comp2-obj").forEach((el) => {
      el.addEventListener("mouseenter", () => { if (!pinned) openFor(el, false); });
      el.addEventListener("mouseleave", () => { if (!pinned) closePopup(false); });
      el.addEventListener("focus", () => { if (!pinned) openFor(el, false); });
      el.addEventListener("blur", () => { if (!pinned) closePopup(false); });
      el.addEventListener("click", () => openFor(el, true));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openFor(el, true);
        }
      });
    });

    popupClose.addEventListener("click", () => closePopup(true));
    document.addEventListener("click", (e) => {
      if (!pinned) return;
      if (popup.contains(e.target)) return;
      if (e.target.closest && e.target.closest(".comp2-obj")) return;
      closePopup(true);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && pinned) closePopup(true);
    });
    const repositionIfOpen = () => {
      if (activeEl && popup.classList.contains("is-open")) positionPopup(activeEl);
    };
    window.addEventListener("resize", repositionIfOpen);
    window.addEventListener("scroll", repositionIfOpen, true);
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */
  applyLanguage(currentLang);
  updateConnectorLines();

  setTimeout(() => document.body.classList.remove("intro-run"), 2400);
})();
