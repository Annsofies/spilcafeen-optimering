"use strict";

// ===== APP INITIALISERING =====
// Start app når DOM er loaded (hele HTML siden er færdig med at indlæse)
document.addEventListener("DOMContentLoaded", initApp);

// Global variabel til alle film - tilgængelig for alle funktioner
let allGames = [];

// #1: Initialize the app - sæt event listeners og hent data
function initApp() {
  getGames(); // Hent film data fra JSON fil
  document
    .querySelector("#search-input")
    .addEventListener("input", filterGames);

  document
    .querySelector("#genre-select1")
    .addEventListener("change", filterGames);

  document
    .querySelector("#genre-select2")
    .addEventListener("change", filterGames);

  document
    .querySelector("#players-select")
    .addEventListener("change", filterGames);

  document
    .querySelector("#clear-filters")
    .addEventListener("click", clearAllFilters);

  document
    .querySelector("#sort-select")
    .addEventListener("change", filterGames);
}

async function getGames() {
  // Hent data fra URL - await venter på svar før vi går videre
  let response = await fetch(
    "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json",
  );

  allGames = await response.json();

  populateGenreDropdown(); // Udfyld dropdown med genrer fra data
  displayGames(allGames); // Vis alle film ved start
}

// Loop gennem alle film og vis hver enkelt
for (const game of allGames) {
  displayGame(game); // Kald displayMovie for hver film
}

// #4: Render a single game card and add event listeners - lav et spil kort

function getGameImage(game) {
  const localImages = {
    Backgammon: "img/backgammon.webp",
    Catan: "img/catan.webp",
    Cluedo: "img/cluedo.webp",
    Ludo: "img/ludo.webp",
    Matador: "img/matador.webp",
    Monopoly: "img/monopoly.webp",
    Partners: "img/partners.webp",
    Risk: "img/risk.webp",
    Sequence: "img/sequence.webp",
    Skak: "img/skak.webp",
    Stratego: "img/stratego.webp",
    Uno: "img/uno.webp",
    Yatzy: "img/yatzy.webp",
  };

  return localImages[game.title] || game.image;
}

function displayGame(game) {
  const gameList = document.querySelector("#game-list"); // Find container til film

  // Byg HTML struktur dynamisk - template literal med ${} til at indsætte data
  const gameHTML = `
  <article class="game-card">
    <img
      src="${getGameImage(game)}"
      alt="Forside til ${game.title}"
      class="game-poster"
      loading="lazy"
    />

    <div class="game-info">
      <h2>${game.title}</h2>

      <p class="game-rating" aria-label="Rating ${game.rating} ud af 5">
        ★ ${game.rating}
      </p>

      <p class="game-playtime">
        Ca. ${game.playtime} min.
      </p>

      <p class="game-players">
        ${game.players.min} - ${game.players.max} spillere
      </p>

      <p class="game-genre">
        ${Array.isArray(game.genre) ? game.genre.join(", ") : game.genre}
      </p>

      <button
        class="read-more-btn"
        type="button"
        aria-label="Læs mere om ${game.title}"
      >
        Læs mere om spillet
      </button>
    </div>
  </article>
`;

  // Tilføj game card til DOM (HTML) - insertAdjacentHTML sætter HTML ind uden at overskrive
  gameList.insertAdjacentHTML("beforeend", gameHTML);

  // Find det kort vi lige har tilføjet (det sidste element)
  const newCard = gameList.lastElementChild;
  const readMoreButton = newCard.querySelector(".read-more-btn");

  readMoreButton.addEventListener("click", function () {
    showGameModal(game);
  });
}

// ===== DROPDOWN OG MODAL FUNKTIONER =====
// #5: Udfyld genre-dropdown med alle unikke genrer fra data
function populateGenreDropdown() {
  // Players dropdown
  const playersSelect = document.querySelector("#players-select");
  const playerCounts = new Set();
  for (const game of allGames) {
    if (
      game.players &&
      typeof game.players.min === "number" &&
      typeof game.players.max === "number"
    ) {
      for (let i = game.players.min; i <= game.players.max; i++) {
        playerCounts.add(i);
      }
    }
  }
  const sortedPlayers = Array.from(playerCounts).sort((a, b) => a - b);
  playersSelect.innerHTML = '<option value="all">Antal spillere</option>';
  sortedPlayers.forEach((num) => {
    playersSelect.innerHTML += `<option value="${num}">${num} spillere</option>`;
  });
  // Genre dropdown
  const genreSelect = document.querySelector("#genre-select1");
  const genres = new Set();

  for (const game of allGames) {
    if (Array.isArray(game.genre)) {
      game.genre.forEach((genre) => genres.add(genre));
    } else if (game.genre) {
      genres.add(game.genre);
    }
  }
  genreSelect.innerHTML = '<option value="all">Kategori</option>';
  genres.forEach((genre) => {
    genreSelect.innerHTML += `<option value="${genre}">${genre}</option>`;
  });

  // Playtime dropdown
  const playtimeSelect = document.querySelector("#genre-select2");
  const playtimes = new Set();
  for (const game of allGames) {
    if (game.playtime) playtimes.add(game.playtime);
  }
  // Sort playtimes numerically
  const sortedPlaytimes = Array.from(playtimes).sort((a, b) => a - b);
  playtimeSelect.innerHTML = '<option value="all">Varighed</option>';
  sortedPlaytimes.forEach((time) => {
    playtimeSelect.innerHTML += `<option value="${time}">${time} min.</option>`;
  });
}

// #6: Vis game i modal dialog - popup vindue med spil detaljerx
// Find modal indhold container og byg HTML struktur dynamisk
function showGameModal(game) {
  document.querySelector("#dialog-content").innerHTML = `
    <img
      src="${getGameImage(game)}"
      alt="Forside til ${game.title}"
      class="game-poster"
    />

    <div class="dialog-details">
      <h2>${game.title}</h2>

      <p class="game-rating" aria-label="Rating ${game.rating} ud af 5">
        ★ ${game.rating}
      </p>

      <p>
        <strong>Spilletid:</strong>
        Ca. ${game.playtime} min.
      </p>

      <p>
        <strong>Antal spillere:</strong>
        ${game.players.min} - ${game.players.max}
      </p>

      <p>
        <strong>Kategori:</strong>
        ${Array.isArray(game.genre) ? game.genre.join(", ") : game.genre || ""}
      </p>

      <p class="game-description">
        ${game.description}
      </p>
    </div>
  `;

  document.querySelector("#game-dialog").showModal();
}

// ===== FILTER FUNKTIONER =====
// #7: Ryd alle filtre - reset alle filter felter til tomme værdier
function clearAllFilters() {
  // Ryd alle input felter - sæt value til tom string eller standard værdi
  document.querySelector("#search-input").value = "";
  document.querySelector("#players-select").value = "all";
  document.querySelector("#genre-select2").value = "all";
  document.querySelector("#genre-select1").value = "all";
  // Hvis du har flere filtre, tilføj dem her

  // Kør filtrering igen (vil vise alle film da alle filtre er ryddet)
  filterGames();
}

// #8: Komplet filtrering med alle funktioner - den vigtigste funktion!
function filterGames() {
  // Hent alle filter værdier fra input felterne
  const searchValue = document
    .querySelector("#search-input")
    .value.toLowerCase();
  const genre1Value = document.querySelector("#genre-select1").value;
  const genre2Value = document.querySelector("#genre-select2").value;
  const playersValue = document.querySelector("#players-select")?.value;

  let filteredGames = allGames;

  // FILTER 1: Søgetekst - filtrer på spil titel
  if (searchValue) {
    filteredGames = filteredGames.filter((game) =>
      game.title.toLowerCase().includes(searchValue),
    );
  }

  // FILTER 2: Genre 1 - filtrer på valgt genre (string match)
  if (genre1Value !== "all") {
    filteredGames = filteredGames.filter((game) => game.genre === genre1Value);
  }

  // FILTER 3: Genre 2 - filtrer på valgt varighed (playtime in minutes)
  if (genre2Value !== "all") {
    filteredGames = filteredGames.filter(
      (game) => String(game.playtime) === genre2Value,
    );
  }

  // FILTER 4: Players
  if (playersValue && playersValue !== "all") {
    const num = Number(playersValue);
    filteredGames = filteredGames.filter(
      (game) =>
        game.players && num >= game.players.min && num <= game.players.max,
    );
  }

  // Sortering
  const sortValue = document.querySelector("#sort-select").value;

  if (sortValue === "popular") {
    filteredGames.sort((a, b) => Number(b.rating) - Number(a.rating));
  }

  if (sortValue === "az") {
    filteredGames.sort((a, b) => a.title.localeCompare(b.title, "da"));
  }

  if (sortValue === "za") {
    filteredGames.sort((a, b) => b.title.localeCompare(a.title, "da"));
  }

  displayGames(filteredGames);
}

// RENDER GAME LIST (called after filtering or loading data)
function displayGames(games) {
  const gameList = document.querySelector("#game-list");
  gameList.innerHTML = "";
  if (!games || games.length === 0) {
    gameList.innerHTML =
      '<p class="no-results">Ingen spil matchede dine filtre </p>';
    return;
  }
  for (const game of games) {
    displayGame(game);
  }
}
