const gameListEl = document.getElementById("game-list");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHomeGames() {
  const games = Array.isArray(window.GAME_CATALOG) ? window.GAME_CATALOG : [];

  if (!games.length) {
    gameListEl.innerHTML = `<div class="empty-state">Belum ada game yang ditambahkan.</div>`;
    return;
  }

  gameListEl.innerHTML = "";

  games.forEach((game) => {
    const link = document.createElement("a");
    link.className = "game-card";
    link.href = `./game.html?game=${encodeURIComponent(game.slug)}`;

    const safeName = escapeHtml(game.name || "Game");
    const safeDescription = escapeHtml(
      game.description || "Price list game tersedia di halaman ini."
    );
    const safeIconText = escapeHtml(game.icon || "🎮");

    const logoContent = game.logo
      ? `<img src="${escapeHtml(game.logo)}" alt="${safeName}" loading="lazy" />`
      : `<span>${safeIconText}</span>`;

    link.innerHTML = `
      <div class="game-card-top">
        <div class="game-icon">${logoContent}</div>
        <div>
          <h3>${safeName}</h3>
        </div>
      </div>
      <p>${safeDescription}</p>
      <span class="open-text">Buka Price List →</span>
    `;

    gameListEl.appendChild(link);
  });
}

renderHomeGames();
