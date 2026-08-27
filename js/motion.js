(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const FINE = window.matchMedia("(pointer: fine)").matches;

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
    if (!card || !FINE) return;
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
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      tx = (px - 0.5) * MAX * 2;
      ty = (0.5 - py) * MAX * 2;
      card.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
      kick();
    });
    card.addEventListener("mouseleave", function () {
      tx = 0;
      ty = 0;
      kick();
    });
  }

  function initMagnet() {
    if (!FINE) return;
    const btns = Array.from(document.querySelectorAll(".btn"));
    if (!btns.length) return;
    let mx = -9999;
    let my = -9999;
    let raf = null;
    let lastMove = 0;
    function loop() {
      let settled = true;
      btns.forEach(function (b) {
        const r = b.getBoundingClientRect();
        const cxp = r.left + r.width / 2;
        const cyp = r.top + r.height / 2;
        const dx = mx - cxp;
        const dy = my - cyp;
        const reach = Math.max(r.width, r.height) / 2 + 52;
        const dist = Math.hypot(dx, dy);
        let txx = 0;
        let tyy = 0;
        if (dist < reach) {
          const pull = 1 - dist / reach;
          const ease = pull * pull * (3 - 2 * pull);
          txx = Math.max(-9, Math.min(9, dx * 0.22 * ease));
          tyy = Math.max(-7, Math.min(7, dy * 0.22 * ease));
        }
        const prev = b._mag || { x: 0, y: 0 };
        const nx = prev.x + (txx - prev.x) * 0.18;
        const ny = prev.y + (tyy - prev.y) * 0.18;
        b._mag = { x: nx, y: ny };
        if (Math.abs(nx) > 0.08 || Math.abs(ny) > 0.08) settled = false;
        b.style.transform =
          Math.abs(nx) < 0.08 && Math.abs(ny) < 0.08 ? "" : "translate(" + nx.toFixed(2) + "px," + ny.toFixed(2) + "px)";
      });
      if (!settled || performance.now() - lastMove < 90) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }
    function kick() {
      if (!raf) raf = requestAnimationFrame(loop);
    }
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      lastMove = performance.now();
      kick();
    });
  }

  function initDepth() {
    const secs = Array.from(document.querySelectorAll("body > section"));
    if (!secs.length) return;
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("revealed");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    secs.forEach(function (s) {
      io.observe(s);
    });
  }

  function initSmoothScroll() {
    if (!FINE) return;
    const root = document.documentElement;
    root.style.scrollBehavior = "auto";
    let cur = window.scrollY;
    let tgt = cur;
    let raf = null;
    let lastWheel = 0;
    function maxScroll() {
      return root.scrollHeight - window.innerHeight;
    }
    function loop() {
      tgt = Math.max(0, Math.min(maxScroll(), tgt));
      cur += (tgt - cur) * 0.105;
      if (Math.abs(tgt - cur) < 0.5) cur = tgt;
      window.scrollTo(0, cur);
      if (cur !== tgt || performance.now() - lastWheel < 150) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }
    function wake() {
      if (!raf) raf = requestAnimationFrame(loop);
    }
    window.addEventListener(
      "wheel",
      function (e) {
        if (e.ctrlKey) return;
        e.preventDefault();
        let d = e.deltaY;
        if (e.deltaMode === 1) d *= 33;
        if (performance.now() - lastWheel > 300) {
          cur = window.scrollY;
          tgt = window.scrollY;
        }
        lastWheel = performance.now();
        tgt += d;
        wake();
      },
      { passive: false }
    );
    window.addEventListener(
      "scroll",
      function () {
        if (raf === null && Math.abs(window.scrollY - cur) > 2) {
          cur = window.scrollY;
          tgt = window.scrollY;
        }
      },
      { passive: true }
    );
    document.addEventListener(
      "click",
      function (e) {
        const a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (!a) return;
        const id = a.getAttribute("href").slice(1);
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        if (performance.now() - lastWheel > 300) cur = window.scrollY;
        tgt = el.getBoundingClientRect().top + window.scrollY - 74;
        lastWheel = performance.now();
        wake();
      },
      false
    );
  }

  function initOdometer() {
    const stats = document.querySelectorAll(".proof-item strong");
    if (!stats.length) return;
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          spin(en.target);
        });
      },
      { threshold: 0.6 }
    );
    stats.forEach(function (s) {
      io.observe(s);
    });
    function spin(el) {
      const txt = el.textContent.trim();
      el.textContent = "";
      Array.from(txt).forEach(function (ch, idx) {
        if (!/\d/.test(ch)) {
          const s = document.createElement("span");
          s.textContent = ch;
          el.appendChild(s);
          return;
        }
        const reel = document.createElement("span");
        reel.className = "dg";
        const stk = document.createElement("span");
        stk.className = "stk";
        for (let k = 0; k <= 10; k++) {
          const i = document.createElement("i");
          i.textContent = String(k % 10);
          stk.appendChild(i);
        }
        reel.appendChild(stk);
        el.appendChild(reel);
        const finalIdx = Number(ch) === 0 ? 10 : Number(ch);
        setTimeout(function () {
          stk.style.transform = "translateY(-" + finalIdx + "em)";
        }, 160 + idx * 85);
      });
    }
  }

  function initSpotlight() {
    if (!FINE) return;
    document.addEventListener("mousemove", function (e) {
      const zone = e.target.closest ? e.target.closest(".hero, .band-ink, .site-footer") : null;
      if (!zone) return;
      const r = zone.getBoundingClientRect();
      zone.style.setProperty("--sx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
      zone.style.setProperty("--sy", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
    });
  }

  function initParallax() {
    const els = Array.from(document.querySelectorAll("[data-plx]"));
    if (!els.length) return;
    let items = [];
    function measure() {
      items = els.map(function (el) {
        el.style.transform = "";
        const r = el.getBoundingClientRect();
        return {
          el: el,
          f: parseFloat(el.dataset.plx) || 0,
          top: r.top + window.scrollY,
          h: r.height,
        };
      });
    }
    function tick() {
      const probe = window.scrollY + window.innerHeight / 2;
      items.forEach(function (it) {
        const off = (probe - (it.top + it.h / 2)) * it.f;
        it.el.style.transform = "translate3d(0," + off.toFixed(1) + "px,0)";
      });
    }
    measure();
    tick();
    let ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(function () {
            ticking = false;
            tick();
          });
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", function () {
      measure();
      tick();
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
    if (!wrap || !FINE) return;
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
  initMagnet();
  initDepth();
  initSmoothScroll();
  initOdometer();
  initSpotlight();
  initParallax();
  initReveals();
  initTrail();
  initDoors();
})();
