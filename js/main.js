(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ----- Header shadow + mobile nav ----- */
  const header = $("#header");
  const nav = $("#nav");
  const toggle = $("#navToggle");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const closeNav = () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$("a", nav).forEach((a) => a.addEventListener("click", closeNav));

  /* ----- Active nav link on scroll ----- */
  const links = $$(".nav__link");
  const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${e.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ----- Hero slider ----- */
  const slides = $$(".slide");
  const dotsWrap = $("#heroDots");
  let current = 0;
  let timer;

  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Go to banner ${i + 1}`);
    b.addEventListener("click", () => go(i, true));
    dotsWrap.appendChild(b);
  });
  const dots = $$("button", dotsWrap);

  function go(i, user = false) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("is-active", idx === current));
    dots.forEach((d, idx) => d.classList.toggle("is-active", idx === current));
    if (user) restart();
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(current + 1), 6000);
  }

  $("#heroPrev").addEventListener("click", () => go(current - 1, true));
  $("#heroNext").addEventListener("click", () => go(current + 1, true));

  let touchX = null;
  const hero = $(".hero");
  hero.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  hero.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1), true);
    touchX = null;
  });
  hero.addEventListener("mouseenter", () => clearInterval(timer));
  hero.addEventListener("mouseleave", restart);

  go(0);
  restart();

  /* ----- Client tabs ----- */
  const tabs = $$("#clientTabs .tab");
  const clients = $$("#clientGrid .client");
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      const f = tab.dataset.filter;
      clients.forEach((c) => {
        const show = f === "all" || c.dataset.cat === f;
        c.classList.toggle("is-hidden", !show);
        c.classList.remove("is-in");
        if (show) {
          void c.offsetWidth;
          c.classList.add("is-in");
        }
      });
    })
  );

  /* ----- Count-up stats ----- */
  const counters = $$("[data-count]");
  const countObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = +el.dataset.count;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / 1400, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => countObs.observe(c));

  /* ----- Reveal on scroll ----- */
  const revealTargets = $$(".section__head, .client-grid, .testimonial, .service, .post, .cta__inner, .contact__info, .contact__form");
  revealTargets.forEach((el) => el.classList.add("reveal"));
  const revealObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        obs.unobserve(e.target);
      });
    },
    { threshold: 0.12 }
  );
  revealTargets.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 80}ms`;
    revealObs.observe(el);
  });

  /* ----- Contact form (front-end only until a backend is connected) ----- */
  const form = $("#contactForm");
  const note = $("#formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    $$("[required]", form).forEach((f) => {
      const ok = f.value.trim() !== "" && f.checkValidity();
      f.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });
    note.className = "form-note " + (valid ? "ok" : "err");
    note.textContent = valid
      ? "Thanks! Your message has been sent. We'll get back to you within one business day."
      : "Please fill in your name, a valid email and a message.";
    if (valid) form.reset();
  });

  $("#newsletter").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("input", e.target);
    input.value = "";
    input.placeholder = "Subscribed, thank you!";
  });

  $("#year").textContent = new Date().getFullYear();
})();
