// Animated tactics board. Reads window.GAMES (data.js) and window.BOARDS (boards.js).
// URL options: tactics.html?id=<game id>&goal=<board id>

const NS = "http://www.w3.org/2000/svg";
const W = 1050, H = 680;
const MOVE_MS = 1600;      // how long one step's movement takes
const PAUSE_MS = 1300;     // pause between steps when playing
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const params = new URLSearchParams(location.search);
const games = [...window.GAMES].sort((a, b) => b.date.localeCompare(a.date));
const game = games.find((g) => g.id === params.get("id")) || games.find((g) => window.BOARDS[g.id]) || games[0];
const boards = (window.BOARDS && window.BOARDS[game.id]) || [];

const $ = (id) => document.getElementById(id);
const svg = $("pitch");

const svgEl = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
};
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ---------- Pitch ----------

function drawPitch() {
  // Lines on the page's own ground, like the dashboard's hero board. Colours come from css/tactics.css.
  const defs = svgEl("defs", {}, svg);
  ["pass", "run", "carry", "shot"].forEach((t) => {
    const m = svgEl("marker", { id: `head-${t}`, viewBox: "0 0 10 10", refX: 7, refY: 5, markerWidth: 4.5, markerHeight: 4.5, orient: "auto-start-reverse" }, defs);
    svgEl("path", { d: "M0,0 L10,5 L0,10 z", class: `head head--${t}` }, m);
  });

  const lines = svgEl("g", { class: "pitch" }, svg);
  svgEl("rect", { x: 0, y: 0, width: W, height: H }, lines);
  svgEl("line", { x1: W / 2, y1: 0, x2: W / 2, y2: H }, lines);
  svgEl("circle", { cx: W / 2, cy: H / 2, r: 91.5 }, lines);
  svgEl("circle", { cx: W / 2, cy: H / 2, r: 3.5, class: "pitch__spot" }, lines);
  [[0, 1], [W, -1]].forEach(([x0, d]) => {
    svgEl("rect", { x: d === 1 ? 0 : W - 165, y: 138.5, width: 165, height: 403 }, lines);
    svgEl("rect", { x: d === 1 ? 0 : W - 55, y: 248.5, width: 55, height: 183 }, lines);
    svgEl("circle", { cx: x0 + d * 110, cy: H / 2, r: 3.5, class: "pitch__spot" }, lines);
    const ax = x0 + d * 165;
    svgEl("path", { d: `M ${ax} ${H / 2 - 73} A 91.5 91.5 0 0 ${d === 1 ? 1 : 0} ${ax} ${H / 2 + 73}` }, lines);
    svgEl("rect", { x: d === 1 ? -14 : W, y: 304, width: 14, height: 72, class: "pitch__goal" }, lines);
  });

  const dir = svgEl("text", { x: W / 2, y: -6, "text-anchor": "middle", class: "pitch-dir" }, svg);
  dir.textContent = "Madrid attack this way →";
}

// ---------- Board state ----------

let board = null;
let stepIndex = 0;
let playing = false;
let anim = null;            // current requestAnimationFrame id
let timer = null;           // pause timer while playing
let layers = {};
let nodes = {};             // player id -> { g, x, y }
let ball = null;

function stateAt(i) {
  // Positions after step i (each step only lists players that moved).
  const pos = {};
  for (let s = 0; s <= i; s++) Object.assign(pos, board.steps[s].pos || {});
  return pos;
}
const endPoint = (b) => (Array.isArray(b[0]) ? b[b.length - 1] : b);

function buildBoard(b) {
  board = b;
  Object.values(layers).forEach((l) => l.remove());
  layers = {
    zone: svgEl("g", {}, svg),
    arrows: svgEl("g", {}, svg),
    players: svgEl("g", {}, svg),
    ball: svgEl("g", {}, svg)
  };
  nodes = {};
  const start = stateAt(0);

  for (const [id, p] of Object.entries(b.players)) {
    const [x, y] = start[id] || [-100, -100];
    const g = svgEl("g", { class: `player ${p.team}${p.gk ? " gk" : ""}`, transform: `translate(${x} ${y})` }, layers.players);
    svgEl("circle", { r: 26, class: "focus-ring" }, g);
    svgEl("circle", { r: 14, class: "body" }, g);
    if (p.num != null) {
      const t = svgEl("text", { y: 5, "text-anchor": "middle", class: "num" }, g);
      t.textContent = p.num;
    }
    if (p.name) {
      const t = svgEl("text", { y: p.up ? -22 : 34, "text-anchor": "middle", class: "name" }, g);
      t.textContent = p.name;
    }
    nodes[id] = { g, x, y };
  }

  const b0 = endPoint(Array.isArray(b.steps[0].ball[0]) ? b.steps[0].ball[0] : b.steps[0].ball);
  ball = { g: svgEl("g", { class: "ball", transform: `translate(${b0[0]} ${b0[1]})` }, layers.ball), x: b0[0], y: b0[1] };
  svgEl("circle", { r: 7, class: "ball__body" }, ball.g);

  // Step dots
  const dots = $("dots");
  dots.replaceChildren();
  b.steps.forEach((s, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "dot";
    d.title = s.title;
    d.setAttribute("aria-label", `Step ${i + 1}: ${s.title}`);
    d.addEventListener("click", () => { stop(); goTo(i, true); });
    dots.appendChild(d);
  });

  $("b-summary").textContent = b.summary;
  // "1–2 · Bellingham, Camavinga, Mbappé" → heading "87', Bellingham, Camavinga, Mbappé"
  $("b-title").textContent = `${b.minute}', ${b.title.replace(/^[^·]*·\s*/, "")}`;
  stepIndex = 0;
  showStep(0, true);
}

// ---------- Drawing a step ----------

function setText(i) {
  const s = board.steps[i];
  $("s-num").textContent = `Step ${i + 1} of ${board.steps.length}`;
  $("s-title").textContent = s.title;
  $("s-text").textContent = s.text;
  $("rec-step").textContent = `${board.minute}', step ${i + 1} of ${board.steps.length}`;
  $("rec-title").textContent = s.title;
  [...$("dots").children].forEach((d, k) => d.classList.toggle("on", k === i));
  $("prev").disabled = i === 0;
  $("next").disabled = i === board.steps.length - 1;
  for (const [id, n] of Object.entries(nodes)) n.g.classList.toggle("focus", id === s.focus);
}

function drawZone(s) {
  layers.zone.replaceChildren();
  if (!s.zone) return;
  const z = svgEl("ellipse", { cx: s.zone.x, cy: s.zone.y, rx: s.zone.rx, ry: s.zone.ry, class: "zone" }, layers.zone);
  z.style.opacity = 0;
  requestAnimationFrame(() => (z.style.opacity = 1));
}

function makeArrows(s) {
  layers.arrows.replaceChildren();
  return (s.arrows || []).map((a) => {
    const line = svgEl("line", {
      x1: a.from[0], y1: a.from[1], x2: a.from[0], y2: a.from[1],
      class: `arrow ${a.type}`, "marker-end": `url(#head-${a.type})`
    }, layers.arrows);
    return { a, line };
  });
}

function placeBall(path, t) {
  // path: list of points, t: 0..1 along it
  const pts = Array.isArray(path[0]) ? path : [path];
  if (pts.length === 1) return pts[0];
  const seg = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1)));
  const local = t * (pts.length - 1) - seg;
  return [lerp(pts[seg][0], pts[seg + 1][0], local), lerp(pts[seg][1], pts[seg + 1][1], local)];
}

function showStep(i, instant) {
  cancelAnimationFrame(anim);
  const s = board.steps[i];
  setText(i);
  drawZone(s);
  const arrows = makeArrows(s);
  const target = stateAt(i);
  const from = Object.fromEntries(Object.entries(nodes).map(([id, n]) => [id, [n.x, n.y]]));
  const ballPath = Array.isArray(s.ball[0]) ? s.ball : [[ball.x, ball.y], s.ball];
  $("goal-flash").classList.remove("on");

  const frame = (t) => {
    const e = ease(t);
    for (const [id, n] of Object.entries(nodes)) {
      const to = target[id];
      if (!to) continue;
      n.x = lerp(from[id][0], to[0], e);
      n.y = lerp(from[id][1], to[1], e);
      n.g.setAttribute("transform", `translate(${n.x} ${n.y})`);
    }
    const [bx, by] = placeBall(ballPath, e);
    ball.x = bx; ball.y = by;
    ball.g.setAttribute("transform", `translate(${bx} ${by})`);
    // Arrows grow one after another
    arrows.forEach(({ a, line }, k) => {
      const n = arrows.length;
      const local = Math.max(0, Math.min(1, (t * n) - k * 0.85));
      line.setAttribute("x2", lerp(a.from[0], a.to[0], ease(local)));
      line.setAttribute("y2", lerp(a.from[1], a.to[1], ease(local)));
      line.style.opacity = local > 0 ? 1 : 0;
    });
  };

  if (instant || reduceMotion) {
    frame(1);
    if (s.goal && !instant) $("goal-flash").classList.add("on");
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.max(0, Math.min(1, (now - t0) / MOVE_MS));
      frame(t);
      if (t < 1) anim = requestAnimationFrame(tick);
      else {
        if (s.goal) $("goal-flash").classList.add("on");
        resolve();
      }
    };
    anim = requestAnimationFrame(tick);
  });
}

function goTo(i, animate) {
  stepIndex = Math.max(0, Math.min(board.steps.length - 1, i));
  return showStep(stepIndex, !animate);
}

// ---------- Playback ----------

function stop() {
  playing = false;
  clearTimeout(timer);
  $("play").textContent = "Play";
}

async function play() {
  if (playing) { stop(); return; }
  playing = true;
  $("play").textContent = "Pause";
  // Restart from the beginning if we're at the end
  if (stepIndex >= board.steps.length - 1) { goTo(0, false); await wait(700); }
  while (playing) {
    await goTo(stepIndex, true);
    if (!playing) break;
    if (stepIndex >= board.steps.length - 1) { stop(); break; }
    await wait(PAUSE_MS);
    if (!playing) break;
    stepIndex++;
  }
}
const wait = (ms) => new Promise((r) => (timer = setTimeout(r, ms)));

// ---------- Tabs, controls, record mode ----------

function renderTabs() {
  const tabs = $("goal-tabs");
  boards.forEach((b) => {
    const t = document.createElement("button");
    t.type = "button";
    t.className = "goal-tab";
    t.setAttribute("role", "tab");
    const min = document.createElement("span");
    min.className = "tab-min";
    min.textContent = `${b.minute}'`;
    const title = document.createElement("span");
    title.textContent = b.title.split("·")[0].trim(); // the score after the goal, e.g. "1–2"
    t.append(min, title);
    t.addEventListener("click", () => selectBoard(b.id));
    t.dataset.id = b.id;
    tabs.appendChild(t);
  });
}

function selectBoard(id) {
  stop();
  const b = boards.find((x) => x.id === id) || boards[0];
  [...$("goal-tabs").children].forEach((t) => t.setAttribute("aria-selected", String(t.dataset.id === b.id)));
  [...$("goal-tabs").children].forEach((t) => t.classList.toggle("on", t.dataset.id === b.id));
  buildBoard(b);
  const url = new URL(location);
  url.searchParams.set("id", game.id);
  url.searchParams.set("goal", b.id);
  history.replaceState(null, "", url);
}

$("play").addEventListener("click", play);
$("prev").addEventListener("click", () => { stop(); goTo(stepIndex - 1, true); });
$("next").addEventListener("click", () => { stop(); goTo(stepIndex + 1, true); });
$("rec").addEventListener("click", () => {
  document.body.classList.add("rec");
  stop();
  goTo(0, false);
  setTimeout(play, 900);
});
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea")) return;
  if (e.key === "Escape") document.body.classList.remove("rec");
  if (e.key === " ") { e.preventDefault(); play(); }
  if (e.key === "ArrowRight") { stop(); goTo(stepIndex + 1, true); }
  if (e.key === "ArrowLeft") { stop(); goTo(stepIndex - 1, true); }
});


// ---------- Go ----------

const date = new Date(game.date + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
$("b-match").textContent = game.venue === "Away"
  ? `${game.opponent} ${game.score.opponent}–${game.score.madrid} Real Madrid, ${date}`
  : `Real Madrid ${game.score.madrid}–${game.score.opponent} ${game.opponent}, ${date}`;
$("lg-opp").textContent = game.opponent;
$("nav-graphic").href = `match.html?id=${encodeURIComponent(game.id)}`;
drawPitch();
if (boards.length) {
  renderTabs();
  selectBoard(params.get("goal"));
} else {
  $("b-summary").textContent = "No boards for this game yet. Add them in js/boards.js.";
}
