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

      var practice = link.getAttribute("data-practice");
      if (practice) {
        var select = document.getElementById("f-interest");
        if (select) {
          Array.prototype.forEach.call(select.options, function (opt) {
            if (opt.value === practice) select.value = practice;
          });
        }
      }
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
    ".principle, .engagement-card, .impact-col, .media-item, .process__step, " +
    ".equation, .pem-feature, .pem-card, .about__media, .about__copy, .contact-aside, .faq-item, .numbers-stat"
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

    // Safety net: never leave content permanently invisible (fast scrolls,
    // scroll-to-fragment, or any element the observer misses).
    window.setTimeout(function () {
      revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
      slideTargets.forEach(function (el) { el.classList.add("is-visible"); });
    }, 2500);
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
        window.setTimeout(function () { journeyList.classList.add("is-visible"); }, 2500);
      } else {
        journeyList.classList.add("is-visible");
      }
    }
  }

  /* ---------------- By the Numbers — count-up ---------------- */
  var statEls = document.querySelectorAll(".numbers-stat__value");
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

  /* ---------------- Contact form (mailto handoff + spam guards) ---------------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var loadedAt = Date.now();
    var status = document.getElementById("form-status");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot check
      var honey = form.querySelector('[name="company"]');
      if (honey && honey.value.trim() !== "") {
        return; // silently drop — likely automated
      }

      // Time-trap: submissions faster than 2.5s after load are treated as bots
      if (Date.now() - loadedAt < 2500) {
        status.textContent = "Please take a moment before sending — try again in a few seconds.";
        status.classList.add("is-error");
        return;
      }

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();

      if (!name || !email || !message) {
        status.textContent = "Please complete all required fields.";
        status.classList.add("is-error");
        return;
      }

      var lines = [
        "Name: " + name,
        "Title: " + (form.title.value.trim() || "—"),
        "Organization: " + (form.organization.value.trim() || "—"),
        "Email: " + email,
        "Organization Type: " + (form.organization_type.value || "—"),
        "Area of Interest: " + (form.area_of_interest.value || "—"),
        "",
        message,
      ];

      var subject = "Advisory Inquiry from " + name;
      var body = lines.join("\n");
      var mailto =
        "mailto:cdidio@carlodidio.net?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      status.classList.remove("is-error");
      status.textContent = "Thank you, " + name.split(" ")[0] + ". Opening your email application to send this message to Carlo.";
      window.location.href = mailto;
    });
  }
})();
