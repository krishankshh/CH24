/* CH24 v2 — shared: nav toggle, scroll reveal, demo bag (localStorage),
   WhatsApp links. Static showcase — no real payment/checkout wired. */

const CH24_WA = "919196036665";

const CH24_PRODUCTS = {
  ocean:     { name: "Ocean Rush",      tone: "#61D6C4", notes: "Aqua Notes · Jasmine · Patchouli", perfectFor: "Office · Day · Gym",        mood: "office", price: 249, img: "assets/products/product-ocean-rush.jpg", loose: "assets/products/loose-ocean-rush.jpg" },
  pistachio: { name: "Nutty Pistachio", tone: "#85AF67", notes: "Pistachio · Almond · Woody",       perfectFor: "Day Out · Party · Movie",   mood: "party",  price: 249, img: "assets/products/product-nutty-pistachio.jpg", loose: "assets/products/loose-nutty-pistachio.jpg" },
  vanilla:   { name: "Vanilla Bean",    tone: "#EDE7DD", notes: "Vanilla · Amber · Warm Spice",     perfectFor: "Date · Coffee · Evening",   mood: "date",   price: 249, img: "assets/products/product-vanilla-bean.jpg", loose: "assets/products/loose-vanilla-bean.jpg" },
  oud:       { name: "Oud Affair",      tone: "#533C2C", notes: "Agarwood · Oud · Vanilla",         perfectFor: "Night · Evening · Wedding", mood: "night",  price: 249, img: "assets/products/product-oud-affair.jpg", loose: "assets/products/loose-oud-affair.jpg" }
};

const BAG_KEY = "ch24v2-bag";
const getBag = () => { try { return JSON.parse(localStorage.getItem(BAG_KEY)) || {}; } catch { return {}; } };
const setBag = (bag) => { localStorage.setItem(BAG_KEY, JSON.stringify(bag)); renderBagCount(); };
const addToBag = (id, qty = 1) => { const bag = getBag(); bag[id] = (bag[id] || 0) + qty; setBag(bag); };

function renderBagCount() {
  const bag = getBag();
  const count = Object.values(bag).reduce((a, b) => a + b, 0);
  document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = count);
}

/* nav mobile toggle */
function wireNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const links = document.querySelector("[data-nav-links]");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("is-open")));
}

/* mark the current page in the main nav */
function wireActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-links] a").forEach(a => {
    if (a.getAttribute("href") === path) a.setAttribute("aria-current", "page");
  });
}

/* scroll reveal — single restrained system, whole site */
function wireReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) { items.forEach(el => el.classList.add("is-visible")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
}

/* "Add to bag" buttons anywhere on the page */
function wireAddToBag() {
  document.querySelectorAll("[data-add-to-bag]").forEach(btn => {
    btn.addEventListener("click", () => {
      const qtyInput = btn.closest(".pd__info")?.querySelector("[data-qty-input]");
      const qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
      addToBag(btn.dataset.addToBag, qty);
      const label = btn.textContent;
      btn.textContent = "Added";
      btn.classList.add("is-added");
      setTimeout(() => { btn.textContent = label; btn.classList.remove("is-added"); }, 1400);
    });
  });
}

/* quantity stepper on product page */
function wireQtyStepper() {
  const wrap = document.querySelector("[data-qty]");
  if (!wrap) return;
  const input = wrap.querySelector("[data-qty-input]");
  wrap.querySelector("[data-qty-minus]").addEventListener("click", () => {
    input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
  });
  wrap.querySelector("[data-qty-plus]").addEventListener("click", () => {
    input.value = (parseInt(input.value, 10) || 1) + 1;
  });
}

/* product gallery thumbnails */
function wireGallery() {
  const main = document.querySelector("[data-gallery-main]");
  if (!main) return;
  document.querySelectorAll("[data-gallery-thumb]").forEach(thumb => {
    thumb.addEventListener("click", () => {
      main.src = thumb.dataset.galleryThumb;
      document.querySelectorAll("[data-gallery-thumb]").forEach(t => t.classList.toggle("is-active", t === thumb));
    });
  });
}

/* newsletter + contact forms — deep-link to WhatsApp, same as v1 */
function wireForms() {
  const newsletter = document.querySelector("[data-newsletter-form]");
  if (newsletter) {
    newsletter.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = new FormData(e.target).get("email");
      window.open(`https://wa.me/${CH24_WA}?text=${encodeURIComponent(`hi CH24 — join the list: ${email}`)}`, "_blank", "noopener");
      newsletter.reset();
    });
  }
  const contact = document.querySelector("[data-contact-form]");
  if (contact) {
    contact.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const msg = `hi CH24 — I'm ${f.get("name")}. ${f.get("message")}`;
      window.open(`https://wa.me/${CH24_WA}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    });
  }
  const waCta = document.querySelector("[data-wa-cta]");
  if (waCta) waCta.href = `https://wa.me/${CH24_WA}?text=${encodeURIComponent("hi CH24 —")}`;
}

document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  wireActiveNav();
  wireReveal();
  wireAddToBag();
  wireQtyStepper();
  wireGallery();
  wireForms();
  renderBagCount();
});
