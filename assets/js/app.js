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
    if (oldScript) oldScript.remove();

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

    script.onerror = () => reject(new Error("File data game tidak ditemukan"));

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
const orderNowBtn = document.getElementById("order-now-btn");
const orderModal = document.getElementById("order-modal");
const modalClose = document.getElementById("modal-close");
const copyBtn = document.getElementById("copy-order-btn");
const orderSection = document.getElementById("order-section");
const previewEl = document.getElementById("preview-order");
const backHomeLink = document.getElementById("back-home-link");
const backTop = document.getElementById("back-top");

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

function normalizeField(field) {
  if (typeof field === "string") {
    return {
      type: "text",
      label: field,
      placeholder: `Masukkan ${field}`
    };
  }

  return {
    type: field.type || "text",
    label: field.label || "Field",
    placeholder: field.placeholder || `Masukkan ${field.label || "Field"}`,
    options: Array.isArray(field.options) ? field.options : []
  };
}

function createField(field, index) {
  const config = normalizeField(field);

  const wrapper = document.createElement("div");
  wrapper.className = "form-group";

  const label = document.createElement("label");
  label.textContent = config.label;

  let input;

  if (config.type === "select") {
    input = document.createElement("select");

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = `Pilih ${config.label}`;
    input.appendChild(defaultOption);

    config.options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt;
      input.appendChild(option);
    });
  } else {
    input = document.createElement("input");
    input.type = "text";
    input.placeholder = config.placeholder;
  }

  input.dataset.label = config.label;
  input.addEventListener("input", updateWhatsappLink);

  wrapper.appendChild(label);
  wrapper.appendChild(input);

  return wrapper;
}

function renderFields() {
  fieldsEl.innerHTML = "";
  (gameData.formFields || []).forEach((field, i) => {
    fieldsEl.appendChild(createField(field, i));
  });
}

function createPriceCard(item) {
  const card = document.createElement("div");
  card.className = "price-item";

  card.innerHTML = `
    <h3>${item.name}</h3>
    <p class="price">${item.price}</p>
  `;

  card.onclick = () => {
    selectedProductEl.value = item.name;
    selectedPriceEl.value = item.price;
    quantityEl.value = 1;

    document.querySelectorAll(".price-item").forEach(el => el.classList.remove("selected"));
    card.classList.add("selected");

    updateTotalPrice();
    updateWhatsappLink();

    orderSection.scrollIntoView({ behavior: "smooth" });
  };

  return card;
}

function renderPriceList() {
  listEl.innerHTML = "";

  if (gameData.categories) {
    gameData.categories.forEach(cat => {
      const section = document.createElement("div");

      section.innerHTML = `<h3>${cat.title}</h3>`;

      const grid = document.createElement("div");
      grid.className = "price-category-grid";

      cat.items.forEach(item => grid.appendChild(createPriceCard(item)));

      section.appendChild(grid);
      listEl.appendChild(section);
    });
  }
}

function buildOrderText() {
  const inputs = fieldsEl.querySelectorAll("input, select");
  const lines = [];

  lines.push(`Pesanan ${gameData.title}`);
  lines.push("");

  inputs.forEach(input => {
    lines.push(`${input.dataset.label}: ${input.value || "-"}`);
  });

  lines.push(`Produk: ${selectedProductEl.value || "-"}`);
  lines.push(`Harga Satuan: ${selectedPriceEl.value || "-"}`);
  lines.push(`Kuantitas: ${getQuantity()}`);
  lines.push(`Total Harga: ${totalPriceEl.value || "-"}`);

  return lines.join("\n");
}

function updateWhatsappLink() {
  if (!gameData) return;

  updateTotalPrice();

  const text = buildOrderText();
  previewEl.value = text;

  const encoded = encodeURIComponent(text);
  contactBtn.href = `https://wa.me/${gameData.contact}?text=${encoded}`;
}

/* MODAL */
function openModal() {
  updateWhatsappLink();
  orderModal.classList.add("active");
}

function closeModal() {
  orderModal.classList.remove("active");
}

orderNowBtn.onclick = openModal;
modalClose.onclick = closeModal;

orderModal.onclick = (e) => {
  if (e.target === orderModal) closeModal();
};

/* COPY */
copyBtn.onclick = () => {
  navigator.clipboard.writeText(previewEl.value);
  copyBtn.textContent = "Copied";
  setTimeout(() => copyBtn.textContent = "Copy", 1000);
};

/* QTY */
qtyMinusBtn.onclick = () => {
  quantityEl.value = Math.max(1, getQuantity() - 1);
  updateWhatsappLink();
};

qtyPlusBtn.onclick = () => {
  quantityEl.value = getQuantity() + 1;
  updateWhatsappLink();
};

/* BACK */
if (backHomeLink) {
  backHomeLink.onclick = (e) => {
    e.preventDefault();
    document.body.classList.add("page-leaving");
    setTimeout(() => window.location.href = backHomeLink.href, 180);
  };
}

if (backTop) {
  backTop.onclick = (e) => {
    e.preventDefault();
    document.body.classList.add("page-leaving");
    setTimeout(() => window.location.href = backTop.href, 180);
  };
}

/* INIT */
async function initGamePage() {
  try {
    gameData = await loadGameData(getGameKey());

    titleEl.textContent = gameData.title;
    subtitleEl.textContent = gameData.subtitle;

    renderFields();
    renderPriceList();

    updateWhatsappLink();
  } catch (err) {
    titleEl.textContent = "Game tidak ditemukan";
    listEl.innerHTML = `<div class="empty-state">Data tidak ada</div>`;
  }
}

initGamePage();
