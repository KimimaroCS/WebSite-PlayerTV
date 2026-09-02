/* =====================================================
   NEXIUMFILMS
===================================================== */


/* =====================================================
   DATA
===================================================== */

let movies =
    JSON.parse(
        localStorage.getItem("nexiumfilms_movies")
    ) || [];

let series =
    JSON.parse(
        localStorage.getItem("nexiumfilms_series")
    ) || [];


/* =====================================================
   GENRES TMDB
===================================================== */

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

    37: "Western"

};


/* =====================================================
   ELEMENTS
===================================================== */

const movieGrid =
    document.getElementById("movieGrid");

const seriesGrid =
    document.getElementById("seriesGrid");

const searchInput =
    document.getElementById("searchInput");

const searchResults =
    document.getElementById("searchResults");

const searchResultsSection =
    document.getElementById(
        "searchResultsSection"
    );

const searchResultsTitle =
    document.getElementById(
        "searchResultsTitle"
    );

const heroBackground =
    document.getElementById(
        "heroBackground"
    );

const heroTitle =
    document.getElementById(
        "heroTitle"
    );

const heroMeta =
    document.getElementById(
        "heroMeta"
    );

const heroGenres =
    document.getElementById(
        "heroGenres"
    );

const heroDescription =
    document.getElementById(
        "heroDescription"
    );

const heroType =
    document.getElementById(
        "heroType"
    );

const heroPlayButton =
    document.getElementById(
        "heroPlayButton"
    );

const playerModal =
    document.getElementById(
        "playerModal"
    );

const videoPlayer =
    document.getElementById(
        "videoPlayer"
    );

const closePlayerButton =
    document.getElementById(
        "closePlayerButton"
    );

const seriesControls =
    document.getElementById(
        "seriesControls"
    );

const seasonSelect =
    document.getElementById(
        "seasonSelect"
    );

const episodeSelect =
    document.getElementById(
        "episodeSelect"
    );

const playEpisodeButton =
    document.getElementById(
        "playEpisodeButton"
    );

const themeGrid =
    document.getElementById(
        "themeGrid"
    );

const themeRows =
    document.getElementById(
        "themeRows"
    );

const themeCount =
    document.getElementById(
        "themeCount"
    );


let currentSeries = null;


/* =====================================================
   HELPERS
===================================================== */

function getGenres(item) {

    if (
        item.genreIds &&
        Array.isArray(item.genreIds)
    ) {

        return item.genreIds
            .map(id => genreMap[id])
            .filter(Boolean);

    }


    if (
        item.genres &&
        Array.isArray(item.genres)
    ) {

        return item.genres
            .map(genre => {

                if (
                    typeof genre === "string"
                ) {
                    return genre;
                }

                return genre.name || "";

            })
            .filter(Boolean);

    }


    return [];
}


function formatRuntime(minutes) {

    if (!minutes || minutes <= 0) {
        return "";
    }


    const hours =
        Math.floor(minutes / 60);


    const mins =
        minutes % 60;


    if (hours === 0) {
        return mins + " min";
    }


    if (mins === 0) {
        return hours + "h";
    }


    return hours + "h " + mins + "min";
}


function getAllMedia() {

    return movies.concat(series);

}


function getThemeItems(theme) {

    return getAllMedia().filter(
        item =>
            getGenres(item).includes(theme)
    );

}


/* =====================================================
   MOVIE CARD
===================================================== */

function createMovieCard(item) {

    const card =
        document.createElement("div");


    card.className =
        "movie-card";


    const image =
        item.poster ||
        "https://via.placeholder.com/500x750?text=NexiumFilms";


    const genres =
        getGenres(item);


    const genreText =
        genres
            .slice(0, 2)
            .join(" • ");


    card.innerHTML = `

        <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(item.title)}"
            loading="lazy"
        >

        <div class="type-badge">
            FILM
        </div>

        <div class="play-button">
            ▶
        </div>

        <div class="movie-info">

            <h3>
                ${escapeHTML(item.title)}
            </h3>

            <p>
                ${escapeHTML(item.year || "")}
                ${
                    genreText
                        ? " • " + escapeHTML(genreText)
                        : ""
                }
            </p>

        </div>

    `;


    card.addEventListener(
        "click",
        function() {

            openMoviePlayer(item);

        }
    );


    return card;
}


/* =====================================================
   SERIES CARD
===================================================== */

function createSeriesCard(item) {

    const card =
        document.createElement("div");


    card.className =
        "movie-card";


    const image =
        item.poster ||
        "https://via.placeholder.com/500x750?text=NexiumFilms";


    const genres =
        getGenres(item);


    const seasons =
        item.seasons
            ? item.seasons.length
            : 0;


    card.innerHTML = `

        <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(item.title)}"
            loading="lazy"
        >

        <div class="type-badge">
            SÉRIE
        </div>

        <div class="play-button">
            ▶
        </div>

        <div class="movie-info">

            <h3>
                ${escapeHTML(item.title)}
            </h3>

            <p>

                ${escapeHTML(item.year || "")}

                ${
                    seasons
                        ? " • " +
                          seasons +
                          " saison" +
                          (
                              seasons > 1
                                  ? "s"
                                  : ""
                          )
                        : ""
                }

            </p>

        </div>

    `;


    card.addEventListener(
        "click",
        function() {

            openSeriesPlayer(item);

        }
    );


    return card;
}


/* =====================================================
   DISPLAY FILMS
===================================================== */

function displayMovies(list) {

    movieGrid.innerHTML = "";


    if (!list.length) {

        movieGrid.innerHTML =
            `
            <div class="empty-library">
                Aucun film ajouté.
            </div>
            `;

        return;
    }


    list.forEach(movie => {

        movieGrid.appendChild(
            createMovieCard(movie)
        );

    });

}


/* =====================================================
   DISPLAY SERIES
===================================================== */

function displaySeries(list) {

    seriesGrid.innerHTML = "";


    if (!list.length) {

        seriesGrid.innerHTML =
            `
            <div class="empty-library">
                Aucune série ajoutée.
            </div>
            `;

        return;
    }


    list.forEach(show => {

        seriesGrid.appendChild(
            createSeriesCard(show)
        );

    });

}


/* =====================================================
   BUILD THEMES
===================================================== */

function getAvailableThemes() {

    const themes = [];


    getAllMedia().forEach(item => {

        getGenres(item).forEach(
            genre => {

                if (
                    !themes.includes(genre)
                ) {

                    themes.push(genre);

                }

            }
        );

    });


    /*
       On garde l'ordre de notre genreMap.
       Cela donne une navigation cohérente.
    */

    const orderedThemes =
        Object.values(genreMap)
            .filter(
                genre =>
                    themes.includes(genre)
            );


    return orderedThemes;

}


/* =====================================================
   DISPLAY THEMES
===================================================== */

function displayThemes() {

    themeGrid.innerHTML = "";

    themeRows.innerHTML = "";


    const themes =
        getAvailableThemes();


    if (themeCount) {

        themeCount.textContent =
            themes.length +
            " THÈME" +
            (
                themes.length > 1
                    ? "S"
                    : ""
            );

    }


    if (!themes.length) {

        themeGrid.innerHTML =
            `
            <div class="empty-library">
                Ajoute des films ou des séries
                pour découvrir les thèmes.
            </div>
            `;

        return;
    }


    themes.forEach(theme => {

        createThemeCard(theme);

        createThemeSection(theme);

    });

}


/* =====================================================
   THEME CARD
===================================================== */

function createThemeCard(theme) {

    const items =
        getThemeItems(theme);


    const button =
        document.createElement("a");


    button.className =
        "theme-card";


    button.href =
        "#theme-" +
        slugify(theme);


    button.innerHTML = `

        <strong>
            ${escapeHTML(theme)}
        </strong>

        <small>
            ${items.length}
            TITRE${items.length > 1 ? "S" : ""}
        </small>

    `;


    themeGrid.appendChild(button);

}


/* =====================================================
   THEME SECTION
===================================================== */

function createThemeSection(theme) {

    const items =
        getThemeItems(theme);


    const section =
        document.createElement("section");


    section.className =
        "theme-section";


    section.id =
        "theme-" +
        slugify(theme);


    const heading =
        document.createElement("div");


    heading.className =
        "theme-heading";


    heading.innerHTML = `

        <h2>
            ${escapeHTML(theme)}
        </h2>

        <span>
            ${items.length}
            TITRE${items.length > 1 ? "S" : ""}
        </span>

    `;


    const row =
        document.createElement("div");


    row.className =
        "movie-row";


    items.forEach(item => {

        if (
            item.type === "serie"
        ) {

            row.appendChild(
                createSeriesCard(item)
            );

        } else {

            row.appendChild(
                createMovieCard(item)
            );

        }

    });


    section.appendChild(
        heading
    );


    section.appendChild(
        row
    );


    themeRows.appendChild(
        section
    );

}


/* =====================================================
   HERO
===================================================== */

function setupHero() {

    const all =
        getAllMedia();


    if (!all.length) {

        heroTitle.textContent =
            "Ta bibliothèque.";


        heroType.textContent =
            "NEXIUMFILMS";


        heroDescription.textContent =
            "Ajoute ton premier film depuis l'administration.";


        heroBackground.style.backgroundImage =
            "none";


        heroPlayButton.disabled =
            true;


        return;
    }


    const item =
        all[0];


    heroTitle.textContent =
        item.title ||
        "NexiumFilms";


    heroType.textContent =
        item.type === "serie"
            ? "SÉRIE"
            : "FILM";


    heroDescription.textContent =
        item.overview ||
        "Découvre ce titre dans ta bibliothèque.";


    if (
        item.backdrop ||
        item.poster
    ) {

        heroBackground.style.backgroundImage =
            `url("${item.backdrop || item.poster}")`;

    }


    heroMeta.innerHTML = "";


    if (item.year) {

        const year =
            document.createElement("span");


        year.textContent =
            item.year;


        heroMeta.appendChild(
            year
        );

    }


    if (item.runtime) {

        const runtime =
            document.createElement("span");


        runtime.textContent =
            "• " +
            formatRuntime(
                item.runtime
            );


        heroMeta.appendChild(
            runtime
        );

    }


    if (item.rating) {

        const rating =
            document.createElement("span");


        rating.textContent =
            "• ⭐ " +
            Number(
                item.rating
            ).toFixed(1);


        heroMeta.appendChild(
            rating
        );

    }


    heroGenres.innerHTML = "";


    getGenres(item)
        .slice(0, 4)
        .forEach(
            genre => {

                const element =
                    document.createElement(
                        "span"
                    );


                element.className =
                    "hero-genre";


                element.textContent =
                    genre;


                heroGenres.appendChild(
                    element
                );

            }
        );


    heroPlayButton.disabled =
        false;


    heroPlayButton.onclick =
        function() {

            if (
                item.type === "serie"
            ) {

                openSeriesPlayer(
                    item
                );

            } else {

                openMoviePlayer(
                    item
                );

            }

        };

}


/* =====================================================
   MOVIE PLAYER
===================================================== */

async function openMoviePlayer(item) {

    seriesControls.classList.add(
        "hidden"
    );


    playerModal.classList.add(
        "active"
    );


    videoPlayer.src = "";


    try {

        const response =
            await fetch(
                "https://vidzy.org/api/" +
                item.id
            );


        if (!response.ok) {

            throw new Error(
                "Vidzy indisponible"
            );

        }


        const data =
            await response.json();


        if (!data.embed) {

            throw new Error(
                "Aucun lecteur disponible"
            );

        }


        videoPlayer.src =
            data.embed +
            (
                data.embed.includes("?")
                    ? "&"
                    : "?"
            ) +
            "autoplay=1";

    }
    catch (error) {

        console.error(error);


        videoPlayer.src =
            "https://vidzy.org/movie/" +
            item.id +
            "?autoplay=1";

    }

}


/* =====================================================
   SERIES PLAYER
===================================================== */

function openSeriesPlayer(item) {

    currentSeries =
        item;


    playerModal.classList.add(
        "active"
    );


    seriesControls.classList.remove(
        "hidden"
    );


    videoPlayer.src = "";


    setupSeriesControls(
        item
    );

}


function setupSeriesControls(item) {

    seasonSelect.innerHTML = "";


    const seasons =
        item.seasons || [];


    if (!seasons.length) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            "1";


        option.textContent =
            "Saison 1";


        seasonSelect.appendChild(
            option
        );


        loadEpisodesForSelectedSeason(
            item
        );


        return;
    }


    seasons.forEach(
        season => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                season.season_number;


            option.textContent =
                season.name ||
                "Saison " +
                season.season_number;


            seasonSelect.appendChild(
                option
            );

        }
    );


    loadEpisodesForSelectedSeason(
        item
    );

}


function loadEpisodesForSelectedSeason(
    item
) {

    episodeSelect.innerHTML = "";


    const seasonNumber =
        Number(
            seasonSelect.value
        );


    const season =
        (item.seasons || [])
            .find(
                s =>
                    Number(
                        s.season_number
                    ) === seasonNumber
            );


    if (
        season &&
        season.episodes
    ) {

        season.episodes.forEach(
            episode => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    episode.episode_number;


                option.textContent =
                    "Épisode " +
                    episode.episode_number +
                    (
                        episode.name
                            ? " — " +
                              episode.name
                            : ""
                    );


                episodeSelect
                    .appendChild(
                        option
                    );

            }
        );


        return;
    }


    for (
        let i = 1;
        i <= 10;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            i;


        option.textContent =
            "Épisode " +
            i;


        episodeSelect
            .appendChild(
                option
            );

    }

}


function playSelectedEpisode() {

    if (!currentSeries) {
        return;
    }


    const season =
        Number(
            seasonSelect.value
        );


    const episode =
        Number(
            episodeSelect.value
        );


    videoPlayer.src =
        "https://vidzy.org/serie/" +
        currentSeries.id +
        "/" +
        season +
        "/" +
        episode +
        "?autoplay=1&autonext=1";

}


/* =====================================================
   SERIES EVENTS
===================================================== */

seasonSelect.addEventListener(
    "change",
    function() {

        if (currentSeries) {

            loadEpisodesForSelectedSeason(
                currentSeries
            );

        }

    }
);


playEpisodeButton.addEventListener(
    "click",
    playSelectedEpisode
);


/* =====================================================
   CLOSE PLAYER
===================================================== */

function closePlayer() {

    playerModal.classList.remove(
        "active"
    );


    videoPlayer.src =
        "";


    currentSeries =
        null;

}


closePlayerButton.addEventListener(
    "click",
    closePlayer
);


playerModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            playerModal
        ) {

            closePlayer();

        }

    }
);


document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            closePlayer();

        }

    }
);


/* =====================================================
   SEARCH
===================================================== */

searchInput.addEventListener(
    "input",
    function() {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();


        if (!query) {

            searchResultsSection
                .classList
                .add("hidden");


            return;

        }


        const all =
            getAllMedia();


        const results =
            all.filter(
                item => {

                    const title =
                        (
                            item.title ||
                            ""
                        )
                        .toLowerCase();


                    const genres =
                        getGenres(item)
                            .join(" ")
                            .toLowerCase();


                    return (
                        title.includes(
                            query
                        ) ||
                        genres.includes(
                            query
                        )
                    );

                }
            );


        searchResultsSection
            .classList
            .remove("hidden");


        searchResultsTitle.textContent =
            results.length +
            " résultat" +
            (
                results.length > 1
                    ? "s"
                    : ""
            );


        searchResults.innerHTML =
            "";


        results.forEach(
            item => {

                searchResults.appendChild(

                    item.type === "serie"
                        ? createSeriesCard(item)
                        : createMovieCard(item)

                );

            }
        );

    }
);


/* =====================================================
   NAVBAR ACTIVE
===================================================== */

function setupNavigation() {

    const links =
        document.querySelectorAll(
            "nav a"
        );


    links.forEach(
        link => {

            link.addEventListener(
                "click",
                function() {

                    links.forEach(
                        other =>
                            other.classList.remove(
                                "active"
                            )
                    );


                    link.classList.add(
                        "active"
                    );

                }
            );

        }
    );

}


setupNavigation();


/* =====================================================
   SLUG
===================================================== */

function slugify(value) {

    return String(value)
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            "");

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(
        value || ""
    )
    .replace(
        /[&<>"']/g,
        function(character) {

            const entities = {

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#039;"

            };


            return entities[
                character
            ];

        }
    );

}


/* =====================================================
   INIT
===================================================== */

displayMovies(
    movies
);


displaySeries(
    series
);


displayThemes();


setupHero();