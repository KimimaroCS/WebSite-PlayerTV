/* =========================================================
   NEXIUMFILMS
   ADMINISTRATION
========================================================= */


/* =========================================================
   SECURITE
========================================================= */

if (
    sessionStorage.getItem(
        "nexium_admin_auth"
    ) !== "1"
) {

    window.location.replace(
        "login.html"
    );

}


/* =========================================================
   TMDB TOKEN
========================================================= */

const TMDB_ACCESS_TOKEN =
    "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMDdiZDcwNzE5NDQ0YTUyNTZjMDhmZDM2NmM2ZDJkYyIsIm5iZiI6MTc4ODM3NDA1MS4wNTYsInN1YiI6IjZhOTg2YzIzMTEwZWM4NDE2MGZlYzY5OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.8hsiu3LFAM5vCqWmDpsn0GPnypX2AH_QXWt61xNW3RU";


/*
    IMPORTANT :

    Mets ton Read Access Token TMDB ici.

    Exemple :

    const TMDB_ACCESS_TOKEN =
        "eyJhbGciOiJIUzI1NiJ9....";
*/


/* =========================================================
   DONNEES
========================================================= */

let movies =
    JSON.parse(
        localStorage.getItem(
            "nexiumfilms_movies"
        )
    ) || [];


let series =
    JSON.parse(
        localStorage.getItem(
            "nexiumfilms_series"
        )
    ) || [];


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
   ELEMENTS HTML
========================================================= */

const mediaSearch =
    document.getElementById(
        "mediaSearch"
    );


const mediaType =
    document.getElementById(
        "mediaType"
    );


const searchButton =
    document.getElementById(
        "searchButton"
    );


const results =
    document.getElementById(
        "results"
    );


const loading =
    document.getElementById(
        "loading"
    );


const movieLibrary =
    document.getElementById(
        "movieLibrary"
    );


const seriesLibrary =
    document.getElementById(
        "seriesLibrary"
    );


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(text) {

    if (!text) {
        return "";
    }

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   TMDB REQUEST
========================================================= */

async function tmdbFetch(
    endpoint
) {

    const response =
        await fetch(
            "https://api.themoviedb.org/3" +
            endpoint,
            {

                method: "GET",

                headers: {

                    "Authorization":
                        "Bearer " +
                        TMDB_ACCESS_TOKEN,

                    "accept":
                        "application/json"

                }

            }
        );


    if (!response.ok) {

        throw new Error(
            "TMDB HTTP " +
            response.status
        );

    }


    return await response.json();

}


/* =========================================================
   RECHERCHE TMDB
========================================================= */

async function searchTMDB() {

    const query =
        mediaSearch.value.trim();


    const type =
        mediaType.value;


    if (!query) {

        alert(
            "Entre le nom d'un film ou d'une série."
        );

        return;

    }


    loading.innerText =
        "🔎 Recherche de : " +
        query;


    results.innerHTML = "";


    try {

        let endpoint;


        if (
            type === "movie"
        ) {

            endpoint =
                "/search/movie";

        } else {

            endpoint =
                "/search/tv";

        }


        const data =
            await tmdbFetch(
                endpoint +
                "?language=fr-FR" +
                "&query=" +
                encodeURIComponent(
                    query
                ) +
                "&include_adult=false"
            );


        loading.innerText =
            data.results.length +
            " résultat(s) trouvé(s).";


        if (
            data.results.length === 0
        ) {

            results.innerHTML =
                "<p>Aucun résultat.</p>";

            return;

        }


        data.results
            .slice(0, 10)
            .forEach(
                function(item) {

                    displayTMDBResult(
                        item,
                        type
                    );

                }
            );


    } catch (error) {

        console.error(error);


        loading.innerText = "";


        results.innerHTML =
            "<p>❌ Erreur TMDB : " +
            escapeHtml(
                error.message
            ) +
            "</p>";

    }

}


/* =========================================================
   AFFICHER RESULTAT
========================================================= */

function displayTMDBResult(
    item,
    type
) {

    const isMovie =
        type === "movie";


    const title =
        isMovie
            ? item.title
            : item.name;


    const date =
        isMovie
            ? item.release_date
            : item.first_air_date;


    const year =
        date
            ? date.substring(0, 4)
            : "N/A";


    const poster =
        item.poster_path

            ? "https://image.tmdb.org/t/p/w500" +
              item.poster_path

            : "";


    const div =
        document.createElement(
            "div"
        );


    div.className =
        "result";


    div.innerHTML =

        '<img src="' +
            escapeHtml(poster) +
            '" alt="' +
            escapeHtml(title) +
        '">' +

        '<div class="result-info">' +

            '<div class="result-type">' +

                (
                    isMovie
                        ? "🎬 FILM"
                        : "📺 SÉRIE"
                ) +

            '</div>' +

            '<div class="result-title">' +

                escapeHtml(
                    title
                ) +

            '</div>' +

            '<div class="result-year">' +

                escapeHtml(
                    year
                ) +

            '</div>' +

            '<div class="result-id">' +

                "TMDB ID : " +
                item.id +

            '</div>' +

            '<button class="add-button">' +

                (
                    isMovie
                        ? "AJOUTER LE FILM"
                        : "AJOUTER LA SÉRIE"
                ) +

            '</button>' +

        '</div>';


    const button =
        div.querySelector(
            ".add-button"
        );


    button.addEventListener(
        "click",
        function() {

            if (isMovie) {

                addMovie(
                    item
                );

            } else {

                addSeries(
                    item
                );

            }

        }
    );


    results.appendChild(
        div
    );

}


/* =========================================================
   AJOUT FILM
========================================================= */

async function addMovie(
    item
) {

    const alreadyExists =
        movies.some(
            function(movie) {

                return (
                    Number(movie.id) ===
                    Number(item.id)
                );

            }
        );


    if (alreadyExists) {

        alert(
            "Ce film est déjà dans NexiumFilms."
        );

        return;

    }


    loading.innerText =
        "🎬 Récupération des informations de " +
        item.title +
        "...";


    try {

        /*
            On récupère les vrais détails
            du film depuis TMDB.
        */

        const details =
            await tmdbFetch(
                "/movie/" +
                item.id +
                "?language=fr-FR"
            );


        const movie = {

            id:
                details.id,

            title:
                details.title || item.title,

            originalTitle:
                details.original_title || "",

            year:
                details.release_date
                    ? details.release_date
                        .substring(0, 4)
                    : "",

            poster:
                details.poster_path
                    ? "https://image.tmdb.org/t/p/w500" +
                      details.poster_path
                    : "",

            backdrop:
                details.backdrop_path
                    ? "https://image.tmdb.org/t/p/w1280" +
                      details.backdrop_path
                    : "",

            overview:
                details.overview || "",

            runtime:
                details.runtime || 0,

            rating:
                details.vote_average || 0,

            voteCount:
                details.vote_count || 0,

            originalLanguage:
                details.original_language || "",

            genreIds:
                details.genres
                    ? details.genres.map(
                        function(genre) {

                            return genre.id;

                        }
                    )
                    : [],

            genres:
                details.genres
                    ? details.genres.map(
                        function(genre) {

                            return genre.name;

                        }
                    )
                    : [],

            type:
                "movie"

        };


        movies.push(
            movie
        );


        localStorage.setItem(
            "nexiumfilms_movies",
            JSON.stringify(
                movies
            )
        );


        loading.innerText =
            "";


        alert(
            "✅ " +
            movie.title +
            " a été ajouté à NexiumFilms !"
        );


        displayLibraries();


    } catch (error) {

        console.error(error);


        loading.innerText =
            "";


        alert(
            "❌ Impossible de récupérer les détails TMDB.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   AJOUT SERIE
========================================================= */

async function addSeries(
    item
) {

    const alreadyExists =
        series.some(
            function(show) {

                return (
                    Number(show.id) ===
                    Number(item.id)
                );

            }
        );


    if (alreadyExists) {

        alert(
            "Cette série est déjà dans NexiumFilms."
        );

        return;

    }


    loading.innerText =
        "📺 Récupération des informations de " +
        item.name +
        "...";


    try {

        /*
            Récupération des détails
            de la série.
        */

        const details =
            await tmdbFetch(
                "/tv/" +
                item.id +
                "?language=fr-FR"
            );


        loading.innerText =
            "📺 Récupération des saisons de " +
            details.name +
            "...";


        /*
            Récupération des saisons
            et épisodes.
        */

        const seasons =
            await fetchSeriesSeasons(
                item.id,
                details.seasons || []
            );


        const show = {

            id:
                details.id,

            title:
                details.name || item.name,

            originalTitle:
                details.original_name || "",

            year:
                details.first_air_date
                    ? details.first_air_date
                        .substring(0, 4)
                    : "",

            poster:
                details.poster_path
                    ? "https://image.tmdb.org/t/p/w500" +
                      details.poster_path
                    : "",

            backdrop:
                details.backdrop_path
                    ? "https://image.tmdb.org/t/p/w1280" +
                      details.backdrop_path
                    : "",

            overview:
                details.overview || "",

            rating:
                details.vote_average || 0,

            voteCount:
                details.vote_count || 0,

            originalLanguage:
                details.original_language || "",

            genreIds:
                details.genres
                    ? details.genres.map(
                        function(genre) {

                            return genre.id;

                        }
                    )
                    : [],

            genres:
                details.genres
                    ? details.genres.map(
                        function(genre) {

                            return genre.name;

                        }
                    )
                    : [],

            seasons:
                seasons,

            type:
                "serie"

        };


        series.push(
            show
        );


        localStorage.setItem(
            "nexiumfilms_series",
            JSON.stringify(
                series
            )
        );


        loading.innerText =
            "";


        alert(
            "✅ " +
            show.title +
            " a été ajoutée à NexiumFilms !"
        );


        displayLibraries();


    } catch (error) {

        console.error(error);


        loading.innerText =
            "";


        alert(
            "❌ Impossible d'ajouter la série.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   RECUPERER SAISONS + EPISODES
========================================================= */

async function fetchSeriesSeasons(
    seriesId,
    tmdbSeasons
) {

    const seasons = [];


    /*
        On ignore la saison 0 :
        ce sont les Specials.
    */

    const normalSeasons =
        (tmdbSeasons || [])
            .filter(
                function(season) {

                    return (
                        Number(
                            season.season_number
                        ) !== 0
                    );

                }
            );


    for (
        const season
        of normalSeasons
    ) {

        loading.innerText =
            "📺 Saison " +
            season.season_number +
            " de " +
            normalSeasons.length;


        const seasonData = {

            season_number:
                season.season_number,

            name:
                season.name ||
                (
                    "Saison " +
                    season.season_number
                ),

            episode_count:
                season.episode_count || 0,

            episodes:
                []

        };


        try {

            const data =
                await tmdbFetch(
                    "/tv/" +
                    seriesId +
                    "/season/" +
                    season.season_number +
                    "?language=fr-FR"
                );


            seasonData.episodes =
                (
                    data.episodes ||
                    []
                ).map(
                    function(episode) {

                        return {

                            episode_number:
                                episode.episode_number,

                            name:
                                episode.name || "",

                            overview:
                                episode.overview || "",

                            still_path:
                                episode.still_path
                                    ? "https://image.tmdb.org/t/p/w500" +
                                      episode.still_path
                                    : "",

                            air_date:
                                episode.air_date || "",

                            runtime:
                                episode.runtime || 0,

                            rating:
                                episode.vote_average || 0

                        };

                    }
                );


        } catch (error) {

            console.error(
                "Erreur saison " +
                season.season_number,
                error
            );

            /*
                La saison reste enregistrée
                même si les épisodes échouent.
            */

            seasonData.episodes =
                [];

        }


        seasons.push(
            seasonData
        );

    }


    return seasons;

}


/* =========================================================
   AFFICHER LES BIBLIOTHEQUES
========================================================= */

function displayLibraries() {

    displayMovieLibrary();

    displaySeriesLibrary();

}


/* =========================================================
   BIBLIOTHEQUE FILMS
========================================================= */

function displayMovieLibrary() {

    movieLibrary.innerHTML = "";


    if (
        movies.length === 0
    ) {

        movieLibrary.innerHTML =
            '<p class="empty-library">' +
                "Aucun film ajouté." +
            "</p>";

        return;

    }


    movies.forEach(
        function(movie) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "library-item";


            const runtime =
                movie.runtime
                    ? formatRuntime(
                        movie.runtime
                    )
                    : "Durée inconnue";


            const rating =
                movie.rating
                    ? "⭐ " +
                      Number(
                          movie.rating
                      ).toFixed(1)
                    : "";


            item.innerHTML =

                '<div class="library-info">' +

                    '<strong>' +
                        escapeHtml(
                            movie.title
                        ) +
                    '</strong>' +

                    '<span>' +

                        escapeHtml(
                            movie.year || ""
                        ) +

                        " · TMDB " +

                        movie.id +

                        " · " +

                        escapeHtml(
                            runtime
                        ) +

                        (
                            rating
                                ? " · " +
                                  rating
                                : ""
                        ) +

                    '</span>' +

                '</div>' +

                '<button class="delete-button">' +

                    "SUPPRIMER" +

                "</button>";


            item
                .querySelector(
                    ".delete-button"
                )
                .addEventListener(
                    "click",
                    function() {

                        removeMovie(
                            movie.id
                        );

                    }
                );


            movieLibrary.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   BIBLIOTHEQUE SERIES
========================================================= */

function displaySeriesLibrary() {

    seriesLibrary.innerHTML = "";


    if (
        series.length === 0
    ) {

        seriesLibrary.innerHTML =
            '<p class="empty-library">' +
                "Aucune série ajoutée." +
            "</p>";

        return;

    }


    series.forEach(
        function(show) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "library-item";


            const seasonCount =
                (
                    show.seasons || []
                ).length;


            const episodeCount =
                (
                    show.seasons || []
                ).reduce(
                    function(total, season) {

                        return (
                            total +
                            (
                                season.episodes
                                    ? season.episodes.length
                                    : 0
                            )
                        );

                    },
                    0
                );


            const rating =
                show.rating
                    ? "⭐ " +
                      Number(
                          show.rating
                      ).toFixed(1)
                    : "";


            item.innerHTML =

                '<div class="library-info">' +

                    '<strong>' +
                        escapeHtml(
                            show.title
                        ) +
                    '</strong>' +

                    '<span>' +

                        escapeHtml(
                            show.year || ""
                        ) +

                        " · TMDB " +

                        show.id +

                        " · " +

                        seasonCount +

                        " saison(s)" +

                        " · " +

                        episodeCount +

                        " épisode(s)" +

                        (
                            rating
                                ? " · " +
                                  rating
                                : ""
                        ) +

                    '</span>' +

                '</div>' +

                '<button class="delete-button">' +

                    "SUPPRIMER" +

                "</button>";


            item
                .querySelector(
                    ".delete-button"
                )
                .addEventListener(
                    "click",
                    function() {

                        removeSeries(
                            show.id
                        );

                    }
                );


            seriesLibrary.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   FORMAT DUREE
========================================================= */

function formatRuntime(
    minutes
) {

    if (
        !minutes ||
        Number(minutes) <= 0
    ) {

        return "";

    }


    const hours =
        Math.floor(
            Number(minutes) / 60
        );


    const mins =
        Number(minutes) % 60;


    if (
        hours === 0
    ) {

        return (
            mins +
            " min"
        );

    }


    if (
        mins === 0
    ) {

        return (
            hours +
            "h"
        );

    }


    return (
        hours +
        "h " +
        mins +
        "min"
    );

}


/* =========================================================
   SUPPRIMER FILM
========================================================= */

function removeMovie(
    id
) {

    const movie =
        movies.find(
            function(item) {

                return (
                    Number(item.id) ===
                    Number(id)
                );

            }
        );


    if (!movie) {
        return;
    }


    const confirmed =
        confirm(
            "Supprimer « " +
            movie.title +
            " » de NexiumFilms ?"
        );


    if (!confirmed) {
        return;
    }


    movies =
        movies.filter(
            function(item) {

                return (
                    Number(item.id) !==
                    Number(id)
                );

            }
        );


    localStorage.setItem(
        "nexiumfilms_movies",
        JSON.stringify(
            movies
        )
    );


    displayLibraries();

}


/* =========================================================
   SUPPRIMER SERIE
========================================================= */

function removeSeries(
    id
) {

    const show =
        series.find(
            function(item) {

                return (
                    Number(item.id) ===
                    Number(id)
                );

            }
        );


    if (!show) {
        return;
    }


    const confirmed =
        confirm(
            "Supprimer « " +
            show.title +
            " » de NexiumFilms ?"
        );


    if (!confirmed) {
        return;
    }


    series =
        series.filter(
            function(item) {

                return (
                    Number(item.id) !==
                    Number(id)
                );

            }
        );


    localStorage.setItem(
        "nexiumfilms_series",
        JSON.stringify(
            series
        )
    );


    displayLibraries();

}


/* =========================================================
   RECHERCHE
========================================================= */

searchButton.addEventListener(
    "click",
    searchTMDB
);


mediaSearch.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            searchTMDB();

        }

    }
);


/* =========================================================
   DECONNEXION
========================================================= */

document
    .getElementById(
        "logoutButton"
    )
    .addEventListener(
        "click",
        function() {

            sessionStorage.removeItem(
                "nexium_admin_auth"
            );


            window.location.replace(
                "login.html"
            );

        }
    );


/* =========================================================
   INITIALISATION
========================================================= */

displayLibraries();