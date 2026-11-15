/* Begrijpend Lezen – begrippen & signaalwoorden toetsen (groep 8)
   Opbouw en gedrag gelijk aan Dictee Engels, maar met meerkeuzevragen. */
(function () {
  "use strict";

  const STORAGE_KEY = "begrijpend-lezen-scores";
  const AMOUNTS = [
    { id: "20", label: "20 vragen" },
    { id: "40", label: "40 vragen" },
    { id: "alles", label: "Alles" }
  ];
  const HINT_DELAY_MS = 10000;
  const PRAISE = ["Goed zo!", "Top!", "Knap gedaan!", "Yes!"];

  // ====================== helpers ======================
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function lc(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function fmtTime(sec) { return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; }

  // ====================== geluid (zelfde tonen als Dictee Engels) ======================
  const sound = {
    enabled: true,
    ctx: null,
    getCtx() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      return this.ctx;
    },
    tone(ctx, freq, dur, type, vol, delay) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + (delay || 0);
      g.gain.setValueAtTime(vol || 0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.start(t); o.stop(t + dur);
    },
    play(list) {
      if (!this.enabled) return;
      const ctx = this.getCtx();
      if (!ctx) return;
      list.forEach(([f, d, t, v, dl]) => this.tone(ctx, f, d, t, v, dl));
    },
    correct() { this.play([[523.25, .12, "sine", .15, 0], [783.99, .16, "sine", .15, .09]]); },
    wrong() { this.play([[180, .28, "sawtooth", .1, 0]]); },
    streak() { this.play([523.25, 659.25, 783.99, 1046.5].map((f, i) => [f, .16, "triangle", .16, i * .09])); },
    finish() { this.play([523.25, 659.25, 783.99, 1046.5, 1318.5].map((f, i) => [f, .18, "sine", .16, i * .08])); }
  };

  // ====================== vraaggeneratie: begrippen ======================
  const BEGRIPPEN = window.BEGRIPPEN;
  const verwant = {}; // begrip -> Set van begrippen die niet samen als keuze mogen
  BEGRIPPEN.forEach(b => { verwant[b.begrip] = new Set([b.begrip]); });
  window.BEGRIPPEN_GROEPEN.forEach(groep => {
    groep.forEach(a => groep.forEach(b => { if (verwant[a]) verwant[a].add(b); }));
  });

  function begripDistractors(b) {
    return shuffle(BEGRIPPEN.filter(x => !verwant[b.begrip].has(x.begrip))).slice(0, 3);
  }

  function begripUitleg(b) { return `${cap(b.begrip)} = ${lc(b.uitleg)}`; }

  const BEGRIP_VRAGEN = {
    betekenis: b => ({
      label: "Wat betekent dit begrip?",
      prompt: cap(b.begrip),
      correct: b.uitleg,
      options: [b.uitleg, ...begripDistractors(b).map(x => x.uitleg)],
      longAnswers: true,
      explain: begripUitleg(b)
    }),
    welk: b => ({
      label: "Welk begrip past bij deze uitleg?",
      prompt: b.uitleg, longPrompt: true,
      correct: b.begrip,
      options: [b.begrip, ...begripDistractors(b).map(x => x.begrip)],
      explain: begripUitleg(b)
    }),
    voorbeeld: b => ({
      label: "Bij welk begrip past dit voorbeeld?",
      prompt: b.voorbeeld, longPrompt: true,
      correct: b.begrip,
      options: [b.begrip, ...begripDistractors(b).map(x => x.begrip)],
      explain: begripUitleg(b)
    })
  };

  // ====================== vraaggeneratie: signaalwoorden ======================
  const VERBANDEN = window.VERBANDEN;
  const verbandById = Object.fromEntries(VERBANDEN.map(v => [v.id, v]));
  const buren = {}; // verband -> Set van verbanden die niet als fout antwoord naast elkaar mogen
  VERBANDEN.forEach(v => { buren[v.id] = new Set([v.id]); });
  window.VERBANDEN_BUREN.forEach(([a, b]) => { buren[a].add(b); buren[b].add(a); });

  const woordVerbanden = new Map(); // woord -> [verband-ids]  (bijv. "want" hoort bij 2 verbanden)
  VERBANDEN.forEach(v => v.woorden.forEach(w => {
    if (!woordVerbanden.has(w)) woordVerbanden.set(w, []);
    woordVerbanden.get(w).push(v.id);
  }));
  const WOORDEN = [...woordVerbanden.keys()];
  // 'Losse woorden': zonder woorden die alleen in een zin een eenduidig verband hebben
  const LOSSE_WOORDEN = WOORDEN.filter(w => !window.LOS_UITGESLOTEN.includes(w));
  const ZINNEN = window.ZINNEN;
  const VORMEN = window.SIGNAAL_VORMEN || {};
  // schrijfwijze in de zin -> schrijfwijze in VERBANDEN (bijv. "Ten eerste" -> "ten eerste, ten tweede")
  function canon(woord) { const l = woord.toLowerCase(); return VORMEN[l] || l; }

  function blokkade(verbandIds) {
    const s = new Set();
    verbandIds.forEach(id => buren[id].forEach(x => s.add(x)));
    return s;
  }

  // goed verband + 3 foute verbanden (nooit hetzelfde of een buur-verband)
  function verbandOpties(goedId, ookUitsluiten) {
    const blok = blokkade([goedId, ...(ookUitsluiten || [])]);
    const fout = shuffle(VERBANDEN.filter(v => !blok.has(v.id))).slice(0, 3).map(v => v.label);
    return [verbandById[goedId].label, ...fout];
  }

  function verbandUitleg(woord, verbandId) {
    const v = verbandById[verbandId];
    return `${cap(woord)} = ${v.label}: ${lc(v.uitleg)}`;
  }

  function woordHint(woord) {
    const u = window.SIGNAAL_UITLEG[canon(woord)];
    return u ? `"${woord}" = ${u}` : null;
  }

  // zin met het signaalwoord vetgedrukt (als veilige HTML)
  function zinMetWoordHtml(z) {
    const [voor, na] = z.tekst.split("___");
    return `${esc(voor)}<b class="sw">${esc(z.woord)}</b>${esc(na)}`;
  }

  const SIGNAAL_VRAGEN = {
    // ---- zinnen ----
    zinVerband: z => ({
      label: "Welk verband geeft het vetgedrukte woord hier aan?",
      prompt: z.tekst.replace("___", z.woord), promptHtml: zinMetWoordHtml(z), longPrompt: true,
      correct: verbandById[z.verband].label,
      // andere verbanden van hetzelfde woord (bijv. 'want') nooit als fout antwoord tonen
      options: verbandOpties(z.verband, woordVerbanden.get(canon(z.woord))),
      hint: woordHint(z.woord),
      explain: verbandUitleg(z.woord, z.verband),
      zinUitleg: z.uitleg
    }),
    zinWoord: z => ({
      label: "Welk signaalwoord past op de puntjes?",
      prompt: z.tekst, longPrompt: true, gap: true,
      correct: z.woord, options: [z.woord, ...z.fout],
      hint: `Welk verband zit er tussen de zinsdelen? ${verbandById[z.verband].uitleg}`,
      explain: verbandUitleg(z.woord, z.verband),
      zinUitleg: z.uitleg
    }),
    vervolg: z => {
      const begin = z.vervolg.begin;
      const i = begin.lastIndexOf(z.woord);
      const beginHtml = `${esc(begin.slice(0, i))}<b class="sw">${esc(z.woord)}</b>${esc(begin.slice(i + z.woord.length))} …`;
      return {
        label: "Hoe gaat de zin verder?",
        prompt: `${begin} …`, promptHtml: beginHtml, longPrompt: true,
        correct: z.vervolg.goed, options: [z.vervolg.goed, ...z.vervolg.fout],
        longAnswers: true,
        hint: woordHint(z.woord),
        explain: verbandUitleg(z.woord, z.verband),
        zinUitleg: z.uitleg
      };
    },
    // ---- losse woorden (korte opwarmer) ----
    losVerband: w => {
      const id = woordVerbanden.get(w)[0];
      return {
        label: "Welk verband geeft dit signaalwoord aan?",
        prompt: w, correct: verbandById[id].label,
        options: verbandOpties(id, woordVerbanden.get(w)),
        hint: woordHint(w),
        explain: verbandUitleg(w, id)
      };
    },
    losWoord: w => {
      const v = verbandById[woordVerbanden.get(w)[0]];
      const blok = buren[v.id];
      const fout = shuffle(LOSSE_WOORDEN.filter(x => x !== w && !woordVerbanden.get(x).some(id => blok.has(id)))).slice(0, 3);
      return {
        label: "Welk signaalwoord hoort bij dit verband?",
        prompt: cap(v.label), correct: w, options: [w, ...fout],
        hint: v.uitleg,
        explain: verbandUitleg(w, v.id)
      };
    }
  };

  function zinVraag(soort, z) {
    const make = { "zin-verband": SIGNAAL_VRAGEN.zinVerband, "zin-woord": SIGNAAL_VRAGEN.zinWoord, "vervolg": SIGNAAL_VRAGEN.vervolg }[soort];
    return { part: soort, ...make(z) };
  }

  // ====================== onderwerpen & onderdelen ======================
  // Elk onderdeel heeft een vaste id: die komt in het packId van de scores.
  // Gebruik een oude id nooit opnieuw voor iets anders (oude scores: signaal::verband / woord / zinnen / alles).
  const TOPICS = {
    begrippen: {
      label: "📚 Begrippen",
      name: "Begrippen",
      parts: [
        { id: "welk", label: "Welk begrip?", icon: "🔎", color: "var(--teal)",
          build: () => BEGRIPPEN.map(b => ({ part: "welk", ...BEGRIP_VRAGEN.welk(b) })) },
        { id: "betekenis", label: "Wat betekent het?", icon: "📖", color: "var(--gold)",
          build: () => BEGRIPPEN.map(b => ({ part: "betekenis", ...BEGRIP_VRAGEN.betekenis(b) })) },
        { id: "voorbeeld", label: "Voorbeelden", icon: "💬", color: "var(--mint)",
          build: () => BEGRIPPEN.filter(b => b.voorbeeld).map(b => ({ part: "voorbeeld", ...BEGRIP_VRAGEN.voorbeeld(b) })) },
        { id: "alles", label: "Alles", icon: "🎯",
          build: () => BEGRIPPEN.map(b => {
            const soort = pick(b.voorbeeld ? ["welk", "betekenis", "voorbeeld"] : ["welk", "betekenis"]);
            return { part: soort, ...BEGRIP_VRAGEN[soort](b) };
          }) }
      ]
    },
    signaal: {
      label: "🔗 Signaalwoorden",
      name: "Signaalwoorden",
      parts: [
        { id: "zin-verband", label: "Welk verband?", icon: "🔗", color: "var(--teal)",
          build: () => ZINNEN.map(z => zinVraag("zin-verband", z)) },
        { id: "zin-woord", label: "Welk woord past?", icon: "🧩", color: "var(--gold)",
          build: () => ZINNEN.map(z => zinVraag("zin-woord", z)) },
        { id: "vervolg", label: "Wat komt er na?", icon: "➡️", color: "var(--mint)",
          build: () => ZINNEN.filter(z => z.vervolg).map(z => zinVraag("vervolg", z)) },
        { id: "los", label: "Losse woorden", icon: "🔤", color: "var(--coral)",
          build: () => LOSSE_WOORDEN.map(w => ({ part: "los", ...SIGNAAL_VRAGEN[pick(["losVerband", "losWoord"])](w) })) },
        { id: "zin-alles", label: "Alles", icon: "🎯",
          build: () => ZINNEN.map(z => zinVraag(pick(z.vervolg ? ["zin-verband", "zin-woord", "vervolg"] : ["zin-verband", "zin-woord"]), z)) }
      ]
    }
  };

  function defaultPart(topicId) { const p = TOPICS[topicId].parts; return p[p.length - 1].id; }
  function partMeta(topicId, partId) {
    return TOPICS[topicId].parts.find(p => p.id === partId);
  }
  function partCount(topicId, partId) {
    return partMeta(topicId, partId).build().length;
  }
  function packName(topicId, partId, amount) {
    const base = `${TOPICS[topicId].name} · ${partMeta(topicId, partId).label}`;
    return amount === "alles" ? base : `${base} · ${amount}`;
  }
  function buildPack(topicId, partId, amount) {
    let qs = shuffle(partMeta(topicId, partId).build());
    if (amount !== "alles") qs = qs.slice(0, Number(amount));
    return {
      id: `${topicId}::${partId}::${amount}`,
      name: packName(topicId, partId, amount),
      topic: topicId,
      questions: qs.map((q, i) => ({ id: i, ...q }))
    };
  }

  // ====================== opslag ======================
  function loadScores() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
    catch { return []; }
  }
  function saveScore(entry) {
    const all = loadScores();
    const rec = { ...entry, id: Date.now(), createdAt: new Date().toISOString() };
    all.push(rec);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch { /* opslag vol of geblokkeerd */ }
    return rec;
  }
  function sortedScores() {
    return loadScores().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  const byBest = (a, b) => b.accuracy - a.accuracy || a.timeSeconds - b.timeSeconds;

  // ====================== app-state ======================
  const root = document.getElementById("root");
  const app = {
    screen: "start",
    nameInput: "",
    playerName: "Speler",
    topic: "begrippen",
    part: "alles",
    amount: "20",
    pack: null,
    quiz: null,
    result: null,
    dialog: false
  };

  // ====================== gedeelde stukjes ======================
  function headerHtml(rightHtml) {
    return `<header>
      <div class="brand">
        <div class="brand-icon"><span class="cube cube-yellow"></span><span class="cube cube-blue"></span><span class="cube cube-red"></span></div>
        <div class="brand-text"><h1>Begrijpend Lezen</h1></div>
      </div>
      ${rightHtml || ""}
      <button class="menu-btn" data-action="sound" title="Geluid aan/uit">${sound.enabled ? "🔊" : "🔇"}</button>
    </header>`;
  }

  // ====================== startscherm ======================
  function renderStart() {
    const t = TOPICS[app.topic];
    const parts = t.parts;
    root.innerHTML = `
      ${headerHtml()}
      <div class="panel">
        <h2>Wie gaat er oefenen?</h2>
        <p class="sub">Vul je naam in, kies een onderwerp en een onderdeel om te starten</p>
        <form data-form="start">
          <label for="nameInput">Naam</label>
          <input id="nameInput" type="text" placeholder="Bijv. Sam" autocomplete="off" value="${esc(app.nameInput)}">

          <label>Kies een onderwerp</label>
          <div class="topic-grid">
            ${Object.entries(TOPICS).map(([id, tp]) =>
              `<button type="button" class="topic-card ${id === app.topic ? "active" : ""}" data-action="topic" data-id="${id}">${tp.label}</button>`).join("")}
          </div>

          <label>Kies een onderdeel</label>
          <div class="category-row">
            ${parts.map(p => `<button type="button" class="category-chip ${p.id === app.part ? "active" : ""}"
                data-action="part" data-id="${p.id}" ${p.color ? `style="--chip-color:${p.color}"` : ""}>
                <span aria-hidden="true">${p.icon}</span>${esc(p.label)}<span class="chip-count">${partCount(app.topic, p.id)}</span>
              </button>`).join("")}
          </div>

          <label>Aantal vragen</label>
          <div class="dir-toggle">
            ${AMOUNTS.map(a => `<button type="button" class="dir-btn ${a.id === app.amount ? "active" : ""}" data-action="amount" data-id="${a.id}">${a.label}</button>`).join("")}
          </div>

          <button type="submit" class="start-btn">Start! ➜</button>
        </form>
        <button class="ghost-btn" style="width:100%;margin-top:12px" data-action="board">🏆 Bekijk scorebord</button>
      </div>`;
  }

  // ====================== toets ======================
  function newQuiz(pack) {
    const queue = shuffle(pack.questions.map(q => q.id));
    return {
      queue, active: queue[0],
      mastered: new Set(), struggling: new Set(), attempted: new Set(),
      mistakes: 0, firstTryCorrect: 0, streak: 0, bestStreak: 0,
      milestone: false, answered: false, lastResult: null, message: "",
      chosen: null, order: [], finished: false, hintShown: false, hintId: null,
      startedAt: Date.now(), seconds: 0, timerId: null, advanceId: null
    };
  }

  function startQuiz() {
    stopTimers();
    app.playerName = app.nameInput.trim() || "Speler";
    app.pack = buildPack(app.topic, app.part, app.amount);
    app.quiz = newQuiz(app.pack);
    app.result = null;
    app.dialog = false;
    app.screen = "quiz";
    prepareQuestion();
    app.quiz.timerId = setInterval(() => {
      const q = app.quiz;
      if (!q) return;
      q.seconds = Math.floor((Date.now() - q.startedAt) / 1000);
      const el = document.getElementById("timer");
      if (el) el.textContent = fmtTime(q.seconds);
    }, 1000);
    render();
  }

  function stopTimers() {
    if (app.quiz) {
      clearInterval(app.quiz.timerId);
      clearTimeout(app.quiz.advanceId);
      clearTimeout(app.quiz.hintId);
    }
  }

  function currentQuestion() { return app.pack.questions[app.quiz.active]; }

  function prepareQuestion() {
    // antwoorden elke keer opnieuw husselen, ook als de vraag terugkomt
    const s = app.quiz, q = currentQuestion();
    s.order = shuffle(q.options);
    s.chosen = null;
    s.hintShown = false;
    clearTimeout(s.hintId);
    // na 10 seconden zonder antwoord verschijnt de hint vanzelf
    if (q.hint) {
      const active = s.active;
      s.hintId = setTimeout(() => {
        if (app.quiz === s && app.screen === "quiz" && !s.answered && s.active === active && !s.hintShown) {
          s.hintShown = true;
          render();
        }
      }, HINT_DELAY_MS);
    }
  }

  function toggleHint() {
    const s = app.quiz;
    if (!s || !currentQuestion().hint || app.dialog) return;
    s.hintShown = !s.hintShown;
    clearTimeout(s.hintId);
    render();
  }

  function isCorrect(q, answer) {
    return answer === q.correct || (q.alsoCorrect || []).includes(answer);
  }

  function choose(index) {
    const s = app.quiz;
    if (!s || s.answered || app.dialog) return;
    const q = currentQuestion();
    const answer = s.order[index];
    if (answer === undefined) return;
    const idx = s.active;
    const first = !s.attempted.has(idx);
    s.attempted.add(idx);
    s.answered = true;
    clearTimeout(s.hintId);
    s.chosen = answer;

    if (isCorrect(q, answer)) {
      s.streak += 1;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
      s.mastered.add(idx);
      s.struggling.delete(idx);
      if (first) s.firstTryCorrect += 1;
      s.lastResult = "correct";
      s.milestone = s.streak > 0 && s.streak % 5 === 0;
      s.message = pick(PRAISE);
    } else {
      s.lastResult = "wrong";
      s.mistakes += 1;
      s.struggling.add(idx);
      s.streak = 0;
      s.milestone = false;
      s.message = "";
    }

    if (s.milestone) sound.streak();
    else if (s.lastResult === "wrong") sound.wrong();
    else sound.correct();

    render();
    // goed: vanzelf verder. Fout: blijven staan tot er op Volgende (of Enter) gedrukt wordt.
    if (s.lastResult === "correct") s.advanceId = setTimeout(advance, 900);
  }

  function advance() {
    const s = app.quiz;
    if (!s || !s.answered || app.screen !== "quiz") return;
    clearTimeout(s.advanceId);
    const rest = s.queue.slice(1);
    if (s.lastResult === "wrong") rest.push(s.active); // komt later terug
    if (rest.length === 0) return finishQuiz();
    s.queue = rest;
    s.active = rest[0];
    s.answered = false;
    s.lastResult = null;
    s.milestone = false;
    s.message = "";
    prepareQuestion();
    render();
  }

  function finishQuiz() {
    const s = app.quiz;
    stopTimers();
    s.finished = true;
    const total = app.pack.questions.length;
    const timeSeconds = Math.floor((Date.now() - s.startedAt) / 1000);
    const accuracy = Math.round(s.firstTryCorrect / total * 100);
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
    const result = {
      totalWords: total, firstTryCorrect: s.firstTryCorrect, accuracy, mistakes: s.mistakes,
      timeSeconds, wpm: Math.round(total / Math.max(timeSeconds, 1) * 60 * 10) / 10,
      bestStreak: s.bestStreak, stars
    };
    const prevBest = loadScores()
      .filter(r => r.playerName === app.playerName && r.packId === app.pack.id)
      .sort(byBest)[0];
    result.isRecord = !prevBest || accuracy > prevBest.accuracy ||
      (accuracy === prevBest.accuracy && timeSeconds < prevBest.timeSeconds);
    saveScore({ playerName: app.playerName, packId: app.pack.id, pack: { name: app.pack.name }, ...result });
    sound.finish();
    app.result = result;
    app.screen = "result";
    render();
  }

  function renderQuiz() {
    const s = app.quiz, pack = app.pack, q = currentQuestion();
    const meta = partMeta(pack.topic, q.part);
    const longAnswers = !!q.longAnswers;

    const steps = pack.questions.map(x => {
      let cls = "step";
      if (s.mastered.has(x.id)) cls += " mastered";
      else if (x.id === s.active && !s.answered) cls += " current";
      else if (s.struggling.has(x.id)) cls += " struggling";
      return `<div class="${cls}"></div>`;
    }).join("");

    let msg = "";
    if (s.lastResult === "correct") msg = esc(s.message);
    else if (s.lastResult === "wrong") {
      msg = q.longAnswers
        ? "Bijna! Het goede antwoord is groen gemaakt. Komt later terug."
        : `Bijna! Het juiste antwoord is: <u>${esc(q.correct)}</u>. Komt later terug.`;
      if (q.explain) {
        msg += `<div class="explain">💡 ${esc(q.explain)}` +
          (q.zinUitleg ? `<div class="zin-uitleg">In deze zin: ${esc(q.zinUitleg)}</div>` : "") +
          `</div>`;
      }
    }

    const promptHtml = q.promptHtml
      ? q.promptHtml
      : q.gap
        ? esc(q.prompt).replace("___", `<span class="gap">&nbsp;</span>`)
        : esc(q.prompt);

    const choices = s.order.map((opt, i) => {
      let cls = "choice-btn";
      if (s.answered) {
        if (isCorrect(q, opt)) cls += " correct";
        else if (opt === s.chosen) cls += " wrong";
        else cls += " dimmed";
      }
      return `<button class="${cls}" data-action="choose" data-index="${i}" ${s.answered ? "disabled" : ""}>
        <span class="key">${i + 1}</span><span>${esc(opt)}</span></button>`;
    }).join("");

    const lastOne = s.queue.length === 1 && s.lastResult !== "wrong";
    const nextLabel = !s.answered ? "Volgende ➜"
      : s.lastResult === "wrong" ? "Volgende ➜"
      : lastOne ? "Nu naar score ➜" : "Nu al verder ➜";

    root.innerHTML = `
      ${headerHtml(`<div class="player-badge">👤 ${esc(app.playerName)} · ${esc(pack.name)}</div>
        <button class="menu-btn" data-action="ask-stop">🏠 Hoofdmenu</button>`)}
      <div class="top-bar">
        <span class="streak-badge">🔥 ${s.streak} op een rij</span>
        <span class="timer">⏱ <span id="timer">${fmtTime(s.seconds)}</span></span>
      </div>
      ${s.answered && s.milestone ? `<div class="milestone-banner">🎉 ${s.streak} op een rij! Knap gedaan!</div>` : ""}
      <div class="trail-wrap">
        <div class="trail">${steps}</div>
        <div class="trail-meta">
          <span>${s.mastered.size} / ${pack.questions.length} onder de knie</span>
          <span>${s.mistakes} foutjes tot nu toe</span>
        </div>
      </div>
      <div class="msg ${s.lastResult === "correct" ? "good" : s.lastResult === "wrong" ? "bad" : ""}">${msg}</div>
      <div class="stage">
        <div class="prompt-card">
          ${meta ? `<div class="category-badge" style="--chip-color:${meta.color}"><span class="dot" aria-hidden="true"></span>${meta.icon} ${esc(meta.label)}</div>` : ""}
          <div class="prompt-label">${esc(q.label)}</div>
          <div class="prompt-word ${q.longPrompt ? "long" : ""}">${promptHtml}</div>
          ${q.hint ? `<button class="hint-btn ${s.hintShown ? "active" : ""}" data-action="hint" title="Hint (H)" aria-label="Hint tonen">?</button>` : ""}
          ${q.hint && s.hintShown && !s.answered ? `<div class="hint-box">💡 ${esc(q.hint)}</div>` : ""}
        </div>
      </div>
      <div class="choice-grid ${longAnswers ? "long" : ""}">${choices}</div>
      <div class="hint">Klik op een antwoord of druk op 1, 2, 3 of 4 · Enter of spatie = verder${q.hint ? " · ? of H = hint" : ""}</div>
      <div class="footer">
        <div class="score"><span>Onder de knie</span> <b>${s.mastered.size} / ${pack.questions.length}</b></div>
        <button class="next-btn ${s.lastResult === "wrong" ? "attention" : ""}" data-action="next" ${s.answered ? "" : "disabled"}>${nextLabel}</button>
      </div>
      ${app.dialog ? `
        <div class="dialog-overlay" data-action="close-dialog">
          <div class="dialog-card" role="dialog" aria-modal="true">
            <div class="dialog-title">Stoppen met deze ronde?</div>
            <div class="dialog-message">Je voortgang in dit onderdeel gaat dan verloren.</div>
            <div class="dialog-actions">
              <button class="ghost-btn" data-action="stop">Ja, stoppen</button>
              <button class="start-btn" data-action="close-dialog">Verder spelen</button>
            </div>
          </div>
        </div>` : ""}`;
  }

  // ====================== resultaat ======================
  function renderResult() {
    const r = app.result;
    const sub = r.stars === 3 ? "Fantastisch werk! Bijna alles in één keer goed."
      : r.stars === 2 ? "Goed bezig! Nog een paar keer oefenen en het zit er helemaal in."
      : "Mooie eerste ronde! Elke keer oefenen maakt je sterker.";
    const top = [...loadScores()].sort(byBest).slice(0, 5);

    root.innerHTML = `
      ${headerHtml(`<div class="player-badge">👤 ${esc(app.playerName)}</div>`)}
      <div class="panel">
        <div class="result-hero">
          <div class="stars">${"⭐".repeat(r.stars)}${"☆".repeat(3 - r.stars)}</div>
          <div class="result-title">"${esc(app.pack.name)}" voltooid!</div>
          <div class="result-sub">${sub}</div>
        </div>
        ${r.isRecord ? `<div class="record-banner">🏆 Nieuw persoonlijk record voor dit onderdeel!</div>` : ""}
        <div class="metric-grid">
          <div class="metric"><div class="mval">${r.accuracy}%</div><div class="mlabel">In één keer goed</div></div>
          <div class="metric"><div class="mval">${fmtTime(r.timeSeconds)}</div><div class="mlabel">Tijd nodig</div></div>
          <div class="metric"><div class="mval">${r.wpm}</div><div class="mlabel">Vragen / minuut</div></div>
          <div class="metric"><div class="mval">${r.mistakes}</div><div class="mlabel">Foutjes totaal</div></div>
          <div class="metric"><div class="mval">🔥 ${r.bestStreak}</div><div class="mlabel">Langste reeks</div></div>
        </div>
        <div class="board">
          <div class="board-title">🏅 Beste rondes</div>
          ${top.map((e, i) => `<div class="board-row">
              <div class="board-rank">${i + 1}.</div>
              <div class="board-name">${esc(e.playerName)} <span style="color:#B8C7BF;font-weight:600">· ${esc(e.pack.name)}</span></div>
              <div class="board-stat">${e.accuracy}% · ${fmtTime(e.timeSeconds)}</div>
            </div>`).join("")}
        </div>
        <div class="result-actions">
          <button class="ghost-btn" data-action="menu">Ander onderdeel</button>
          <button class="start-btn" data-action="again">Nog een keer ➜</button>
        </div>
        <button class="ghost-btn" style="width:100%;margin-top:12px" data-action="board">🏆 Volledig scorebord</button>
      </div>`;
  }

  // ====================== scorebord ======================
  function withDeltas(entries) {
    const last = {};
    return [...entries].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(e => {
      const key = e.packId || e.pack.name;
      const prev = last[key];
      const deltaAcc = prev ? e.accuracy - prev.accuracy : null;
      const deltaTime = prev ? prev.timeSeconds - e.timeSeconds : null;
      last[key] = e;
      return { ...e, deltaAcc, deltaTime };
    });
  }
  function deltaSpan(value, unit) {
    const color = value === 0 ? "#8A97A8" : value > 0 ? "var(--mint)" : "var(--coral)";
    const arrow = value === 0 ? "▬" : value > 0 ? "▲" : "▼";
    return `<span style="color:${color}">${arrow} ${Math.abs(value)}${unit}</span>`;
  }

  function renderBoard() {
    const all = sortedScores();
    const head = headerHtml(`<button class="menu-btn" data-action="menu">🏠 Hoofdmenu</button>`);
    if (all.length === 0) {
      root.innerHTML = `${head}
        <div class="panel" style="text-align:center">
          <h2>🏆 Scorebord</h2>
          <p class="sub">Hier komt de voortgang te staan zodra er een onderdeel is afgerond.</p>
          <button class="start-btn" data-action="menu">Terug naar start</button>
        </div>`;
      return;
    }
    const perPlayer = {};
    all.forEach(e => { (perPlayer[e.playerName] = perPlayer[e.playerName] || []).push(e); });
    root.innerHTML = `${head}
      <div class="panel">
        <h2>🏆 Scorebord</h2>
        <p class="sub">Groene pijl = vooruitgang t.o.v. de vorige poging op hetzelfde onderdeel. Rood betekent: nog even oefenen.</p>
        ${Object.entries(perPlayer).map(([name, list]) => {
          const rows = withDeltas(list).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          return `<div class="board" style="margin-bottom:16px">
            <div class="board-title">👤 ${esc(name)}</div>
            ${rows.map(e => `<div class="board-row">
                <div class="board-name">${esc(e.pack.name)}</div>
                <div class="board-stat">${e.accuracy}% · ${fmtTime(e.timeSeconds)}</div>
                <div class="board-delta">${e.deltaAcc === null
                  ? `<span class="dim">eerste poging</span>`
                  : `${deltaSpan(e.deltaAcc, "%")} · ${deltaSpan(e.deltaTime, "s")}`}</div>
              </div>`).join("")}
          </div>`;
        }).join("")}
        <button class="ghost-btn" style="width:100%" data-action="menu">Terug naar hoofdmenu</button>
      </div>`;
  }

  // ====================== render & events ======================
  function render() {
    if (app.screen === "start") renderStart();
    else if (app.screen === "quiz") renderQuiz();
    else if (app.screen === "result") renderResult();
    else if (app.screen === "board") renderBoard();
  }

  function goMenu() {
    stopTimers();
    app.quiz = null;
    app.dialog = false;
    app.screen = "start";
    render();
  }

  root.addEventListener("input", e => {
    if (e.target.id === "nameInput") app.nameInput = e.target.value;
  });

  root.addEventListener("submit", e => {
    e.preventDefault();
    startQuiz();
  });

  root.addEventListener("click", e => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;
    // klik op de achtergrond van de dialoog sluit hem, klik in de kaart niet
    if (action === "close-dialog" && el.classList.contains("dialog-overlay") && e.target !== el) return;

    switch (action) {
      case "sound": sound.enabled = !sound.enabled; el.textContent = sound.enabled ? "🔊" : "🔇"; break;
      case "topic": app.topic = el.dataset.id; app.part = defaultPart(app.topic); renderStart(); break;
      case "part": app.part = el.dataset.id; renderStart(); break;
      case "amount": app.amount = el.dataset.id; renderStart(); break;
      case "board": stopTimers(); app.screen = "board"; render(); break;
      case "menu": goMenu(); break;
      case "again": startQuiz(); break;
      case "choose": choose(Number(el.dataset.index)); break;
      case "next": advance(); break;
      case "hint": toggleHint(); break;
      case "ask-stop": app.dialog = true; render(); break;
      case "close-dialog": app.dialog = false; render(); break;
      case "stop": goMenu(); break;
    }
  });

  document.addEventListener("keydown", e => {
    if (app.screen === "quiz") {
      if (app.dialog) {
        if (e.key === "Escape") { app.dialog = false; render(); }
        return;
      }
      if (["1", "2", "3", "4"].includes(e.key)) { choose(Number(e.key) - 1); return; }
      if (e.key === "h" || e.key === "H" || e.key === "?") { toggleHint(); return; }
      if ((e.key === "Enter" || e.key === " ") && app.quiz.answered) { e.preventDefault(); advance(); }
    } else if (app.screen === "result" && e.key === "Enter") {
      e.preventDefault();
      startQuiz();
    }
  });

  render();
})();
