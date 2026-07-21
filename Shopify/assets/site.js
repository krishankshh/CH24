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

/* .box__pick lives in a sibling .box__info, not inside .box itself, so it
   can't be found via ".box .box__pick" — read the id off the .box that
   immediately precedes .box__info instead. Each click adds one to the real
   Shopify cart (via window.CH24_addToCart, exposed by the cart-drawer setup
   further down this file) — no cap, add as many of any scent as you want. */
function wireBoxPickButtons(root = document) {
  root.querySelectorAll(".box__pick").forEach(btn => {
    if (btn.dataset.wired) return;
    const info = btn.closest(".box__info");
    if (!info) return;
    const box = info.previousElementSibling?.classList.contains("box")
      ? info.previousElementSibling
      : info.previousElementSibling?.querySelector(".box");
    if (!box || !box.dataset.id) return;
    btn.dataset.wired = "1";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.CH24_addToCart && window.CH24_addToCart(box.dataset.id);
    });
  });
}
wireBoxPickButtons();

/* Click logic for the box cards:
   On desktop, clicking the box navigates to the product detail page.
   On mobile, the first tap opens the box to reveal the stick. If it's already open, tapping again navigates. */
document.addEventListener("click", (e) => {
  const box = e.target.closest(".box[data-id]");
  if (!box) return;
  if (e.target.closest(".box__pick")) return;

  const id = box.dataset.id;
  if (!id) return;

  const touchCapable = window.matchMedia("(hover: none)").matches;
  if (touchCapable) {
    const isOpen = box.classList.contains("is-open");
    if (isOpen) {
      // Let it naturally navigate (browser follows anchor href)
    } else {
      e.preventDefault();
      document.querySelectorAll(".box.is-open").forEach(b => b !== box && b.classList.remove("is-open"));
      box.classList.add("is-open");
    }
  }
});

/* "surprise me" — adds two different random scents straight to the real
   cart (no fabricated "bestseller"/"most loved" claims, just a random
   pick), same one-at-a-time add used everywhere else now. */
document.querySelectorAll("[data-shuffle]").forEach(btn => {
  btn.addEventListener("click", async () => {
    const ids = Object.keys(CH24_PRODUCTS);
    const a = ids[Math.floor(Math.random() * ids.length)];
    let b = ids[Math.floor(Math.random() * ids.length)];
    while (b === a) b = ids[Math.floor(Math.random() * ids.length)];
    btn.classList.add("is-spinning");
    if (window.CH24_addToCart) {
      await window.CH24_addToCart(a, { open: false });
      await window.CH24_addToCart(b, { open: true });
    }
    setTimeout(() => btn.classList.remove("is-spinning"), 500);
  });
});

/* newsletter */
const nlForm = document.querySelector(".footer__form");
if (nlForm) nlForm.addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.innerHTML = '<p class="footer__hook">You\'re on the list.</p>';
});

/* mood strip: click a mood → opens + highlights the matching box and
   scrolls to it, picks it as the first pair choice */
/* touch/no-hover devices: tap a panel to fold the row onto it (CSS
   handles the fold on :hover for mouse users, this covers the rest) */
if (window.matchMedia("(hover: none)").matches) {
  document.querySelectorAll("[data-panel]").forEach(panel => {
    panel.addEventListener("click", (e) => {
      if (e.target.closest(".mood__cta")) return;
      const wasActive = panel.classList.contains("is-active");
      document.querySelectorAll(".mood__panel.is-active").forEach(p => p !== panel && p.classList.remove("is-active"));
      panel.classList.toggle("is-active", !wasActive);
    });
  });
}

document.querySelectorAll("[data-mood-pick]").forEach(tile => {
  tile.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = tile.dataset.moodPick;
    window.CH24_addToCart && window.CH24_addToCart(id);

    const box = document.querySelector(`.box[data-id="${id}"]`);
    if (box) {
      box.scrollIntoView({ behavior: "smooth", block: "center" });
      document.querySelectorAll(".box.is-open").forEach(b => b !== box && b.classList.remove("is-open"));
      box.classList.add("is-open");
      setTimeout(() => box.classList.remove("is-open"), 2200);
    } else {
      window.location.href = "/collections/all";
    }
  });
});

/* ---------- cart drawer (Shopify only — real /cart.js backend doesn't
   exist on the static site, so this stays Shopify-side only) ---------- */
(() => {
  const drawer = document.querySelector("[data-cart-drawer]");
  const backdrop = document.querySelector("[data-cart-backdrop]");
  if (!drawer || !backdrop) return;

  function openDrawer() {
    drawer.classList.add("is-open");
    backdrop.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function money(cents) {
    return "₹" + (cents / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function renderCart(cart) {
    const body = drawer.querySelector("[data-cart-body]");
    const subtotal = drawer.querySelector("[data-cart-subtotal]");
    const checkout = drawer.querySelector("[data-cart-checkout]");

    if (cart.item_count === 0) {
      body.innerHTML = '<p class="cart-drawer__empty">Your bag is empty.</p>';
    } else {
      body.innerHTML = "<ul class=\"cart-drawer__items\">" + cart.items.map((item) => `
        <li class="cart-drawer__item" data-line-key="${item.key}">
          <img src="${item.image}" alt="${item.title.replace(/"/g, "&quot;")}" width="80" height="80" loading="lazy">
          <div class="cart-drawer__item-info">
            <p class="cart-drawer__item-title">${item.product_title}</p>
            ${item.variant_title && item.variant_title !== "Default Title" ? `<p class="cart-drawer__item-variant">${item.variant_title}</p>` : ""}
            <div class="cart-drawer__item-qty">
              <button type="button" data-qty-decrease aria-label="Decrease quantity">&minus;</button>
              <span>${item.quantity}</span>
              <button type="button" data-qty-increase aria-label="Increase quantity">+</button>
            </div>
          </div>
          <p class="cart-drawer__item-price">${money(item.final_line_price)}</p>
          <button class="cart-drawer__item-remove" type="button" data-remove aria-label="Remove">&times;</button>
        </li>
      `).join("") + "</ul>";
    }
    if (subtotal) subtotal.textContent = money(cart.total_price);
    if (checkout) checkout.setAttribute("aria-disabled", cart.item_count === 0 ? "true" : "false");

    /* real cart truth drives both the nav badge and which box cards show
       as "already in your bag" — no more local pair-picker count/state */
    document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = cart.item_count; });
    const variantIdsInCart = new Set(cart.items.map((item) => String(item.variant_id)));
    document.querySelectorAll(".box[data-id]").forEach((card) => {
      const variantId = window.CH24_SHOPIFY_VARIANTS && window.CH24_SHOPIFY_VARIANTS[card.dataset.id];
      card.classList.toggle("is-picked", !!variantId && variantIdsInCart.has(String(variantId)));
    });
  }

  async function fetchCart() {
    const res = await fetch("/cart.js");
    const cart = await res.json();
    renderCart(cart);
    return cart;
  }

  async function changeLine(key, quantity) {
    const res = await fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: key, quantity })
    });
    const cart = await res.json();
    renderCart(cart);
  }

  /* real "add as many as you want" add-to-cart — replaces the old
     pick-exactly-two local pair state. Opens the drawer so the user gets
     immediate confirmation and can adjust quantity right there. */
  async function addToCart(scentId, { open = true } = {}) {
    const variantId = window.CH24_SHOPIFY_VARIANTS && window.CH24_SHOPIFY_VARIANTS[scentId];
    if (!variantId) return;
    await fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
    });
    await fetchCart();
    if (open) openDrawer();
  }
  window.CH24_addToCart = addToCart;

  document.querySelectorAll("[data-cart-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      fetchCart();
      openDrawer();
    });
  });
  document.querySelectorAll("[data-cart-close]").forEach((btn) => btn.addEventListener("click", closeDrawer));
  backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  drawer.addEventListener("click", (e) => {
    const line = e.target.closest("[data-line-key]");
    if (!line) return;
    const key = line.dataset.lineKey;
    const currentQty = +line.querySelector(".cart-drawer__item-qty span").textContent;
    if (e.target.closest("[data-qty-increase]")) changeLine(key, currentQty + 1);
    else if (e.target.closest("[data-qty-decrease]")) changeLine(key, Math.max(0, currentQty - 1));
    else if (e.target.closest("[data-remove]")) changeLine(key, 0);
  });

  window.CH24_openCartDrawer = openDrawer;
  window.CH24_refreshCartDrawer = fetchCart;

  /* landed here via the /cart page's redirect (main-cart.liquid) — open
     the drawer automatically so there's still no visible "bag page" gap */
  if (sessionStorage.getItem("ch24_open_cart") === "1") {
    sessionStorage.removeItem("ch24_open_cart");
    fetchCart();
    openDrawer();
  } else {
    /* otherwise just sync the real badge count + box highlighting quietly
       on every page load, without popping the drawer open */
    fetchCart();
  }
})();
