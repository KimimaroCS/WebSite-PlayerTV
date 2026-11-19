/* =========================================================
   NEXIUMFILMS — Administration
========================================================= */

if (sessionStorage.getItem("nexium_admin_auth") !== "1") {
    window.location.replace("login.html");
}

const TMDB_ACCESS_TOKEN =
    "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMDdiZDcwNzE5NDQ0YTUyNTZjMDhmZDM2NmM2ZDJkYyIsIm5iZiI6MTc4ODM3NDA1MS4wNTYsInN1YiI6IjZhOTg2YzIzMTEwZWM4NDE2MGZlYzY5OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.8hsiu3LFAM5vCqWmDpsn0GPnypX2AH_QXWt61xNW3RU";

const STORAGE_KEYS = {
    movies: "nexiumfilms_movies",
    series: "nexiumfilms_series",
    anime: "nexiumfilms_anime",
};

let movies = JSON.parse(localStorage.getItem(STORAGE_KEYS.movies) || "null") || [];
let series = JSON.parse(localStorage.getItem(STORAGE_KEYS.series) || "null") || [];
let anime = JSON.parse(localStorage.getItem(STORAGE_KEYS.anime) || "null") || [];

const mediaSearch = document.getElementById("mediaSearch");
const mediaType = document.getElementById("mediaType");
const searchButton = document.getElementById("searchButton");
const results = document.getElementById("results");
const loading = document.getElementById("loading");
const movieLibrary = document.getElementById("movieLibrary");
const seriesLibrary = document.getElementById("seriesLibrary");
const animeLibrary = document.getElementById("animeLibrary");

function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function persist() {
    localStorage.setItem(STORAGE_KEYS.movies, JSON.stringify(movies));
    localStorage.setItem(STORAGE_KEYS.series, JSON.stringify(series));
    localStorage.setItem(STORAGE_KEYS.anime, JSON.stringify(anime));
}

function formatRuntime(minutes) {
    if (!minutes || Number(minutes) <= 0) return "";
    const hours = Math.floor(Number(minutes) / 60);
    const mins = Number(minutes) % 60;
    if (hours === 0) return mins + " min";
    if (mins === 0) return hours + "h";
    return hours + "h " + mins + "min";
}

function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return div.textContent || div.innerText || "";
}

/* =========================================================
   TMDB
========================================================= */

async function tmdbFetch(endpoint) {
    const response = await fetch("https://api.themoviedb.org/3" + endpoint, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + TMDB_ACCESS_TOKEN,
            accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("TMDB HTTP " + response.status);
    }

    return response.json();
}

/* =========================================================
   ANILIST
========================================================= */

async function anilistSearch(query) {
    const graphql = `
      query ($search: String) {
        Page(page: 1, perPage: 10) {
          media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
            id
            title { romaji english native }
            coverImage { large }
            bannerImage
            description(asHtml: false)
            episodes
            averageScore
            genres
            seasonYear
            format
          }
        }
      }
    `;

    const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            query: graphql,
            variables: { search: query },
        }),
    });

    if (!response.ok) {
        throw new Error("AniList HTTP " + response.status);
    }

    const payload = await response.json();
    if (payload.errors && payload.errors.length) {
        throw new Error(payload.errors[0].message || "AniList error");
    }

    return (payload.data && payload.data.Page && payload.data.Page.media) || [];
}

/* =========================================================
   SEARCH
========================================================= */

async function searchMedia() {
    const query = mediaSearch.value.trim();
    const type = mediaType.value;

    if (!query) {
        alert("Entre le nom d'un film, d'une série ou d'un anime.");
        return;
    }

    loading.innerText = "Recherche de : " + query;
    results.innerHTML = "";

    try {
        if (type === "anime") {
            const list = await anilistSearch(query);
            loading.innerText = list.length + " résultat(s) AniList.";

            if (!list.length) {
                results.innerHTML = "<p>Aucun résultat.</p>";
                return;
            }

            list.forEach((item) => displayAnimeResult(item));
            return;
        }

        const endpoint = type === "movie" ? "/search/movie" : "/search/tv";
        const data = await tmdbFetch(
            endpoint +
                "?language=fr-FR&query=" +
                encodeURIComponent(query) +
                "&include_adult=false"
        );

        loading.innerText = data.results.length + " résultat(s) TMDB.";

        if (!data.results.length) {
            results.innerHTML = "<p>Aucun résultat.</p>";
            return;
        }

        data.results.slice(0, 10).forEach((item) => displayTmdbResult(item, type));
    } catch (error) {
        console.error(error);
        loading.innerText = "";
        results.innerHTML =
            "<p>Erreur : " + escapeHtml(error.message) + "</p>";
    }
}

function displayTmdbResult(item, type) {
    const isMovie = type === "movie";
    const title = isMovie ? item.title : item.name;
    const date = isMovie ? item.release_date : item.first_air_date;
    const year = date ? date.substring(0, 4) : "N/A";
    const poster = item.poster_path
        ? "https://image.tmdb.org/t/p/w500" + item.poster_path
        : "";

    const div = document.createElement("div");
    div.className = "result";
    div.innerHTML =
        '<img src="' +
        escapeHtml(poster) +
        '" alt="' +
        escapeHtml(title) +
        '">' +
        '<div class="result-info">' +
        '<div class="result-type">' +
        (isMovie ? "FILM" : "SÉRIE") +
        "</div>" +
        '<div class="result-title">' +
        escapeHtml(title) +
        "</div>" +
        '<div class="result-year">' +
        escapeHtml(year) +
        "</div>" +
        '<div class="result-id">TMDB ID : ' +
        item.id +
        "</div>" +
        '<button class="add-button">' +
        (isMovie ? "AJOUTER LE FILM" : "AJOUTER LA SÉRIE") +
        "</button>" +
        "</div>";

    div.querySelector(".add-button").addEventListener("click", () => {
        if (isMovie) addMovie(item);
        else addSeries(item);
    });

    results.appendChild(div);
}

function displayAnimeResult(item) {
    const title =
        item.title.english || item.title.romaji || item.title.native || "Anime";
    const year = item.seasonYear || "N/A";
    const poster = (item.coverImage && item.coverImage.large) || "";

    const div = document.createElement("div");
    div.className = "result";
    div.innerHTML =
        '<img src="' +
        escapeHtml(poster) +
        '" alt="' +
        escapeHtml(title) +
        '">' +
        '<div class="result-info">' +
        '<div class="result-type">ANIME</div>' +
        '<div class="result-title">' +
        escapeHtml(title) +
        "</div>" +
        '<div class="result-year">' +
        escapeHtml(String(year)) +
        (item.episodes ? " · " + item.episodes + " ép." : "") +
        "</div>" +
        '<div class="result-id">AniList ID : ' +
        item.id +
        "</div>" +
        '<button class="add-button">AJOUTER L\'ANIME</button>' +
        "</div>";

    div.querySelector(".add-button").addEventListener("click", () => addAnime(item));
    results.appendChild(div);
}

/* =========================================================
   ADD
========================================================= */

async function addMovie(item) {
    if (movies.some((movie) => Number(movie.id) === Number(item.id))) {
        alert("Ce film est déjà dans NexiumFilms.");
        return;
    }

    loading.innerText = "Récupération de " + item.title + "…";

    try {
        const details = await tmdbFetch("/movie/" + item.id + "?language=fr-FR");

        movies.push({
            id: details.id,
            title: details.title || item.title,
            originalTitle: details.original_title || "",
            year: details.release_date ? details.release_date.substring(0, 4) : "",
            poster: details.poster_path
                ? "https://image.tmdb.org/t/p/w500" + details.poster_path
                : "",
            backdrop: details.backdrop_path
                ? "https://image.tmdb.org/t/p/w1280" + details.backdrop_path
                : "",
            overview: details.overview || "",
            runtime: details.runtime || 0,
            rating: details.vote_average || 0,
            voteCount: details.vote_count || 0,
            originalLanguage: details.original_language || "",
            genreIds: details.genres ? details.genres.map((g) => g.id) : [],
            genres: details.genres ? details.genres.map((g) => g.name) : [],
            type: "movie",
        });

        persist();
        loading.innerText = "";
        alert(details.title + " a été ajouté !");
        displayLibraries();
    } catch (error) {
        console.error(error);
        loading.innerText = "";
        alert("Impossible de récupérer les détails TMDB.\n\n" + error.message);
    }
}

async function addSeries(item) {
    if (series.some((show) => Number(show.id) === Number(item.id))) {
        alert("Cette série est déjà dans NexiumFilms.");
        return;
    }

    loading.innerText = "Récupération de " + item.name + "…";

    try {
        const details = await tmdbFetch("/tv/" + item.id + "?language=fr-FR");
        loading.innerText = "Récupération des saisons de " + details.name + "…";
        const seasons = await fetchSeriesSeasons(item.id, details.seasons || []);

        series.push({
            id: details.id,
            title: details.name || item.name,
            originalTitle: details.original_name || "",
            year: details.first_air_date
                ? details.first_air_date.substring(0, 4)
                : "",
            poster: details.poster_path
                ? "https://image.tmdb.org/t/p/w500" + details.poster_path
                : "",
            backdrop: details.backdrop_path
                ? "https://image.tmdb.org/t/p/w1280" + details.backdrop_path
                : "",
            overview: details.overview || "",
            rating: details.vote_average || 0,
            voteCount: details.vote_count || 0,
            originalLanguage: details.original_language || "",
            genreIds: details.genres ? details.genres.map((g) => g.id) : [],
            genres: details.genres ? details.genres.map((g) => g.name) : [],
            seasons: seasons,
            type: "serie",
        });

        persist();
        loading.innerText = "";
        alert(details.name + " a été ajoutée !");
        displayLibraries();
    } catch (error) {
        console.error(error);
        loading.innerText = "";
        alert("Impossible d'ajouter la série.\n\n" + error.message);
    }
}

function addAnime(item) {
    if (anime.some((show) => Number(show.id) === Number(item.id))) {
        alert("Cet anime est déjà dans NexiumFilms.");
        return;
    }

    const title =
        item.title.english || item.title.romaji || item.title.native || "Anime";

    anime.push({
        id: item.id,
        title: title,
        originalTitle: item.title.romaji || item.title.native || "",
        year: item.seasonYear ? String(item.seasonYear) : "",
        poster: (item.coverImage && item.coverImage.large) || "",
        backdrop: item.bannerImage || "",
        overview: stripHtml(item.description || "").slice(0, 400),
        rating: item.averageScore ? item.averageScore / 10 : 0,
        episodeCount: item.episodes || 12,
        genres: item.genres || [],
        format: item.format || "",
        type: "anime",
    });

    persist();
    alert(title + " a été ajouté !");
    displayLibraries();
}

async function fetchSeriesSeasons(seriesId, tmdbSeasons) {
    const seasons = [];
    const normalSeasons = (tmdbSeasons || []).filter(
        (season) => Number(season.season_number) !== 0
    );

    for (const season of normalSeasons) {
        loading.innerText =
            "Saison " + season.season_number + " / " + normalSeasons.length;

        const seasonData = {
            season_number: season.season_number,
            name: season.name || "Saison " + season.season_number,
            episode_count: season.episode_count || 0,
            episodes: [],
        };

        try {
            const data = await tmdbFetch(
                "/tv/" +
                    seriesId +
                    "/season/" +
                    season.season_number +
                    "?language=fr-FR"
            );

            seasonData.episodes = (data.episodes || []).map((episode) => ({
                episode_number: episode.episode_number,
                name: episode.name || "",
                overview: episode.overview || "",
                still_path: episode.still_path
                    ? "https://image.tmdb.org/t/p/w500" + episode.still_path
                    : "",
                air_date: episode.air_date || "",
                runtime: episode.runtime || 0,
                rating: episode.vote_average || 0,
            }));
        } catch (error) {
            console.error("Erreur saison " + season.season_number, error);
            seasonData.episodes = [];
        }

        seasons.push(seasonData);
    }

    return seasons;
}

/* =========================================================
   LIBRARIES
========================================================= */

function displayLibraries() {
    displayMovieLibrary();
    displaySeriesLibrary();
    displayAnimeLibrary();
}

function displayMovieLibrary() {
    movieLibrary.innerHTML = "";

    if (!movies.length) {
        movieLibrary.innerHTML =
            '<p class="empty-library">Aucun film ajouté.</p>';
        return;
    }

    movies.forEach((movie) => {
        const item = document.createElement("div");
        item.className = "library-item";
        const runtime = movie.runtime
            ? formatRuntime(movie.runtime)
            : "Durée inconnue";
        const rating = movie.rating
            ? "★ " + Number(movie.rating).toFixed(1)
            : "";

        item.innerHTML =
            '<div class="library-info"><strong>' +
            escapeHtml(movie.title) +
            "</strong><span>" +
            escapeHtml(movie.year || "") +
            " · TMDB " +
            movie.id +
            " · " +
            escapeHtml(runtime) +
            (rating ? " · " + rating : "") +
            '</span></div><button class="delete-button">SUPPRIMER</button>';

        item.querySelector(".delete-button").addEventListener("click", () => {
            removeMovie(movie.id);
        });

        movieLibrary.appendChild(item);
    });
}

function displaySeriesLibrary() {
    seriesLibrary.innerHTML = "";

    if (!series.length) {
        seriesLibrary.innerHTML =
            '<p class="empty-library">Aucune série ajoutée.</p>';
        return;
    }

    series.forEach((show) => {
        const item = document.createElement("div");
        item.className = "library-item";
        const seasonCount = (show.seasons || []).length;
        const episodeCount = (show.seasons || []).reduce(
            (total, season) =>
                total + (season.episodes ? season.episodes.length : 0),
            0
        );
        const rating = show.rating
            ? "★ " + Number(show.rating).toFixed(1)
            : "";

        item.innerHTML =
            '<div class="library-info"><strong>' +
            escapeHtml(show.title) +
            "</strong><span>" +
            escapeHtml(show.year || "") +
            " · TMDB " +
            show.id +
            " · " +
            seasonCount +
            " saison(s) · " +
            episodeCount +
            " épisode(s)" +
            (rating ? " · " + rating : "") +
            '</span></div><button class="delete-button">SUPPRIMER</button>';

        item.querySelector(".delete-button").addEventListener("click", () => {
            removeSeries(show.id);
        });

        seriesLibrary.appendChild(item);
    });
}

function displayAnimeLibrary() {
    animeLibrary.innerHTML = "";

    if (!anime.length) {
        animeLibrary.innerHTML =
            '<p class="empty-library">Aucun anime ajouté.</p>';
        return;
    }

    anime.forEach((show) => {
        const item = document.createElement("div");
        item.className = "library-item";
        const rating = show.rating
            ? "★ " + Number(show.rating).toFixed(1)
            : "";

        item.innerHTML =
            '<div class="library-info"><strong>' +
            escapeHtml(show.title) +
            "</strong><span>" +
            escapeHtml(show.year || "") +
            " · AniList " +
            show.id +
            " · " +
            (show.episodeCount || "?") +
            " épisode(s)" +
            (rating ? " · " + rating : "") +
            '</span></div><button class="delete-button">SUPPRIMER</button>';

        item.querySelector(".delete-button").addEventListener("click", () => {
            removeAnime(show.id);
        });

        animeLibrary.appendChild(item);
    });
}

function removeMovie(id) {
    const movie = movies.find((item) => Number(item.id) === Number(id));
    if (!movie) return;
    if (!confirm('Supprimer « ' + movie.title + ' » ?')) return;
    movies = movies.filter((item) => Number(item.id) !== Number(id));
    persist();
    displayLibraries();
}

function removeSeries(id) {
    const show = series.find((item) => Number(item.id) === Number(id));
    if (!show) return;
    if (!confirm('Supprimer « ' + show.title + ' » ?')) return;
    series = series.filter((item) => Number(item.id) !== Number(id));
    persist();
    displayLibraries();
}

function removeAnime(id) {
    const show = anime.find((item) => Number(item.id) === Number(id));
    if (!show) return;
    if (!confirm('Supprimer « ' + show.title + ' » ?')) return;
    anime = anime.filter((item) => Number(item.id) !== Number(id));
    persist();
    displayLibraries();
}

searchButton.addEventListener("click", searchMedia);
mediaSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") searchMedia();
});

document.getElementById("logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem("nexium_admin_auth");
    window.location.replace("login.html");
});

displayLibraries();
