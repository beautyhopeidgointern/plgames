document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-enter");

  requestAnimationFrame(() => {
    document.body.classList.remove("page-enter");
  });
});

function getGameKey() {
  const params = new URLSearchParams(window.location.search);
  return params.get("game") || "";
}

function loadGameData(gameKey) {
  return new Promise((resolve, reject) => {
    if (!gameKey) {
      reject(new Error("Game tidak ditemukan"));
      return;
    }

    window.PRICE_DATA = null;

    const oldScript = document.getElementById("dynamic-game-data");
    if (oldScript) {
      oldScript.remove();
    }

    const script = document.createElement("script");
    script.id = "dynamic-game-data";
    script.src = `./data/${encodeURIComponent(gameKey)}.js`;

    script.onload = () => {
      if (window.PRICE_DATA && typeof window.PRICE_DATA === "object") {
        resolve(window.PRICE_DATA);
      } else {
        reject(new Error("Data game kosong"));
      }
    };

    script.onerror = () => {
      reject(new Error("File data game tidak ditemukan"));
    };

    document.body.appendChild(script);
  });
}

const titleEl = document.getElementById("game-title");
const subtitleEl = document.getElementById("game-subtitle");
const listEl = document.getElementById("price-list");
const fieldsEl = document.getElementById("dynamic-fields");
const selectedProductEl = document.getElementById("selected-product");
const selectedPriceEl = document.getElementById("selected-price");
const totalPriceEl = document.getElementById("total-price");
const quantityEl = document.getElementById("quantity");
const qtyMinusBtn = document.getElementById("qty-minus");
const qtyPlusBtn = document.getElementById("qty-plus");
const contactBtn = document.getElementById("contact-btn");
const orderSection = document.getElementById("order-section");
const previewEl = document.getElementById("preview-order");
const backHomeLink = document.getElementById("back-home-link");

let gameData = null;

function parseRupiah(value) {
  if (!value) return 0;
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}

function formatRupiah(value) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function getQuantity() {
  const qty = Number(quantityEl?.value) || 1;
  return qty < 1 ? 1 : qty;
}

function getSelectedPriceNumber() {
  return parseRupiah(selectedPriceEl?.value);
}

function getTotalPriceNumber() {
  return getSelectedPriceNumber() * getQuantity();
}

function updateTotalPrice() {
  if (!totalPriceEl) return;

  const total = getTotalPriceNumber();
  totalPriceEl.value = total > 0 ? formatRupiah(total) : "-";
}

function createField(labelText, index) {
  const wrapper = document.createElement("div");
  wrapper.className = "form-group";

  const label = document.createElement("label");
  label.setAttribute("for", `field-${index}`);
  label.textContent = labelText;

  const input = document.createElement("input");
  input.type = "text";
  input.id = `field-${index}`;
  input.dataset.label = labelText;
  input.placeholder = `Masukkan ${labelText}`;
  input.autocomplete = "off";
  input.addEventListener("input", updateWhatsappLink);

  wrapper.appendChild(label);
  wrapper.appendChild(input);

  return wrapper;
}

function renderFields() {
  if (!fieldsEl || !gameData) return;

  fieldsEl.innerHTML = "";
  gameData.formFields.forEach((field, index) => {
    fieldsEl.appendChild(createField(field, index));
  });
}

function renderPriceList() {
  if (!listEl || !gameData) return;

  listEl.innerHTML = "";

  gameData.items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "price-item";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    const title = document.createElement("h3");
    title.textContent = item.name;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = item.price;

    const selectItem = () => {
      if (selectedProductEl) selectedProductEl.value = item.name;
      if (selectedPriceEl) selectedPriceEl.value = item.price;
      if (quantityEl) quantityEl.value = 1;

      document.querySelectorAll(".price-item").forEach((el) => {
        el.classList.remove("selected");
      });
      card.classList.add("selected");

      updateTotalPrice();
      updateWhatsappLink();

      if (orderSection) {
        orderSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    card.addEventListener("click", selectItem);

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectItem();
      }
    });

    card.appendChild(title);
    card.appendChild(price);
    listEl.appendChild(card);
  });
}

function buildOrderText() {
  const inputs = fieldsEl ? fieldsEl.querySelectorAll("input") : [];
  const lines = [];

  lines.push(`Pesanan ${gameData.title}`);
  lines.push("");

  inputs.forEach((input) => {
    lines.push(`${input.dataset.label}: ${input.value.trim() || "-"}`);
  });

  lines.push(`Produk: ${selectedProductEl?.value || "-"}`);
  lines.push(`Harga Satuan: ${selectedPriceEl?.value || "-"}`);
  lines.push(`Kuantitas: ${getQuantity()}`);
  lines.push(`Total Harga: ${totalPriceEl?.value || "-"}`);

  return lines.join("\n");
}

function updateWhatsappLink() {
  if (!gameData || !contactBtn) return;

  updateTotalPrice();

  const text = buildOrderText();

  if (previewEl) {
    previewEl.value = text;
  }

  const encoded = encodeURIComponent(text);
  contactBtn.href = `https://wa.me/${gameData.contact}?text=${encoded}`;
}

if (qtyMinusBtn) {
  qtyMinusBtn.addEventListener("click", () => {
    const current = getQuantity();
    if (quantityEl) {
      quantityEl.value = current > 1 ? current - 1 : 1;
    }
    updateWhatsappLink();
  });
}

if (qtyPlusBtn) {
  qtyPlusBtn.addEventListener("click", () => {
    const current = getQuantity();
    if (quantityEl) {
      quantityEl.value = current + 1;
    }
    updateWhatsappLink();
  });
}

if (quantityEl) {
  quantityEl.addEventListener("input", () => {
    if (Number(quantityEl.value) < 1 || !quantityEl.value) {
      quantityEl.value = 1;
    }
    updateWhatsappLink();
  });
}

if (backHomeLink) {
  backHomeLink.addEventListener("click", (event) => {
    event.preventDefault();
    document.body.classList.add("page-leaving");

    setTimeout(() => {
      window.location.href = backHomeLink.href;
    }, 180);
  });
}

async function initGamePage() {
  const gameKey = getGameKey();

  try {
    gameData = await loadGameData(gameKey);

    if (titleEl) titleEl.textContent = gameData.title;
    if (subtitleEl) subtitleEl.textContent = gameData.subtitle;

    renderFields();
    renderPriceList();

    if (selectedProductEl) selectedProductEl.value = "";
    if (selectedPriceEl) selectedPriceEl.value = "";
    if (quantityEl) quantityEl.value = 1;
    if (totalPriceEl) totalPriceEl.value = "-";

    updateWhatsappLink();
  } catch (error) {
    if (titleEl) titleEl.textContent = "Game tidak ditemukan";
    if (subtitleEl) subtitleEl.textContent = "Data game belum tersedia atau nama file salah.";

    if (listEl) {
      listEl.innerHTML = `<div class="empty-state">Data price list untuk game ini belum ada.</div>`;
    }

    if (fieldsEl) {
      fieldsEl.innerHTML = "";
    }

    if (selectedProductEl) selectedProductEl.value = "";
    if (selectedPriceEl) selectedPriceEl.value = "";
    if (quantityEl) quantityEl.value = 1;
    if (totalPriceEl) totalPriceEl.value = "";
    if (previewEl) previewEl.value = "";

    if (contactBtn) {
      contactBtn.removeAttribute("href");
    }
  }
}

initGamePage();
