# Begrijpend Lezen

Toets voor groep 8: **begrippen** en **signaalwoorden** van begrijpend lezen, met meerkeuzevragen.

Online: https://jkellendonk.github.io/begrijpend-lezen/

- Statische pagina (HTML/CSS/JS), geen server of database nodig.
- Lokaal gebruiken: open `index.html` in de browser.
- Vragen aanpassen:
  - `data/begrippen.js`: begrippen
  - `data/signaalwoorden.js`: verbanden, signaalwoorden en hun korte uitleg
  - `data/zinnen.js`: de zinnen waaruit alle signaalwoord-onderdelen hun vragen halen
- Na het aanpassen van de signaalwoord-data: `node tools/check-data.js` (controleert o.a. afleiders, hoofdletters en dat elk signaalwoord in een zin voorkomt).
- Scores worden bewaard in de browser (localStorage).
