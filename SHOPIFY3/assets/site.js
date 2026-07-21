/* CH24 — Shopify v3 shared: product data, Ajax Cart Drawer API integrations,
   sleeve click handlers, WhatsApp overrides, and mood switcher active states. */

const CH24_WA = "919196036665";
const CH24_URL = "https://ch24.in";
const CH24_EMAIL = "help@ch24.in";

const CH24_PRODUCTS = {
  ocean:     { name: "Ocean Rush",      tone: "#61D6C4", toneName: "Aqua Notes", ink: "#0A0A0A", notes: "Aqua Notes · Jasmine · Patchouli", perfectFor: "Office · Day · Gym",        mood: "office" },
  pistachio: { name: "Nutty Pistachio", tone: "#85AF67", toneName: "Pistachio",  ink: "#0A0A0A", notes: "Pistachio · Almond · Woody",       perfectFor: "Day Out · Party · Movie",   mood: "party" },
  vanilla:   { name: "Vanilla Bean",    tone: "#E9C7AC", toneName: "Vanilla",    ink: "#0A0A0A", notes: "Vanilla · Amber · Warm Spice",     perfectFor: "Date · Coffee · Evening",   mood: "date" },
  oud:       { name: "Oud Affair",      tone: "#533C2C", toneName: "Oud",       ink: "#FFFFFF", notes: "Agarwood · Oud · Vanilla",         perfectFor: "Night · Evening · Wedding", mood: "night" }
};

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
      window.CH24_addToCart && window.CH24_addToCart(card.dataset.id);
    });
  });
}
wireCardPickButtons();

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
setupMobileCardTaps();

// "Surprise Me" Shuffle Button
function setupShuffler() {
  document.querySelectorAll("[data-shuffle]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const ids = Object.keys(CH24_PRODUCTS);
      const a = ids[Math.floor(Math.random() * ids.length)];
      let b = ids[Math.floor(Math.random() * ids.length)];
      while (b === a) {
        b = ids[Math.floor(Math.random() * ids.length)];
      }
      btn.classList.add("is-spinning");
      if (window.CH24_addToCart) {
        await window.CH24_addToCart(a, { open: false });
        await window.CH24_addToCart(b, { open: true });
      }
      setTimeout(() => btn.classList.remove("is-spinning"), 600);
    });
  });
}
setupShuffler();

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

    item.addEventListener("click", (e) => {
      const touchCapable = window.matchMedia("(hover: none)").matches;
      if (touchCapable) {
        activate();
      }
    });
  });
}
setupMoodSwitcher();

document.querySelectorAll("[data-mood-pick]").forEach(tile => {
  tile.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = tile.dataset.moodPick;
    window.CH24_addToCart && window.CH24_addToCart(id);

    const card = document.querySelector(`.sleeve-card[data-id="${id}"]`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      document.querySelectorAll(".sleeve-card.is-open").forEach(c => c !== card && c.classList.remove("is-open"));
      card.classList.add("is-open");
      setTimeout(() => card.classList.remove("is-open"), 2200);
    } else {
      window.location.href = "/collections/all";
    }
  });
});

// Newsletter Subscription Handle
const nlForm = document.querySelector(".footer-v3__form");
if (nlForm) {
  nlForm.addEventListener("submit", (e) => {
    e.preventDefault();
    nlForm.innerHTML = '<p class="footer-v3__hook">You\'re on the drop list.</p>';
  });
}

/* ---------- Shopify Ajax Cart Drawer integration ---------- */
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

    document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = cart.item_count; });
    const variantIdsInCart = new Set(cart.items.map((item) => String(item.variant_id)));
    
    // Sync active sleeve cards pick states
    document.querySelectorAll(".sleeve-card[data-id]").forEach((card) => {
      const variantId = window.CH24_SHOPIFY_VARIANTS && window.CH24_SHOPIFY_VARIANTS[card.dataset.id];
      const isPicked = !!variantId && variantIdsInCart.has(String(variantId));
      card.classList.toggle("is-picked", isPicked);
      const btn = card.querySelector(".sleeve-card__pick");
      if (btn) {
        btn.textContent = isPicked ? "In your pair" : "Add to pair";
      }
    });

    // Detail page picker sync
    const detailAddBtn = document.querySelector("[data-pd2-add]");
    if (detailAddBtn && detailAddBtn.dataset.id) {
      const variantId = window.CH24_SHOPIFY_VARIANTS && window.CH24_SHOPIFY_VARIANTS[detailAddBtn.dataset.id];
      const isPicked = !!variantId && variantIdsInCart.has(String(variantId));
      detailAddBtn.textContent = isPicked ? "In your pair" : "Add to pair";
      detailAddBtn.className = isPicked ? "btn btn--white" : "btn btn--orange";
    }
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

  if (sessionStorage.getItem("ch24_open_cart") === "1") {
    sessionStorage.removeItem("ch24_open_cart");
    fetchCart();
    openDrawer();
  } else {
    fetchCart();
  }
})();
