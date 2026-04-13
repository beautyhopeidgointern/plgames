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

    const oldScript = document.getElementById("dynamic-game-data");
    if (oldScript) oldScript.remove();

    const script = document.createElement("script");
    script.id = "dynamic-game-data";
    script.src = `./data/${gameKey}.js`;

    script.onload = () => {
      if (window.PRICE_DATA) {
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
const previewEl = document.getElementById("preview-order");
const copyBtn = document.getElementById("copy-btn");
const contactBtn = document.getElementById("contact-btn");
const orderSection = document.getElementById("order-section");
const noteEl = document.getElementById("note");

let gameData = null;

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
  input.addEventListener("input", updatePreview);

  wrapper.appendChild(label);
  wrapper.appendChild(input);

  return wrapper;
}

function renderFields() {
  fieldsEl.innerHTML = "";
  gameData.formFields.forEach((field, index) => {
    fieldsEl.appendChild(createField(field, index));
  });
}

function renderPriceList() {
  listEl.innerHTML = "";

  gameData.items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "price-item";

    const title = document.createElement("h3");
    title.textContent = item.name;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = item.price;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Pilih";

    button.addEventListener("click", () => {
      selectedProductEl.value = item.name;
      selectedPriceEl.value = item.price;
      updatePreview();
      orderSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(button);

    listEl.appendChild(card);
  });
}

function buildOrderText() {
  const inputs = fieldsEl.querySelectorAll("input");
  const lines = [];

  lines.push(`Pesanan ${gameData.title}`);
  lines.push("");

  inputs.forEach((input) => {
    lines.push(`${input.dataset.label}: ${input.value.trim() || "-"}`);
  });

  lines.push(`Produk: ${selectedProductEl.value || "-"}`);
  lines.push(`Harga: ${selectedPriceEl.value || "-"}`);
  lines.push(`Catatan: ${noteEl.value.trim() || "-"}`);

  return lines.join("\n");
}

function updatePreview() {
  if (!gameData) return;

  const text = buildOrderText();
  previewEl.value = text;

  const encoded = encodeURIComponent(text);
  contactBtn.href = `https://wa.me/${gameData.contact}?text=${encoded}`;
}

noteEl.addEventListener("input", updatePreview);

copyBtn.addEventListener("click", async () => {
  if (!gameData) return;

  const text = buildOrderText();

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Berhasil Disalin";
    setTimeout(() => {
      copyBtn.textContent = "Salin Pesanan";
    }, 1500);
  } catch (error) {
    previewEl.focus();
    previewEl.select();
    document.execCommand("copy");
    copyBtn.textContent = "Berhasil Disalin";
    setTimeout(() => {
      copyBtn.textContent = "Salin Pesanan";
    }, 1500);
  }
});

async function initGamePage() {
  const gameKey = getGameKey();

  try {
    window.PRICE_DATA = null;
    gameData = await loadGameData(gameKey);

    titleEl.textContent = gameData.title;
    subtitleEl.textContent = gameData.subtitle;

    renderFields();
    renderPriceList();
    updatePreview();
  } catch (error) {
    titleEl.textContent = "Game tidak ditemukan";
    subtitleEl.textContent = "Data game belum tersedia atau nama file salah.";

    listEl.innerHTML = `<div class="empty-state">Data price list untuk game ini belum ada.</div>`;
    fieldsEl.innerHTML = "";
    selectedProductEl.value = "";
    selectedPriceEl.value = "";
    previewEl.value = "";
    contactBtn.removeAttribute("href");
  }
}

initGamePage();
