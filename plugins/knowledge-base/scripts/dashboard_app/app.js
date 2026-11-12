/* Syntraq knowledge-base dashboard. Data: window.KB_DASHBOARD (.dashboard/data.js,
   rebuilt by .dashboard/dashboard.py whenever a skill runs). Optional live mode:
   with the File System Access API the page re-counts raw/ itself and saves the
   theme into .dashboard/data/settings.json. No server, no dependencies. */
(function () {
  "use strict";
  var D = window.KB_DASHBOARD;
  var app = document.getElementById("app");
  if (!D) { app.innerHTML = '<p style="padding:24px">Sem dados: falta <code>.dashboard/data.js</code>. Pede ao Claude «atualiza o dashboard».</p>'; return; }
  var root = document.documentElement;

  // ------------------------------------------------------------ i18n
  var PT = /^pt/i.test(D.language || "");
  root.lang = PT ? "pt-PT" : "en";
  var T = PT ? {
    overview: "Visão geral", courses: "Unidades curriculares", areas: "Áreas", archive: "Arquivo", sources: "Fontes", wiki: "Wiki", outputs: "Outputs", activity: "Atividade",
    search: "Pesquisar artigos, outputs, UCs…", generated: "Atualizado", stale: "desatualizado", light: "Claro", dark: "Escuro",
    nextExam: "Próximo exame", noExam: "Sem data", days: "dias", day: "dia", today: "hoje", tomorrow: "amanhã", ago: "há", in_: "daqui a", taken: "realizado",
    compiledPct: "Fontes compiladas", toCompile: "Por compilar", articles: "Artigos", notes: "Notas por compilar", of: "de", outOfScope: "fora do âmbito",
    newF: "novas", changed: "alteradas", lastCompile: "última compilação",
    upcoming: "Próximos exames", nextSteps: "Próximos passos", copy: "Copiar pedido", copied: "Copiado — cola no Claude", todayTasks: "Hoje", nextDay: "Próximo dia de estudo",
    missing: "Em falta", heat: "Ritmo", streak: "dias seguidos", streak1: "dia seguido", less: "menos", more: "mais", nothing: "Nada para mostrar.",
    priorities: "Prioridades", grades: "Notas estimadas", trend: "tendência", perAttempt: "por tentativa", nextGuess: "próxima ≈", passGrade: "nota mínima", noPass: "Nota mínima por definir",
    above: "acima da mínima", partial: "parcial, convertida", below: "abaixo da mínima", attempts: "tentativas", quizzes: "quizzes", material: "Material", plan: "Plano", tasks: "tarefas",
    ahead: "Adiantado", onTrack: "Em dia", behind: "Atrasado", overdue: "por fazer de dias anteriores", planOver: "Plano terminado", notDone: "por fazer",
    compiled: "Compiladas", pending: "Pendentes", newer: "alterada desde a compilação", area: "Área", total: "Total", pendingList: "Por compilar (mais recentes)",
    removed: "Saíram do raw/ mas continuam no manifest", health: "Saúde", broken: "Links partidos", notInIndex: "Fora do index.md", allGood: "Tudo em ordem", inbox: "Notas na inbox",
    allTypes: "Todos", allFolders: "Todas", folder: "Pasta", kindL: "Tipo", other: "Geral", source: "fonte", fromPlan: "plano de estudo", inferred: "ano deduzido", examsOf: "Exames", wikiOf: "Artigos na wiki",
    events: "O que os skills fizeram", files: "Ficheiros alterados", live: "Contagem ao vivo", liveOn: "raw/ contado ao vivo", liveOff: "contagem do último build",
    connect: "Ligar à pasta da KB", connectRaw: "Ligar a pasta do raw/", refresh: "Atualizar contagem", wrongFolder: "Escolhe a pasta da KB: ", rawHint: "O raw/ é um atalho; escolhe a pasta real: ",
    filter: "Filtrar…", open: "abrir", obs: "abrir no Obsidian", k: { raw: "raw", wiki: "wiki", note: "nota", output: "output" },
    state: { red: "fraco", yellow: "a melhorar", green: "dominado", none: "sem dados" },
    s: {
      compileArea: function (n, a) { return "Compilar " + n + (n === 1 ? " fonte de " : " fontes de ") + a; }, compileAreaP: function (a) { return "compila a wiki — começa pelas fontes pendentes de " + a; },
      compileNotes: function (n) { return "Compilar " + n + (n === 1 ? " nota da inbox" : " notas da inbox"); }, compileNotesP: "compila as notas pendentes da wiki",
      lint: "Corrigir a saúde da wiki", lintP: "corre o wiki-lint",
      quiz: function (t, a) { return "Treinar " + t + " (" + a + ")"; }, quizP: function (t, a) { return "faz-me um quiz de " + t + " de " + a; },
      mock: function (a) { return "Fazer um simulado de " + a; }, mockP: function (a) { return "faz-me um simulado de " + a; },
      map: function (a) { return "Mapear os exames antigos de " + a; }, mapP: function (a) { return "analisa os exames antigos de " + a; },
      replan: function (n) { return "Replanear (" + n + (n === 1 ? " tarefa atrasada)" : " tarefas atrasadas)"); }, replanP: "estou atrasado no plano de estudo, replaneia",
      why: { exam: function (n) { return "exame daqui a " + n + " dias"; }, noAttempt: "sem tentativas nos últimos 7 dias" }
    },
    footer: "Os números atualizam-se sozinhos quando um skill corre. «atualiza o dashboard» só é preciso quando há pastas ou plugins novos."
  } : {
    overview: "Overview", courses: "Courses", areas: "Areas", archive: "Archive", sources: "Sources", wiki: "Wiki", outputs: "Outputs", activity: "Activity",
    search: "Search articles, outputs, courses…", generated: "Updated", stale: "out of date", light: "Light", dark: "Dark",
    nextExam: "Next exam", noExam: "No date", days: "days", day: "day", today: "today", tomorrow: "tomorrow", ago: "ago", in_: "in", taken: "taken",
    compiledPct: "Sources compiled", toCompile: "To compile", articles: "Articles", notes: "Notes to compile", of: "of", outOfScope: "out of scope",
    newF: "new", changed: "changed", lastCompile: "last compile",
    upcoming: "Upcoming exams", nextSteps: "Next steps", copy: "Copy request", copied: "Copied — paste it to Claude", todayTasks: "Today", nextDay: "Next study day",
    missing: "Missing", heat: "Rhythm", streak: "day streak", streak1: "day streak", less: "less", more: "more", nothing: "Nothing to show.",
    priorities: "Priorities", grades: "Estimated grades", trend: "trend", perAttempt: "per attempt", nextGuess: "next ≈", passGrade: "pass mark", noPass: "Pass mark not set",
    above: "above the pass mark", partial: "partial, rescaled", below: "below the pass mark", attempts: "attempts", quizzes: "quizzes", material: "Material", plan: "Plan", tasks: "tasks",
    ahead: "Ahead", onTrack: "On track", behind: "Behind", overdue: "left from earlier days", planOver: "Plan over", notDone: "not done",
    compiled: "Compiled", pending: "Pending", newer: "changed since compiled", area: "Area", total: "Total", pendingList: "To compile (newest)",
    removed: "Gone from raw/ but still in the manifest", health: "Health", broken: "Broken links", notInIndex: "Missing from index.md", allGood: "All good", inbox: "Notes in the inbox",
    allTypes: "All", allFolders: "All", folder: "Folder", kindL: "Type", other: "General", source: "source", fromPlan: "study plan", inferred: "year inferred", examsOf: "Exams", wikiOf: "Wiki articles",
    events: "What skills did", files: "Changed files", live: "Live count", liveOn: "raw/ counted live", liveOff: "count from the last build",
    connect: "Connect the KB folder", connectRaw: "Connect the raw/ folder", refresh: "Refresh count", wrongFolder: "Pick the KB folder: ", rawHint: "raw/ is a link; pick the real folder: ",
    filter: "Filter…", open: "open", obs: "open in Obsidian", k: { raw: "raw", wiki: "wiki", note: "note", output: "output" },
    state: { red: "weak", yellow: "improving", green: "mastered", none: "no data" },
    s: {
      compileArea: function (n, a) { return "Compile " + n + (n === 1 ? " source of " : " sources of ") + a; }, compileAreaP: function (a) { return "compile the wiki — start with the pending sources of " + a; },
      compileNotes: function (n) { return "Compile " + n + (n === 1 ? " inbox note" : " inbox notes"); }, compileNotesP: "compile the pending notes into the wiki",
      lint: "Fix the wiki's health", lintP: "run wiki-lint",
      quiz: function (t, a) { return "Practise " + t + " (" + a + ")"; }, quizP: function (t, a) { return "quiz me on " + t + " in " + a; },
      mock: function (a) { return "Take a mock exam of " + a; }, mockP: function (a) { return "give me a mock exam of " + a; },
      map: function (a) { return "Map the past exams of " + a; }, mapP: function (a) { return "analyse the past exams of " + a; },
      replan: function (n) { return "Replan (" + n + (n === 1 ? " task behind)" : " tasks behind)"); }, replanP: "I'm behind on my study plan, replan it",
      why: { exam: function (n) { return "exam in " + n + " days"; }, noAttempt: "no attempt in the last 7 days" }
    },
    footer: "Numbers update by themselves when a skill runs. “Update the dashboard” is only needed for new folders or plugins."
  };

  // ------------------------------------------------------------ helpers
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function num(n, d) { return Number(n || 0).toLocaleString(PT ? "pt-PT" : "en", { maximumFractionDigits: d == null ? 1 : d }); }
  function pct(a, b) { return b ? Math.round(a * 100 / b) : 0; }
  function iso(d) { var m = d.getMonth() + 1, x = d.getDate(); return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (x < 10 ? "0" : "") + x; }
  var TODAY = iso(new Date());
  function parse(s) { var p = String(s).slice(0, 10).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function diff(s) { return Math.round((parse(s) - parse(TODAY)) / 864e5); }
  function fmtDate(s, long) {
    if (!s) return "";
    var d = parse(s);
    return d.toLocaleDateString(PT ? "pt-PT" : "en-GB", { weekday: long ? "long" : "short", day: "numeric", month: "short", year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
  }
  function rel(s) {
    var n = diff(s);
    if (n === 0) return T.today;
    if (n === 1) return T.tomorrow;
    var a = Math.abs(n), w = a + " " + (a === 1 ? T.day : T.days);
    return n > 0 ? T.in_ + " " + w : (PT ? T.ago + " " + w : w + " " + T.ago);
  }
  function key(s) { return String(s || "").normalize("NFC").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "").trim().toLowerCase(); }
  function under(path, prefixes) { var p = key(path); return (prefixes || []).some(function (q) { q = key(q); return !q || q === "." || p === q || p.indexOf(q + "/") === 0; }); }
  function globRe(q) { return new RegExp("^" + q.replace(/[.+^${}()|\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$"); }
  function matches(path, pats) {
    var p = key(path);
    return (pats || []).some(function (q) {
      q = key(q);
      if (/\/\*\*$/.test(q)) { var b = q.slice(0, -3); return p === b || p.indexOf(b + "/") === 0; }
      return globRe(q).test(p) || p.indexOf(q.replace(/\/+$/, "") + "/") === 0;
    });
  }
  function shortPath(p, n) { var s = String(p).split("/"); n = n || 3; return s.length > n ? "…/" + s.slice(-n).join("/") : p; }
  function base(p) { return String(p).split("/").pop().replace(/\.[A-Za-z0-9]{1,5}$/, ""); }
  function href(p) { return String(p).split("/").map(encodeURIComponent).join("/"); }
  function obsidian(wikiPath) {
    if (!D.vault || !D.vault.name) return "";
    return "obsidian://open?vault=" + encodeURIComponent(D.vault.name) + "&file=" + encodeURIComponent((D.vault.prefix || "") + "wiki/" + String(wikiPath).replace(/\.md$/i, ""));
  }
  function artLink(a) { var o = obsidian(a.path); return o ? '<a class="link" href="' + esc(o) + '" title="' + esc(T.obs) + '">' + esc(a.name) + "</a>" : esc(a.name); }
  function stateOf(s) { s = String(s || "").toLowerCase(); return /red|🔴|weak|fraco/.test(s) ? "red" : /yellow|🟡|improv|melhor/.test(s) ? "yellow" : /green|🟢|master|domin/.test(s) ? "green" : "none"; }
  var SC = { red: "st-bad", yellow: "st-warn", green: "st-good", none: "st-none" }, SI = { red: "🔴", yellow: "🟡", green: "🟢", none: "⚪" };
  function stTag(s, note) { var k = stateOf(s); return '<span class="tag ' + SC[k] + '">' + SI[k] + " " + esc(T.state[k]) + (note ? " " + esc(note) : "") + "</span>"; }
  function bar(parts, total, marker) {
    var h = '<div class="bar">';
    parts.forEach(function (p) { if (p.v > 0) h += '<span class="' + p.c + '" style="width:' + (p.v * 100 / Math.max(total, 1)) + '%" data-tip="' + esc(p.l + ": " + num(p.v)) + '"></span>'; });
    if (marker != null) h += '<i class="mk" style="left:calc(' + Math.min(100, marker * 100 / Math.max(total, 1)) + '% - 1px)"></i>';
    return h + "</div>";
  }
  function card(title, body, cls) { return '<div class="card ' + (cls || "") + '">' + (title ? "<h3>" + title + "</h3>" : "") + body + "</div>"; }
  function sec(t) { return '<h2 class="sec">' + esc(t) + "</h2>"; }
  function copyBtn(prompt) { return '<button class="btn sm" data-copy="' + esc(prompt) + '">⧉ ' + esc(T.copy) + "</button>"; }
  function grade(v) { return num(v, 1); }

  // ------------------------------------------------------------ derived data
  var AREAS = D.areas || [];
  function names(a) { return [a.name].concat(a.aliases || []).map(key); }
  function areaBySlug(s) { for (var i = 0; i < AREAS.length; i++) if (AREAS[i].slug === s) return AREAS[i]; return null; }
  function examsOf(a) { return (a.exams || []).filter(function (e) { return e.date; }).slice().sort(function (x, y) { return x.date < y.date ? -1 : 1; }); }
  function allExams() {
    var out = [];
    AREAS.forEach(function (a) { examsOf(a).forEach(function (e) { out.push({ a: a, e: e }); }); });
    return out.sort(function (x, y) { return x.e.date < y.e.date ? -1 : 1; });
  }
  function isActive(a) { return !a.archived; }
  function topicsOf(a) {
    var em = (a.exam_map && a.exam_map.topics) || [], pr = (a.progress && a.progress.topics) || [], st = {};
    pr.forEach(function (t) { st[key(t.article || t.name)] = t; st[key(t.name)] = st[key(t.name)] || t; });
    var list = em.length ? em.map(function (t) { var p = st[key(t.article)] || st[key(t.name)] || {}; return { name: t.name, article: t.article, band: t.band, share: t.share, state: p.state || "none", note: p.note || "" }; })
      : pr.map(function (t) { return { name: t.name || t.article, article: t.article, state: t.state, note: t.note || "" }; });
    var o = { red: 0, yellow: 1, none: 2, green: 3 }, b = function (t) { return /🔥/.test(t.band || "") ? 0 : /⚠/.test(t.band || "") ? 1 : 2; };
    return list.sort(function (p, q) { return o[stateOf(p.state)] - o[stateOf(q.state)] || b(p) - b(q) || (q.share || 0) - (p.share || 0); });
  }
  function isStudyKB() { return (D.plans || []).length > 0 || AREAS.some(function (a) { return hasStudy(a) || a.course.pass_grade != null || (a.course.exams || []).length; }); }
  function hasStudy(a) { return examsOf(a).length || topicsOf(a).length || (a.attempts || []).length || (a.materials || []).some(function (m) { return /summary|sheet|mock|solution|flashcard|study|resumo|folha|simulado|resolu/i.test(m.type); }); }
  function wordIn(text, word) {
    // the course name as a whole word: "so" matches "so — memória", never "resolver"
    var w = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp("(^|[^\\p{L}\\p{N}])" + w + "($|[^\\p{L}\\p{N}])", "u").test(text);
  }
  function planFor(a) {
    var ns = names(a), out = [];
    (D.plans || []).forEach(function (p) {
      var whole = (p.courses || []).length === 1 && ns.indexOf(key(p.courses[0])) >= 0;
      var days = p.days.map(function (d) {
        var ts = whole ? d.tasks : d.tasks.filter(function (t) { var k = key(t.text); return ns.some(function (n) { return n && wordIn(k, n); }); });
        return { date: d.date, tasks: ts };
      }).filter(function (d) { return d.tasks.length; });
      if (days.length) out.push({ label: p.label, path: p.path, days: days });
    });
    return out;
  }
  function planState(p) {
    var all = 0, done = 0, due = 0, overdue = 0, ahead = 0, todays = null, next = null;
    p.days.forEach(function (d) {
      d.tasks.forEach(function (t) { all++; if (t.done) done++; if (d.date < TODAY) { due++; if (!t.done) overdue++; } if (d.date > TODAY && t.done) ahead++; });
      if (d.date === TODAY) todays = d; if (!next && d.date > TODAY) next = d;
    });
    var last = p.days.length ? p.days[p.days.length - 1].date : TODAY;
    return { all: all, done: done, due: due, overdue: overdue, ahead: ahead, today: todays, next: next, over: last < TODAY };
  }
  function planBlock(p, title) {
    var s = planState(p), st;
    if (s.over) st = s.overdue ? '<span class="tag st-none">■ ' + esc(T.planOver) + " · " + num(s.overdue) + " " + esc(T.notDone) + "</span>" : '<span class="tag st-good">✓ ' + esc(T.planOver) + "</span>";
    else if (s.overdue) st = '<span class="tag st-bad">⚠ ' + esc(T.behind) + " · " + num(s.overdue) + " " + esc(T.overdue) + "</span>";
    else if (s.ahead) st = '<span class="tag st-good">▲ ' + esc(T.ahead) + " · " + num(s.ahead) + "</span>";
    else st = '<span class="tag st-good">● ' + esc(T.onTrack) + "</span>";
    var h = (title ? "<h4>" + esc(title) + "</h4>" : "") + '<div class="row small" style="margin-bottom:6px"><span>' + num(s.done) + " / " + num(s.all) + " " + esc(T.tasks) + "</span><span class=sp></span>" + st + "</div>" + bar([{ c: "seg-a", v: s.done, l: T.tasks }], s.all, s.over ? null : s.due);
    var show = s.over ? null : (s.today || s.next);
    if (show) {
      h += "<h4>" + esc(s.today ? T.todayTasks : T.nextDay + " · " + fmtDate(show.date)) + '</h4><ul class="list tasks">';
      show.tasks.slice(0, 8).forEach(function (t) { h += '<li class="' + (t.done ? "done" : "") + '"><span class="g">' + esc(t.text) + "</span></li>"; });
      h += "</ul>";
    }
    return h;
  }

  function nextSteps(only) {
    var out = [], tot = D.totals || {};
    AREAS.forEach(function (a) {
      if (only && a !== only) return;
      var todo = a.sources.pending + a.sources.changed;
      if (todo && isActive(a)) out.push({ p: 2, ic: "📥", t: T.s.compileArea(todo, a.name), why: "", pr: T.s.compileAreaP(a.name) });
    });
    if (!only) {
      if (tot.notes_pending) out.push({ p: 3, ic: "📝", t: T.s.compileNotes(tot.notes_pending), pr: T.s.compileNotesP });
      if (tot.broken_links || tot.not_in_index) out.push({ p: 5, ic: "🩺", t: T.s.lint, why: num(tot.broken_links) + " " + T.broken.toLowerCase() + " · " + num(tot.not_in_index) + " " + T.notInIndex, pr: T.s.lintP });
      (D.plans || []).forEach(function (p) { var s = planState(p); if (!s.over && s.overdue) out.push({ p: 1, ic: "🗓️", t: T.s.replan(s.overdue), why: p.label, pr: T.s.replanP }); });
    }
    AREAS.forEach(function (a) {
      if (only && a !== only) return;
      var up = examsOf(a).filter(function (e) { return diff(e.date) >= 0; })[0];
      if (!up) return;
      var n = diff(up.date);
      if (n <= 45 && !topicsOf(a).length) out.push({ p: 1, ic: "🗺️", t: T.s.map(a.name), why: T.s.why.exam(n), pr: T.s.mapP(a.name) });
      if (n <= 30) topicsOf(a).filter(function (t) { var s = stateOf(t.state); return (s === "red" || s === "yellow") && /🔥|⚠/.test(t.band || "🔥"); }).slice(0, 2)
        .forEach(function (t) { out.push({ p: 0, ic: "🎯", t: T.s.quiz(t.name, a.name), why: T.s.why.exam(n) + " · " + T.state[stateOf(t.state)], pr: T.s.quizP(t.name, a.name) }); });
      var last = (a.attempts || []).map(function (x) { return x.date; }).sort().pop();
      if (n <= 21 && (!last || diff(last) < -7)) out.push({ p: 0, ic: "📝", t: T.s.mock(a.name), why: T.s.why.exam(n) + " · " + T.s.why.noAttempt, pr: T.s.mockP(a.name) });
    });
    return out.sort(function (x, y) { return x.p - y.p; }).slice(0, only ? 5 : 7);
  }
  function stepsCard(steps) {
    if (!steps.length) return "";
    return card(esc(T.nextSteps), steps.map(function (s) { return '<div class="step"><span class="ic">' + s.ic + '</span><div class="t">' + esc(s.t) + (s.why ? "<div>" + esc(s.why) + "</div>" : "") + "</div>" + copyBtn(s.pr) + "</div>"; }).join(""));
  }
  function missingList(only) {
    var out = (D.missing || []).filter(function (m) { return !only || !m.area || key(m.area) === key(only.name); }).slice();
    function kindOf(m) { if (m.kind) return m.kind; var w = key(m.what); return /(exam|exame)/.test(w) && /(date|data)/.test(w) ? "exam-date" : /(pass|m[ií]nima)/.test(w) ? "pass-grade" : ""; }
    function has(a, kind) { return out.some(function (m) { return m.area && key(m.area) === key(a.name) && kindOf(m) === kind; }); }
    AREAS.forEach(function (a) {
      if (only && a !== only) return;
      if (a.archived) return;
      var upcoming = examsOf(a).some(function (e) { return diff(e.date) >= 0; });
      if (!upcoming && isStudyKB() && (hasStudy(a) || a.sources.total) && !has(a, "exam-date"))
        out.push({ area: a.name, kind: "exam-date", what: (PT ? "Data do exame — " : "Exam date — ") + a.name, how: PT ? "Corre o study-plan ou diz a data ao Claude." : "Run study-plan or tell Claude the date.", prompt: PT ? "a data do exame de " + a.name + " é …" : "the exam date of " + a.name + " is …" });
      if (((a.attempts || []).length || upcoming) && a.course.pass_grade == null && !has(a, "pass-grade"))
        out.push({ area: a.name, kind: "pass-grade", what: T.noPass + " — " + a.name, how: PT ? "Nem sempre é 9,5: diz ao Claude qual é, ou onde está a regra (ficha da UC)." : "Tell Claude the pass mark, or where the rule is.", prompt: PT ? "a nota mínima de " + a.name + " é …" : "the pass mark of " + a.name + " is …" });
    });
    return out;
  }
  function missingCards(list) {
    return list.map(function (m) { return card(esc(m.what), "<p>" + esc(m.how || "") + "</p>" + (m.prompt ? copyBtn(m.prompt) : ""), "missing"); }).join("");
  }

  // ------------------------------------------------------------ charts
  function spark(at, scale, pass) {
    if (!at.length) return "";
    var W = 360, H = 120, L = 26, R = 14, Tp = 12, B = 18, n = at.length;
    var max = Math.max(scale, Math.max.apply(null, at.map(function (g) { return g.grade; })));
    var proj = null, slope = 0;
    if (n >= 2) {
      var xs = at.map(function (_, i) { return i; }), ys = at.map(function (g) { return g.grade; }), mx = (n - 1) / 2, my = ys.reduce(function (s, v) { return s + v; }, 0) / n, sxy = 0, sxx = 0;
      xs.forEach(function (x, i) { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) * (x - mx); });
      slope = sxx ? sxy / sxx : 0; proj = Math.max(0, Math.min(max, my + slope * (n - mx)));
    }
    var cols = n + (proj != null ? 1 : 0);
    function x(i) { return cols === 1 ? (L + W - R) / 2 : L + i * (W - L - R) / (cols - 1); }
    function y(v) { return Tp + (1 - v / max) * (H - Tp - B); }
    var s = '<svg class="spark" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(T.grades) + '">';
    [0, max / 2, max].forEach(function (v) { s += '<line class="ax" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text x="0" y="' + (y(v) + 4) + '">' + Math.round(v) + "</text>"; });
    if (pass != null) s += '<line class="pass" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(pass) + '" y2="' + y(pass) + '"><title>' + esc(T.passGrade + " " + grade(pass)) + "</title></line>";
    s += '<polyline class="ln" points="' + at.map(function (g, i) { return x(i) + "," + y(g.grade); }).join(" ") + '"/>';
    if (proj != null) s += '<line class="pr" x1="' + x(n - 1) + '" y1="' + y(at[n - 1].grade) + '" x2="' + x(n) + '" y2="' + y(proj) + '"/><circle class="pt" style="opacity:.5" r="4" cx="' + x(n) + '" cy="' + y(proj) + '" data-tip="' + esc(T.nextGuess + " " + grade(proj)) + '"/>';
    at.forEach(function (g, i) { s += '<circle class="pt" r="4" cx="' + x(i) + '" cy="' + y(g.grade) + '"' + (g.partial ? ' style="fill:var(--surface);stroke:var(--violet)"' : "") + ' data-tip="' + esc((g.paper || "") + " · " + fmtDate(g.date) + " · " + grade(g.grade) + (g.partial ? " (" + T.partial + ": " + g.raw + ")" : "") + (g.note ? " — " + g.note : "")) + '"/>'; });
    var lg = at[n - 1];
    s += '<text x="' + Math.min(x(n - 1) - 6, W - R - 30) + '" y="' + Math.max(y(lg.grade) - 9, 10) + '" style="font-weight:700;fill:var(--ink)">' + grade(lg.grade) + "</text></svg>";
    var info = "";
    if (n >= 2) info += esc(T.trend) + " " + (slope >= 0 ? "▲ +" : "▼ ") + grade(slope) + " " + esc(T.perAttempt) + " · " + esc(T.nextGuess) + " " + grade(proj);
    if (pass != null) info += (info ? " · " : "") + (lg.grade >= pass ? '<span class="tag st-good">' + esc(T.above) + "</span>" : '<span class="tag st-bad">' + esc(T.below) + "</span>") + " (" + esc(T.passGrade) + " " + grade(pass) + ")";
    return s + (info ? '<div class="small muted" style="margin-top:6px">' + info + "</div>" : "");
  }
  // The grid fills the width of its card: fitHeat() works out how many weeks fit and rebuilds the cells; the number passed here is only the first guess.
  function heatCells(weeks) {
    var h = D.heat || {}, end = parse(TODAY), start = new Date(end);
    start.setDate(end.getDate() - (weeks * 7 - 1));
    start.setDate(start.getDate() - (start.getDay() + 6) % 7);
    var max = 0; Object.keys(h).forEach(function (k) { max = Math.max(max, h[k]); });
    var cells = "", d = new Date(start);
    while (true) {
      var k = iso(d), v = h[k] || 0, lv = !v ? 0 : v <= max * .25 ? 1 : v <= max * .5 ? 2 : v <= max * .75 ? 3 : 4;
      cells += '<i class="' + (d > end ? "fut" : "l" + lv) + '" data-tip="' + esc(fmtDate(k) + " · " + v) + '"></i>';
      d.setDate(d.getDate() + 1);
      if (d > end && (d.getDay() + 6) % 7 === 0) break;
    }
    return cells;
  }
  function heatmap(weeks) {
    var h = D.heat || {}, streak = 0;
    var c = parse(TODAY); if (!h[iso(c)]) c.setDate(c.getDate() - 1);
    while (h[iso(c)]) { streak++; c.setDate(c.getDate() - 1); }
    return '<div class="heat" data-weeks="' + weeks + '">' + heatCells(weeks) + '</div><div class="legend"><span>🔥 ' + num(streak) + " " + esc(streak === 1 ? T.streak1 : T.streak) + '</span><span class="sp"></span><span class="scale">' + esc(T.less) + ' <i style="background:var(--heat-0)"></i><i style="background:rgba(124,92,255,.3)"></i><i style="background:rgba(124,92,255,.55)"></i><i style="background:rgba(124,92,255,.8)"></i><i style="background:var(--accent)"></i>' + esc(T.more) + "</span></div>";
  }
  function fitHeat() {
    Array.prototype.forEach.call(document.querySelectorAll(".heat"), function (el) {
      var w = el.clientWidth; if (!w) return;
      var weeks = Math.max(8, Math.min(104, Math.floor((w + 4) / 17)));
      if (String(weeks) === el.getAttribute("data-weeks")) return;
      el.setAttribute("data-weeks", weeks);
      el.style.setProperty("--wk", weeks);
      el.innerHTML = heatCells(weeks);
    });
  }
  function examCard(a, e) {
    var n = diff(e.date), past = n < 0, src = e.source ? (/^plan/.test(e.source) ? T.fromPlan : shortPath(e.source, 2)) : "";
    return '<a class="exam' + (past ? " past" : "") + '" href="#/uc/' + esc(a.slug) + '"><div class="d">' + (past ? "✓" : n === 0 ? esc(T.today) : num(n, 0) + "<small>" + esc(n === 1 ? T.day : T.days) + "</small>") + "</div>" +
      '<div class="w"><b>' + esc(a.name) + "</b>" + (e.label && key(e.label) !== key(a.name) ? " · " + esc(e.label) : "") + "<br>" + esc(fmtDate(e.date, true)) + (e.time ? " · " + esc(e.time) : "") + (past ? " · " + esc(T.taken) + " " + esc(rel(e.date)) : "") +
      (e.inferred ? ' <span class="tag st-warn">' + esc(T.inferred) + "</span>" : "") + "</div>" + (src ? '<div class="src">' + esc(T.source) + ": " + esc(src) + "</div>" : "") + "</a>";
  }

  // ------------------------------------------------------------ pages
  function kpis() {
    var tot = D.totals || {}, up = allExams().filter(function (x) { return diff(x.e.date) >= 0; }), h = '<div class="kpis">';
    if (up.length) { var x = up[0], n = diff(x.e.date); h += '<a class="kpi" href="#/uc/' + esc(x.a.slug) + '"><div class="l">' + esc(T.nextExam) + '</div><div class="v">' + (n === 0 ? esc(T.today) : num(n, 0) + "<small>" + esc(n === 1 ? T.day : T.days) + "</small>") + '</div><div class="s">' + esc(x.a.name) + " · " + esc(fmtDate(x.e.date)) + "</div></a>"; }
    else if (isStudyKB()) h += '<div class="kpi dim"><div class="l">' + esc(T.nextExam) + '</div><div class="v">' + esc(T.noExam) + '</div><div class="s">&nbsp;</div></div>';
    h += '<a class="kpi" href="#/sources"><div class="l">' + esc(T.compiledPct) + '</div><div class="v">' + pct(tot.compiled, tot.sources) + '<small>%</small></div><div class="s">' + num(tot.compiled) + " " + esc(T.of) + " " + num(tot.sources) + (tot.excluded ? " · " + num(tot.excluded) + " " + esc(T.outOfScope) : "") + "</div></a>";
    h += '<a class="kpi" href="#/sources"><div class="l">' + esc(T.toCompile) + '</div><div class="v">' + num((tot.pending || 0) + (tot.changed || 0)) + '</div><div class="s">' + num(tot.pending) + " " + esc(T.newF) + " · " + num(tot.changed) + " " + esc(T.changed) + "</div></a>";
    h += '<a class="kpi" href="#/wiki"><div class="l">' + esc(T.articles) + '</div><div class="v">' + num(tot.articles) + '</div><div class="s">' + (tot.last_compile ? esc(T.lastCompile) + " " + esc(rel(tot.last_compile)) : "&nbsp;") + "</div></a>";
    h += '<a class="kpi" href="#/wiki"><div class="l">' + esc(T.notes) + '</div><div class="v">' + num(tot.notes_pending) + '</div><div class="s">notes/</div></a>';
    return h + "</div>";
  }
  function pageOverview() {
    var h = kpis();
    var up = allExams().filter(function (x) { return diff(x.e.date) >= 0; });
    if (up.length) h += sec(T.upcoming) + '<div class="exams">' + up.map(function (x) { return examCard(x.a, x.e); }).join("") + "</div>";
    var left = stepsCard(nextSteps());
    var today = (D.plans || []).filter(function (p) { return !planState(p).over; }).map(function (p) { return card(esc(p.label), planBlock(p)); }).join("");
    h += '<div class="grid wide" style="margin-top:24px">' + (left || "") + today + card(esc(T.heat), heatmap(18)) + "</div>";
    var ms = missingList();
    if (ms.length) h += sec(T.missing) + '<div class="grid">' + missingCards(ms) + "</div>";
    if ((D.extra || []).length) h += sec(T.other) + '<div class="grid">' + extraCards() + "</div>";
    return h;
  }
  function pageCourse(a) {
    if (!a) return "<p>" + esc(T.nothing) + "</p>";
    var ex = examsOf(a), tps = topicsOf(a), pl = planFor(a), scale = a.course.grade_scale || 20;
    var h = '<div class="ph"><h1>' + esc(a.name) + "</h1>" + (a.archived ? '<span class="tag">' + esc(T.archive) + "</span>" : "") + ((a.aliases || []).length ? '<div class="sub">' + esc(a.aliases.join(" · ")) + "</div>" : "") + "</div>";
    if (ex.length) h += '<div class="exams">' + ex.map(function (e) { return examCard(a, e); }).join("") + "</div>";
    var cards = "";
    var st = stepsCard(nextSteps(a)); if (st && isActive(a)) cards += st;
    if (tps.length) {
      var t = tps.map(function (t) { var ar = (a.articles || []).filter(function (x) { return key(x.name) === key(t.article || t.name); })[0]; return '<div class="topic"><span class="nm">' + (ar ? artLink({ path: ar.path, name: t.name }) : esc(t.name)) + '</span><span class="small muted">' + esc(t.band || "") + (t.share ? " " + num(t.share) + "%" : "") + "</span>" + stTag(t.state, t.note) + "</div>"; });
      cards += card(esc(T.priorities), t.slice(0, 10).join("") + (t.length > 10 ? "<details><summary>+" + (t.length - 10) + "</summary>" + t.slice(10).join("") + "</details>" : ""));
    }
    var passInfo = a.course.pass_rules ? '<p class="small muted" style="margin:6px 0 0">' + esc(T.passGrade) + ": " + esc(a.course.pass_rules) + "</p>"
      : (a.course.pass_grade != null && !(a.attempts || []).length ? '<p class="small muted" style="margin:6px 0 0">' + esc(T.passGrade) + ": " + grade(a.course.pass_grade) + "</p>" : "");
    if ((a.attempts || []).length) cards += card(esc(T.grades) + ' <span class="muted small">' + num(a.attempts.length) + " " + esc(T.attempts) + (a.quizzes ? " · " + num(a.quizzes) + " " + esc(T.quizzes) : "") + "</span>", spark(a.attempts, scale, a.course.pass_grade) + passInfo);
    else if (passInfo) cards += card(esc(T.grades), passInfo);
    pl.forEach(function (p) { cards += card(esc(p.label), planBlock(p)); });
    if ((a.materials || []).length) cards += card(esc(T.material), '<ul class="list">' + a.materials.map(function (m) { return '<li><span class="kind k-output">' + esc(m.type) + '</span><span class="g"><a class="link" href="' + esc(href(m.path)) + '">' + esc(m.title) + "</a></span>" + '<span class="small muted">' + (m.version ? "v" + esc(m.version) + " · " : "") + esc(m.updated ? rel(m.updated) : "") + "</span></li>"; }).join("") + "</ul>");
    var s = a.sources;
    if (s.total) cards += card(esc(T.sources), '<div class="row small" style="margin-bottom:6px"><span>' + num(s.compiled) + " / " + num(s.total) + " " + esc(T.compiled.toLowerCase()) + "</span><span class=sp></span>" + (s.pending + s.changed ? "<b>" + num(s.pending + s.changed) + " " + esc(T.pending.toLowerCase()) + "</b>" : "") + "</div>" + bar([{ c: "seg-a", v: s.compiled, l: T.compiled }, { c: "seg-b", v: s.changed, l: T.changed }], s.total) + pendingList(a.pending, 8));
    if ((a.articles || []).length) cards += card(esc(T.wikiOf) + ' <span class="muted small">' + num(a.articles.length) + "</span>", '<ul class="list">' + a.articles.slice(0, 12).map(function (x) { return '<li><span class="g">' + artLink(x) + '</span><span class="small muted">' + esc(rel(x.mtime)) + "</span></li>"; }).join("") + "</ul>" + (a.articles.length > 12 ? '<p class="small muted">+' + (a.articles.length - 12) + "</p>" : ""));
    var ms = missingList(a);
    return h + '<div class="grid wide" style="margin-top:16px">' + cards + "</div>" + (ms.length ? sec(T.missing) + '<div class="grid">' + missingCards(ms) + "</div>" : "");
  }
  function pendingList(list, n) {
    if (!list || !list.length) return "";
    return '<ul class="list" style="margin-top:10px">' + list.slice(0, n).map(function (p) { return '<li><span class="g" title="' + esc(p.path) + '">' + esc(shortPath(p.path)) + '</span><span class="tag ' + (p.state === "changed" ? "st-warn" : "") + '">' + esc(p.state === "changed" ? T.changed : T.newF) + '</span><span class="small muted">' + esc(rel(p.mtime)) + "</span></li>"; }).join("") + "</ul>" + (list.length > n ? '<p class="small muted">+' + (list.length - n) + "</p>" : "");
  }
  function pageSources() {
    var tot = D.totals || {}, rows = AREAS.filter(function (a) { return a.sources.total; }).sort(function (p, q) { return (p.archived ? 1 : 0) - (q.archived ? 1 : 0); });
    var t = '<div class="scroll"><table><thead><tr><th>' + esc(T.area) + '</th><th class="n">' + esc(T.compiled) + '</th><th class="n">' + esc(T.pending) + "</th><th></th></tr></thead><tbody>" +
      rows.map(function (a) { var x = a.sources, todo = x.pending + x.changed; return '<tr><td><a class="link" href="#/uc/' + esc(a.slug) + '">' + esc(a.name) + "</a>" + (a.archived ? ' <span class="tag">' + esc(T.archive) + "</span>" : "") + '</td><td class="n">' + num(x.compiled) + " / " + num(x.total) + '</td><td class="n">' + (todo ? "<b>" + num(todo) + "</b>" : "—") + '</td><td class="bc">' + bar([{ c: "seg-a", v: x.compiled, l: T.compiled }, { c: "seg-b", v: x.changed, l: T.changed }], x.total) + "</td></tr>"; }).join("") +
      '</tbody></table></div><div class="legend"><span><i class="seg-a"></i>' + esc(T.compiled) + '</span><span><i class="seg-b"></i>' + esc(T.newer) + '</span><span><i style="background:var(--track)"></i>' + esc(T.pending) + "</span></div>" +
      (tot.excluded ? '<p class="small muted">' + num(tot.excluded) + " " + esc(T.outOfScope) + (D.raw && D.raw.why ? " — " + esc(D.raw.why) : "") + "</p>" : "");
    var side = "<h3>" + esc(T.pendingList) + "</h3>" + (pendingList(D.pending, 25) || '<p class="small muted">' + esc(T.allGood) + "</p>");
    if ((D.removed || []).length) side += "<h4>" + esc(T.removed) + '</h4><ul class="list">' + D.removed.map(function (p) { return '<li><span class="g">' + esc(shortPath(p)) + "</span></li>"; }).join("") + "</ul>";
    return '<div class="ph"><h1>' + esc(T.sources) + '</h1><span class="sp"></span>' + liveControl(true) + "</div>" + kpis() + '<div class="grid wide" style="margin-top:16px">' + card("", t) + card("", side) + "</div>";
  }
  function pageWiki() {
    var tot = D.totals || {}, rows = AREAS.filter(function (a) { return (a.articles || []).length; }).sort(function (p, q) { return (p.archived ? 1 : 0) - (q.archived ? 1 : 0) || q.articles.length - p.articles.length; });
    var mx = Math.max.apply(null, rows.map(function (a) { return a.articles.length; }).concat([1]));
    var t = '<div class="scroll"><table><thead><tr><th>' + esc(T.area) + '</th><th class="n">' + esc(T.articles) + "</th><th></th></tr></thead><tbody>" + rows.map(function (a) { return '<tr><td><a class="link" href="#/uc/' + esc(a.slug) + '">' + esc(a.name) + '</a></td><td class="n">' + num(a.articles.length) + '</td><td class="bc">' + bar([{ c: "seg-a", v: a.articles.length, l: T.articles }], mx) + "</td></tr>"; }).join("") + "</tbody></table></div>";
    var healthy = !tot.broken_links && !tot.not_in_index, hl = healthy ? '<div class="allok"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M14 27 l8 8 l16 -18"/></svg><b>' + esc(T.allGood) + "</b></div>" : "";
    if (tot.broken_links) hl += "<h4>" + esc(T.broken) + " · " + num(tot.broken_links) + '</h4><ul class="list">' + (D.broken || []).map(function (b) { return '<li><span class="g">[[' + esc(b.target) + ']]</span><span class="small muted">' + esc((b["in"] || []).join(", ")) + "</span></li>"; }).join("") + "</ul>";
    if (tot.not_in_index) hl += "<h4>" + esc(T.notInIndex) + " · " + num(tot.not_in_index) + '</h4><ul class="list">' + (D.not_in_index || []).map(function (n) { return '<li><span class="g">' + esc(n) + "</span></li>"; }).join("") + "</ul>";
    if ((D.notes || []).length) hl += "<h4>" + esc(T.inbox) + '</h4><ul class="list">' + D.notes.map(function (n) { return '<li><span class="g">' + esc(n.path) + '</span><span class="small muted">' + esc(rel(n.mtime)) + "</span></li>"; }).join("") + "</ul>";
    return '<div class="ph"><h1>' + esc(T.wiki) + '</h1><div class="sub">' + num(tot.articles) + " " + esc(T.articles.toLowerCase()) + (tot.last_compile ? " · " + esc(T.lastCompile) + " " + esc(rel(tot.last_compile)) : "") + "</div></div>" +
      '<div class="grid wide">' + card("", t) + card(esc(T.health), hl) + "</div>";
  }
  var VIEW_KEY = "kb-dashboard-view:" + (D.kb.folder || "");
  var outFilter = { folder: "", type: "", q: "" };
  try { var sv = JSON.parse(localStorage.getItem(VIEW_KEY) || "{}"); if (sv.out) outFilter = Object.assign(outFilter, sv.out); if (!location.hash && sv.route) history.replaceState(null, "", sv.route); } catch (e) {}
  function saveView() { try { localStorage.setItem(VIEW_KEY, JSON.stringify({ route: location.hash || "#/", out: outFilter })); } catch (e) {} }
  function classifyOutputs() {
    var files = (D.outputs && D.outputs.files) || [], regMap = {};
    ((D.outputs && D.outputs.registry) || []).forEach(function (r) { regMap[key(r.folder)] = r.what; });
    return { regMap: regMap, files: files.map(function (f) {
      var a = AREAS.filter(function (x) { return under(f.path, x.outputs); })[0], rest = f.path;
      if (a) (a.outputs || []).forEach(function (pre) { if (under(f.path, [pre])) rest = f.path.slice(pre.length).replace(/^\/+/, ""); });
      var parts = rest.split("/"), purpose = null, owner = a ? a.name : null;
      for (var i = 0; i < parts.length - 1; i++) if (regMap[key(parts[i])] != null) { purpose = parts[i]; if (!owner) owner = parts[i - 1] || T.other; break; }
      if (!purpose) purpose = parts.length > 1 ? parts[0] : "—";
      return { f: f, owner: owner || T.other, purpose: purpose, type: f.type || f.ext };
    }) };
  }
  function chipRow(attr, cur, counts, allLabel, total) {
    return '<div class="chips" style="margin-bottom:8px"><button class="btn sm' + (!cur ? " primary" : "") + '" ' + attr + '="">' + esc(allLabel) + " · " + total + "</button>" +
      Object.keys(counts).sort(function (p, q) { return counts[q] - counts[p] || (p < q ? -1 : 1); }).map(function (k) { return '<button class="btn sm' + (cur === k ? " primary" : "") + '" ' + attr + '="' + esc(k) + '">' + esc(k) + " · " + counts[k] + "</button>"; }).join("") + "</div>";
  }
  function pageOutputs() {
    var c = classifyOutputs(), all = c.files;
    var byFolder = {}; all.forEach(function (x) { byFolder[x.owner] = (byFolder[x.owner] || 0) + 1; });
    if (outFilter.folder && !byFolder[outFilter.folder]) outFilter.folder = "";
    var inFolder = all.filter(function (x) { return !outFilter.folder || x.owner === outFilter.folder; });
    var byType = {}; inFolder.forEach(function (x) { byType[x.type] = (byType[x.type] || 0) + 1; });
    if (outFilter.type && !byType[outFilter.type]) outFilter.type = "";
    var groups = {};
    inFolder.forEach(function (x) {
      if (outFilter.type && x.type !== outFilter.type) return;
      if (outFilter.q && key(x.f.path + " " + (x.f.title || "")).indexOf(key(outFilter.q)) < 0) return;
      var g = x.owner + "\u0000" + x.purpose;
      (groups[g] = groups[g] || []).push(x.f);
    });
    var body = Object.keys(groups).sort().map(function (g) {
      var p = g.split("\u0000"), list = groups[g].sort(function (x, y) { return x.mtime < y.mtime ? 1 : -1; });
      return card((outFilter.folder ? "" : esc(p[0]) + ' <span class="muted small">/</span> ') + esc(p[1]) + ' <span class="muted small">· ' + list.length + "</span>", (c.regMap[key(p[1])] ? '<p class="small muted" style="margin:0 0 8px">' + esc(c.regMap[key(p[1])]) + "</p>" : "") +
        '<ul class="list">' + list.slice(0, 15).map(function (f) { return '<li><span class="kind k-output">' + esc(f.type || f.ext) + '</span><span class="g"><a class="link" href="' + esc(href("outputs/" + f.path)) + '">' + esc(f.title || base(f.path)) + '</a></span><span class="small muted">' + (f.version ? "v" + esc(f.version) + " · " : "") + esc(rel(f.mtime)) + "</span></li>"; }).join("") + "</ul>" + (list.length > 15 ? "<details><summary>+" + (list.length - 15) + '</summary><ul class="list">' + list.slice(15).map(function (f) { return '<li><span class="kind k-output">' + esc(f.type || f.ext) + '</span><span class="g"><a class="link" href="' + esc(href("outputs/" + f.path)) + '">' + esc(f.title || base(f.path)) + '</a></span><span class="small muted">' + esc(rel(f.mtime)) + "</span></li>"; }).join("") + "</ul></details>" : ""));
    }).join("");
    return '<div class="ph"><h1>' + esc(T.outputs) + '</h1><span class="sp"></span><input class="search" style="max-width:260px" id="ofilter" placeholder="' + esc(T.filter) + '" value="' + esc(outFilter.q) + '"></div>' +
      '<div class="small muted" style="margin-bottom:4px">' + esc(T.folder) + "</div>" + chipRow("data-ofolder", outFilter.folder, byFolder, T.allFolders, all.length) +
      '<div class="small muted" style="margin-bottom:4px">' + esc(T.kindL) + "</div>" + chipRow("data-otype", outFilter.type, byType, T.allTypes, inFolder.length) +
      '<div class="grid wide" style="margin-top:14px">' + (body || card("", '<p class="muted small">' + esc(T.nothing) + "</p>")) + "</div>";
  }
  function pageActivity() {
    var ev = (D.events || []).map(function (e) { return { date: e.date, time: e.time, kind: "skill", label: e.skill, text: e.summary + (e.area ? " · " + e.area : "") }; });
    var byDay = {};
    ev.forEach(function (e) { (byDay[e.date] = byDay[e.date] || []).push(e); });
    var evHtml = Object.keys(byDay).sort().reverse().slice(0, 14).map(function (d) { return "<h4>" + esc(fmtDate(d)) + " · " + esc(rel(d)) + '</h4><ul class="list">' + byDay[d].map(function (e) { return '<li><span class="kind k-skill">' + esc(e.label) + '</span><span class="g">' + esc(e.text) + '</span><span class="small muted">' + esc(e.time || "") + "</span></li>"; }).join("") + "</ul>"; }).join("");
    var fd = {}; (D.recent || []).forEach(function (e) { (fd[e.date] = fd[e.date] || []).push(e); });
    var fHtml = Object.keys(fd).sort().reverse().slice(0, 10).map(function (d) { var it = fd[d]; return "<h4>" + esc(fmtDate(d)) + " · " + esc(rel(d)) + '</h4><ul class="list">' + it.slice(0, 6).map(function (e) { return '<li><span class="kind k-' + esc(e.kind) + '">' + esc(T.k[e.kind] || e.kind) + '</span><span class="g" title="' + esc(e.path) + '">' + esc(shortPath(e.path)) + "</span></li>"; }).join("") + (it.length > 6 ? '<li class="small muted">+' + (it.length - 6) + "</li>" : "") + "</ul>"; }).join("");
    return '<div class="ph"><h1>' + esc(T.activity) + "</h1></div>" + card(esc(T.heat), heatmap(26)) + '<div class="grid wide" style="margin-top:12px">' + card(esc(T.events), evHtml || '<p class="small muted">' + esc(T.nothing) + "</p>") + card(esc(T.files), fHtml || '<p class="small muted">' + esc(T.nothing) + "</p>") + "</div>";
  }
  function extraCards() {
    return (D.extra || []).map(function (p) {
      var b = "";
      if (p.kind === "stat") b = '<div style="font-size:30px;font-weight:700">' + esc(p.value) + "</div>" + (p.sub ? '<div class="small muted">' + esc(p.sub) + "</div>" : "");
      else if (p.kind === "progress") b = '<div class="small" style="margin-bottom:6px">' + num(p.value) + " / " + num(p.total) + " (" + pct(p.value, p.total) + "%)</div>" + bar([{ c: "seg-a", v: p.value, l: p.title }], p.total);
      else if (p.kind === "table" && p.columns) b = '<div class="scroll"><table><thead><tr>' + p.columns.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" + (p.rows || []).map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
      else b = '<ul class="list">' + (p.items || []).map(function (i) { return '<li><span class="g">' + esc(i) + "</span></li>"; }).join("") + "</ul>";
      return card(esc(p.title || ""), b + (p.note ? '<p class="small muted" style="margin:8px 0 0">' + esc(p.note) + "</p>" : ""));
    }).join("");
  }

  // ------------------------------------------------------------ shell
  var LOGO = '<svg viewBox="0 0 112 112" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7C5CFF"/><stop offset="1" stop-color="#22D3EE"/></linearGradient></defs><path d="M56 4 L102 30 V82 L56 108 L10 82 V30 Z" fill="none" stroke="url(#lg)" stroke-width="7" stroke-linejoin="round"/><path d="M62 22 L36 62 H54 L48 92 L76 50 H58 Z" fill="url(#lg)"/></svg>';
  function sidebar(route) {
    function a(h, label, cnt) { return '<a href="' + esc(h) + '" class="' + (route === h ? "on" : "") + '">' + label + (cnt != null && cnt !== "" ? '<span class="cnt">' + cnt + "</span>" : "") + "</a>"; }
    var act = AREAS.filter(isActive), arch = AREAS.filter(function (x) { return !isActive(x); });
    function ucLink(x) { var up = examsOf(x).filter(function (e) { return diff(e.date) >= 0; })[0]; return a("#/uc/" + x.slug, esc(x.name), up ? num(diff(up.date), 0) + "d" : ""); }
    var tot = D.totals || {}, gen = String(D.generated || ""), age = gen ? -diff(gen.slice(0, 10)) : 0;
    return '<aside class="side"><div class="brand">' + LOGO + '<div><div class="k">Syntraq</div><div class="n">' + esc(D.kb.name || D.kb.folder) + "</div></div></div>" +
      '<div><input class="search" id="q" placeholder="' + esc(T.search) + '" autocomplete="off"><div class="results" id="qr"></div></div>' +
      "<nav>" + a("#/", "◇ " + esc(T.overview)) +
      (act.length ? '<div class="grp">' + esc(isStudyKB() ? T.courses : T.areas) + "</div>" + act.map(ucLink).join("") : "") +
      (arch.length ? '<details' + (arch.some(function (x) { return route === "#/uc/" + x.slug; }) ? " open" : "") + '><summary><div class="grp">▸ ' + esc(T.archive) + " · " + arch.length + "</div></summary>" + arch.map(ucLink).join("") + "</details>" : "") +
      (arch.length ? '<div class="arch-compact">' + arch.map(ucLink).join("") + "</div>" : "") +
      '<div class="grp">KB</div>' + a("#/sources", "⬇ " + esc(T.sources), num((tot.pending || 0) + (tot.changed || 0)) || "") + a("#/wiki", "❖ " + esc(T.wiki), num(tot.articles)) + a("#/outputs", "▤ " + esc(T.outputs), num(tot.outputs)) + a("#/activity", "∿ " + esc(T.activity)) + "</nav>" +
      '<div class="foot">' + liveControl(false) + '<div class="row"><button class="btn sm" id="theme"></button><span class="sp"></span><span title="' + esc(gen) + '">' + esc(T.generated) + " " + esc(rel(gen.slice(0, 10))) + " " + esc(gen.slice(11, 16)) + "</span></div>" +
      (age >= 7 ? '<span class="stale">' + esc(T.stale) + "</span>" : "") + '<span>' + esc(T.footer) + "</span></div></aside>";
  }
  function render() {
    TODAY = iso(new Date());
    var route = location.hash || "#/", page;
    if (/^#\/uc\//.test(route)) page = pageCourse(areaBySlug(decodeURIComponent(route.slice(5))));
    else if (route === "#/sources") page = pageSources();
    else if (route === "#/wiki") page = pageWiki();
    else if (route === "#/outputs") page = pageOutputs();
    else if (route === "#/activity") page = pageActivity();
    else { route = "#/"; page = '<div class="ph"><h1>' + esc(D.kb.title || D.kb.topic || D.kb.name) + "</h1>" + (D.kb.subtitle ? '<div class="sub">' + esc(D.kb.subtitle) + "</div>" : "") + "</div>" + pageOverview(); }
    app.innerHTML = '<div class="layout">' + sidebar(route) + '<main class="main">' + page + "</main></div>";
    saveView();
    var a = AREAS.filter(function (x) { return route === "#/uc/" + x.slug; })[0];
    document.title = (a ? a.name + " — " : "") + (D.kb.name || D.kb.folder) + " · Dashboard";
    paintTheme();
    fitHeat();
    var of = document.getElementById("ofilter");
    if (of) { of.addEventListener("input", function () { outFilter.q = of.value; var pos = of.selectionStart; render(); var n = document.getElementById("ofilter"); n.focus(); n.setSelectionRange(pos, pos); }); }
  }

  // ------------------------------------------------------------ search
  function search(q) {
    var r = document.getElementById("qr"); if (!r) return;
    q = key(q); if (q.length < 2) { r.innerHTML = ""; return; }
    var out = [];
    AREAS.forEach(function (a) { if (names(a).some(function (n) { return n.indexOf(q) >= 0; })) out.push('<a href="#/uc/' + esc(a.slug) + '">◆ ' + esc(a.name) + "</a>"); });
    (D.articles || []).forEach(function (a) { if (out.length < 30 && key(a.name).indexOf(q) >= 0) { var o = obsidian(a.path); out.push('<a href="' + esc(o || "#/wiki") + '">❖ ' + esc(a.name) + "</a>"); } });
    ((D.outputs && D.outputs.files) || []).forEach(function (f) { if (out.length < 40 && key((f.title || "") + " " + f.path).indexOf(q) >= 0) out.push('<a href="' + esc(href("outputs/" + f.path)) + '">▤ ' + esc(f.title || base(f.path)) + "</a>"); });
    r.innerHTML = out.join("") || '<span class="small muted" style="padding:5px 8px">' + esc(T.nothing) + "</span>";
  }

  // ------------------------------------------------------------ theme
  var THEME_KEY = "kb-dashboard-theme:" + (D.kb.folder || "");
  var theme = D.theme === "light" ? "light" : "dark";
  try { var lt = localStorage.getItem(THEME_KEY); if (lt === "light" || lt === "dark") theme = lt; } catch (e) {}
  function paintTheme() {
    root.setAttribute("data-theme", theme);
    var b = document.getElementById("theme"); if (b) b.textContent = theme === "dark" ? "☀ " + T.light : "☾ " + T.dark;
  }
  async function saveThemeToFile() {
    var h = live.root; if (!h) return;
    try {
      if ((await h.queryPermission({ mode: "readwrite" })) !== "granted" && (await h.requestPermission({ mode: "readwrite" })) !== "granted") return;
      var dir = await (await h.getDirectoryHandle(".dashboard")).getDirectoryHandle("data");
      var fh = await dir.getFileHandle("settings.json"), cur = JSON.parse(await (await fh.getFile()).text() || "{}");
      cur.theme = theme;
      var w = await fh.createWritable(); await w.write(JSON.stringify(cur, null, 2) + "\n"); await w.close();
    } catch (e) { /* the browser keeps it anyway */ }
  }

  // ------------------------------------------------------------ live raw/ count (File System Access API)
  var live = { root: null, raw: null, state: "off", at: "" };
  var CAN = typeof window.showDirectoryPicker === "function" && typeof indexedDB !== "undefined";
  function idb() { return new Promise(function (ok, ko) { var r = indexedDB.open("kb-dashboard", 1); r.onupgradeneeded = function () { r.result.createObjectStore("h"); }; r.onsuccess = function () { ok(r.result); }; r.onerror = function () { ko(r.error); }; }); }
  async function idbGet(k) { var db = await idb(); return new Promise(function (ok) { var r = db.transaction("h").objectStore("h").get(k); r.onsuccess = function () { ok(r.result || null); }; r.onerror = function () { ok(null); }; }); }
  async function idbPut(k, v) { var db = await idb(); return new Promise(function (ok) { var t = db.transaction("h", "readwrite"); t.objectStore("h").put(v, k); t.oncomplete = ok; t.onerror = ok; }); }
  var HK = (D.kb.folder || "kb") + ":";
  function liveControl(big) {
    if (!CAN) return "";
    var dot = '<span class="dot' + (live.state === "on" ? " on" : "") + '"></span>';
    var lbl = live.state === "on" ? esc(T.liveOn) + " · " + esc(live.at) : esc(T.liveOff);
    var btn = "";
    if (live.state === "off") btn = '<button class="btn sm" data-live="root">' + esc(T.connect) + "</button>";
    else if (live.state === "needraw") btn = '<button class="btn sm" data-live="raw" title="' + esc(D.raw.target || "") + '">' + esc(T.connectRaw) + "</button>";
    else if (live.state === "prompt") btn = '<button class="btn sm" data-live="grant">' + esc(T.refresh) + "</button>";
    else if (live.state === "on" && big) btn = '<button class="btn sm" data-live="grant">↻ ' + esc(T.refresh) + "</button>";
    return '<div class="live small">' + dot + "<span>" + lbl + "</span>" + btn + (live.state === "needraw" && big ? '<div class="small muted" style="width:100%">' + esc(T.rawHint) + esc(D.raw.target) + "</div>" : "") + "</div>";
  }
  async function rawHandle() {
    if (live.raw) return live.raw;
    if (!live.root) return null;
    try { var r = await live.root.getDirectoryHandle("raw"); var it = r.entries(); await it.next(); return r; } catch (e) { return null; }
  }
  async function liveInit() {
    if (!CAN) return;
    try { live.root = await idbGet(HK + "root"); live.raw = await idbGet(HK + "raw"); } catch (e) { return; }
    if (!live.root && !live.raw) return;
    var h = live.raw || live.root, p = await h.queryPermission({ mode: "read" });
    if (p !== "granted") { live.state = "prompt"; render(); return; }
    if (live.root) await readSettingsTheme();
    await count();
  }
  async function readSettingsTheme() {
    try {
      if ((await live.root.queryPermission({ mode: "read" })) !== "granted") return;
      var f = await (await (await (await live.root.getDirectoryHandle(".dashboard")).getDirectoryHandle("data")).getFileHandle("settings.json")).getFile();
      var t = JSON.parse(await f.text()).theme; if ((t === "light" || t === "dark") && t !== theme) { theme = t; paintTheme(); }
    } catch (e) {}
  }
  async function liveAction(kind) {
    try {
      if (kind === "root") {
        var h = await window.showDirectoryPicker({ id: "kb-root", mode: "readwrite" });
        if (key(h.name) !== key(D.kb.folder)) { toast(T.wrongFolder + D.kb.folder); return; }
        live.root = h; await idbPut(HK + "root", h);
      } else if (kind === "raw") {
        var r = await window.showDirectoryPicker({ id: "kb-raw", mode: "read" });
        live.raw = r; await idbPut(HK + "raw", r);
      } else {
        var hh = live.raw || live.root;
        if ((await hh.requestPermission({ mode: "read" })) !== "granted") return;
      }
      await count();
    } catch (e) { if (e && e.name !== "AbortError") toast(e.message || String(e)); }
  }
  async function count() {
    var r = await rawHandle();
    if (!r) { live.state = live.root ? "needraw" : "off"; render(); return; }
    live.state = "on";
    var comp = D.compiled || {}, ex = (D.raw && D.raw.exclude) || [], files = [], skipped = 0;
    var compiledPrefixes = Object.keys(comp);
    function cdate(k) { var v = comp[k]; return Array.isArray(v) ? v[0] : v; }
    // "last compiled" is YYYY-MM-DDTHH:MM (compared to the minute) or, in old rows, a bare date (compared by day)
    function upToDate(mt, c) { return !!c && (c.length > 10 ? mt <= c : mt.slice(0, 10) <= c); }
    function isoMin(d) { var h = d.getHours(), m = d.getMinutes(); return iso(d) + "T" + (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m; }
    function cpath(k) { var v = comp[k]; return Array.isArray(v) ? v[1] : k; }
    async function countOnly(dir) {
      // an excluded folder: its files count as out of scope, without reading their dates
      var subs = [];
      for await (var entry of dir.entries()) {
        var nm = entry[0];
        if (nm.charAt(0) === "." || nm.indexOf("~$") === 0 || /^(desktop\.ini|thumbs\.db)$/i.test(nm)) continue;
        if (entry[1].kind === "directory") subs.push(countOnly(entry[1])); else skipped++;
      }
      await Promise.all(subs);
    }
    async function walk(dir, prefix) {
      var subs = [], gets = [];
      for await (var entry of dir.entries()) {
        var name = entry[0], h = entry[1];
        if (name.charAt(0) === "." || name.indexOf("~$") === 0 || /^(desktop\.ini|thumbs\.db)$/i.test(name)) continue;
        var p = prefix ? prefix + "/" + name : name;
        if (h.kind === "directory") {
          var k = key(p);
          if (matches(p + "/x", ex) && !compiledPrefixes.some(function (c) { return c.indexOf(k + "/") === 0; })) { subs.push(countOnly(h)); continue; }
          subs.push(walk(h, p));
        } else {
          if (!prefix && /^readme\.md$/i.test(name)) continue;
          gets.push(h.getFile().then(function (pp) { return function (f) { var d = new Date(f.lastModified); files.push({ path: pp.normalize("NFC"), mtime: iso(d), mt: isoMin(d) }); }; }(p)));
        }
      }
      await Promise.all(gets.concat(subs));
    }
    try { await walk(r, ""); } catch (e) { live.state = "prompt"; render(); return; }
    var seen = {}, srcs = [];
    files.forEach(function (f) {
      var k = key(f.path); seen[k] = 1;
      var has = Object.prototype.hasOwnProperty.call(comp, k);
      if (!has && matches(f.path, ex)) return;
      f.state = has && upToDate(f.mt, cdate(k)) ? "compiled" : has ? "changed" : "pending";
      srcs.push(f);
    });
    function tally(list) { var o = { total: list.length, compiled: 0, pending: 0, changed: 0 }; list.forEach(function (s) { o[s.state]++; }); return o; }
    var t = tally(srcs), tot = D.totals;
    tot.raw_files = files.length; tot.sources = t.total; tot.compiled = t.compiled; tot.pending = t.pending; tot.changed = t.changed; tot.excluded = files.length - t.total + skipped; tot.raw_files += skipped;
    var removed = Object.keys(comp).filter(function (k) { return !seen[k]; });
    tot.removed = removed.length;
    D.removed = removed.slice(0, 20).map(cpath);
    var pend = srcs.filter(function (s) { return s.state !== "compiled"; }).sort(function (x, y) { return x.mtime < y.mtime ? 1 : -1; });
    D.pending = pend.slice(0, 40);
    AREAS.forEach(function (a) { var l = srcs.filter(function (s) { return (a.raw || []).length && under(s.path, a.raw); }); a.sources = tally(l); a.pending = l.filter(function (s) { return s.state !== "compiled"; }).sort(function (x, y) { return x.mtime < y.mtime ? 1 : -1; }).slice(0, 40); });
    var n = new Date(); live.at = n.toTimeString().slice(0, 5);
    render();
  }

  // ------------------------------------------------------------ events
  function toast(msg) { var t = document.getElementById("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("on"); }, 2200); }
  function copy(text) {
    function fallback() { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(fallback); else fallback();
    toast(T.copied);
  }
  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-copy]"); if (c) { copy(c.getAttribute("data-copy")); return; }
    var l = e.target.closest("[data-live]"); if (l) { liveAction(l.getAttribute("data-live")); return; }
    var o = e.target.closest("[data-otype]"); if (o) { outFilter.type = o.getAttribute("data-otype"); render(); return; }
    var of = e.target.closest("[data-ofolder]"); if (of) { outFilter.folder = of.getAttribute("data-ofolder"); outFilter.type = ""; render(); return; }
    if (e.target.id === "theme") { theme = theme === "dark" ? "light" : "dark"; try { localStorage.setItem(THEME_KEY, theme); } catch (x) {} paintTheme(); saveThemeToFile(); }
  });
  document.addEventListener("input", function (e) { if (e.target.id === "q") search(e.target.value); });
  var tip = document.getElementById("tip");
  document.addEventListener("mousemove", function (e) {
    var t = e.target.closest && e.target.closest("[data-tip]");
    if (!t) { tip.style.opacity = 0; return; }
    tip.textContent = t.getAttribute("data-tip");
    tip.style.left = Math.min(e.clientX + 12, window.innerWidth - tip.offsetWidth - 8) + "px";
    tip.style.top = (e.clientY + 14) + "px"; tip.style.opacity = 1;
  });
  window.addEventListener("resize", function () { clearTimeout(fitHeat._t); fitHeat._t = setTimeout(fitHeat, 80); });
  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });
  window.addEventListener("focus", function () { if (live.state === "on") count(); else render(); });

  render();
  liveInit();
})();
