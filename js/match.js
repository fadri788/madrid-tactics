// Builds the shareable 1080×1350 graphic for one game: match.html?id=<game id>
// Without an id it shows the latest game.

const params = new URLSearchParams(location.search);
const sorted = [...window.GAMES].sort((a, b) => b.date.localeCompare(a.date));
const game = sorted.find((g) => g.id === params.get("id")) || sorted[0];

const $ = (id) => document.getElementById(id);
const el = (tag, text, className) => {
  const e = document.createElement(tag);
  if (text != null) e.textContent = text;
  if (className) e.className = className;
  return e;
};

function build(g) {
  const oppName = g.opponentShort ? g.opponentShort.charAt(0) + g.opponentShort.slice(1).toLowerCase() : g.opponent;
  document.title = `Match graphic: ${g.venue === "Away" ? `${oppName} ${g.score.opponent}–${g.score.madrid} Madrid` : `Madrid ${g.score.madrid}–${g.score.opponent} ${oppName}`}`;
  const date = new Date(g.date + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  $("g-label").textContent = `${g.competition.replace(" · ", ", ").replace("Matchday", "matchday")}, ${date}`;
  $("intro-lead").textContent = `${g.venue === "Away" ? `${g.opponent} ${g.score.opponent}–${g.score.madrid} Real Madrid` : `Real Madrid ${g.score.madrid}–${g.score.opponent} ${g.opponent}`} as one picture for Instagram, 1080 by 1350 pixels.`;
  $("nav-board").href = `tactics.html?id=${encodeURIComponent(g.id)}`;

  // Home team first: "Barça 1–2 Madrid" for away games.
  const [home, homeGoals, away, awayGoals] = g.venue === "Away"
    ? [oppName, g.score.opponent, "Madrid", g.score.madrid]
    : ["Madrid", g.score.madrid, oppName, g.score.opponent];
  $("g-score").textContent = `${home} ${homeGoals}–${awayGoals} ${away}`;

  // Shrink the score until it fits on one line (952px = 1080 minus padding).
  const scoreEl = $("g-score");
  const shrink = () => {
    let size = 150;
    scoreEl.style.fontSize = size + "px";
    while (scoreEl.scrollWidth > 952 && size > 56) scoreEl.style.fontSize = --size + "px";
  };
  shrink();
  document.fonts.ready.then(shrink);

  $("g-tagline").textContent = g.headline;

  // Stadium picture as a wide band (set stadiumImg in data.js). A background, not an <img>,
  // so the picture always fills the band.
  const pic = g.stadiumImg && window.STADIUMS && window.STADIUMS[g.stadiumImg];
  if (pic) $("g-stadium").style.backgroundImage = `url("${pic}")`;
  else $("g-stadium").remove();

  // Stat bars: ink = Madrid's share, light grey = the opponent's.
  [["Possession", g.stats.possession, "%"], ["Shots", g.stats.shots, ""], ["On target", g.stats.onTarget, ""]].forEach(([name, s, unit]) => {
    const wrap = el("div", null, "g-stat");
    const top = el("div", null, "g-stat-top");
    top.append(el("span", `${s.madrid}${unit}`, "g-stat-rm"), el("span", name, "g-stat-name"), el("span", `${s.opponent}${unit}`, "g-stat-opp"));
    const track = el("div", null, "g-track");
    const fill = el("div", null, "g-fill");
    fill.style.width = `${(s.madrid / (s.madrid + s.opponent || 1)) * 100}%`;
    track.append(fill);
    wrap.append(top, track);
    $("g-stats").append(wrap);
  });

  // Goal timeline across 90 minutes.
  g.goals.forEach((goal) => {
    const pos = Math.min(goal.minute, 90) / 90;
    const marker = el("div", null, `g-goal g-goal--${goal.team}`);
    marker.style.left = `${Math.max(5, Math.min(95, pos * 100))}%`;
    marker.append(el("span", `${goal.minute}'`, "g-min"), el("div", null, "g-dot"), el("span", goal.scorer, "g-scorer"));
    $("g-timeline").append(marker);
  });

  // Up to three tactical keys that worked.
  g.keys.filter((k) => k.verdict === "worked").slice(0, 3).forEach((k) => {
    const row = el("div", null, "g-key");
    row.append(el("p", k.title, "g-key-title"), el("p", k.detail, "g-key-detail"));
    $("g-keys").append(row);
  });

  $("g-setup").textContent = `${g.formation}, ${g.block.toLowerCase()}`;
}

// Your handle in the bottom-right corner, remembered in this browser.
function handle() {
  const input = $("handle");
  let saved = "";
  try { saved = localStorage.getItem("mt-handle") || ""; } catch (e) {}
  input.value = saved;
  const show = () => ($("g-handle").textContent = input.value.trim());
  input.addEventListener("input", () => {
    show();
    try { localStorage.setItem("mt-handle", input.value.trim()); } catch (e) {}
  });
  show();
}

// Scale the full-size graphic down to fit its column.
function fit() {
  const scale = $("scaler").clientWidth / 1080;
  $("graphic").style.transform = `scale(${scale})`;
}

$("download").addEventListener("click", async () => {
  const note = $("download-note");
  if (!window.htmlToImage) {
    note.textContent = "The export tool is missing. Check that js/vendor/html-to-image.js is in the folder.";
    note.classList.add("is-error");
    return;
  }
  const btn = $("download");
  btn.disabled = true;
  btn.textContent = "Making the PNG…";
  try {
    await document.fonts.ready;
    const url = await window.htmlToImage.toPng($("graphic"), {
      width: 1080, height: 1350, pixelRatio: 1, backgroundColor: "#f8f8f8",
      style: { transform: "none" }
    });
    const a = document.createElement("a");
    a.download = `${game.id}.png`;
    a.href = url;
    a.click();
    note.textContent = `Downloaded ${game.id}.png.`;
    note.classList.remove("is-error");
  } catch (e) {
    note.textContent = "The PNG couldn't be made. Open the page through Live Server and try again.";
    note.classList.add("is-error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Download PNG";
  }
});

if (game) build(game);
handle();
fit();
window.addEventListener("resize", fit);
