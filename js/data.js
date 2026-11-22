// All big games live here. Add a new object at the top of GAMES after each big game.
// Big games = Clásicos, derbies, Champions League knockouts.
window.GAMES = [
  {
    id: "2026-10-25-bar",
    date: "2026-10-25",
    opponent: "Barcelona",
    opponentShort: "BARÇA",
    competition: "La Liga · Matchday 10",
    venue: "Away",
    stadium: "Spotify Camp Nou",
    stadiumImg: "camp-nou", // picture from js/stadiums.js (optional)
    score: { madrid: 2, opponent: 1 },
    result: "W",
    formation: "4-2-3-1",
    block: "Mid-to-low block",
    headline: "Mourinho's mid-block won it with 37% of the ball, and both goals came down the right.",
    stats: {
      possession: { madrid: 37, opponent: 63 },
      shots: { madrid: 9, opponent: 16 },
      onTarget: { madrid: 5, opponent: 6 },
      corners: { madrid: 6, opponent: 6 },
      fouls: { madrid: 11, opponent: 15 }
    },
    goals: [
      { minute: 41, team: "madrid", scorer: "Mbappé", how: "Diomande drove in from the right; Martín's clearance bounced in off Mbappé", board: "goal-41" },
      { minute: 61, team: "opponent", scorer: "Raphinha", how: "Equaliser, assisted by Pedri" },
      { minute: 87, team: "madrid", scorer: "Mbappé", how: "Bellingham beat two, Camavinga went past Cubarsí and the keeper, cut back for Mbappé", board: "goal-87" }
    ],
    keys: [
      { title: "Both goals down the right", detail: "Diomande (41') and Camavinga (87') both attacked the right channel, the space on Barça's left side.", verdict: "worked" },
      { title: "Bellingham broke the lines", detail: "For the winner he rode G. Jesus's challenge and spun past Pedri in one carry, which opened the whole pitch.", verdict: "worked" },
      { title: "Won the midfield duels", detail: "Bellingham, Tchouaméni and Cucurella beat Pedri, Rodri and Yamal in tight 1v1s.", verdict: "worked" },
      { title: "Gave Barça the ball", detail: "Sat in a mid-to-low 4-2-3-1, let Barça reach halfway, then squeezed the space.", verdict: "worked" },
      { title: "Bernardo Silva as the outlet", detail: "Kept the ball under pressure and dragged Barça's midfielders out of position.", verdict: "worked" },
      { title: "Pressed only at the right moments", detail: "Switched from a compact block to a high press when the moment was right.", verdict: "worked" },
      { title: "Playing out against the press", detail: "Lunin was forced long about 10 times; Madrid escaped by switching play wide.", verdict: "mixed" },
      { title: "Mbappé vs the offside trap", detail: "Barça's high line caught him offside again and again.", verdict: "failed" }
    ],
    // Man of the match card. Only use stats you can back up with a source.
    motm: {
      name: "Mbappé",
      fullName: "Kylian Mbappé",
      position: "ST",
      line: "Both goals, including the 87th-minute winner, his 100th for the club.",
      stats: [
        { label: "Goals", value: 2 },
        { label: "Club goal no.", value: 100 },
        { label: "Offsides", value: 7 }
      ]
    },
    sources: ["Sportradar match stats", "Goal", "Sky Sports", "Yahoo Sports", "ESPN"]
  }
];
