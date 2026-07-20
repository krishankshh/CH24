/* CH24 — home page motion (pair picker & shared behavior live in site.js) */

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

/* debug helpers: ?noanim disables motion, ?scroll=N jumps to offset */
const NOANIM = location.search.includes("noanim");
const SCROLL_TO = new URLSearchParams(location.search).get("scroll");
if (SCROLL_TO !== null) {
  document.documentElement.style.scrollBehavior = "auto";
  window.addEventListener("load", () => window.scrollTo(0, +SCROLL_TO));
}

/* nav: merged/transparent over the hero photo, solid once it scrolls past.
   Always on (not gated by reduced-motion) — it's a state flip, not
   decorative motion, and the transition collapses to near-instant under
   prefers-reduced-motion via the global CSS rule. */
(() => {
  const hero = document.querySelector("[data-hero]");
  const nav = document.querySelector(".nav");
  if (!hero || !nav) return;
  const ticker = document.querySelector(".ticker");
  if (ticker) document.documentElement.style.setProperty("--ticker-h", `${ticker.offsetHeight}px`);
  const io = new IntersectionObserver(
    ([entry]) => nav.classList.toggle("nav--overlay", entry.isIntersecting),
    { rootMargin: `-${nav.offsetHeight}px 0px 0px 0px`, threshold: 0 }
  );
  io.observe(hero);
})();

if (!NOANIM)
mm.add("(prefers-reduced-motion: no-preference)", () => {

  /* hero + intro load sequence */
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".hero-photo img", { scale: 1.1, duration: 1.3, ease: "power2.out" })
    .from(".hero-photo__scroll", { opacity: 0, duration: 0.6 }, "-=0.6")
    .from(".anim-eyebrow", { opacity: 0, y: 20, duration: 0.6 }, "-=0.6")
    .from(".intro__title", { opacity: 0, y: 30, duration: 0.7 }, "-=0.4")
    .from(".intro__row", { opacity: 0, y: 24, duration: 0.6 }, "-=0.4");

  /* mood tiles reveal + stagger */
  gsap.set(".mood__tile", { opacity: 0, y: 40 });
  ScrollTrigger.batch(".mood__tile", {
    start: "top 88%",
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out", overwrite: true })
  });

  /* product cards reveal */
  gsap.set(".product", { opacity: 0, y: 50 });
  ScrollTrigger.batch(".product", {
    start: "top 85%",
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out", overwrite: true })
  });

  /* format: pinned horizontal ritual (desktop only) */
  mm.add("(min-width: 641px)", () => {
    const track = document.querySelector(".format__track");
    gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: ".format__pin",
        pin: true,
        scrub: 1,
        start: "top top",
        end: () => "+=" + (track.scrollWidth - window.innerWidth),
        invalidateOnRefresh: true
      }
    });
  });

  /* manifesto: word-by-word scrub reveal */
  const manifesto = document.querySelector("[data-words]");
  if (manifesto) {
    manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/)
      .map(w => `<span class="w">${w}</span>`).join(" ");
    gsap.to(".manifesto__text .w", {
      opacity: 1,
      stagger: 0.06,
      ease: "none",
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
