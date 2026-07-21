/* CH24 Version 3 — Homepage & Page Animations.
   Uses GSAP & ScrollTrigger to bring the Brutalist Grid and Sleeves to life. */

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();
const NOANIM = location.search.includes("noanim");

// Adjust fixed navigation properties based on ticker height
(() => {
  const ticker = document.querySelector(".ticker");
  if (!ticker) return;
  const syncTickerHeight = () => {
    document.documentElement.style.setProperty("--ticker-h", `${ticker.offsetHeight}px`);
  };
  syncTickerHeight();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncTickerHeight);
  }
  window.addEventListener("resize", syncTickerHeight);
})();

if (!NOANIM) {
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // 1. Hero Entrance Timeline
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    
    // Draw grid lines (using layout opacity/scale simulation)
    tl.from(".hero-v3__text", { opacity: 0, x: -30, duration: 0.8 })
      .from(".hero-v3__media", { opacity: 0, scale: 1.05, duration: 1.2 }, "-=0.6")
      .from(".hero-v3__sidebar", { opacity: 0, x: 30, duration: 0.8 }, "-=0.8")
      .from(".hero-v3__headline", { y: 40, opacity: 0, duration: 0.8 }, "-=0.4")
      .from(".hero-v3__desc", { y: 20, opacity: 0, duration: 0.6 }, "-=0.5")
      .from(".hero-v3__cta-row", { y: 15, opacity: 0, duration: 0.5 }, "-=0.4")
      .from(".hero-v3__chip", { opacity: 0, y: -10, duration: 0.4 }, "-=0.8")
      .from(".hero-v3__spec-item", { opacity: 0, y: 10, stagger: 0.1, duration: 0.5 }, "-=0.5");

    // 2. Mouse parallax on the hero image/video media
    mm.add("(hover: hover) and (pointer: fine)", () => {
      const hero = document.querySelector(".hero-v3");
      const media = document.querySelector(".hero-v3__media img, .hero-v3__media video");
      if (hero && media) {
        const moveX = gsap.quickTo(media, "xPercent", { duration: 0.8, ease: "power3.out" });
        const moveY = gsap.quickTo(media, "yPercent", { duration: 0.8, ease: "power3.out" });
        
        hero.addEventListener("mousemove", (e) => {
          const r = hero.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          
          // Subtle translation offsets within bounds
          moveX(px * -5);
          moveY(py * -5);
        });
        
        hero.addEventListener("mouseleave", () => {
          moveX(0);
          moveY(0);
        });
      }
    });

    // 3. Batch reveal of the Scent Sleeve cards in the grid
    gsap.set(".sleeve-card", { opacity: 0, y: 40 });
    ScrollTrigger.batch(".sleeve-card", {
      start: "top 88%",
      once: true,
      onEnter: (els) => {
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          overwrite: true
        });
      }
    });

    // 4. Batch reveal of the Mood Switcher items
    gsap.set(".mood-v3__item", { opacity: 0, x: -30 });
    ScrollTrigger.batch(".mood-v3__item", {
      trigger: ".mood-v3",
      start: "top 85%",
      once: true,
      onEnter: (els) => {
        gsap.to(els, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out"
        });
      }
    });

    // 5. Community Grid image cell fades
    const cells = document.querySelectorAll(".community-cell");
    if (cells.length > 0) {
      gsap.set(".community-cell", { opacity: 0, y: 30 });
      ScrollTrigger.batch(".community-cell", {
        start: "top 90%",
        once: true,
        onEnter: (els) => {
          gsap.to(els, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out"
          });
        }
      });
    }

    // 6. Manifesto Scroll-Reveal
    const manifestoText = document.querySelector("[data-words]");
    if (manifestoText) {
      manifestoText.innerHTML = manifestoText.textContent.trim().split(/\s+/).map(w => `<span class="w">${w} </span>`).join("");
      gsap.to(".w", {
        opacity: 1,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: {
          trigger: manifestoText,
          start: "top 80%",
          end: "bottom 55%",
          scrub: true
        }
      });
    }
  });
}
