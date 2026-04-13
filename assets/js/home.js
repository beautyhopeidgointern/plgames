const gameListEl = document.getElementById("game-list");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function goToGame(slug) {
  document.body.classList.add("page-leaving");

  setTimeout(() => {
    window.location.href = `./game.html?game=${encodeURIComponent(slug)}`;
  }, 180);
}

function renderHomeGames() {
  const games = Array.isArray(window.GAME_CATALOG) ? window.GAME_CATALOG : [];

  if (!games.length) {
    gameListEl.innerHTML = `<div class="empty-state">Belum ada game yang ditambahkan.</div>`;
    return;
  }

  gameListEl.innerHTML = "";

  games.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    const safeName = escapeHtml(game.name || "Game");
    const safeDescription = escapeHtml(
      game.description || "Price list game tersedia di halaman ini."
    );
    const safeIconText = escapeHtml(game.icon || "🎮");

    const logoContent = game.logo
      ? `<img src="${escapeHtml(game.logo)}" alt="${safeName}" loading="lazy" draggable="false" />`
      : `<span>${safeIconText}</span>`;

    card.innerHTML = `
      <div class="game-card-top">
        <div class="game-icon">${logoContent}</div>
        <div>
          <h3>${safeName}</h3>
        </div>
      </div>
      <p>${safeDescription}</p>
      <span class="open-text">Buka Price List →</span>
    `;

    card.addEventListener("click", () => {
      goToGame(game.slug);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goToGame(game.slug);
      }
    });

    gameListEl.appendChild(card);
  });
}

renderHomeGames();
