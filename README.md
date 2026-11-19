# NexiumFilms

Bibliothèque cinéma façon Netflix : **films**, **séries** et **anime**, lecture **VF/VOSTFR** via [Frembed](https://frembed.click).

> **Flemmix** (flemmix.uno / flemmix.me) n’expose pas d’API iframe par ID TMDB : c’est un catalogue scrapé. **Frembed** est l’API d’embed française équivalente.

## Lecteur Frembed

| Type | URL |
|------|-----|
| Film | `https://frembed.click/api/film.php?id={tmdbId}` |
| Série / Anime | `https://frembed.click/api/serie.php?id={tmdbId}&sa={saison}&epi={épisode}` |

Les contrôles saison/épisode du site restent en français. Frembed propose VF / VOSTFR dans le player.

## Lancer

```bash
npm install
npm run dev
```

Port Vite : `3847`.

## Admin

1. `login.html` → code dans `login.js`
2. Recherche TMDB (films, séries, anime)
3. Bibliothèque en `localStorage`

## Stack

HTML / CSS / JS + Vite. Métadonnées TMDB. Lecteur Frembed.
