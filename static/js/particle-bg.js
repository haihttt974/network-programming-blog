const canvas = document.createElement("canvas");
canvas.id = "particle-bg";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");
const DPR = window.devicePixelRatio || 1;

canvas.style.position = "fixed";
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.zIndex = -1;
canvas.style.pointerEvents = "none";

let w, h;
function resize() {
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w * DPR;
  canvas.height = h * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener("resize", resize);
resize();

/* ================= PRO CONTROLS ================= */

const IDLE_FLOW_SPEED = 0.012;
const IDLE_NOISE = 0.004;

const MOUSE_RADIUS = 130;
const FOLLOW_FORCE = 0.005;
const ORBIT_FORCE  = 0.004;

const FRICTION = 0.978;
const MASS = 0.9;

const COUNT = 120;
const LINK_DIST = 150;

const INIT_SPEED = 0.12;

/* ================= Mouse ================= */

const mouse = { x: 0, y: 0, active: false };

document.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});
document.addEventListener("mouseleave", () => mouse.active = false);
window.addEventListener("blur", () => mouse.active = false);

/* ================= Particles ================= */

const particles = Array.from({ length: COUNT }, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  vx: (Math.random() - 0.5) * INIT_SPEED,
  vy: (Math.random() - 0.5) * INIT_SPEED,
  angle: Math.random() * Math.PI * 2
}));

/* ================= Animation ================= */

function animate() {
  ctx.clearRect(0, 0, w, h);

  for (let i = 0; i < COUNT; i++) {
    const p = particles[i];

    /* ===== FLOW BASED IDLE ===== */
    p.angle += (Math.random() - 0.5) * IDLE_NOISE;
    p.vx += Math.cos(p.angle) * IDLE_FLOW_SPEED;
    p.vy += Math.sin(p.angle) * IDLE_FLOW_SPEED;

    /* ===== MOUSE INFLUENCE ===== */
    if (mouse.active) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < MOUSE_RADIUS) {
        const f = 1 - dist / MOUSE_RADIUS;

        p.vx += dx * FOLLOW_FORCE * f;
        p.vy += dy * FOLLOW_FORCE * f;

        p.vx += -dy * ORBIT_FORCE * f;
        p.vy +=  dx * ORBIT_FORCE * f;
      }
    }

    /* ===== PHYSICS ===== */
    p.vx *= FRICTION * MASS;
    p.vy *= FRICTION * MASS;

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;

    /* ===== CONNECTIONS ===== */
    for (let j = i + 1; j < COUNT; j++) {
      const q = particles[j];
      const d = Math.hypot(p.x - q.x, p.y - q.y);

      if (d < LINK_DIST) {
        const a = 1 - d / LINK_DIST;

        ctx.strokeStyle = `rgba(120,170,255,${a * 0.55})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

animate();
