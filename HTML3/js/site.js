/* CH24 — Version 3 Logic: Product data, pair selection, sleeve reveal,
   mood switcher, WhatsApp chat button, and footer subscription. */

const CH24_WA = "919196036665";
const CH24_URL = "https://ch24.in";
const CH24_EMAIL = "help@ch24.in";

const CH24_PRODUCTS = {
  ocean: {
    name: "Ocean Rush",
    tone: "#61D6C4",
    toneName: "Aqua Notes",
    ink: "#0A0A0A",
    notes: "Aqua Notes · Jasmine · Patchouli",
    perfectFor: "Office · Day · Gym",
    mood: "office",
    img: "assets/products/product-ocean-rush.jpg"
  },
  pistachio: {
    name: "Nutty Pistachio",
    tone: "#85AF67",
    toneName: "Pistachio",
    ink: "#0A0A0A",
    notes: "Pistachio · Almond · Woody",
    perfectFor: "Day Out · Party · Movie",
    mood: "party",
    img: "assets/products/product-nutty-pistachio.jpg"
  },
  vanilla: {
    name: "Vanilla Bean",
    tone: "#E9C7AC",
    toneName: "Vanilla",
    ink: "#0A0A0A",
    notes: "Vanilla · Amber · Warm Spice",
    perfectFor: "Date · Coffee · Evening",
    mood: "date",
    img: "assets/products/product-vanilla-bean.jpg"
  },
  oud: {
    name: "Oud Affair",
    tone: "#533C2C",
    toneName: "Oud",
    ink: "#FFFFFF",
    notes: "Agarwood · Oud · Vanilla",
    perfectFor: "Night · Evening · Wedding",
    mood: "night",
    img: "assets/products/product-oud-affair.jpg"
  }
};

const PAIR_KEY = "ch24-pair-v3";

const getPair = () => {
  try { return JSON.parse(localStorage.getItem(PAIR_KEY)) || []; }
  catch { return []; }
};

const setPair = (pair) => {
  localStorage.setItem(PAIR_KEY, JSON.stringify(pair));
  renderPair();
};

function renderPair() {
  const pair = getPair();
  
  // Update cart item count badges
  document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = pair.length);

  // Update pair checkout bars
  const namesEl = document.querySelector("[data-pair-names]");
  if (namesEl) {
    namesEl.textContent = pair.length
      ? ": " + pair.map(id => CH24_PRODUCTS[id].name).join(" + ")
      : ": pick two";
  }

  const ctaEl = document.querySelector("[data-pair-cta]");
  if (ctaEl) {
    ctaEl.setAttribute("aria-disabled", pair.length === 2 ? "false" : "true");
    if (pair.length === 2) {
      ctaEl.removeAttribute("disabled");
      ctaEl.href = "checkout.html";
    } else {
      ctaEl.setAttribute("disabled", "disabled");
      ctaEl.removeAttribute("href");
    }
  }

  // Toggle selected state on cassette sleeve cards
  document.querySelectorAll(".sleeve-card[data-id]").forEach(card => {
    const isPicked = pair.includes(card.dataset.id);
    card.classList.toggle("is-picked", isPicked);
    const btn = card.querySelector(".sleeve-card__pick");
    if (btn) {
      btn.textContent = isPicked ? "In your pair" : "Add to pair";
    }
  });

  // Check details page add buttons
  const detailAddBtn = document.querySelector("[data-pd2-add]");
  if (detailAddBtn && detailAddBtn.dataset.id) {
    const isPicked = pair.includes(detailAddBtn.dataset.id);
    detailAddBtn.textContent = isPicked ? "In your pair" : "Add to pair";
    detailAddBtn.classList.toggle("btn--orange", !isPicked);
    detailAddBtn.classList.toggle("btn--white", isPicked);
  }

  // Handle slide-up pair completion drawer visibility
  const pairBar = document.querySelector("[data-pairbar]");
  if (pairBar) {
    pairBar.classList.toggle("is-visible", pair.length > 0);
  }
}

function togglePick(id) {
  const pair = getPair();
  const idx = pair.indexOf(id);
  if (idx > -1) {
    pair.splice(idx, 1);
  } else {
    if (pair.length === 2) {
      pair.shift(); // Evict first choice to maintain pair size
    }
    pair.push(id);
  }
  setPair(pair);
}

// Wire up selection buttons on the Cassette Cards
function wireCardPickButtons(root = document) {
  root.querySelectorAll(".sleeve-card__pick").forEach(btn => {
    if (btn.dataset.wired) return;
    const card = btn.closest(".sleeve-card");
    if (!card || !card.dataset.id) return;
    btn.dataset.wired = "1";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      togglePick(card.dataset.id);
    });
  });
}

// Handle mobile touch reveals for cassette cards
function setupMobileCardTaps() {
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".sleeve-card[data-id]");
    if (!card) return;
    if (e.target.closest(".sleeve-card__pick")) return;
    if (e.target.closest(".sleeve-card__actions")) return;

    const touchCapable = window.matchMedia("(hover: none)").matches;
    if (touchCapable) {
      const isOpen = card.classList.contains("is-open");
      if (!isOpen) {
        e.preventDefault();
        document.querySelectorAll(".sleeve-card.is-open").forEach(c => c !== card && c.classList.remove("is-open"));
        card.classList.add("is-open");
      }
    }
  });
}

// "Surprise Me" Shuffle Button
function setupShuffler() {
  document.querySelectorAll("[data-shuffle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const ids = Object.keys(CH24_PRODUCTS);
      const a = ids[Math.floor(Math.random() * ids.length)];
      let b = ids[Math.floor(Math.random() * ids.length)];
      while (b === a) {
        b = ids[Math.floor(Math.random() * ids.length)];
      }
      btn.classList.add("is-spinning");
      setPair([a, b]);
      setTimeout(() => btn.classList.remove("is-spinning"), 600);
    });
  });
}

// Mood Switcher Functionality
function setupMoodSwitcher() {
  const items = document.querySelectorAll(".mood-v3__item");
  const panes = document.querySelectorAll(".mood-v3__pane");
  if (items.length === 0) return;

  items.forEach(item => {
    const activate = () => {
      const scent = item.dataset.scent;
      items.forEach(i => i.classList.toggle("is-active", i === item));
      panes.forEach(p => p.classList.toggle("is-active", p.dataset.scent === scent));
    };

    item.addEventListener("mouseenter", activate);
    item.addEventListener("focus", activate);

    // Support touch devices via click toggles
    item.addEventListener("click", (e) => {
      const touchCapable = window.matchMedia("(hover: none)").matches;
      if (touchCapable) {
        activate();
      }
    });
  });
}

// Floating WhatsApp Link for Order Messages
function pairWaLink() {
  const pair = getPair();
  const scents = pair.map(id => CH24_PRODUCTS[id].name).join(" + ");
  const msg = pair.length === 2
    ? `hi CH24 — I want to order the Take Me Out Pack 01 pair: ${scents} (₹499)`
    : "hi CH24 — I want to order the Take Me Out fragrance pack";
  return `https://wa.me/${CH24_WA}?text=${encodeURIComponent(msg)}`;
}

function setupWaFloat() {
  const a = document.createElement("a");
  a.className = "wa-float";
  a.href = `https://wa.me/${CH24_WA}?text=${encodeURIComponent("hi CH24 —")}`;
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", "Chat with CH24 on WhatsApp");
  a.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.4 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.5 3.9 1.7.7 2.3.8 3.1.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3Z"/></svg>';
  document.body.appendChild(a);

  // Dynamic override on checkout
  const checkCta = document.querySelector("[data-checkout-wa]");
  if (checkCta) {
    checkCta.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(pairWaLink(), "_blank");
    });
  }
}

// Newsletter Subscription Handle
function setupNewsletter() {
  const form = document.querySelector(".footer-v3__form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.innerHTML = '<p class="footer-v3__hook">You\'re on the drop list.</p>';
    });
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  wireCardPickButtons();
  setupMobileCardTaps();
  setupShuffler();
  setupMoodSwitcher();
  setupWaFloat();
  setupNewsletter();
  renderPair();
});
