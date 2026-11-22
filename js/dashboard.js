// Renders the dashboard (index.html) from window.GAMES (js/data.js) and window.BOARDS (js/boards.js).
// Runs before the kit's modules (assets/), so the hero's words are in place when motion.js animates them.

const games = [...window.GAMES].sort((a, b) => b.date.localeCompare(a.date));
const latest = games[0];
const NS = "http://www.w3.org/2000/svg";

const $ = (id) => document.getElementById(id);
const el = (tag, text, className) => {
  const e = document.createElement(tag);
  if (text != null) e.textContent = text;
  if (className) e.className = className;
  return e;
};
const svgEl = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
};
const formatDate = (iso, opts = { day: "numeric", month: "long", year: "numeric" }) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-GB", opts);
const verdictLabel = { worked: "Worked", mixed: "Mixed", failed: "Didn't work" };
const resultLabel = { W: "Win", D: "Draw", L: "Loss" };
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const say = (n) => words[n] || String(n);

// ---------- Hero: the score and the winning goal on the board ----------

function renderHero(g) {
  const opp = g.opponentShort ? g.opponentShort.charAt(0) + g.opponentShort.slice(1).toLowerCase() : g.opponent;
  const away = g.venue === "Away";
  const score = away
    ? `${opp} ${g.score.opponent}–${g.score.madrid} Madrid`
    : `Madrid ${g.score.madrid}–${g.score.opponent} ${opp}`;
  const ground = g.stadium ? g.stadium.replace(/^Spotify /, "") : "";
  $("hero-h").textContent = ground ? `${score} at ${ground}` : score;
  const comp = g.competition.replace(" · ", ", ").replace("Matchday", "matchday");
  $("hero-lead").textContent = `${g.headline} ${comp}, ${formatDate(g.date)}.`;

  const q = `?id=${encodeURIComponent(g.id)}`;
  ["board-link", "nav-board", "close-board"].forEach((id) => ($(id).href = `tactics.html${q}`));
  $("graphic-link").href = `match.html${q}`;
  $("nav-graphic").href = `match.html${q}`;
}

// Draws the last goal with a board: every step's arrows at once, players where they ended up.
function renderBoard(g) {
  const svg = $("hero-board");
  const boards = (window.BOARDS && window.BOARDS[g.id]) || [];
  const madridGoals = g.goals.filter((x) => x.team === "madrid" && x.board);
  const goal = madridGoals[madridGoals.length - 1];
  const b = goal && boards.find((x) => x.id === goal.board);
  if (!b) { svg.closest(".hero__stage").hidden = true; return; }

  // Where every player ended up
  const end = {};
  b.steps.forEach((s) => Object.assign(end, s.pos || {}));
  // The whole pitch, so you can see where on it the move happened
  svg.setAttribute("viewBox", "-20 -12 1090 704");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("aria-label", `${b.title}: ${b.summary}`);

  const defs = svgEl("defs", {}, svg);
  [["pass", "var(--accent)"], ["shot", "var(--accent)"], ["carry", "var(--ink)"], ["run", "var(--muted)"]].forEach(([t, c]) => {
    const m = svgEl("marker", { id: `hb-${t}`, viewBox: "0 0 10 10", refX: 7, refY: 5, markerWidth: 4.5, markerHeight: 4.5, orient: "auto-start-reverse" }, defs);
    svgEl("path", { d: "M0,0 L10,5 L0,10 z", style: `fill:${c}` }, m);
  });

  // Pitch lines, drawn like chalk on the page
  const W = 1050, H = 680;
  const lines = svgEl("g", { class: "pitch" }, svg);
  svgEl("rect", { x: 0, y: 0, width: W, height: H }, lines);
  svgEl("line", { x1: W / 2, y1: 0, x2: W / 2, y2: H }, lines);
  svgEl("circle", { cx: W / 2, cy: H / 2, r: 91.5 }, lines);
  [[0, 1], [W, -1]].forEach(([e, d]) => {
    svgEl("rect", { x: d === 1 ? 0 : W - 165, y: 138.5, width: 165, height: 403 }, lines);
    svgEl("rect", { x: d === 1 ? 0 : W - 55, y: 248.5, width: 55, height: 183 }, lines);
    const ax = e + d * 165;
    svgEl("path", { d: `M ${ax} ${H / 2 - 73} A 91.5 91.5 0 0 ${d === 1 ? 1 : 0} ${ax} ${H / 2 + 73}` }, lines);
    svgEl("rect", { x: d === 1 ? -14 : W, y: 304, width: 14, height: 72, class: "pitch__goal" }, lines);
  });

  // The move: arrows in the order they happened (the hero entrance draws them one after another)
  const moves = svgEl("g", { class: "moves" }, svg);
  let n = 0;
  b.steps.forEach((s) => (s.arrows || []).forEach((a) => {
    const len = Math.hypot(a.to[0] - a.from[0], a.to[1] - a.from[1]);
    const line = svgEl("line", { x1: a.from[0], y1: a.from[1], x2: a.to[0], y2: a.to[1], class: `move move--${a.type}`, "marker-end": `url(#hb-${a.type})` }, moves);
    line.style.setProperty("--len", len.toFixed(0));
    line.style.setProperty("--i", n++);
  }));

  // Players where the move ended
  const people = svgEl("g", { class: "people" }, svg);
  for (const [id, p] of Object.entries(b.players)) {
    const at = end[id];
    if (!at) continue;
    const gEl = svgEl("g", { class: `pl pl--${p.team === "rm" ? "rm" : "opp"}${p.gk ? " pl--gk" : ""}`, transform: `translate(${at[0]} ${at[1]})` }, people);
    svgEl("circle", { r: 13 }, gEl);
    if (p.num != null) svgEl("text", { y: 4.5, "text-anchor": "middle", class: "pl__num" }, gEl).textContent = p.num;
    if (p.name && p.team === "rm") svgEl("text", { y: p.up ? -22 : 34, "text-anchor": "middle", class: "pl__name" }, gEl).textContent = p.name;
  }
  const lastShot = b.steps.flatMap((s) => s.arrows || []).filter((a) => a.type === "shot").pop();
  if (lastShot) {
    const ball = svgEl("circle", { cx: lastShot.to[0] - 6, cy: lastShot.to[1], r: 7, class: "ball" }, svg);
    ball.style.setProperty("--i", n);
  }
  svg.style.setProperty("--moves", n);

  // A small key under the board (passes, carries, runs) and the minute
  const key = el("p", null, "board-still__key t-label");
  key.append(
    el("span", `${b.minute}', ${b.title.replace(/^[^·]*·\s*/, "")}`, "board-still__title"),
    el("span", "Pass or shot", "k k--pass"),
    el("span", "Carry", "k k--carry"),
    el("span", "Run", "k k--run")
  );
  svg.closest(".hero__stage").after(key);
}

// ---------- Numbers ----------

function renderNumbers(g) {
  const s = g.stats;
  const opp = g.opponent;
  $("numbers-h").innerHTML = "";
  $("numbers-h").append(
    `${s.possession.madrid}% of the ball, ${plural(s.shots.madrid, "shot")}, ${plural(g.score.madrid, "goal")}. `,
    el("span", `${opp} had ${s.possession.opponent}% and ${s.shots.opponent} shots.`, "muted")
  );
  $("opp-name").textContent = opp;

  const rows = [
    ["Possession", s.possession, "%"],
    ["Shots", s.shots, ""],
    ["On target", s.onTarget, ""],
    ["Corners", s.corners, ""],
    ["Fouls", s.fouls, ""]
  ];
  rows.forEach(([name, v, unit]) => {
    const total = v.madrid + v.opponent || 1;
    const li = el("li", null, "compare__row");
    li.style.setProperty("--rm", (v.madrid / total).toFixed(3));
    const top = el("div", null, "compare__top");
    top.append(el("span", `${v.madrid}${unit}`, "compare__rm"), el("span", name, "compare__name muted"), el("span", `${v.opponent}${unit}`, "compare__opp"));
    const bar = el("div", null, "compare__bar");
    bar.setAttribute("aria-hidden", "true");
    bar.append(el("span", null, "compare__fill"));
    li.append(top, bar);
    li.setAttribute("aria-label", `${name}: Madrid ${v.madrid}${unit}, ${opp} ${v.opponent}${unit}`);
    $("compare").append(li);
  });

  const m = g.motm;
  if (!m) { $("motm").hidden = true; return; }
  $("motm-name").textContent = m.fullName || m.name;
  $("motm-line").textContent = m.line;
  m.stats.forEach((st) => {
    const d = el("div");
    d.append(el("dt", st.label, "t-label muted"), el("dd", String(st.value), "t-stat"));
    $("motm-stats").append(d);
  });
}

// ---------- Goals ----------

function renderGoals(g) {
  const goals = [...g.goals].sort((a, b) => a.minute - b.minute);
  $("goals-h").append(
    `How the ${say(goals.length)} goals came. `,
    el("span", "Open a Madrid goal to watch it on the board.", "muted")
  );

  const tl = $("timeline");
  goals.forEach((x) => {
    const m = el("span", `${x.minute}'`, `timeline__goal timeline__goal--${x.team}`);
    m.style.left = `${(Math.min(x.minute, 90) / 90) * 100}%`;
    tl.append(m);
  });

  goals.forEach((x) => {
    const li = el("li", null, `goal-row goal-row--${x.team}`);
    const inner = el(x.board ? "a" : "div", null, "goal-row__in");
    if (x.board) inner.href = `tactics.html?id=${encodeURIComponent(g.id)}&goal=${encodeURIComponent(x.board)}`;
    const who = el("span", null, "goal-row__who");
    who.append(el("span", x.scorer, "goal-row__scorer"), el("span", x.team === "madrid" ? "Real Madrid" : g.opponent, "goal-row__team muted"));
    inner.append(el("span", `${x.minute}'`, "goal-row__min"), who, el("span", x.how, "goal-row__how"));
    if (x.board) inner.append(el("span", "Watch it", "goal-row__go link"));
    li.append(inner);
    $("goal-rows").append(li);
  });
}

// ---------- Keys ----------

function renderKeys(g) {
  const c = { worked: 0, mixed: 0, failed: 0 };
  g.keys.forEach((k) => c[k.verdict]++);
  const parts = [];
  if (c.worked) parts.push(`${say(c.worked)} worked`);
  if (c.mixed) parts.push(`${say(c.mixed)} half worked`);
  if (c.failed) parts.push(`${say(c.failed)} didn't`);
  const tail = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0];
  $("keys-h").append(`What the plan was. `, el("span", `Of ${say(g.keys.length)} tactical keys, ${tail}.`, "muted"));

  g.keys.forEach((k) => {
    const card = el("article", null, `card key key--${k.verdict} span-3`);
    card.append(el("p", verdictLabel[k.verdict], "key__verdict t-label"), el("h3", k.title), el("p", k.detail));
    $("keys-grid").append(card);
  });
}

// ---------- Season ----------

function renderSeason(list) {
  const rec = [
    ["Big games", list.length],
    ["Won", list.filter((g) => g.result === "W").length],
    ["Drawn", list.filter((g) => g.result === "D").length],
    ["Lost", list.filter((g) => g.result === "L").length]
  ];
  rec.forEach(([label, v]) => {
    const d = el("div");
    d.append(el("dt", label, "t-label muted"), el("dd", String(v), "t-stat"));
    $("record").append(d);
  });

  list.forEach((g) => {
    const tr = el("tr");
    const link = el("a", g.opponent, "link");
    link.href = `match.html?id=${encodeURIComponent(g.id)}`;
    const opp = el("td");
    opp.append(link);
    tr.append(
      el("td", formatDate(g.date, { day: "numeric", month: "short", year: "numeric" })),
      opp,
      el("td", g.competition.replace(" · ", ", "), "hide-narrow"),
      el("td", `${g.score.madrid}–${g.score.opponent}`, "num"),
      el("td", resultLabel[g.result], `result result--${g.result}`),
      el("td", `${g.stats.possession.madrid}%`, "num hide-narrow")
    );
    $("games").append(tr);
  });

  // The latest game's stadium picture beside the table (js/stadiums.js)
  const pic = latest.stadiumImg && window.STADIUMS && window.STADIUMS[latest.stadiumImg];
  if (pic) {
    const box = $("season-photo");
    const img = new Image();
    img.src = pic;
    img.alt = `${latest.stadium} from above`;
    img.loading = "lazy";
    box.append(img);
    box.hidden = false;
  }
}

// ---------- Go ----------

if (latest) {
  renderHero(latest);
  renderBoard(latest);
  renderNumbers(latest);
  renderGoals(latest);
  renderKeys(latest);
  renderSeason(games);
  $("sources").textContent = `Stats and analysis: ${latest.sources.join(", ")}.`;
} else {
  $("hero-h").textContent = "No games yet";
  $("hero-lead").textContent = "Add the first big game to js/data.js.";
}
