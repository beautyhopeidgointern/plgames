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

titleEl.textContent = gameData.title;
subtitleEl.textContent = gameData.subtitle;

function renderFields() {
  fieldsEl.innerHTML = "";
  gameData.formFields.forEach((field, index) => {
    const safeId = `field-${index}`;

    const label = document.createElement("label");
    label.textContent = field;

    const input = document.createElement("input");
    input.type = "text";
    input.id = safeId;
    input.dataset.label = field;
    input.placeholder = `Masukkan ${field}`;

    input.addEventListener("input", updatePreview);

    fieldsEl.appendChild(label);
    fieldsEl.appendChild(input);
  });
}

function renderPriceList() {
  listEl.innerHTML = "";
  gameData.items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "price-item";

    card.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.price}</p>
      <button type="button">Pilih</button>
    `;

    const btn = card.querySelector("button");
    btn.addEventListener("click", () => {
      selectedProductEl.value = item.name;
      selectedPriceEl.value = item.price;
      updatePreview();
      orderSection.scrollIntoView({ behavior: "smooth" });
    });

    listEl.appendChild(card);
  });
}

function updatePreview() {
  const dynamicInputs = fieldsEl.querySelectorAll("input");
  const lines = [];

  lines.push(`Pesanan ${gameData.title}`);
  lines.push("");

  dynamicInputs.forEach((input) => {
    lines.push(`${input.dataset.label}: ${input.value || "-"}`);
  });

  lines.push(`Produk: ${selectedProductEl.value || "-"}`);
  lines.push(`Harga: ${selectedPriceEl.value || "-"}`);
  lines.push(`Catatan: ${document.getElementById("note").value || "-"}`);

  previewEl.value = lines.join("\n");

  const message = encodeURIComponent(previewEl.value);
  contactBtn.href = `https://wa.me/${gameData.contact}?text=${message}`;
}

document.getElementById("note").addEventListener("input", updatePreview);

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(previewEl.value);
    copyBtn.textContent = "Berhasil Disalin";
    setTimeout(() => {
      copyBtn.textContent = "Salin Pesanan";
    }, 1500);
  } catch (err) {
    alert("Gagal menyalin pesanan");
  }
});

renderFields();
renderPriceList();
updatePreview();
