const PRICE_LIST = {
  "mobile-legends": {
    title: "Mobile Legends",
    subtitle: "Top Up Diamond Murah dan Aman",
    contact: "6281234567890",
    formFields: ["User ID", "Zone ID", "Nickname"],
    items: [
      { name: "86 Diamond", price: "Rp 20.000" },
      { name: "172 Diamond", price: "Rp 39.000" },
      { name: "257 Diamond", price: "Rp 58.000" }
    ]
  }
};

function getGameKey() {
  const params = new URLSearchParams(window.location.search);
  return params.get("game") || "mobile-legends";
}

const gameKey = getGameKey();
const gameData = PRICE_LIST[gameKey] || PRICE_LIST["mobile-legends"];

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

titleEl.textContent = gameData.title;
subtitleEl.textContent = gameData.subtitle;

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
  const text = buildOrderText();
  previewEl.value = text;

  const encoded = encodeURIComponent(text);
  contactBtn.href = `https://wa.me/${gameData.contact}?text=${encoded}`;
}

noteEl.addEventListener("input", updatePreview);

copyBtn.addEventListener("click", async () => {
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

renderFields();
renderPriceList();
updatePreview();
