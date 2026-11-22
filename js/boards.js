// Animated tactics boards, one list per game id (same ids as js/data.js).
//
// Pitch is 1050 x 680 (105m x 68m, x10). Madrid ALWAYS attack to the right.
// Madrid's right wing is the BOTTOM of the pitch (y near 680).
// Goal mouth: x = 1050, y between 304 and 376.
//
// Each step moves players from where they were to `pos`. Players not listed keep their spot.
// ball: one point, or a list of points the ball travels through.
// arrows: pass (solid gold), run (dashed white), carry (dotted gold), shot (thick gold).
// zone: highlighted space. focus: player who glows.
//
// Positions are read from broadcast footage, so they are approximate.

window.BOARDS = {
  "2026-10-25-bar": [
    {
      id: "goal-41",
      minute: 41,
      title: "0–1 · Diomande's run, Mbappé's touch",
      summary: "Diomande held the width on the right while Barça stayed narrow. One switch put him 1v1, and the chaos in the box did the rest.",
      players: {
        rmA:      { team: "rm" },
        rmB:      { team: "rm" },
        rmC:      { team: "rm" },
        diomande: { team: "rm", num: 25, name: "Diomande", up: true },
        mbappe:   { team: "rm", num: 10, name: "Mbappé", up: true },
        m1:       { team: "fcb" },
        m2:       { team: "fcb" },
        m3:       { team: "fcb" },
        b2:       { team: "fcb", num: 2, name: "#2" },
        martin:   { team: "fcb", num: 18, name: "Martín" },
        cubarsi:  { team: "fcb", num: 5, name: "Cubarsí", up: true },
        gk:       { team: "fcb", gk: true, name: "García", up: true }
      },
      steps: [
        {
          title: "Diomande holds the width",
          text: "Madrid keep the ball in midfield. Diomande stays glued to the right touchline, and Barça's block is narrow, so nobody goes with him.",
          ball: [480, 280],
          focus: "diomande",
          zone: { x: 790, y: 630, rx: 130, ry: 42 },
          pos: {
            rmA: [480, 280], rmB: [420, 430], rmC: [600, 170],
            diomande: [640, 645], mbappe: [700, 300],
            m1: [560, 240], m2: [540, 380], m3: [610, 470],
            b2: [720, 560], martin: [770, 460], cubarsi: [770, 330], gk: [1000, 340]
          }
        },
        {
          title: "Switch to the free man",
          text: "One pass out to the right and Diomande is running at #2 with space behind him. Mbappé starts moving towards the box.",
          ball: [730, 625],
          focus: "diomande",
          arrows: [
            { type: "pass", from: [480, 280], to: [722, 622] },
            { type: "run", from: [640, 645], to: [722, 630] }
          ],
          pos: {
            diomande: [730, 628], b2: [795, 600], mbappe: [810, 255],
            m2: [580, 420], m3: [650, 500], martin: [800, 470]
          }
        },
        {
          title: "Drive into the box",
          text: "Diomande carries it into the right side of the box with #2 chasing. Martín and Cubarsí drop towards their own goal, Mbappé attacks the near post.",
          ball: [900, 520],
          focus: "diomande",
          arrows: [
            { type: "carry", from: [730, 625], to: [895, 522] },
            { type: "run", from: [810, 255], to: [950, 372] }
          ],
          pos: {
            diomande: [900, 528], b2: [858, 578], martin: [930, 445], cubarsi: [925, 295],
            mbappe: [955, 378], gk: [1015, 345], m3: [760, 520], m2: [700, 430]
          }
        },
        {
          title: "Clearance off Mbappé, goal",
          text: "The ball comes across the near post. Martín's clearance smashes off Mbappé's leg and flies in. Lucky finish, but it only happened because Madrid got the ball into that space.",
          ball: [[900, 520], [952, 425], [982, 397], [1046, 358]],
          focus: "mbappe",
          goal: true,
          arrows: [
            { type: "pass", from: [900, 520], to: [948, 429] },
            { type: "shot", from: [985, 394], to: [1044, 360] }
          ],
          pos: { martin: [955, 425], mbappe: [985, 392], gk: [1022, 325] }
        }
      ]
    },
    {
      id: "goal-87",
      minute: 87,
      title: "1–2 · Bellingham, Camavinga, Mbappé",
      summary: "Bellingham broke Barça's midfield on his own, and Camavinga attacked the same right channel as the first goal. Barça's back line was pulled apart.",
      players: {
        rmA:     { team: "rm" },
        rmB:     { team: "rm" },
        bell:    { team: "rm", num: 5, name: "Bellingham", up: true },
        cama:    { team: "rm", num: 6, name: "Camavinga" },
        mbappe:  { team: "rm", num: 10, name: "Mbappé", up: true },
        jesus:   { team: "fcb", num: 9, name: "G. Jesus" },
        pedri:   { team: "fcb", num: 8, name: "Pedri" },
        fx:      { team: "fcb" },
        cubarsi: { team: "fcb", num: 5, name: "Cubarsí" },
        b3:      { team: "fcb", num: 3, name: "#3" },
        cb2:     { team: "fcb" },
        gk:      { team: "fcb", gk: true, name: "García", up: true }
      },
      steps: [
        {
          title: "Patient build-up",
          text: "Madrid keep the ball around halfway at 1–1 and pull Barça's midfield towards it. Bellingham drops in to receive.",
          ball: [420, 330],
          focus: "bell",
          pos: {
            rmA: [420, 330], rmB: [380, 180], bell: [520, 360],
            cama: [600, 600], mbappe: [660, 240],
            jesus: [565, 325], pedri: [585, 425], fx: [520, 200],
            cubarsi: [770, 420], b3: [640, 540], cb2: [780, 290], gk: [1000, 340]
          },
          arrows: [{ type: "pass", from: [420, 330], to: [512, 358] }]
        },
        {
          title: "Bellingham beats two",
          text: "He rides G. Jesus's challenge, spins away from Pedri and is through Barça's midfield line in one carry.",
          ball: [645, 420],
          focus: "bell",
          zone: { x: 720, y: 520, rx: 110, ry: 70 },
          arrows: [{ type: "carry", from: [522, 362], to: [640, 418] }],
          pos: { bell: [645, 420], jesus: [575, 380], pedri: [598, 462], b3: [660, 560] }
        },
        {
          title: "Camavinga into the channel",
          text: "Camavinga bursts down the right, the same channel as the first goal. #3 is behind the play, so Cubarsí has to come across to cover.",
          ball: [790, 570],
          focus: "cama",
          zone: { x: 870, y: 560, rx: 120, ry: 60 },
          arrows: [
            { type: "pass", from: [645, 420], to: [785, 566] },
            { type: "run", from: [600, 600], to: [784, 576] }
          ],
          pos: {
            cama: [792, 576], cubarsi: [835, 500], b3: [700, 605],
            mbappe: [800, 300], cb2: [880, 300], jesus: [590, 400], pedri: [625, 480]
          }
        },
        {
          title: "Past Cubarsí and the keeper",
          text: "He takes on Cubarsí and keeps going as García dives at his feet. Barça's last line is now on the ground or out of position.",
          ball: [955, 476],
          focus: "cama",
          arrows: [
            { type: "carry", from: [792, 572], to: [948, 482] },
            { type: "run", from: [800, 300], to: [880, 335] }
          ],
          pos: {
            cama: [955, 482], cubarsi: [888, 540], gk: [1002, 440],
            b3: [840, 590], mbappe: [885, 338], cb2: [960, 330]
          }
        },
        {
          title: "Cutback, Mbappé finishes",
          text: "Camavinga pulls it back and Mbappé tucks it in at 87'. His 100th goal for the club, and the winner.",
          ball: [[955, 476], [902, 345], [1046, 332]],
          focus: "mbappe",
          goal: true,
          arrows: [
            { type: "pass", from: [955, 476], to: [906, 351] },
            { type: "shot", from: [906, 345], to: [1044, 332] }
          ],
          pos: { mbappe: [902, 348], cb2: [972, 392], cubarsi: [895, 545] }
        }
      ]
    }
  ]
};
