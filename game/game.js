const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const hpEl = document.getElementById("hp");
const waveEl = document.getElementById("wave");
const overlay = document.getElementById("overlay");
const overText = document.getElementById("overText");
const restartBtn = document.getElementById("restart");

const state = {
  running: true,
  score: 0,
  wave: 1,
  enemyTarget: 8,
  spawned: 0,
  keys: new Set(),
  mouse: { x: canvas.width / 2, y: canvas.height / 2, down: false },
  player: { x: canvas.width / 2, y: canvas.height / 2, r: 14, speed: 4.2, hp: 100, fireCd: 0 },
  bullets: [],
  enemies: [],
  particles: [],
};

function rand(min, max) { return Math.random() * (max - min) + min; }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function spawnEnemy() {
  const edge = Math.floor(Math.random() * 4);
  let x = 0, y = 0;
  if (edge === 0) { x = rand(0, canvas.width); y = -20; }
  if (edge === 1) { x = canvas.width + 20; y = rand(0, canvas.height); }
  if (edge === 2) { x = rand(0, canvas.width); y = canvas.height + 20; }
  if (edge === 3) { x = -20; y = rand(0, canvas.height); }
  const speed = rand(1.1, 2.2) + state.wave * 0.12;
  const hp = 18 + state.wave * 3;
  state.enemies.push({ x, y, r: 12, speed, hp });
}

function shoot() {
  const p = state.player;
  if (p.fireCd > 0) return;
  p.fireCd = 8;
  const dx = state.mouse.x - p.x;
  const dy = state.mouse.y - p.y;
  const len = Math.hypot(dx, dy) || 1;
  const vx = (dx / len) * 9;
  const vy = (dy / len) * 9;
  state.bullets.push({ x: p.x, y: p.y, vx, vy, life: 80, r: 4 });
}

function damagePlayer(dmg) {
  state.player.hp = clamp(state.player.hp - dmg, 0, 100);
  if (state.player.hp <= 0) {
    state.running = false;
    overText.textContent = `最终分数 ${state.score}，到达波次 ${state.wave}`;
    overlay.classList.remove("hidden");
  }
}

function nextWaveIfNeeded() {
  if (state.spawned >= state.enemyTarget && state.enemies.length === 0) {
    state.wave += 1;
    state.enemyTarget = Math.floor(state.enemyTarget * 1.25) + 2;
    state.spawned = 0;
    state.player.hp = clamp(state.player.hp + 15, 0, 100);
  }
}

function resetGame() {
  state.running = true;
  state.score = 0;
  state.wave = 1;
  state.enemyTarget = 8;
  state.spawned = 0;
  state.bullets = [];
  state.enemies = [];
  state.particles = [];
  state.player = { x: canvas.width / 2, y: canvas.height / 2, r: 14, speed: 4.2, hp: 100, fireCd: 0 };
  overlay.classList.add("hidden");
}

function update() {
  if (!state.running) return;

  if (state.spawned < state.enemyTarget && Math.random() < 0.04 + state.wave * 0.002) {
    spawnEnemy();
    state.spawned += 1;
  }

  const p = state.player;
  let mx = 0, my = 0;
  if (state.keys.has("w")) my -= 1;
  if (state.keys.has("s")) my += 1;
  if (state.keys.has("a")) mx -= 1;
  if (state.keys.has("d")) mx += 1;
  if (mx || my) {
    const len = Math.hypot(mx, my);
    p.x += (mx / len) * p.speed;
    p.y += (my / len) * p.speed;
  }
  p.x = clamp(p.x, p.r, canvas.width - p.r);
  p.y = clamp(p.y, p.r, canvas.height - p.r);
  p.fireCd = Math.max(0, p.fireCd - 1);

  if (state.mouse.down) shoot();

  for (const b of state.bullets) {
    b.x += b.vx;
    b.y += b.vy;
    b.life -= 1;
  }
  state.bullets = state.bullets.filter(b => b.life > 0 && b.x > -20 && b.x < canvas.width + 20 && b.y > -20 && b.y < canvas.height + 20);

  for (const e of state.enemies) {
    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const len = Math.hypot(dx, dy) || 1;
    e.x += (dx / len) * e.speed;
    e.y += (dy / len) * e.speed;
  }

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];

    if (dist(e, p) < e.r + p.r) {
      state.enemies.splice(i, 1);
      damagePlayer(14);
      continue;
    }

    for (let j = state.bullets.length - 1; j >= 0; j--) {
      const b = state.bullets[j];
      if (dist(e, b) < e.r + b.r) {
        e.hp -= 20;
        state.bullets.splice(j, 1);
        if (e.hp <= 0) {
          state.enemies.splice(i, 1);
          state.score += 10;
        }
        break;
      }
    }
  }

  nextWaveIfNeeded();
  scoreEl.textContent = state.score;
  hpEl.textContent = Math.floor(state.player.hp);
  waveEl.textContent = state.wave;
}

function drawGrid() {
  ctx.strokeStyle = "rgba(66, 114, 183, 0.18)";
  ctx.lineWidth = 1;
  const gap = 40;
  for (let x = 0; x <= canvas.width; x += gap) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += gap) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  const p = state.player;
  const ang = Math.atan2(state.mouse.y - p.y, state.mouse.x - p.x);

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(ang);
  ctx.fillStyle = "#44d9ff";
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(-12, -10);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-12, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  for (const b of state.bullets) {
    ctx.fillStyle = "#baf6ff";
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
  }

  for (const e of state.enemies) {
    ctx.fillStyle = "#ff4d7a";
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#30101a";
    ctx.fillRect(e.x - 12, e.y - 18, 24, 4);
    ctx.fillStyle = "#7dff9a";
    ctx.fillRect(e.x - 12, e.y - 18, (e.hp / (18 + state.wave * 3)) * 24, 4);
  }
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (["w", "a", "s", "d"].includes(k)) state.keys.add(k);
  if (k === "r") resetGame();
});
window.addEventListener("keyup", (e) => state.keys.delete(e.key.toLowerCase()));
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  state.mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
  state.mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
});
canvas.addEventListener("mousedown", () => { state.mouse.down = true; });
window.addEventListener("mouseup", () => { state.mouse.down = false; });
restartBtn.addEventListener("click", resetGame);

loop();
