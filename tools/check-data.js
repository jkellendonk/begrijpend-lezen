#!/usr/bin/env node
/* Controle van de signaalwoord-data. Gebruik: node tools/check-data.js
   Stopt met exitcode 1 als er fouten zijn. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const ctx = { window: {} };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ["data/signaalwoorden.js", "data/zinnen.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
}
const { VERBANDEN, VERBANDEN_BUREN, ZINNEN, SIGNAAL_UITLEG, SIGNAAL_VORMEN, LOS_UITGESLOTEN } = ctx;

const fouten = [];
const fout = (item, msg) => fouten.push(`${item ? `[${item.woord}] "${item.tekst}"\n    ` : ""}${msg}`);

// ---------- hulpstructuren ----------
const verbandIds = new Set(VERBANDEN.map(v => v.id));
const buren = {};
VERBANDEN.forEach(v => { buren[v.id] = new Set([v.id]); });
VERBANDEN_BUREN.forEach(([a, b]) => { buren[a].add(b); buren[b].add(a); });
const woordVerbanden = new Map();
VERBANDEN.forEach(v => v.woorden.forEach(w => {
  if (!woordVerbanden.has(w)) woordVerbanden.set(w, []);
  woordVerbanden.get(w).push(v.id);
}));
const canon = w => { const l = w.toLowerCase(); return SIGNAAL_VORMEN[l] || l; };
const heeftWoord = (tekst, w) => {
  const esc = w.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-zà-ÿ])${esc}($|[^a-zà-ÿ])`, "i").test(tekst);
};
const isHoofdletter = s => s.charAt(0) !== s.charAt(0).toLowerCase();

// ---------- VERBANDEN / SIGNAAL_UITLEG ----------
for (const v of VERBANDEN) if (!v.uitleg) fout(null, `Verband ${v.id} heeft geen uitleg.`);
for (const w of woordVerbanden.keys()) if (!SIGNAAL_UITLEG[w]) fout(null, `Signaalwoord "${w}" heeft geen SIGNAAL_UITLEG.`);
for (const w of LOS_UITGESLOTEN) if (!woordVerbanden.has(w)) fout(null, `LOS_UITGESLOTEN bevat onbekend woord "${w}".`);
for (const [vorm, c] of Object.entries(SIGNAAL_VORMEN)) if (!woordVerbanden.has(c)) fout(null, `SIGNAAL_VORMEN: "${vorm}" verwijst naar onbekend woord "${c}".`);

// ---------- zinnen ----------
const gedekt = new Set();
const teksten = new Set();
for (const z of ZINNEN) {
  // precies één ___
  const n = z.tekst.split("___").length - 1;
  if (n !== 1) { fout(z, `Moet precies één ___ hebben (nu ${n}).`); continue; }
  if (teksten.has(z.tekst)) fout(z, "Dubbele zin.");
  teksten.add(z.tekst);

  // verband
  if (!verbandIds.has(z.verband)) { fout(z, `Onbekend verband "${z.verband}".`); continue; }
  const w = canon(z.woord);
  if (!woordVerbanden.has(w)) fout(z, `Woord "${z.woord}" staat niet in VERBANDEN (ook niet via SIGNAAL_VORMEN).`);
  else if (!woordVerbanden.get(w).includes(z.verband)) fout(z, `"${w}" hoort niet bij verband "${z.verband}" volgens VERBANDEN.`);
  else gedekt.add(w);
  if (!z.uitleg || z.uitleg.length < 10) fout(z, "Uitleg ontbreekt of is te kort.");

  // afleiders
  if (!Array.isArray(z.fout) || z.fout.length < 2) fout(z, "Minstens 2 afleiders nodig.");
  const alle = [z.woord, ...z.fout].map(x => x.toLowerCase());
  if (new Set(alle).size !== alle.length) fout(z, "Woord en afleiders zijn niet allemaal verschillend.");
  for (const f of z.fout) {
    const fc = canon(f);
    if (!woordVerbanden.has(fc)) { fout(z, `Afleider "${f}" is geen signaalwoord uit VERBANDEN (voeg evt. een vorm toe aan SIGNAAL_VORMEN).`); continue; }
    const fv = woordVerbanden.get(fc);
    const botst = fv.filter(id => buren[z.verband].has(id));
    if (botst.length) fout(z, `Afleider "${f}" komt uit hetzelfde of een buur-verband (${botst.join(", ")}).`);
  }

  // hoofdletters passend bij de plek in de zin
  const voor = z.tekst.slice(0, z.tekst.indexOf("___"));
  const zinsbegin = voor.trim() === "" || /[.!?]\s*$/.test(voor);
  for (const x of [z.woord, ...z.fout]) {
    if (zinsbegin && !isHoofdletter(x)) fout(z, `"${x}" staat aan het begin van een zin en moet met een hoofdletter.`);
    if (!zinsbegin && isHoofdletter(x)) fout(z, `"${x}" staat midden in een zin en moet met een kleine letter.`);
  }

  // hint bij 'Welk woord past?' (uitleg van het verband) mag het antwoord niet verklappen
  const vUitleg = VERBANDEN.find(v => v.id === z.verband).uitleg;
  if (heeftWoord(vUitleg, z.woord)) fout(z, `De hint (verbanduitleg) bevat het antwoord "${z.woord}".`);

  // vervolg
  if (z.vervolg) {
    const { begin, goed, fout: vf } = z.vervolg;
    const gevuld = z.tekst.replace("___", z.woord);
    if (voor.trim() === "") fout(z, "Vervolg heeft geen context: het signaalwoord staat helemaal vooraan.");
    if (`${begin} ${goed}` !== gevuld) fout(z, `Vervolg klopt niet met de zin:\n      "${begin} ${goed}"\n   vs "${gevuld}"`);
    if (!Array.isArray(vf) || vf.length < 1) fout(z, "Vervolg heeft geen foute vervolgen.");
    const alleV = [goed, ...vf].map(x => x.toLowerCase());
    if (new Set(alleV).size !== alleV.length) fout(z, "Vervolgen zijn niet allemaal verschillend.");
    for (const x of vf) {
      if (isHoofdletter(x) !== isHoofdletter(goed)) fout(z, `Fout vervolg "${x}" heeft een andere hoofdletter dan het goede vervolg.`);
      if (!/[.!?]$/.test(x)) fout(z, `Fout vervolg "${x}" eindigt niet met een leesteken.`);
    }
  }
}

// elk signaalwoord minstens één keer in een zin
for (const w of woordVerbanden.keys()) if (!gedekt.has(w)) fout(null, `Signaalwoord "${w}" komt in geen enkele zin voor.`);

// hints bij 'Losse woorden': verbanduitleg mag het woord niet bevatten
for (const w of woordVerbanden.keys()) {
  if (LOS_UITGESLOTEN.includes(w)) continue;
  for (const id of woordVerbanden.get(w)) {
    const u = VERBANDEN.find(v => v.id === id).uitleg;
    if (heeftWoord(u, w)) fout(null, `Losse woorden: de uitleg van "${id}" bevat het antwoord "${w}".`);
  }
}

// ---------- rapport ----------
const metVervolg = ZINNEN.filter(z => z.vervolg).length;
const perVerband = {};
ZINNEN.forEach(z => { perVerband[z.verband] = (perVerband[z.verband] || 0) + 1; });
console.log(`Zinnen: ${ZINNEN.length} (met vervolg: ${metVervolg})`);
console.log("Per verband:", Object.entries(perVerband).map(([k, v]) => `${k} ${v}`).join(", "));
console.log(`Signaalwoorden gedekt: ${gedekt.size} / ${woordVerbanden.size}`);
if (fouten.length) {
  console.log(`\n${fouten.length} melding(en):`);
  fouten.forEach(f => console.log(" - " + f));
  process.exit(1);
}
console.log("\nGeen meldingen. ✔");
