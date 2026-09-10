(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  function initSmoothScroll() {
    document.addEventListener("click", function (event) {
      const link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
      if (!link) return;
      const target = document.getElementById(link.getAttribute("href").slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }

  function initTrail() {
    const trail = document.querySelector(".trail");
    const fill = trail && trail.querySelector(".rail-fill");
    if (!trail || !fill || reduceMotion) return;
    const nodes = Array.from(trail.querySelectorAll(".tl-node"));
    let queued = false;
    function update() {
      queued = false;
      const bounds = trail.getBoundingClientRect();
      const probe = window.innerHeight * 0.55;
      const progress = Math.max(0, Math.min(1, (probe - bounds.top) / bounds.height));
      fill.style.transform = "scaleY(" + progress + ")";
      nodes.forEach(function (node) {
        if (!node.classList.contains("hit")) {
          const rect = node.getBoundingClientRect();
          if (rect.top + rect.height * 0.5 <= probe) node.classList.add("hit");
        }
      });
    }
    function queueUpdate() {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    update();
  }

  function initHeaderMotion() {
    const header = document.querySelector(".site-header");
    if (!header || reduceMotion) return;
    let queued = false;
    function update() {
      queued = false;
      header.classList.toggle("header-scrolled", window.scrollY > 18);
    }
    window.addEventListener("scroll", function () {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  function initCardMotion() {
    if (!finePointer || reduceMotion) return;
    const selector = ".compass-site .program-card, .compass-site .team-card, .compass-site .age-card, .compass-site .door, .compass-site .post-row, .compass-site .trail li > div, .compass-site .trio > div, .compass-site .form-card";
    document.querySelectorAll(selector).forEach(function (card) {
      card.classList.add("motion-card");
      card.addEventListener("pointermove", function (event) {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tilt-x", (-y * 2.5).toFixed(2) + "deg");
        card.style.setProperty("--tilt-y", (x * 3).toFixed(2) + "deg");
        card.style.setProperty("--glow-x", ((x + 0.5) * 100).toFixed(0) + "%");
        card.style.setProperty("--glow-y", ((y + 0.5) * 100).toFixed(0) + "%");
      });
      card.addEventListener("pointerleave", function () {
        ["--tilt-x", "--tilt-y", "--glow-x", "--glow-y"].forEach(function (property) {
          card.style.removeProperty(property);
        });
      });
    });
  }

  function initCompassMotion() {
    if (!document.body.classList.contains("compass-site")) return;
    document.body.classList.add("motion-ready");
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const selector = ".compass-site main > section:not(.compass-hero):not(.page-hero), .compass-site .program-card, .compass-site .team-card, .compass-site .age-card, .compass-site .door, .compass-site .post-row, .compass-site .trail li > div, .compass-site .trio > div, .compass-site .faq details, .compass-site .form-card";
    const blocks = Array.from(new Set(Array.from(document.querySelectorAll(selector))));
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("motion-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    blocks.forEach(function (element, index) {
      element.classList.add("motion-block");
      element.style.setProperty("--motion-delay", Math.min(index * 35, 180) + "ms");
      observer.observe(element);
    });
  }

  initSmoothScroll();
  initTrail();
  initHeaderMotion();
  initCardMotion();
  initCompassMotion();
})();
