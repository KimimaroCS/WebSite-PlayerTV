# NexiumFilms

Bibliothèque cinéma façon Netflix : **films**, **séries** et **anime**, avec lecture via [Vidy.st](https://www.vidy.st/#playground).

## Lecteur Vidy.st

| Type | Route |
|------|--------|
| Film | `https://vidy.st/movie/{tmdbId}` |
| Série | `https://vidy.st/tv/{tmdbId}/{season}/{episode}` |
| Anime | `https://vidy.st/anime/{anilistId}/{episode}` |

Options activées : `color`, `autoplay`, et pour séries/anime `nextEpisode`, `episodeSelector`, `autoplayNextEpisode`.

Iframe requis :

```html
allow="encrypted-media; autoplay *; fullscreen *"
```

## Lancer

```bash
npm install
npm run dev
```

Ouvre l’URL Vite (port `3847`).

## Admin

1. `login.html` → code défini dans `login.js`
2. Recherche TMDB (films/séries) ou AniList (anime)
3. Ajoute à la bibliothèque (`localStorage`)

## Stack

HTML / CSS / JS + Vite. Métadonnées TMDB + AniList. Pas de backend.
