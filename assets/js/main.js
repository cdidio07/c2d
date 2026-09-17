(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Intro splash ---------------- */
  var splash = document.getElementById("splash");
  if (splash) {
    var html = document.documentElement;
    var skipBtn = document.getElementById("splash-skip");
    var dismissed = false;

    function dismissSplash() {
      if (dismissed) return;
      dismissed = true;
      splash.classList.add("is-leaving");
      html.classList.remove("splash-lock");
      window.setTimeout(function () {
        splash.hidden = true;
      }, reduceMotion ? 0 : 650);
    }

    if (reduceMotion) {
      dismissSplash();
    } else {
      splash.classList.add("is-active");
      html.classList.add("splash-lock");
      window.setTimeout(dismissSplash, 5600);
      if (skipBtn) {
        skipBtn.addEventListener("click", dismissSplash);
        skipBtn.focus({ preventScroll: true });
      }
      splash.addEventListener("click", function (e) {
        if (e.target === splash) dismissSplash();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") dismissSplash();
      });
    }
  }

  /* ---------------- Mobile nav ---------------- */
  var toggle = document.getElementById("nav-toggle");
  var mobileMenu = document.getElementById("mobile-menu");

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
  }
  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------------- Smooth anchor scroll w/ focus management ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href").slice(1);
      var target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      window.setTimeout(function () {
        if (!target.hasAttribute("tabindex")) {
          target.setAttribute("tabindex", "-1");
        }
        target.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 500);
    });
  });

  /* ---------------- Active nav link on scroll ---------------- */
  var navLinks = document.querySelectorAll(".nav__links a");
  var navSections = ["home", "model", "services", "about", "impact", "media", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (navSections.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    navSections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------------- Reveal on scroll ---------------- */
  var revealTargets = document.querySelectorAll(
    ".principle, .impact-col, .media-item, .process__step, " +
    ".equation, .pem-feature, .faq-item, .numbers-stat"
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  var slideTargets = document.querySelectorAll(".slide-in");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px 200px 0px" }
    );
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
    slideTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
    slideTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------- Relationship Lifecycle — staggered reveal ---------------- */
  var journeyList = document.querySelector(".journey");
  if (journeyList) {
    if (reduceMotion) {
      journeyList.classList.add("is-visible");
    } else {
      journeyList.classList.add("js-stagger");
      if ("IntersectionObserver" in window) {
        var journeyObserver = new IntersectionObserver(
          function (entries, obs) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                journeyList.classList.add("is-visible");
                obs.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.2 }
        );
        journeyObserver.observe(journeyList);
      } else {
        journeyList.classList.add("is-visible");
      }
    }
  }

  /* ---------------- Engagement carousel ---------------- */
  var engScroll = document.getElementById("engagement-scroll");
  if (engScroll) {
    document.querySelectorAll(".engagement-controls__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dir = parseInt(btn.getAttribute("data-dir"), 10);
        var card = engScroll.querySelector(".engagement-card");
        var amount = card ? card.getBoundingClientRect().width + 24 : 320;
        engScroll.scrollBy({ left: amount * dir, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });

    var engCards = engScroll.querySelectorAll(".engagement-card");
    var engSpacerStart = engScroll.querySelector(".engagement-spacer--start");
    var engSpacerEnd = engScroll.querySelector(".engagement-spacer--end");
    if (engCards.length) {
      var engTicking = false;
      function updateEngScale() {
        if (reduceMotion) return;
        var containerRect = engScroll.getBoundingClientRect();
        var centerX = containerRect.left + containerRect.width / 2;
        engCards.forEach(function (card) {
          var r = card.getBoundingClientRect();
          var cardCenter = r.left + r.width / 2;
          var dist = Math.abs(centerX - cardCenter);
          var maxDist = containerRect.width / 2 + r.width / 2;
          var ratio = Math.min(dist / maxDist, 1);
          var scale = 1 - ratio * 0.16;
          var opacity = 1 - ratio * 0.45;
          card.style.transform = "scale(" + scale.toFixed(3) + ")";
          card.style.opacity = opacity.toFixed(3);
        });
        engTicking = false;
      }
      function onEngScroll() {
        if (!engTicking) {
          window.requestAnimationFrame(updateEngScale);
          engTicking = true;
        }
      }
      function setEngSpacers() {
        if (!engSpacerStart || !engSpacerEnd || !engCards.length) return 0;
        var cardWidth = parseFloat(window.getComputedStyle(engCards[0]).width) || 0;
        var pad = Math.max(0, (engScroll.clientWidth - cardWidth) / 2);
        engSpacerStart.style.width = pad + "px";
        engSpacerEnd.style.width = pad + "px";
        return pad;
      }
      setEngSpacers();
      engScroll.scrollLeft = 0;
      updateEngScale();
      engScroll.addEventListener("scroll", onEngScroll, { passive: true });
      window.addEventListener("resize", function () {
        setEngSpacers();
        onEngScroll();
      });
    }
  }

  /* ---------------- Model — sticky scrollytelling ---------------- */
  var pemPanels = document.querySelectorAll(".pem-panel");
  var pemNavItems = document.querySelectorAll(".pem-nav__item");
  if (pemPanels.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var pemObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var idx = entry.target.getAttribute("data-pem-panel");
              pemPanels.forEach(function (p) { p.classList.remove("is-active"); });
              entry.target.classList.add("is-active");
              pemNavItems.forEach(function (item) {
                item.classList.toggle("is-active", item.getAttribute("data-pem-nav") === idx);
              });
            }
          });
        },
        { threshold: 0.01, rootMargin: "-40% 0px -40% 0px" }
      );
      pemPanels.forEach(function (p) { pemObserver.observe(p); });
    } else {
      pemPanels.forEach(function (p) { p.classList.add("is-active"); });
    }
  }

  /* ---------------- By the Numbers — count-up ---------------- */
  var statEls = document.querySelectorAll(".numbers-stat__value, .hero__chip-value");
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count-to"), 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion || isNaN(target)) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = prefix + value + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  if (statEls.length) {
    if ("IntersectionObserver" in window) {
      var statObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCount(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      statEls.forEach(function (el) { statObserver.observe(el); });
    } else {
      statEls.forEach(runCount);
    }
  }

  /* ---------------- Services tabs ---------------- */
  var tabList = document.querySelector(".tabs__list");
  if (tabList) {
    var tabs = Array.prototype.slice.call(tabList.querySelectorAll('[role="tab"]'));
    var panelsWrap = document.querySelector(".tabs__panels");

    function selectTab(tab) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", selected ? "true" : "false");
        t.tabIndex = selected ? 0 : -1;
        t.classList.toggle("is-active", selected);
      });
      var targetId = tab.getAttribute("aria-controls");
      panelsWrap.querySelectorAll('[role="tabpanel"]').forEach(function (p) {
        var show = p.id === targetId;
        p.hidden = !show;
        p.classList.toggle("is-active", show);
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { selectTab(tab); });
      tab.addEventListener("keydown", function (e) {
        var newIndex = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") newIndex = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") newIndex = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") newIndex = 0;
        if (e.key === "End") newIndex = tabs.length - 1;
        if (newIndex !== null) {
          e.preventDefault();
          tabs[newIndex].focus();
          selectTab(tabs[newIndex]);
        }
      });
    });
  }

  /* ---------------- Sticky header shrink shadow ---------------- */
  var header = document.getElementById("site-header");
  if (header) {
    var lastState = false;
    window.addEventListener(
      "scroll",
      function () {
        var scrolled = window.scrollY > 12;
        if (scrolled !== lastState) {
          header.style.boxShadow = scrolled ? "0 8px 24px -12px rgba(0,0,0,.45)" : "none";
          lastState = scrolled;
        }
      },
      { passive: true }
    );
  }

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
