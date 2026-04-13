const gameListEl = document.getElementById("game-list");

function renderHomeGames() {
  const games = window.GAME_CATALOG || [];

  if (!games.length) {
    gameListEl.innerHTML = `<div class="empty-state">Belum ada game yang ditambahkan.</div>`;
    return;
  }

  gameListEl.innerHTML = "";

  games.forEach((game) => {
    const link = document.createElement("a");
    link.className = "game-card";
    link.href = `./game.html?game=${encodeURIComponent(game.slug)}`;

    link.innerHTML = `
      <div class="game-card-top">
        <div class="game-icon">${game.icon || "🎮"}</div>
        <div>
          <h3>${game.name}</h3>
        </div>
      </div>
      <p>${game.description || "Price list game tersedia di halaman ini."}</p>
      <span class="open-text">Buka Price List →</span>
    `;

    gameListEl.appendChild(link);
  });
}

renderHomeGames();
