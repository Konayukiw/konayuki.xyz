(function () {
  const canvas = document.getElementById("snow");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let w = 0, h = 0, flakes = [], raf = null, last = 0, enabled = true;

  const sprite = (function () {
    const size = 64;
    const s = document.createElement("canvas");
    s.width = s.height = size;
    const sc = s.getContext("2d");
    const g = sc.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,.95)");
    g.addColorStop(.4, "rgba(228,244,255,.65)");
    g.addColorStop(1, "rgba(200,230,255,0)");
    sc.fillStyle = g;
    sc.beginPath();
    sc.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    sc.fill();
    return s;
  })();

  function snow(spread) {
    const r = 0.9 + Math.random() * 2.4;
    return {
      x: Math.random() * w,
      y: spread ? Math.random() * h : -r * 5,
      r: r,
      vy: 14 + r * 9 + Math.random() * 18,
      sway: 6 + Math.random() * 16,
      phase: Math.random() * Math.PI * 2,
      freq: 0.4 + Math.random() * 0.8,
      alpha: 0.35 + Math.random() * 0.55
    };
  }

  function build() {
    const count = Math.max(36, Math.min(150, Math.round((w * h) / 20000)));
    flakes = [];
    for (let i = 0; i < count; i++) flakes.push(snow(true));
  }

  function draw(dt) {
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      if (dt > 0) {
        f.y += f.vy * dt;
        f.x += Math.sin(f.phase + f.y * 0.01 * f.freq) * f.sway * dt;
        if (f.y - f.r * 5 > h) Object.assign(f, snow(false));
        if (f.x < -30) f.x = w + 30;
        else if (f.x > w + 30) f.x = -30;
      }
      const size = f.r * 5;
      ctx.globalAlpha = f.alpha;
      ctx.drawImage(sprite, f.x - size / 2, f.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  }

  function step(t) {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    draw(dt);
    raf = requestAnimationFrame(step);
  }

  function start() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    if (!enabled) return;
    if (reduced.matches) {
      draw(0);
      return;
    }
    last = performance.now();
    raf = requestAnimationFrame(step);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  resize();
  start();

  let rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); start(); }, 150);
  });
  if (reduced.addEventListener) reduced.addEventListener("change", start);

  window.snowfall = {
    get enabled() { return enabled; },
    set(value) {
      enabled = !!value;
      if (enabled) {
        resize();
        start();
      } else {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        ctx.clearRect(0, 0, w, h);
      }
      return enabled;
    },
    toggle() { return this.set(!enabled); }
  };
})();

const el = document.getElementById("clock");
function tick() {
  if (!el) return;
  const d = new Date();
  el.textContent = d.toLocaleString("ja-JP", { hour12: false });
}
tick(); setInterval(tick, 1000);
