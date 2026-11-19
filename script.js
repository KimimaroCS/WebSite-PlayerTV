/* =====================================================
   NEXIUMFILMS — Films / Séries / Anime + Vidy.st
===================================================== */

const STORAGE_KEYS = {
    movies: "nexiumfilms_movies",
    series: "nexiumfilms_series",
    anime: "nexiumfilms_anime",
    seeded: "nexiumfilms_seeded_v2",
};

const VIDY_BASE = "https://vidy.st";
const VIDY_COLOR = "E50914";

const genreMap = {
    28: "Action",
    878: "Science-Fiction",
    14: "Fantastique",
    35: "Comédie",
    27: "Horreur",
    10749: "Romance",
    53: "Thriller",
    12: "Aventure",
    16: "Animation",
    18: "Drame",
    80: "Crime",
    9648: "Mystère",
    10751: "Familial",
    36: "Histoire",
    10752: "Guerre",
    37: "Western",
};

let movies = JSON.parse(localStorage.getItem(STORAGE_KEYS.movies) || "null") || [];
let series = JSON.parse(localStorage.getItem(STORAGE_KEYS.series) || "null") || [];
let anime = JSON.parse(localStorage.getItem(STORAGE_KEYS.anime) || "null") || [];

let currentEpisodeItem = null;
let currentEpisodeKind = null;

const movieGrid = document.getElementById("movieGrid");
const seriesGrid = document.getElementById("seriesGrid");
const animeGrid = document.getElementById("animeGrid");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchResultsSection = document.getElementById("searchResultsSection");
const searchResultsTitle = document.getElementById("searchResultsTitle");
const heroBackground = document.getElementById("heroBackground");
const heroTitle = document.getElementById("heroTitle");
const heroMeta = document.getElementById("heroMeta");
const heroGenres = document.getElementById("heroGenres");
const heroDescription = document.getElementById("heroDescription");
const heroType = document.getElementById("heroType");
const heroPlayButton = document.getElementById("heroPlayButton");
const playerModal = document.getElementById("playerModal");
const videoPlayer = document.getElementById("videoPlayer");
const closePlayerButton = document.getElementById("closePlayerButton");
const episodeControls = document.getElementById("episodeControls");
const seasonControl = document.getElementById("seasonControl");
const seasonSelect = document.getElementById("seasonSelect");
const episodeSelect = document.getElementById("episodeSelect");
const playEpisodeButton = document.getElementById("playEpisodeButton");
const themeGrid = document.getElementById("themeGrid");
const themeRows = document.getElementById("themeRows");
const themeCount = document.getElementById("themeCount");
const movieCount = document.getElementById("movieCount");
const seriesCount = document.getElementById("seriesCount");
const animeCount = document.getElementById("animeCount");

/* =====================================================
   DEMO SEED (first visit)
===================================================== */

function seedDemoLibrary() {
    if (localStorage.getItem(STORAGE_KEYS.seeded) === "1") return;
    if (movies.length || series.length || anime.length) {
        localStorage.setItem(STORAGE_KEYS.seeded, "1");
        return;
    }

    movies = [
        {
            id: 27205,
            title: "Inception",
            year: "2010",
            poster: "https://image.tmdb.org/t/p/w500/ljsZTbVdnXnQu2qJSw6RRk0iQXU.jpg",
            backdrop: "https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
            overview: "Un voleur s'infiltre dans les rêves pour voler des secrets — et tenter l'impossible.",
            runtime: 148,
            rating: 8.4,
            genreIds: [28, 878, 12],
            genres: ["Action", "Science-Fiction", "Aventure"],
            type: "movie",
        },
        {
            id: 155,
            title: "The Dark Knight",
            year: "2008",
            poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
            backdrop: "https://image.tmdb.org/t/p/w1280/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
            overview: "Batman affronte le Joker dans une Gotham au bord du chaos.",
            runtime: 152,
            rating: 8.5,
            genreIds: [28, 80, 18],
            genres: ["Action", "Crime", "Drame"],
            type: "movie",
        },
        {
            id: 157336,
            title: "Interstellar",
            year: "2014",
            poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
            backdrop: "https://image.tmdb.org/t/p/w1280/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
            overview: "Des explorateurs franchissent un trou de ver pour sauver l'humanité.",
            runtime: 169,
            rating: 8.4,
            genreIds: [878, 18, 12],
            genres: ["Science-Fiction", "Drame", "Aventure"],
            type: "movie",
        },
    ];

    series = [
        {
            id: 1396,
            title: "Breaking Bad",
            year: "2008",
            poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
            backdrop: "https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
            overview: "Un prof de chimie bascule dans le crime pour sécuriser l'avenir de sa famille.",
            rating: 8.9,
            genreIds: [18, 80],
            genres: ["Drame", "Crime"],
            type: "serie",
            seasons: [
                {
                    season_number: 1,
                    name: "Saison 1",
                    episodes: Array.from({ length: 7 }, (_, i) => ({
                        episode_number: i + 1,
                        name: "Épisode " + (i + 1),
                    })),
                },
            ],
        },
        {
            id: 66732,
            title: "Stranger Things",
            year: "2016",
            poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
            backdrop: "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypAEIE5.jpg",
            overview: "À Hawkins, un monde parallèle menace une bande d'amis.",
            rating: 8.6,
            genreIds: [18, 10765, 9648],
            genres: ["Drame", "Mystère"],
            type: "serie",
            seasons: [
                {
                    season_number: 1,
                    name: "Saison 1",
                    episodes: Array.from({ length: 8 }, (_, i) => ({
                        episode_number: i + 1,
                        name: "Épisode " + (i + 1),
                    })),
                },
            ],
        },
    ];

    anime = [
        {
            id: 16498,
            title: "Attack on Titan",
            year: "2013",
            poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-C6FPmWmNAAmO.jpg",
            backdrop: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCMsnvyPt.jpg",
            overview: "L'humanité survit derrière des murs face à des titans dévoreurs.",
            rating: 8.5,
            episodeCount: 25,
            genres: ["Action", "Drame", "Fantastique"],
            type: "anime",
        },
        {
            id: 101922,
            title: "Demon Slayer",
            year: "2019",
            poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blf.jpg",
            backdrop: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-YfwMiPlnJsYx.jpg",
            overview: "Tanjiro devient pourfendeur de démons pour sauver sa sœur.",
            rating: 8.5,
            episodeCount: 26,
            genres: ["Action", "Aventure", "Fantastique"],
            type: "anime",
        },
        {
            id: 21,
            title: "One Piece",
            year: "1999",
            poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx21-tXMN3Y33qgO5.jpg",
            backdrop: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VekZmKba.jpg",
            overview: "Luffy et son équipage cherchent le One Piece au bout des mers.",
            rating: 8.7,
            episodeCount: 20,
            genres: ["Action", "Aventure", "Comédie"],
            type: "anime",
        },
    ];

    persistLibrary();
    localStorage.setItem(STORAGE_KEYS.seeded, "1");
}

function persistLibrary() {
    localStorage.setItem(STORAGE_KEYS.movies, JSON.stringify(movies));
    localStorage.setItem(STORAGE_KEYS.series, JSON.stringify(series));
    localStorage.setItem(STORAGE_KEYS.anime, JSON.stringify(anime));
}

/* =====================================================
   HELPERS
===================================================== */

function getGenres(item) {
    if (item.genreIds && Array.isArray(item.genreIds)) {
        return item.genreIds.map((id) => genreMap[id]).filter(Boolean);
    }

    if (item.genres && Array.isArray(item.genres)) {
        return item.genres
            .map((genre) => (typeof genre === "string" ? genre : genre.name || ""))
            .filter(Boolean);
    }

    return [];
}

function formatRuntime(minutes) {
    if (!minutes || minutes <= 0) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return mins + " min";
    if (mins === 0) return hours + "h";
    return hours + "h " + mins + "min";
}

function getAllMedia() {
    return movies.concat(series, anime);
}

function getThemeItems(theme) {
    return getAllMedia().filter((item) => getGenres(item).includes(theme));
}

function typeLabel(item) {
    if (item.type === "serie") return "SÉRIE";
    if (item.type === "anime") return "ANIME";
    return "FILM";
}

function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, (character) => {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
        }[character];
    });
}

function slugify(value) {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function setCountLabel(el, count, singular) {
    if (!el) return;
    el.textContent = count + " " + singular + (count > 1 ? "S" : "");
}

/* =====================================================
   VIDY.ST
===================================================== */

function withVidyParams(extra) {
    const params = new URLSearchParams({
        color: VIDY_COLOR,
        autoplay: "true",
        ...extra,
    });
    return params.toString();
}

function buildVidyMovieUrl(tmdbId) {
    return VIDY_BASE + "/movie/" + encodeURIComponent(tmdbId) + "?" + withVidyParams();
}

function buildVidyTvUrl(tmdbId, season, episode) {
    return (
        VIDY_BASE +
        "/tv/" +
        encodeURIComponent(tmdbId) +
        "/" +
        encodeURIComponent(season) +
        "/" +
        encodeURIComponent(episode) +
        "?" +
        withVidyParams({
            nextEpisode: "true",
            episodeSelector: "true",
            autoplayNextEpisode: "true",
        })
    );
}

function buildVidyAnimeUrl(anilistId, episode) {
    return (
        VIDY_BASE +
        "/anime/" +
        encodeURIComponent(anilistId) +
        "/" +
        encodeURIComponent(episode) +
        "?" +
        withVidyParams({
            nextEpisode: "true",
            episodeSelector: "true",
            autoplayNextEpisode: "true",
        })
    );
}

/* =====================================================
   CARDS
===================================================== */

function createMediaCard(item) {
    const card = document.createElement("div");
    card.className = "movie-card";

    const image =
        item.poster ||
        "https://via.placeholder.com/500x750?text=NexiumFilms";

    const genres = getGenres(item).slice(0, 2).join(" • ");
    let meta = item.year || "";

    if (item.type === "serie") {
        const seasons = item.seasons ? item.seasons.length : 0;
        if (seasons) {
            meta += (meta ? " • " : "") + seasons + " saison" + (seasons > 1 ? "s" : "");
        }
    } else if (item.type === "anime") {
        const eps = item.episodeCount || 0;
        if (eps) meta += (meta ? " • " : "") + eps + " ép.";
    } else if (genres) {
        meta += (meta ? " • " : "") + genres;
    }

    card.innerHTML = `
        <img src="${escapeHTML(image)}" alt="${escapeHTML(item.title)}" loading="lazy">
        <div class="type-badge">${typeLabel(item)}</div>
        <div class="play-button">▶</div>
        <div class="movie-info">
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(meta)}</p>
        </div>
    `;

    card.addEventListener("click", () => openItem(item));
    return card;
}

function openItem(item) {
    if (item.type === "serie") openSeriesPlayer(item);
    else if (item.type === "anime") openAnimePlayer(item);
    else openMoviePlayer(item);
}

function fillRow(container, list, emptyText) {
    container.innerHTML = "";

    if (!list.length) {
        container.innerHTML = `<div class="empty-library">${escapeHTML(emptyText)}</div>`;
        return;
    }

    list.forEach((item) => container.appendChild(createMediaCard(item)));
}

function displayMovies(list) {
    fillRow(movieGrid, list, "Aucun film — ajoute-en depuis l'admin.");
    setCountLabel(movieCount, list.length, "TITRE");
}

function displaySeries(list) {
    fillRow(seriesGrid, list, "Aucune série — ajoute-en depuis l'admin.");
    setCountLabel(seriesCount, list.length, "TITRE");
}

function displayAnime(list) {
    fillRow(animeGrid, list, "Aucun anime — ajoute-en depuis l'admin.");
    setCountLabel(animeCount, list.length, "TITRE");
}

/* =====================================================
   THEMES
===================================================== */

function getAvailableThemes() {
    const themes = [];

    getAllMedia().forEach((item) => {
        getGenres(item).forEach((genre) => {
            if (!themes.includes(genre)) themes.push(genre);
        });
    });

    return Object.values(genreMap)
        .concat(["Shounen", "Seinen", "Slice of Life", "Mecha", "Supernatural"])
        .filter((genre, index, arr) => themes.includes(genre) && arr.indexOf(genre) === index)
        .concat(themes.filter((g) => !Object.values(genreMap).includes(g) && !["Shounen", "Seinen", "Slice of Life", "Mecha", "Supernatural"].includes(g)));
}

function displayThemes() {
    themeGrid.innerHTML = "";
    themeRows.innerHTML = "";

    const themes = getAvailableThemes();
    setCountLabel(themeCount, themes.length, "THÈME");

    if (!themes.length) {
        themeGrid.innerHTML =
            '<div class="empty-library">Ajoute des titres pour découvrir les thèmes.</div>';
        return;
    }

    themes.forEach((theme) => {
        createThemeCard(theme);
        createThemeSection(theme);
    });
}

function createThemeCard(theme) {
    const items = getThemeItems(theme);
    const button = document.createElement("a");
    button.className = "theme-card";
    button.href = "#theme-" + slugify(theme);
    button.innerHTML = `
        <strong>${escapeHTML(theme)}</strong>
        <small>${items.length} TITRE${items.length > 1 ? "S" : ""}</small>
    `;
    themeGrid.appendChild(button);
}

function createThemeSection(theme) {
    const items = getThemeItems(theme);
    const section = document.createElement("section");
    section.className = "theme-section";
    section.id = "theme-" + slugify(theme);

    const heading = document.createElement("div");
    heading.className = "theme-heading";
    heading.innerHTML = `
        <h2>${escapeHTML(theme)}</h2>
        <span>${items.length} TITRE${items.length > 1 ? "S" : ""}</span>
    `;

    const row = document.createElement("div");
    row.className = "media-row";
    items.forEach((item) => row.appendChild(createMediaCard(item)));

    section.appendChild(heading);
    section.appendChild(row);
    themeRows.appendChild(section);
}

/* =====================================================
   HERO
===================================================== */

function setupHero() {
    const all = getAllMedia();

    if (!all.length) {
        heroTitle.textContent = "Ta bibliothèque.";
        heroType.textContent = "NEXIUMFILMS";
        heroDescription.textContent =
            "Ajoute films, séries et anime depuis l'administration.";
        heroBackground.style.backgroundImage = "none";
        heroBackground.classList.remove("ready");
        heroPlayButton.disabled = true;
        return;
    }

    const item = all[0];
    heroTitle.textContent = item.title || "NexiumFilms";
    heroType.textContent = typeLabel(item);
    heroDescription.textContent =
        item.overview || "Découvre ce titre dans ta bibliothèque.";

    if (item.backdrop || item.poster) {
        heroBackground.style.backgroundImage = `url("${item.backdrop || item.poster}")`;
        heroBackground.classList.add("ready");
    }

    heroMeta.innerHTML = "";
    if (item.year) {
        const year = document.createElement("span");
        year.textContent = item.year;
        heroMeta.appendChild(year);
    }
    if (item.runtime) {
        const runtime = document.createElement("span");
        runtime.textContent = "• " + formatRuntime(item.runtime);
        heroMeta.appendChild(runtime);
    }
    if (item.rating) {
        const rating = document.createElement("span");
        rating.textContent = "• ★ " + Number(item.rating).toFixed(1);
        heroMeta.appendChild(rating);
    }

    heroGenres.innerHTML = "";
    getGenres(item)
        .slice(0, 4)
        .forEach((genre) => {
            const el = document.createElement("span");
            el.className = "hero-genre";
            el.textContent = genre;
            heroGenres.appendChild(el);
        });

    heroPlayButton.disabled = false;
    heroPlayButton.onclick = () => openItem(item);
}

/* =====================================================
   PLAYERS
===================================================== */

function openMoviePlayer(item) {
    episodeControls.classList.add("hidden");
    playerModal.classList.add("active");
    playerModal.setAttribute("aria-hidden", "false");
    videoPlayer.src = buildVidyMovieUrl(item.id);
}

function openSeriesPlayer(item) {
    currentEpisodeItem = item;
    currentEpisodeKind = "serie";
    playerModal.classList.add("active");
    playerModal.setAttribute("aria-hidden", "false");
    episodeControls.classList.remove("hidden");
    seasonControl.classList.remove("hidden");
    videoPlayer.src = "";
    setupSeriesControls(item);
}

function openAnimePlayer(item) {
    currentEpisodeItem = item;
    currentEpisodeKind = "anime";
    playerModal.classList.add("active");
    playerModal.setAttribute("aria-hidden", "false");
    episodeControls.classList.remove("hidden");
    seasonControl.classList.add("hidden");
    videoPlayer.src = "";
    setupAnimeControls(item);
}

function setupSeriesControls(item) {
    seasonSelect.innerHTML = "";
    const seasons = item.seasons || [];

    if (!seasons.length) {
        const option = document.createElement("option");
        option.value = "1";
        option.textContent = "Saison 1";
        seasonSelect.appendChild(option);
        loadEpisodesForSelectedSeason(item);
        return;
    }

    seasons.forEach((season) => {
        const option = document.createElement("option");
        option.value = season.season_number;
        option.textContent = season.name || "Saison " + season.season_number;
        seasonSelect.appendChild(option);
    });

    loadEpisodesForSelectedSeason(item);
}

function loadEpisodesForSelectedSeason(item) {
    episodeSelect.innerHTML = "";
    const seasonNumber = Number(seasonSelect.value);
    const season = (item.seasons || []).find(
        (s) => Number(s.season_number) === seasonNumber
    );

    if (season && season.episodes && season.episodes.length) {
        season.episodes.forEach((episode) => {
            const option = document.createElement("option");
            option.value = episode.episode_number;
            option.textContent =
                "Épisode " +
                episode.episode_number +
                (episode.name ? " — " + episode.name : "");
            episodeSelect.appendChild(option);
        });
        return;
    }

    for (let i = 1; i <= 10; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = "Épisode " + i;
        episodeSelect.appendChild(option);
    }
}

function setupAnimeControls(item) {
    episodeSelect.innerHTML = "";
    const total = Math.max(1, Number(item.episodeCount) || 12);

    for (let i = 1; i <= total; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = "Épisode " + i;
        episodeSelect.appendChild(option);
    }
}

function playSelectedEpisode() {
    if (!currentEpisodeItem) return;

    const episode = Number(episodeSelect.value) || 1;

    if (currentEpisodeKind === "anime") {
        videoPlayer.src = buildVidyAnimeUrl(currentEpisodeItem.id, episode);
        return;
    }

    const season = Number(seasonSelect.value) || 1;
    videoPlayer.src = buildVidyTvUrl(currentEpisodeItem.id, season, episode);
}

function closePlayer() {
    playerModal.classList.remove("active");
    playerModal.setAttribute("aria-hidden", "true");
    videoPlayer.src = "";
    currentEpisodeItem = null;
    currentEpisodeKind = null;
}

seasonSelect.addEventListener("change", () => {
    if (currentEpisodeItem && currentEpisodeKind === "serie") {
        loadEpisodesForSelectedSeason(currentEpisodeItem);
    }
});

playEpisodeButton.addEventListener("click", playSelectedEpisode);
closePlayerButton.addEventListener("click", closePlayer);

playerModal.addEventListener("click", (event) => {
    if (event.target === playerModal) closePlayer();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePlayer();
});

/* =====================================================
   SEARCH + NAV
===================================================== */

searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        searchResultsSection.classList.add("hidden");
        return;
    }

    const results = getAllMedia().filter((item) => {
        const title = (item.title || "").toLowerCase();
        const genres = getGenres(item).join(" ").toLowerCase();
        return title.includes(query) || genres.includes(query);
    });

    searchResultsSection.classList.remove("hidden");
    searchResultsTitle.textContent =
        results.length + " résultat" + (results.length > 1 ? "s" : "");
    searchResults.innerHTML = "";
    results.forEach((item) => searchResults.appendChild(createMediaCard(item)));
});

function setupNavigation() {
    const links = document.querySelectorAll("nav a");
    links.forEach((link) => {
        link.addEventListener("click", () => {
            links.forEach((other) => other.classList.remove("active"));
            link.classList.add("active");
        });
    });
}

function setupRowNav() {
    document.querySelectorAll(".row-nav").forEach((button) => {
        button.addEventListener("click", () => {
            const row = document.getElementById(button.dataset.row);
            if (!row) return;
            const delta = button.classList.contains("next") ? 1 : -1;
            row.scrollBy({ left: delta * (row.clientWidth * 0.8), behavior: "smooth" });
        });
    });
}

window.addEventListener("scroll", () => {
    document.querySelector(".navbar").classList.toggle("scrolled", window.scrollY > 40);
});

/* =====================================================
   INIT
===================================================== */

seedDemoLibrary();
setupNavigation();
setupRowNav();
displayMovies(movies);
displaySeries(series);
displayAnime(anime);
displayThemes();
setupHero();
