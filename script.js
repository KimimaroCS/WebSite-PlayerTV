/* =========================================================
   NEXIUMFILMS
   SCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   GENRES TMDB
========================================================= */

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


/* =========================================================
   RECUPERATION DES DONNEES
========================================================= */

let movies =
    JSON.parse(
        localStorage.getItem("nexiumfilms_movies")
    ) || [];


let series =
    JSON.parse(
        localStorage.getItem("nexiumfilms_series")
    ) || [];


/* =========================================================
   ELEMENTS HTML
========================================================= */

const movieGrid =
    document.getElementById("movieGrid");

const seriesGrid =
    document.getElementById("seriesGrid");

const searchInput =
    document.getElementById("searchInput");

const searchResultsSection =
    document.getElementById("searchResultsSection");

const searchResults =
    document.getElementById("searchResults");

const searchResultsTitle =
    document.getElementById("searchResultsTitle");

const playerModal =
    document.getElementById("playerModal");

const videoPlayer =
    document.getElementById("videoPlayer");

const seriesControls =
    document.getElementById("seriesControls");

const seasonSelect =
    document.getElementById("seasonSelect");

const episodeSelect =
    document.getElementById("episodeSelect");

const playEpisodeButton =
    document.getElementById("playEpisodeButton");


/* =========================================================
   UTILITAIRE HTML
========================================================= */

function escapeHtml(text) {

    if (!text) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   GENRES D'UN FILM
========================================================= */

function getMovieGenres(movie) {

    if (!movie.genreIds) {
        return [];
    }

    return movie.genreIds
        .map(function(id) {
            return genreMap[id];
        })
        .filter(Boolean);
}


/* =========================================================
   CREATION CARTE FILM
========================================================= */

function createMovieCard(movie) {

    const card =
        document.createElement("div");

    card.className = "movie-card";

    card.onclick = function() {

        openMoviePlayer(movie.id);

    };


    const genres =
        getMovieGenres(movie);


    card.innerHTML =

        '<div class="movie-poster-wrapper">' +

            '<img src="' +
                escapeHtml(movie.poster || "") +
                '" alt="' +
                escapeHtml(movie.title) +
            '">' +

            '<div class="movie-play">' +
                '▶' +
            '</div>' +

        '</div>' +

        '<div class="movie-title">' +
            escapeHtml(movie.title) +
        '</div>' +

        '<div class="movie-year">' +
            escapeHtml(movie.year || "") +
        '</div>' +

        (
            genres.length > 0
            ?
            '<div class="movie-genre">' +
                escapeHtml(genres.slice(0, 2).join(" • ")) +
            '</div>'
            :
            ""
        );


    return card;
}


/* =========================================================
   CREATION CARTE SERIE
========================================================= */

function createSeriesCard(show) {

    const card =
        document.createElement("div");

    card.className =
        "movie-card series-card";


    card.onclick = function() {

        openSeriesPlayer(show);

    };


    const genres =
        getMovieGenres(show);


    card.innerHTML =

        '<div class="movie-poster-wrapper">' +

            '<img src="' +
                escapeHtml(show.poster || "") +
                '" alt="' +
                escapeHtml(show.title) +
            '">' +

            '<div class="movie-play">' +
                '▶' +
            '</div>' +

            '<div class="series-badge">' +
                'SÉRIE' +
            '</div>' +

        '</div>' +

        '<div class="movie-title">' +
            escapeHtml(show.title) +
        '</div>' +

        '<div class="movie-year">' +
            escapeHtml(show.year || "") +
        '</div>' +

        (
            genres.length > 0
            ?
            '<div class="movie-genre">' +
                escapeHtml(genres.slice(0, 2).join(" • ")) +
            '</div>'
            :
            ""
        );


    return card;
}


/* =========================================================
   AFFICHER FILMS
========================================================= */

function displayMovies(list) {

    movieGrid.innerHTML = "";


    if (list.length === 0) {

        movieGrid.innerHTML =
            '<div class="empty-message">' +
                'Aucun film dans ta bibliothèque.' +
            '</div>';

        return;
    }


    list.forEach(function(movie) {

        movieGrid.appendChild(
            createMovieCard(movie)
        );

    });
}


/* =========================================================
   AFFICHER SERIES
========================================================= */

function displaySeries(list) {

    seriesGrid.innerHTML = "";


    if (list.length === 0) {

        seriesGrid.innerHTML =
            '<div class="empty-message">' +
                'Aucune série dans ta bibliothèque.' +
            '</div>';

        return;
    }


    list.forEach(function(show) {

        seriesGrid.appendChild(
            createSeriesCard(show)
        );

    });
}


/* =========================================================
   CATEGORIES
========================================================= */

function displayCategories() {

    const categorySections =
        document.querySelectorAll(
            ".category-section"
        );


    categorySections.forEach(function(section) {

        const category =
            section.dataset.category;

        const container =
            document.getElementById(
                "category-" + category
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        /*
         On affiche films ET séries
         dans les catégories.
        */

        const matchingMovies =
            movies.filter(function(movie) {

                return getMovieGenres(movie)
                    .includes(category);

            });


        const matchingSeries =
            series.filter(function(show) {

                return getMovieGenres(show)
                    .includes(category);

            });


        const all =
            matchingMovies.concat(
                matchingSeries
            );


        if (all.length === 0) {

            container.innerHTML =
                '<div class="empty-category">' +
                    'Aucun contenu dans cette catégorie.' +
                '</div>';

            return;
        }


        all.forEach(function(item) {

            if (item.type === "serie") {

                container.appendChild(
                    createSeriesCard(item)
                );

            } else {

                container.appendChild(
                    createMovieCard(item)
                );

            }

        });

    });
}


/* =========================================================
   LECTURE FILM
========================================================= */

async function openMoviePlayer(tmdbId) {

    try {

        const response =
            await fetch(
                "https://vidzy.org/api/" +
                tmdbId
            );


        if (!response.ok) {

            throw new Error(
                "Erreur Vidzy HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "Réponse Vidzy :",
            data
        );


        if (!data.available) {

            alert(
                "Ce film n'est pas disponible sur Vidzy."
            );

            return;
        }


        const embedUrl =
            data.embed ||
            data.embed_url ||
            data.embedUrl ||
            data.url;


        if (!embedUrl) {

            alert(
                "Vidzy n'a fourni aucune URL de lecture."
            );

            return;
        }


        /*
         On cache les contrôles série.
        */

        seriesControls.classList.add(
            "hidden"
        );


        /*
         On affiche le lecteur.
        */

        videoPlayer.src =
            embedUrl +
            (
                embedUrl.includes("?")
                ? "&"
                : "?"
            ) +
            "autoplay=1";


        playerModal.classList.add(
            "active"
        );


    } catch (error) {

        console.error(
            "Erreur Vidzy :",
            error
        );


        alert(
            "Impossible de lancer le film.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   OUVRIR SERIE
========================================================= */

async function openSeriesPlayer(show) {

    /*
     On affiche les contrôles.
    */

    seriesControls.classList.remove(
        "hidden"
    );


    /*
     On récupère les saisons TMDB.
    */

    try {

        const response =
            await fetch(
                "https://api.themoviedb.org/3/tv/" +
                show.id
            );


        /*
         IMPORTANT :

         Cette partie nécessite ton token TMDB.
         Pour éviter de mettre le token public
         dans le site principal, on va récupérer
         les infos déjà stockées dans l'admin.

         Si seasons est déjà présent :
         on l'utilise.
        */


        if (
            show.seasons &&
            show.seasons.length > 0
        ) {

            setupSeriesControls(
                show
            );

        } else {

            /*
             Fallback :
             on essaie quand même avec saison 1.
            */

            setupSeriesControls(
                show
            );

        }


    } catch (error) {

        console.error(error);

        setupSeriesControls(
            show
        );

    }


    playerModal.classList.add(
        "active"
    );

}


/* =========================================================
   CONTROLES SERIE
========================================================= */

function setupSeriesControls(show) {

    seasonSelect.innerHTML = "";

    episodeSelect.innerHTML = "";


    /*
     Si les saisons sont stockées.
    */

    if (
        show.seasons &&
        show.seasons.length > 0
    ) {

        show.seasons.forEach(function(season) {

            /*
             On ignore les specials
             saison 0.
            */

            if (
                season.season_number === 0
            ) {
                return;
            }


            const option =
                document.createElement("option");


            option.value =
                season.season_number;


            option.textContent =
                "Saison " +
                season.season_number;


            option.dataset.episodeCount =
                season.episode_count || 0;


            seasonSelect.appendChild(
                option
            );

        });

    } else {

        /*
         Fallback si aucune saison
         n'a été récupérée.
        */

        const option =
            document.createElement("option");

        option.value = "1";
        option.textContent = "Saison 1";

        seasonSelect.appendChild(
            option
        );

    }


    loadEpisodesForSelectedSeason(
        show
    );


    seasonSelect.onchange =
        function() {

            loadEpisodesForSelectedSeason(
                show
            );

        };


    playEpisodeButton.onclick =
        function() {

            playSelectedEpisode(
                show
            );

        };

}


/* =========================================================
   CHARGER EPISODES
========================================================= */

async function loadEpisodesForSelectedSeason(show) {

    const season =
        parseInt(
            seasonSelect.value
        );


    episodeSelect.innerHTML = "";


    /*
     Si les épisodes sont déjà stockés.
    */

    const storedSeason =
        (show.seasons || [])
            .find(function(item) {

                return item.season_number === season;

            });


    if (
        storedSeason &&
        storedSeason.episodes
    ) {

        storedSeason.episodes.forEach(
            function(episode) {

                addEpisodeOption(
                    episode
                );

            }
        );

        return;
    }


    /*
     Sinon, on crée une liste générique
     basée sur episode_count.
    */

    let episodeCount =
        storedSeason
        ? storedSeason.episode_count
        : 10;


    if (
        !episodeCount ||
        episodeCount < 1
    ) {

        episodeCount = 10;

    }


    for (
        let i = 1;
        i <= episodeCount;
        i++
    ) {

        const option =
            document.createElement("option");


        option.value = i;


        option.textContent =
            "Épisode " + i;


        episodeSelect.appendChild(
            option
        );

    }

}


/* =========================================================
   AJOUT OPTION EPISODE
========================================================= */

function addEpisodeOption(episode) {

    const option =
        document.createElement("option");


    option.value =
        episode.episode_number;


    option.textContent =
        "Épisode " +
        episode.episode_number +
        (
            episode.name
            ?
            " — " + episode.name
            :
            ""
        );


    episodeSelect.appendChild(
        option
    );

}


/* =========================================================
   LIRE EPISODE
========================================================= */

function playSelectedEpisode(show) {

    const season =
        parseInt(
            seasonSelect.value
        );


    const episode =
        parseInt(
            episodeSelect.value
        );


    if (
        !season ||
        !episode
    ) {

        alert(
            "Sélectionne une saison et un épisode."
        );

        return;
    }


    /*
     URL officielle Vidzy
     pour une série :
     
     /serie/TMDB_ID/SAISON/EPISODE
    */

    const embedUrl =
        "https://vidzy.org/serie/" +
        show.id +
        "/" +
        season +
        "/" +
        episode +
        "?autoplay=1&autonext=1";


    console.log(
        "Lecture série :",
        embedUrl
    );


    videoPlayer.src =
        embedUrl;

}


/* =========================================================
   FERMER PLAYER
========================================================= */

function closePlayer() {

    videoPlayer.src = "";


    playerModal.classList.remove(
        "active"
    );


    seriesControls.classList.add(
        "hidden"
    );

}


/* =========================================================
   BOUTON FERMER
========================================================= */

document
    .getElementById("closePlayerButton")
    .addEventListener(
        "click",
        closePlayer
    );


/* =========================================================
   FERMER EN CLIQUANT EN DEHORS
========================================================= */

playerModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target === playerModal
        ) {

            closePlayer();

        }

    }
);


/* =========================================================
   RECHERCHE
========================================================= */

function searchFilms() {

    const value =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!value) {

        searchResultsSection.classList.add(
            "hidden"
        );

        displayMovies(movies);
        displaySeries(series);
        displayCategories();

        return;
    }


    const movieResults =
        movies.filter(function(movie) {

            return movie.title
                .toLowerCase()
                .includes(value);

        });


    const seriesResults =
        series.filter(function(show) {

            return show.title
                .toLowerCase()
                .includes(value);

        });


    searchResults.innerHTML = "";


    searchResultsTitle.textContent =
        "Résultats pour : " +
        searchInput.value;


    searchResultsSection.classList.remove(
        "hidden"
    );


    movieResults.forEach(
        function(movie) {

            searchResults.appendChild(
                createMovieCard(movie)
            );

        }
    );


    seriesResults.forEach(
        function(show) {

            searchResults.appendChild(
                createSeriesCard(show)
            );

        }
    );


    if (
        movieResults.length === 0 &&
        seriesResults.length === 0
    ) {

        searchResults.innerHTML =
            '<div class="empty-message">' +
                'Aucun résultat.' +
            '</div>';

    }

}


/* =========================================================
   INPUT RECHERCHE
========================================================= */

searchInput.addEventListener(
    "input",
    searchFilms
);


/* =========================================================
   HERO
========================================================= */

function setupHero() {

    const allContent =
        movies.concat(series);


    if (allContent.length === 0) {
        return;
    }


    const featured =
        allContent[0];


    const heroTitle =
        document.getElementById(
            "heroTitle"
        );


    const heroBackground =
        document.getElementById(
            "heroBackground"
        );


    if (heroTitle) {

        heroTitle.innerHTML =
            escapeHtml(
                featured.title
            );

    }


    if (
        heroBackground &&
        featured.poster
    ) {

        heroBackground.style.backgroundImage =
            "url('" +
            featured.poster +
            "')";

    }


    const heroPlayButton =
        document.getElementById(
            "heroPlayButton"
        );


    if (heroPlayButton) {

        heroPlayButton.onclick =
            function() {

                if (
                    featured.type === "serie"
                ) {

                    openSeriesPlayer(
                        featured
                    );

                } else {

                    openMoviePlayer(
                        featured.id
                    );

                }

            };

    }

}


/* =========================================================
   INITIALISATION
========================================================= */

displayMovies(
    movies
);

displaySeries(
    series
);

displayCategories();

setupHero();