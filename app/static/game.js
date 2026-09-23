/* DinoQuest.

   A runner: the dino holds still, the world moves left, and jumping is the
   only control. Nothing here is the lesson -- the lesson is where the scores
   go -- so it is kept short and dependency-free.

   The dino is drawn from /dino.png. Replacing that file replaces the dino,
   which is what the last step of the course does with a generated one. */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;
const GROUND = H - 26;

const GRAVITY = 0.68;
const JUMP = -13.2;
const START_SPEED = 6.2;
const TOP_SPEED = 13;
const RAMP = 700;        // how quickly the climb flattens out

const scoreLabel = document.getElementById("score");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayHint = document.getElementById("overlay-hint");
const soundButton = document.getElementById("sound");
const scoreList = document.getElementById("scores");
const nameField = document.getElementById("name");
const music = document.getElementById("music");

const sprite = new Image();
sprite.src = "dino.png";

/* ── sound ───────────────────────────────────────────────────────────────── */

let soundOn = false;
const effects = {
  jump: new Audio("audio/jump.mp3"),
  bump: new Audio("audio/bump.mp3"),
  coin: new Audio("audio/coin.wav"),
  lose: new Audio("audio/lose.wav"),
};
Object.values(effects).forEach((clip) => (clip.volume = 0.5));
music.volume = 0.35;

function play(name) {
  if (!soundOn) return;
  const clip = effects[name];
  clip.currentTime = 0;
  clip.play().catch(() => {});
}

soundButton.addEventListener("click", () => {
  soundOn = !soundOn;
  soundButton.textContent = soundOn ? "sound on" : "sound off";
  soundButton.setAttribute("aria-pressed", String(soundOn));
  // Browsers only allow audio to start from a gesture, so this click is it.
  if (soundOn) music.play().catch(() => {});
  else music.pause();
});

/* ── state ───────────────────────────────────────────────────────────────── */

const dino = { x: 90, y: GROUND, vy: 0, size: 52, grounded: true };

let obstacles = [];
let speed = START_SPEED;
let score = 0;
let nextCoin = 100;
let running = false;
let over = false;
let frame = 0;

function reset() {
  dino.y = GROUND;
  dino.vy = 0;
  dino.grounded = true;
  obstacles = [];
  speed = START_SPEED;
  score = 0;
  nextCoin = 100;
  frame = 0;
  over = false;
}

function jump() {
  if (!dino.grounded || over) return;
  dino.vy = JUMP;
  dino.grounded = false;
  play("jump");
}

function start() {
  if (running) return;
  reset();
  running = true;
  overlay.hidden = true;
  requestAnimationFrame(tick);
}

function press() {
  if (blocked) return;
  if (over) start();
  else if (!running) start();
  else jump();
}

/* Space is both "jump" and a character. Whenever the caret is in a text field
   it is a character, so the game keeps its hands off every key. */
function typing() {
  const active = document.activeElement;
  return (
    !!active &&
    (active.tagName === "INPUT" ||
      active.tagName === "TEXTAREA" ||
      active.isContentEditable)
  );
}

window.addEventListener("keydown", (event) => {
  if (typing()) return;
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    press();
  }
});
/* Click or tap anywhere to jump, except on the two controls -- hunting for
   the canvas mid-run is not a game mechanic. */
window.addEventListener("pointerdown", (event) => {
  if (event.target.closest("input, button, a")) return;
  press();
});

/* ── the world ───────────────────────────────────────────────────────────── */

function spawn() {
  const tall = Math.random() < 0.3;
  obstacles.push({
    x: W + 20,
    w: tall ? 18 : 26,
    h: tall ? 54 : 34,
  });
}

function hits(obstacle) {
  // A little forgiveness on every edge, so near misses feel like near misses.
  const pad = 8;
  const dx = dino.x + pad;
  const dw = dino.size - pad * 2;
  const dy = dino.y - dino.size + pad;
  const dh = dino.size - pad;

  return (
    dx < obstacle.x + obstacle.w &&
    dx + dw > obstacle.x &&
    dy < GROUND &&
    dy + dh > GROUND - obstacle.h
  );
}

function update() {
  frame += 1;

  dino.vy += GRAVITY;
  dino.y += dino.vy;
  if (dino.y >= GROUND) {
    dino.y = GROUND;
    dino.vy = 0;
    dino.grounded = true;
  }

  if (frame % Math.max(44, Math.round(104 - speed * 6)) === 0) spawn();

  obstacles.forEach((obstacle) => (obstacle.x -= speed));
  obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.w > -20);

  // One point per few frames, so the number climbs at a readable pace.
  if (frame % 4 === 0) score += 1;
  // Climbs quickly at first, then flattens towards TOP_SPEED. Linear growth
  // has no ceiling and turns the game unplayable a minute in.
  speed = TOP_SPEED - (TOP_SPEED - START_SPEED) * Math.exp(-score / RAMP);

  if (score >= nextCoin) {
    nextCoin += 100;
    play("coin");
  }

  scoreLabel.textContent = String(score);

  if (obstacles.some(hits)) finish();
}

/* ── drawing ─────────────────────────────────────────────────────────────── */

function ink(fallback) {
  return getComputedStyle(document.body).color || fallback;
}

function draw() {
  const colour = ink("#12151c");
  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = colour;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(0, GROUND + 1);
  ctx.lineTo(W, GROUND + 1);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = colour;
  obstacles.forEach((obstacle) => {
    const { x, w, h } = obstacle;
    ctx.fillRect(x, GROUND - h, w, h);                    // trunk
    const arm = Math.round(w * 0.42);
    ctx.fillRect(x - arm, GROUND - h * 0.72, arm, 5);     // left arm
    ctx.fillRect(x - arm, GROUND - h * 0.72, 5, h * 0.3);
    ctx.fillRect(x + w, GROUND - h * 0.58, arm, 5);       // right arm
    ctx.fillRect(x + w + arm - 5, GROUND - h * 0.58, 5, h * 0.24);
  });

  // A small bob while running sells the motion without a second sprite.
  const bob = dino.grounded && running && !over ? Math.sin(frame / 4) * 1.6 : 0;
  if (sprite.complete && sprite.naturalWidth) {
    ctx.drawImage(sprite, dino.x, dino.y - dino.size + bob, dino.size, dino.size);
  } else {
    ctx.fillRect(dino.x, dino.y - dino.size, dino.size, dino.size);
  }
}

function tick() {
  if (!running) return;
  update();
  draw();
  if (running) requestAnimationFrame(tick);
}

/* ── the leaderboard ─────────────────────────────────────────────────────── */

/* The name lives in a field on the page rather than a prompt(), which would
   block the whole tab and is a poor first impression of your own app. */
nameField.value = localStorage.getItem("dino.name") || "";
nameField.addEventListener("change", () => {
  localStorage.setItem("dino.name", nameField.value.trim().slice(0, 12));
  loadScores();
});

function who() {
  return nameField.value.trim().slice(0, 12) || "anon";
}

function render(rows) {
  const me = who();
  if (!rows.length) {
    scoreList.innerHTML = '<li class="empty">No scores yet.</li>';
    return;
  }
  scoreList.innerHTML = rows
    .map(
      (row) =>
        `<li class="${row.name === me ? "me" : ""}">` +
        `<span class="who"></span><span class="points">${Number(row.score)}</span></li>`,
    )
    .join("");
  // Names come from other players, so they are set as text, never as HTML.
  scoreList.querySelectorAll(".who").forEach((cell, index) => {
    cell.textContent = rows[index].name;
  });
}

async function loadScores() {
  try {
    render(await (await fetch("api/scores")).json());
  } catch {
    /* the board is a nicety; the game still plays without it */
  }
}

async function submit(points) {
  try {
    const response = await fetch("api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: who(), score: points }),
    });
    render(await response.json());
  } catch {
    overlayHint.textContent = "score not saved — the server did not answer";
  }
}

function finish() {
  running = false;
  over = true;
  play("bump");
  play("lose");
  draw();

  overlayTitle.textContent = `${score}`;
  overlayHint.textContent = "space to run again";
  overlay.hidden = false;

  if (score > 0) submit(score);
}

/* ── the dino maker ──────────────────────────────────────────────────────── */

/* The control is hidden until the server says it can draw one, so the page
   matches what the app can actually do rather than what it will do later. */

const maker = document.getElementById("maker");
const idea = document.getElementById("idea");
const makeButton = document.getElementById("make");
const makerNote = document.getElementById("maker-note");
const restoreButton = document.getElementById("restore");
const veil = document.getElementById("veil");
const veilText = document.getElementById("veil-text");
const veilAction = document.getElementById("veil-action");

/* While the veil is up the game does not take input. A round played now would
   be thrown away by the reload that puts the new dino on screen. */
let blocked = false;

function cover(message, offerReload) {
  blocked = true;
  veilText.textContent = message;
  veilAction.hidden = !offerReload;
  veil.hidden = false;
  // Stop any round in progress rather than letting it run behind the veil.
  running = false;
  overlay.hidden = true;
}

/* One request at a time. The disabled attribute is the visible half of this;
   the flag is the half that cannot be bypassed. */
let working = false;

/* One switch for the whole maker. While a request is in flight -- or once one
   has succeeded and the page is waiting to be reloaded -- none of these should
   be usable. */
function controls(enabled) {
  makeButton.disabled = !enabled;
  restoreButton.disabled = !enabled;
  idea.disabled = !enabled;
}

function uncover() {
  blocked = false;
  veil.hidden = true;
  veilAction.hidden = true;
  // The interrupted round is gone, so come back to a clean idle screen
  // rather than whatever was on the overlay before.
  reset();
  draw();
  overlayTitle.textContent = "Press space to run";
  overlayHint.textContent = "space or tap to jump";
  overlay.hidden = false;
}
const boardNote = document.getElementById("board-note");

async function askHealth() {
  try {
    const health = await (await fetch("api/health")).json();
    boardNote.textContent = health.where || "";
    if (health.dino) maker.hidden = false;
  } catch {
    /* an older build of the app has no health route */
  }
}

async function makeDino() {
  if (working) return;
  working = true;
  controls(false);
  makerNote.textContent = "asking the model… this takes a few seconds, longer if it is busy";
  cover("Drawing your dino…", false);

  try {
    const response = await fetch("api/dino", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea: idea.value.trim() }),
    });
    const outcome = await response.json();

    if (outcome.ok) {
      // The file on disk changed, but the browser still holds the old one.
      sprite.src = `dino.png?v=${Date.now()}`;
      makerNote.textContent = "Your new dino is ready. Reload the game to run with it.";
      cover("Your new dino is ready", true);
    } else {
      // It failed, so there is nothing to reload into. Give the game back.
      makerNote.textContent = outcome.detail || "the model did not answer";
      uncover();
      controls(true);
      working = false;
    }
  } catch {
    makerNote.textContent = "the server did not answer";
    uncover();
    controls(true);
    working = false;
  }
}

async function restoreDino() {
  if (working) return;
  working = true;
  controls(false);
  cover("Putting the original dino back…", false);

  try {
    const outcome = await (await fetch("api/dino/original", { method: "POST" })).json();
    if (outcome.ok) {
      sprite.src = `dino.png?v=${Date.now()}`;
      makerNote.textContent = "Back to the dino the game shipped with. Reload to run with it.";
      cover("Back to the original dino", true);
    } else {
      makerNote.textContent = outcome.detail || "could not put it back";
      uncover();
      controls(true);
      working = false;
    }
  } catch {
    makerNote.textContent = "the server did not answer";
    uncover();
    controls(true);
    working = false;
  }
}

makeButton.addEventListener("click", makeDino);
restoreButton.addEventListener("click", restoreDino);
veilAction.addEventListener("click", () => location.reload());
idea.addEventListener("keydown", (event) => {
  if (event.key === "Enter") makeDino();
});

sprite.addEventListener("load", draw);
draw();
loadScores();
askHealth();
