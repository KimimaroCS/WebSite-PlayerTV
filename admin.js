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
   ⚠️ REMPLACE uniquement cette ligne
   par ton vrai Read Access Token TMDB.
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
   GENRES
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
   ELEMENTS
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
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

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


        if (type === "movie") {

            endpoint =
                "https://api.themoviedb.org/3/search/movie";

        } else {

            endpoint =
                "https://api.themoviedb.org/3/search/tv";

        }


        const url =
            endpoint +
            "?language=fr-FR" +
            "&query=" +
            encodeURIComponent(query);


        const response =
            await fetch(
                url,
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


        const data =
            await response.json();


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
            "<p>❌ Erreur : " +
            escapeHtml(
                error.message
            ) +
            "</p>";

    }

}


/* =========================================================
   AFFICHER RESULTAT TMDB
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
        ?
        "https://image.tmdb.org/t/p/w500" +
        item.poster_path
        :
        "";


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
                    ?
                    "🎬 FILM"
                    :
                    "📺 SÉRIE"
                ) +

            '</div>' +

            '<div class="result-title">' +
                escapeHtml(title) +
            '</div>' +

            '<div class="result-year">' +
                escapeHtml(year) +
            '</div>' +

            '<div class="result-id">' +
                'TMDB ID : ' +
                item.id +
            '</div>' +

            '<button class="add-button">' +

                (
                    isMovie
                    ?
                    "AJOUTER LE FILM"
                    :
                    "AJOUTER LA SÉRIE"
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
                    item,
                    poster,
                    year
                );

            } else {

                addSeries(
                    item,
                    poster,
                    year
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

function addMovie(
    item,
    poster,
    year
) {

    const alreadyExists =
        movies.some(
            function(movie) {

                return movie.id === item.id;

            }
        );


    if (alreadyExists) {

        alert(
            "Ce film est déjà dans NexiumFilms."
        );

        return;

    }


    const movie = {

        id: item.id,

        title: item.title,

        year: year,

        poster: poster,

        type: "movie",

        genreIds:
            item.genre_ids || []

    };


    movies.push(
        movie
    );


    localStorage.setItem(
        "nexiumfilms_movies",
        JSON.stringify(movies)
    );


    alert(
        item.title +
        " a été ajouté à NexiumFilms !"
    );


    displayLibraries();

}


/* =========================================================
   AJOUT SERIE
========================================================= */

async function addSeries(
    item,
    poster,
    year
) {

    const alreadyExists =
        series.some(
            function(show) {

                return show.id === item.id;

            }
        );


    if (alreadyExists) {

        alert(
            "Cette série est déjà dans NexiumFilms."
        );

        return;

    }


    loading.innerText =
        "📺 Récupération des saisons de " +
        item.name +
        "...";


    let seasons = [];


    try {

        seasons =
            await fetchSeriesSeasons(
                item.id
            );

    } catch (error) {

        console.error(
            error
        );

        alert(
            "La série sera ajoutée, " +
            "mais les saisons n'ont pas pu être récupérées."
        );

    }


    const show = {

        id: item.id,

        title: item.name,

        year: year,

        poster: poster,

        type: "serie",

        genreIds:
            item.genre_ids || [],

        seasons: seasons

    };


    series.push(
        show
    );


    localStorage.setItem(
        "nexiumfilms_series",
        JSON.stringify(series)
    );


    loading.innerText =
        "";


    alert(
        item.name +
        " a été ajoutée à NexiumFilms !"
    );


    displayLibraries();

}


/* =========================================================
   RECUPERER SAISONS TMDB
========================================================= */

async function fetchSeriesSeasons(
    seriesId
) {

    const url =
        "https://api.themoviedb.org/3/tv/" +
        seriesId +
        "?language=fr-FR";


    const response =
        await fetch(
            url,
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


    const data =
        await response.json();


    const seasons =
        [];


    /*
     On récupère toutes les saisons
     sauf les Specials = saison 0.
    */

    for (
        const season of
        (data.seasons || [])
    ) {

        if (
            season.season_number === 0
        ) {

            continue;

        }


        /*
         Récupération des épisodes
         de la saison.
        */

        const seasonUrl =
            "https://api.themoviedb.org/3/tv/" +
            seriesId +
            "/season/" +
            season.season_number +
            "?language=fr-FR";


        try {

            const seasonResponse =
                await fetch(
                    seasonUrl,
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


            if (!seasonResponse.ok) {

                throw new Error(
                    "Erreur saison " +
                    season.season_number
                );

            }


            const seasonData =
                await seasonResponse.json();


            const episodes =
                (
                    seasonData.episodes ||
                    []
                ).map(
                    function(episode) {

                        return {

                            episode_number:
                                episode.episode_number,

                            name:
                                episode.name,

                            overview:
                                episode.overview,

                            still_path:
                                episode.still_path

                        };

                    }
                );


            seasons.push({

                season_number:
                    season.season_number,

                name:
                    season.name,

                episode_count:
                    season.episode_count,

                episodes:
                    episodes

            });


        } catch (error) {

            console.error(
                error
            );


            /*
             Même si les épisodes
             échouent, on garde la saison.
            */

            seasons.push({

                season_number:
                    season.season_number,

                name:
                    season.name,

                episode_count:
                    season.episode_count,

                episodes: []

            });

        }

    }


    return seasons;

}


/* =========================================================
   AFFICHER BIBLIOTHEQUES
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


            item.innerHTML =

                '<div class="library-info">' +

                    '<strong>' +
                        escapeHtml(
                            movie.title
                        ) +
                    '</strong>' +

                    '<span>' +
                        movie.year +
                        " · TMDB " +
                        movie.id +
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


            item.innerHTML =

                '<div class="library-info">' +

                    '<strong>' +
                        escapeHtml(
                            show.title
                        ) +
                    '</strong>' +

                    '<span>' +

                        show.year +

                        " · TMDB " +

                        show.id +

                        " · " +

                        seasonCount +

                        " saison(s)" +

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
   SUPPRIMER FILM
========================================================= */

function removeMovie(id) {

    movies =
        movies.filter(
            function(movie) {

                return movie.id !== id;

            }
        );


    localStorage.setItem(
        "nexiumfilms_movies",
        JSON.stringify(movies)
    );


    displayLibraries();

}


/* =========================================================
   SUPPRIMER SERIE
========================================================= */

function removeSeries(id) {

    series =
        series.filter(
            function(show) {

                return show.id !== id;

            }
        );


    localStorage.setItem(
        "nexiumfilms_series",
        JSON.stringify(series)
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