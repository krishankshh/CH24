/* CH24 — home page motion (pair picker & flip-box logic live in site.js) */

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

/* debug helpers: ?noanim disables motion, ?scroll=N jumps to offset */
const NOANIM = location.search.includes("noanim");
const SCROLL_TO = new URLSearchParams(location.search).get("scroll");
if (SCROLL_TO !== null) {
  document.documentElement.style.scrollBehavior = "auto";
  window.addEventListener("load", () => window.scrollTo(0, +SCROLL_TO));
}

/* ticker height drives the fixed-nav offset on photo-hero pages — measure the
   real box, not a guessed constant, and re-measure once the web font swaps in
   (FOUT can grow/shrink the ticker after the first paint) and on resize. */
(() => {
  const ticker = document.querySelector(".ticker");
  if (!ticker) return;
  const syncTickerHeight = () => document.documentElement.style.setProperty("--ticker-h", `${ticker.offsetHeight}px`);
  syncTickerHeight();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncTickerHeight);
  window.addEventListener("resize", syncTickerHeight);
})();

/* nav: merged/transparent over the hero photo, solid once it scrolls past. */
(() => {
  const hero = document.querySelector("[data-hero]");
  const nav = document.querySelector(".nav");
  if (!hero || !nav) return;
  const io = new IntersectionObserver(
    ([entry]) => nav.classList.toggle("nav--overlay", entry.isIntersecting),
    { rootMargin: `-${nav.offsetHeight}px 0px 0px 0px`, threshold: 0 }
  );
  io.observe(hero);
})();

if (!NOANIM)
mm.add("(prefers-reduced-motion: no-preference)", () => {

  /* hero: type lines slam in one after another */
  gsap.timeline({ defaults: { ease: "power4.out" } })
    .from(".hero__media img, .hero__media video", { scale: 1.12, duration: 1.4, ease: "power2.out" })
    .from(".hero__eyebrow", { opacity: 0, x: -30, duration: 0.5 }, "-=1")
    .from(".hero__line--1", { opacity: 0, x: -80, duration: 0.7 }, "-=0.35")
    .from(".hero__line--2", { opacity: 0, x: -80, duration: 0.7 }, "-=0.5")
    .from(".hero__line--3", { opacity: 0, x: -80, duration: 0.7 }, "-=0.5")
    .from(".hero__foot", { opacity: 0, y: 20, duration: 0.6 }, "-=0.3")
    .from(".hero__chip", { opacity: 0, y: -14, duration: 0.5 }, "-=0.5")
    .from(".hero__scroll", { opacity: 0, duration: 0.6 }, "-=0.4");

  /* hero photo: a genuine tactile response to the cursor (real interaction,
     not decoration) — desktop/mouse only, capped range, GSAP quickTo so it
     never queues up a backlog of tweens on fast mouse movement */
  mm.add("(hover: hover) and (pointer: fine)", () => {
    const media = document.querySelector("[data-hero-media]");
    const hero = document.querySelector(".hero");
    if (!media || !hero) return;
    const moveX = gsap.quickTo(media, "x", { duration: 0.7, ease: "power3.out" });
    const moveY = gsap.quickTo(media, "y", { duration: 0.7, ease: "power3.out" });
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      moveX(px * -20);
      moveY(py * -14);
    });
    hero.addEventListener("mouseleave", () => { moveX(0); moveY(0); });
  });

  /* mood panels reveal */
  gsap.set(".mood__panel", { opacity: 0, y: 30 });
  ScrollTrigger.batch(".mood__panel", {
    start: "top 88%",
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power3.out", overwrite: true })
  });

  /* flip-box cards reveal */
  gsap.set(".box-grid .box", { opacity: 0, y: 50 });
  ScrollTrigger.batch(".box-grid .box", {
    start: "top 88%",
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.65, stagger: 0.09, ease: "power3.out", overwrite: true })
  });

  /* format: pinned horizontal ritual (desktop only) */
  mm.add("(min-width: 641px)", () => {
    const track = document.querySelector(".format__track");
    if (track) gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: ".format__pin", pin: true, scrub: 1, start: "top top",
        end: () => "+=" + (track.scrollWidth - window.innerWidth), invalidateOnRefresh: true
      }
    });
  });

  /* manifesto: word-by-word scrub reveal */
  const manifesto = document.querySelector("[data-words]");
  if (manifesto) {
    manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(" ");
    gsap.to(".manifesto__text .w", {
      opacity: 1, stagger: 0.06, ease: "none",
      scrollTrigger: { trigger: ".manifesto", start: "top 75%", end: "bottom 60%", scrub: true }
    });
  }

  /* community cells drift in */
  gsap.set(".community__cell", { opacity: 0, y: 40 });
  ScrollTrigger.batch(".community__cell", {
    start: "top 88%",
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out", overwrite: true })
  });
});
