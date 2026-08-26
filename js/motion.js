(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function playTracker() {
    const tracker = document.querySelector(".tracker");
    if (!tracker) return;
    const rows = Array.from(tracker.querySelectorAll(".trow"));
    const streak = tracker.querySelector(".tracker-foot b");
    tracker.classList.add("playing");
    rows.forEach(function (row, i) {
      setTimeout(function () {
        row.classList.add("lit");
      }, 550 + i * 430);
    });
    setTimeout(function () {
      tracker.classList.add("played");
      let n = 0;
      const iv = setInterval(function () {
        n += 1;
        streak.textContent = n + "/6 weeks";
        if (n >= 5) clearInterval(iv);
      }, 120);
    }, 550 + rows.length * 430 + 150);
  }

  function tiltTracker() {
    const card = document.querySelector(".tracker");
    if (!card || !window.matchMedia("(pointer: fine)").matches) return;
    const MAX = 5;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = null;
    function loop() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      card.style.transform =
        "perspective(900px) rotateX(" + cy.toFixed(2) + "deg) rotateY(" + cx.toFixed(2) + "deg)";
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }
    function kick() {
      if (!raf) raf = requestAnimationFrame(loop);
    }
    card.addEventListener("mousemove", function (e) {
      const r = card.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * MAX * 2;
      ty = (0.5 - (e.clientY - r.top) / r.height) * MAX * 2;
      kick();
    });
    card.addEventListener("mouseleave", function () {
      tx = 0;
      ty = 0;
      kick();
    });
  }

  function initReveals() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    const obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("inview");
            obs.unobserve(en.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    els.forEach(function (el) {
      obs.observe(el);
    });
  }

  function initTrail() {
    const trail = document.querySelector(".trail");
    if (!trail) return;
    const fill = trail.querySelector(".rail-fill");
    const nodes = Array.from(trail.querySelectorAll(".tl-node"));
    let ticking = false;
    function update() {
      ticking = false;
      const r = trail.getBoundingClientRect();
      const probe = window.innerHeight * 0.55;
      const p = clamp01((probe - r.top) / r.height);
      fill.style.transform = "scaleY(" + p + ")";
      nodes.forEach(function (n) {
        if (!n.classList.contains("hit")) {
          const nr = n.getBoundingClientRect();
          if (nr.top + nr.height * 0.5 <= probe) n.classList.add("hit");
        }
      });
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", update);
    update();
  }

  function initDoors() {
    const wrap = document.querySelector(".doors");
    if (!wrap || !window.matchMedia("(pointer: fine)").matches) return;
    const cards = Array.from(wrap.querySelectorAll(".door"));
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        const r = card.getBoundingClientRect();
        const rx = (0.5 - (e.clientY - r.top) / r.height) * 6;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
        card.style.transform =
          "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
        cards.forEach(function (other) {
          if (other !== card) {
            other.style.transform =
              "perspective(900px) rotateY(" + (ry > 0 ? "-4" : "4") + "deg)";
            other.style.opacity = "0.85";
          }
        });
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
        cards.forEach(function (other) {
          other.style.transform = "";
          other.style.opacity = "";
        });
      });
    });
  }

  playTracker();
  tiltTracker();
  initReveals();
  initTrail();
  initDoors();
})();
