/* CH24 — shared across all pages: product data, pair state, bag count,
   flip-box open/close, WhatsApp float, newsletter. */

/* pulled from the printed packaging (box back panel) */
const CH24_WA = "919196036665";
const CH24_URL = "https://ch24.in";
const CH24_EMAIL = "help@ch24.in";

const CH24_PRODUCTS = {
  ocean:     { name: "Ocean Rush",      tone: "#61D6C4", toneName: "Aqua Notes", ink: "#0A0A0A", notes: "Aqua Notes · Jasmine · Patchouli", perfectFor: "Office · Day · Gym",        mood: "office", img: "assets/products/product-ocean-rush.jpg" },
  pistachio: { name: "Nutty Pistachio", tone: "#85AF67", toneName: "Pistachio",  ink: "#0A0A0A", notes: "Pistachio · Almond · Woody",       perfectFor: "Day Out · Party · Movie",   mood: "party",  img: "assets/products/product-nutty-pistachio.jpg" },
  vanilla:   { name: "Vanilla Bean",    tone: "#E9C7AC", toneName: "Vanilla",    ink: "#0A0A0A", notes: "Vanilla · Amber · Warm Spice",     perfectFor: "Date · Coffee · Evening",   mood: "date",   img: "assets/products/product-vanilla-bean.jpg" },
  oud:       { name: "Oud Affair",      tone: "#533C2C", toneName: "Oud",       ink: "#FFFFFF", notes: "Agarwood · Oud · Vanilla",         perfectFor: "Night · Evening · Wedding", mood: "night",  img: "assets/products/product-oud-affair.jpg" }
};

const PAIR_KEY = "ch24-pair";

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
  document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = pair.length);

  const namesEl = document.querySelector("[data-pair-names]");
  if (namesEl) {
    namesEl.textContent = pair.length
      ? ": " + pair.map(id => CH24_PRODUCTS[id].name).join(" + ")
      : ": pick two";
  }
  const ctaEl = document.querySelector("[data-pair-cta]");
  if (ctaEl) ctaEl.setAttribute("aria-disabled", pair.length === 2 ? "false" : "true");

  document.querySelectorAll(".box[data-id]").forEach(card => {
    card.classList.toggle("is-picked", pair.includes(card.dataset.id));
  });
}

function togglePick(id) {
  const pair = getPair();
  const idx = pair.indexOf(id);
  if (idx > -1) pair.splice(idx, 1);
  else {
    if (pair.length === 2) pair.shift();
    pair.push(id);
  }
  setPair(pair);
}

document.querySelectorAll(".box[data-id] .box__pick").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePick(btn.closest(".box").dataset.id);
  });
});

/* the box lid opens on hover (desktop) via CSS; on touch, tap the box
   itself to flip it open, tap again (or elsewhere) to close */
const touchCapable = window.matchMedia("(hover: none)").matches;
if (touchCapable) {
  document.querySelectorAll(".box[data-id]").forEach(box => {
    box.addEventListener("click", (e) => {
      if (e.target.closest(".box__pick")) return;
      const wasOpen = box.classList.contains("is-open");
      document.querySelectorAll(".box.is-open").forEach(b => b !== box && b.classList.remove("is-open"));
      box.classList.toggle("is-open", !wasOpen);
    });
  });
}

renderPair();

/* "surprise me" — picks two different scents at random, does not fabricate
   any claim about them (no fake "bestseller"/"most loved" labels) */
document.querySelectorAll("[data-shuffle]").forEach(btn => {
  btn.addEventListener("click", () => {
    const ids = Object.keys(CH24_PRODUCTS);
    const a = ids[Math.floor(Math.random() * ids.length)];
    let b = ids[Math.floor(Math.random() * ids.length)];
    while (b === a) b = ids[Math.floor(Math.random() * ids.length)];
    btn.classList.add("is-spinning");
    setPair([a, b]);
    setTimeout(() => btn.classList.remove("is-spinning"), 500);
  });
});

/* WhatsApp order link for the current pair */
function pairWaLink() {
  const pair = getPair();
  const scents = pair.map(id => CH24_PRODUCTS[id].name).join(" + ");
  const msg = pair.length === 2
    ? `hi CH24 — I want Take Me Out Pack 01: ${scents} (₹499)`
    : "hi CH24 — I want to order Take Me Out";
  return `https://wa.me/${CH24_WA}?text=${encodeURIComponent(msg)}`;
}

/* floating WhatsApp chat button on every page */
(() => {
  const a = document.createElement("a");
  a.className = "wa-float";
  a.href = `https://wa.me/${CH24_WA}?text=${encodeURIComponent("hi CH24 —")}`;
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", "Chat with CH24 on WhatsApp");
  a.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.4 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.5 3.9 1.7.7 2.3.8 3.1.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3Z"/></svg>';
  document.body.appendChild(a);
})();

/* newsletter */
const nlForm = document.querySelector(".footer__form");
if (nlForm) nlForm.addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.innerHTML = '<p class="footer__hook">You\'re on the list.</p>';
});

/* mood strip: click a mood → opens + highlights the matching box and
   scrolls to it, picks it as the first pair choice */
document.querySelectorAll("[data-mood-pick]").forEach(tile => {
  tile.addEventListener("click", (e) => {
    e.preventDefault();
    const id = tile.dataset.moodPick;
    const pair = getPair().filter(x => x !== id);
    pair.unshift(id);
    setPair(pair.slice(0, 2));

    const box = document.querySelector(`.box[data-id="${id}"]`);
    if (box) {
      box.scrollIntoView({ behavior: "smooth", block: "center" });
      document.querySelectorAll(".box.is-open").forEach(b => b !== box && b.classList.remove("is-open"));
      box.classList.add("is-open");
      setTimeout(() => box.classList.remove("is-open"), 2200);
    } else {
      window.location.href = "shop.html";
    }
  });
});
