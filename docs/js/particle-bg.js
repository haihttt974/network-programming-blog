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
canvas.style.background = "#f8fbfd";  // Nền nhạt hơn

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

/* ================= CẤU HÌNH ================= */
const SETTINGS = {
    count: 140,
    linkDist: 140,                 // Tăng nhẹ để nối nhiều hơn khi tụ
    nodeColor: "rgba(100, 160, 220, 0.25)",  // Hạt nhạt hơn
    lineColor: "120, 160, 200",    // Đường nối nhạt
    
    mouseRadius: 150,              // Phạm vi hút
    orbitRadius: 80,               // Bán kính vòng tròn tụ (như quả cầu điện)
    magnetForce: 0.0008,           // Lực hút nhẹ hơn
    repelForce: 0.0012,            // Lực đẩy lẫn nhau để giữ hình tròn
    friction: 0.96,                // Ma sát thấp hơn → di chuyển chậm, mềm mại
    defaultSpeed: 0.4,             // Tốc độ trôi tự nhiên chậm hơn
    randomness: 0.1,               // Nhiễu nhẹ
    maxAttracted: 60               // Nhiều hạt hơn để tạo vòng tròn đầy đặn
};

const mouse = { x: -1000, y: -1000, active: false };

document.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
});
document.addEventListener("mouseleave", () => {
    mouse.active = false;
    attractedParticles = [];
});

let attractedParticles = [];

/* ================= Particle ================= */
class Particle {
    constructor() {
        this.init();
        this.attracted = false;
    }

    init() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * SETTINGS.defaultSpeed;
        this.vy = Math.sin(angle) * SETTINGS.defaultSpeed;
        this.radius = Math.random() * 1 + 0.8;
    }

    update() {
        let ax = 0, ay = 0;

        // Duy trì tốc độ tối thiểu nhẹ nhàng
        const speed = Math.hypot(this.vx, this.vy);
        if (speed < SETTINGS.defaultSpeed && !this.attracted) {
            ax += (this.vx / (speed || 1)) * 0.01;
            ay += (this.vy / (speed || 1)) * 0.01;
        }

        if (mouse.active) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < SETTINGS.mouseRadius) {
                // Thêm vào danh sách hút nếu còn chỗ
                if (!this.attracted && attractedParticles.length < SETTINGS.maxAttracted) {
                    this.attracted = true;
                    attractedParticles.push(this);
                }

                if (this.attracted) {
                    // Lực hút nhẹ về chuột
                    const attractPower = (1 - dist / SETTINGS.mouseRadius) * SETTINGS.magnetForce;
                    ax += (dx / (dist || 1)) * attractPower;
                    ay += (dy / (dist || 1)) * attractPower;
                }
            } else if (this.attracted) {
                // Ra khỏi phạm vi → thả ra
                this.attracted = false;
                attractedParticles = attractedParticles.filter(p => p !== this);
            }
        } else if (this.attracted) {
            this.attracted = false;
            attractedParticles = [];
        }

        // Lực đẩy lẫn nhau giữa các hạt bị hút → tạo hình tròn đẹp
        if (this.attracted) {
            for (const other of attractedParticles) {
                if (other !== this) {
                    const dx = this.x - other.x;
                    const dy = this.y - other.y;
                    const d = Math.hypot(dx, dy);
                    if (d < SETTINGS.orbitRadius && d > 0) {
                        const force = (SETTINGS.orbitRadius - d) / SETTINGS.orbitRadius * SETTINGS.repelForce;
                        ax += (dx / d) * force;
                        ay += (dy / d) * force;
                    }
                }
            }
        }

        // Nhiễu tự nhiên
        ax += (Math.random() - 0.5) * SETTINGS.randomness;
        ay += (Math.random() - 0.5) * SETTINGS.randomness;

        // Áp dụng gia tốc
        this.vx += ax;
        this.vy += ay;

        // Ma sát → mềm mại, chậm rãi
        this.vx *= SETTINGS.friction;
        this.vy *= SETTINGS.friction;

        this.x += this.vx;
        this.y += this.vy;

        // Va chạm biên nhẹ nhàng
        if (this.x < 0) { this.x = 0; this.vx *= -0.8; }
        if (this.x > w) { this.x = w; this.vx *= -0.8; }
        if (this.y < 0) { this.y = 0; this.vy *= -0.8; }
        if (this.y > h) { this.y = h; this.vy *= -0.8; }

        // Quản lý số lượng hạt hút (FIFO - thả hạt cũ khi quá giới hạn)
        if (attractedParticles.length > SETTINGS.maxAttracted) {
            const oldest = attractedParticles.shift();
            oldest.attracted = false;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = SETTINGS.nodeColor;
        ctx.fill();
    }
}

const particles = Array.from({ length: SETTINGS.count }, () => new Particle());

/* ================= Animate ================= */
function animate() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < SETTINGS.count; i++) {
        const p = particles[i];
        p.update();
        p.draw();

        for (let j = i + 1; j < SETTINGS.count; j++) {
            const q = particles[j];
            const d = Math.hypot(p.x - q.x, p.y - q.y);

            if (d < SETTINGS.linkDist) {
                const alpha = (1 - d / SETTINGS.linkDist) * 0.3;  // Đường nối nhạt hơn
                ctx.strokeStyle = `rgba(${SETTINGS.lineColor}, ${alpha})`;
                ctx.lineWidth = 0.6;
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