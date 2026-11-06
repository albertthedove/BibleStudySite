# VizBible (vizbible.com)

Static site (no build step). Open `index.html` through any web server, for example `python3 -m http.server`.

## Structure
- `index.html`, `about.html`, `privacy.html`, `terms.html`: site pages.
- `paulmap.html`, `jesusmap.html`: journey maps. Both use `assets/journey-map.js` and read their content from `data/paul-journeys.json` and `data/jesus-journeys.json`.
- `PaulineChurches.html`: New Testament timeline (all 27 books) and churches table. Reads `data/books.json` and `data/churches.json`. **Change a book's date in `books.json` only.**
- `KingsJudaIsrael.html`: kings table; the chart is built from the table by `assets/kings-timeline.js`.
- `BibleChronos.html`, `BooksGraphs.html`: older pages, now inside the shared shell.
- `assets/site.css`, `assets/site.js`: shared styles, nav and footer. Add a page by adding one line to the `pages` list in `site.js`.
- `data/land.json`, `country-lines.json`, `admin-lines.json`: built-in offline base map (Natural Earth). CARTO tiles load on top when available.
- `vendor/`: self-hosted libraries (Leaflet 1.9.4, jQuery, DataTables, Bootstrap, Chart.js, vis-timeline 7.7.3).

## Adding a place to a map
Add an entry to `C` (the city), to `MODERN`, optionally `ART` and `WIKI`, and to a route in `R` in the map's JSON file. Each city lists its events by journey number with a Bible reference.

## Donate button
`assets/site.js` leaves an empty `<span id="donate-slot">` in the footer. Put the donate link or button inside it.
