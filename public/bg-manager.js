// bg-manager.js
// Lightweight background manager — injects a canvas and runs a per-page animation.
// Usage: include as a module: <script type="module" src="bg-manager.js" defer></script>

const opts = {
  // tweak global animation settings here
  fps: 60
};

function createCanvas() {
  const canvas = document.createElement('canvas');
  canvas.className = 'page-bg-canvas';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '-100';
  canvas.style.pointerEvents = 'none';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  document.body.prepend(canvas);
  return canvas;
}

function getPageId() {
  // Prefer explicit data-page attribute, fallback to pathname
  const el = document.body;
  return el.dataset.page || (location.pathname.split('/').pop() || 'index').replace('.html','') || 'index';
}

// Utilities
function resizeCanvasToDisplaySize(canvas) {
  const width = Math.floor(window.innerWidth * devicePixelRatio);
  const height = Math.floor(window.innerHeight * devicePixelRatio);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
  }
}

// Basic animated patterns
function startParticles(ctx, canvas, config={}) {
  const particles = [];
  const count = Math.max(30, Math.floor((canvas.width / devicePixelRatio) / 30));
  for (let i=0;i<count;i++) {
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      vx: (Math.random()-0.5)*0.5,
      vy: (Math.random()-0.5)*0.5,
      r: (Math.random()*2 + 1) * devicePixelRatio,
    });
  }

  function draw() {
    resizeCanvasToDisplaySize(canvas);
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);

    // subtle gradient background
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0, config.bgStart || 'rgba(250,252,255,1)');
    g.addColorStop(1, config.bgEnd || 'rgba(240,249,245,1)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(p => {
      p.x += p.vx * (devicePixelRatio);
      p.y += p.vy * (devicePixelRatio);
      if (p.x < -50*devicePixelRatio) p.x = w + 50*devicePixelRatio;
      if (p.x > w + 50*devicePixelRatio) p.x = -50*devicePixelRatio;
      if (p.y < -50*devicePixelRatio) p.y = h + 50*devicePixelRatio;
      if (p.y > h + 50*devicePixelRatio) p.y = -50*devicePixelRatio;

      ctx.beginPath();
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
      grd.addColorStop(0, config.pColor || 'rgba(5,173,41,0.12)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.arc(p.x, p.y, p.r*6, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  let raf;
  function loop() {
    draw();
    raf = requestAnimationFrame(loop);
  }
  loop();
  return () => cancelAnimationFrame(raf);
}

function startWaves(ctx, canvas, config={}) {
  let t = 0;
  function draw() {
    resizeCanvasToDisplaySize(canvas);
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);

    // background
    ctx.fillStyle = config.bg || 'rgba(245,250,250,1)';
    ctx.fillRect(0,0,w,h);

    ctx.lineWidth = 2 * devicePixelRatio;
    for (let i=0;i<4;i++) {
      const amp = 20*devicePixelRatio*(i+1);
      const freq = 0.0009*(i+1);
      ctx.beginPath();
      for (let x=0;x<w;x+=10*devicePixelRatio) {
        const y = h/2 + Math.sin((x + t*70)*(freq)) * amp * Math.sin(t*0.0008 + i);
        if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      const alpha = 0.08 + i*0.03;
      ctx.strokeStyle = config.color || `rgba(5,173,41,${alpha})`;
      ctx.stroke();
    }

    t += 1;
  }

  let raf;
  function loop() { draw(); raf = requestAnimationFrame(loop); }
  loop();
  return () => cancelAnimationFrame(raf);
}

function startGrid(ctx, canvas, config={}) {
  function draw() {
    resizeCanvasToDisplaySize(canvas);
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = config.bg || 'rgba(255,255,255,1)';
    ctx.fillRect(0,0,w,h);

    const gap = 120*devicePixelRatio;
    ctx.strokeStyle = 'rgba(6,95,70,0.04)';
    ctx.lineWidth = 1*devicePixelRatio;
    for (let x=0;x<w;x+=gap) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
    }
    for (let y=0;y<h;y+=gap) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
    }

    // soft vignette
    const g = ctx.createRadialGradient(w/2,h/2, Math.min(w,h)/4, w/2,h/2, Math.max(w,h));
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.03)');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  }
  let raf;
  function loop() { draw(); raf = requestAnimationFrame(loop); }
  loop();
  return () => cancelAnimationFrame(raf);
}

// Map page id -> starter
const pageMap = {
  'index': (ctx, canvas) => startParticles(ctx, canvas, { bgStart: 'rgba(250,252,255,1)', bgEnd: 'rgba(240,249,245,1)', pColor: 'rgba(5,173,41,0.12)'}),
  'resources': (ctx, canvas) => startGrid(ctx, canvas, { bg: 'rgba(249,251,250,1)'}),
  'auth': (ctx, canvas) => startWaves(ctx, canvas, { bg: 'rgba(10,5,40,1)', color: 'rgba(80,216,120,0.12)'}),
  'jobs': (ctx, canvas) => startGrid(ctx, canvas, { bg: 'rgba(255,255,255,1)'}),
  'companies': (ctx, canvas) => startParticles(ctx, canvas, { pColor: 'rgba(6,110,255,0.08)', bgStart: 'rgba(250,252,255,1)', bgEnd: 'rgba(240,249,255,1)'}),
};

// Fallback animation
function startDefault(ctx, canvas) {
  return startParticles(ctx, canvas, {});
}

// Initialize
export default function initBackground() {
  if (!document.body) return;
  const canvas = createCanvas();
  const ctx = canvas.getContext('2d');

  let stopFn = null;
  function startForPage() {
    if (stopFn) stopFn();
    const pageId = getPageId().toLowerCase();
    const starter = pageMap[pageId] || startDefault;
    stopFn = starter(ctx, canvas) || null;
  }

  startForPage();
  window.addEventListener('resize', () => { resizeCanvasToDisplaySize(canvas); });

  // observe changes to data-page so SPA-like navigation can switch background
  const mo = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.attributeName === 'data-page') startForPage();
    }
  });
  mo.observe(document.body, { attributes: true });

  return { canvas, stop: () => { if (stopFn) stopFn(); mo.disconnect(); } };
}
