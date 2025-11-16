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
    return true;
  }
  return false;
}

// Basic animated patterns
function startParticles(ctx, canvas, config={}) {
  // initialize size and particle set
  resizeCanvasToDisplaySize(canvas);
  const particles = [];
  const approxCount = Math.floor((canvas.width / devicePixelRatio) / 30);
  const count = Math.max(24, Math.min(80, approxCount));
  for (let i=0;i<count;i++) {
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      vx: (Math.random()-0.5)*0.35,
      vy: (Math.random()-0.5)*0.35,
      r: (Math.random()*1.6 + 0.8) * devicePixelRatio,
    });
  }

  // update/draw uses simpler fills to avoid creating gradients per-particle
  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);

    // subtle gradient background
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0, config.bgStart || 'rgba(250,252,255,1)');
    g.addColorStop(1, config.bgEnd || 'rgba(240,249,245,1)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    ctx.globalCompositeOperation = 'lighter';
    ctx.save();
    for (let p of particles) {
      p.x += p.vx * (devicePixelRatio);
      p.y += p.vy * (devicePixelRatio);
      if (p.x < -60) p.x = w + 60;
      if (p.x > w + 60) p.x = -60;
      if (p.y < -60) p.y = h + 60;
      if (p.y > h + 60) p.y = -60;

      ctx.beginPath();
      ctx.fillStyle = config.pColor || 'rgba(5,173,41,0.12)';
      ctx.globalAlpha = Math.min(0.9, 0.2 + (p.r / (4*devicePixelRatio)));
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }

  let raf;
  let running = true;

  function loop() {
    if (!running) return;
    draw();
    raf = requestAnimationFrame(loop);
  }

  // handle resize by reinitializing particles when size changes
  function onResize() {
    const changed = resizeCanvasToDisplaySize(canvas);
    if (changed) {
      // reposition particles proportionally
      const w = canvas.width, h = canvas.height;
      for (let p of particles) {
        p.x = Math.random()*w;
        p.y = Math.random()*h;
      }
    }
  }
  window.addEventListener('resize', onResize, {passive: true});

  loop();
  return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
}

function startWaves(ctx, canvas, config={}) {
  // Use time-based animation (ms -> scaled) so speed is independent of RAF frequency
  let t = 0; // logical time (matches previous "t" increments at ~60 units/sec)
  let last = 0;
  // initialize canvas size once
  resizeCanvasToDisplaySize(canvas);
  const step = Math.max(8, Math.round(10 * devicePixelRatio));

  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);

    // background
    ctx.fillStyle = config.bg || 'rgba(245,250,250,1)';
    ctx.fillRect(0,0,w,h);

    ctx.lineWidth = Math.max(1, 2 * devicePixelRatio);
    for (let i=0;i<4;i++) {
      const amp = 20 * devicePixelRatio * (i+1);
      const freq = 0.0009 * (i+1);
      ctx.beginPath();
      for (let x=0;x<=w;x+=step) {
        // use the time-based t for phase; this matches the old behavior when t increased by ~1 per frame
        const y = h/2 + Math.sin((x + t*70) * (freq)) * amp * Math.sin(t*0.0008 + i);
        if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      const alpha = 0.08 + i*0.03;
      ctx.strokeStyle = config.color || `rgba(5,173,41,${alpha})`;
      ctx.stroke();
    }
  }

  let raf;
  let running = true;
  function loop(ts) {
    if (!running) return;
    if (!last) last = ts;
    const delta = ts - last; // ms
    last = ts;
    // scale delta so t grows ~60 units per second (like previous frame-based code)
    t += delta * 0.06;
    draw();
    raf = requestAnimationFrame(loop);
  }

  function onResize() { resizeCanvasToDisplaySize(canvas); }
  window.addEventListener('resize', onResize, {passive: true});
  raf = requestAnimationFrame(loop);
  return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
}

function startGrid(ctx, canvas, config={}) {
  // initialize once
  resizeCanvasToDisplaySize(canvas);
  const gap = Math.max(80, Math.round(120 * devicePixelRatio));
  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = config.bg || 'rgba(255,255,255,1)';
    ctx.fillRect(0,0,w,h);

    ctx.strokeStyle = 'rgba(6,95,70,0.04)';
    ctx.lineWidth = Math.max(1, 1 * devicePixelRatio);
    for (let x=0;x<w;x+=gap) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y=0;y<h;y+=gap) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

    // soft vignette
    const g = ctx.createRadialGradient(w/2,h/2, Math.min(w,h)/4, w/2,h/2, Math.max(w,h));
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.03)');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  }

  let raf; let running = true;
  function loop() { if (!running) return; draw(); raf = requestAnimationFrame(loop); }
  function onResize() { resizeCanvasToDisplaySize(canvas); }
  window.addEventListener('resize', onResize, {passive: true});
  loop();
  return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
}

// Dedicated, optimized auth background
function startAuth(ctx, canvas, config = {}) {
  resizeCanvasToDisplaySize(canvas);
  let w = canvas.width, h = canvas.height;
  let last = 0;
  let t = 0;
  const dpr = devicePixelRatio || 1;
  // detect low-end devices and avoid heavy animation
  const lowEnd = (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);

  function drawStaticBackground() {
    // draw a simple dark green gradient as fallback
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#04120a');
    bg.addColorStop(1, '#00120a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }

  if (lowEnd) {
    // if low-end, render a static background once and return a simple cleanup
    drawStaticBackground();
    function onResizeLow() {
      const changed = resizeCanvasToDisplaySize(canvas);
      if (changed) { w = canvas.width; h = canvas.height; drawStaticBackground(); }
    }
    window.addEventListener('resize', onResizeLow, {passive: true});
    return () => { window.removeEventListener('resize', onResizeLow); };
  }
  // Build a dotted mesh (grid) that displaces with layered waves to emulate the image
  // Mesh resolution adapts to viewport and devicePixelRatio for performance
  const mesh = {
    cols: 0,
    rows: 0,
    points: []
  };

  function initMesh() {
    mesh.points.length = 0;
    const dpr = devicePixelRatio || 1;
    // increase base cell so fewer points; cap lower for better perf
    const cell = Math.max(60, Math.round(80 * dpr)); // spacing between mesh points (coarser)
    mesh.cols = Math.max(4, Math.floor(w / cell));
    mesh.rows = Math.max(4, Math.floor(h / cell));
    // cap total points for performance (aggressively lowered)
    const maxPoints = 800;
    if (mesh.cols * mesh.rows > maxPoints) {
      const scale = Math.sqrt((mesh.cols * mesh.rows) / maxPoints);
      mesh.cols = Math.max(6, Math.round(mesh.cols / scale));
      mesh.rows = Math.max(5, Math.round(mesh.rows / scale));
    }

    for (let r = 0; r < mesh.rows; r++) {
      for (let c = 0; c < mesh.cols; c++) {
        const bx = (c + 0.5) * (w / mesh.cols);
        const by = (r + 0.5) * (h / mesh.rows);
        mesh.points.push({
          bx, by,
          x: bx, y: by,
          ox: (Math.random() - 0.5) * 6 * dpr,
          oy: (Math.random() - 0.5) * 6 * dpr,
          size: (Math.random() * 1.2 + 0.6) * dpr,
          hue: 140 + (Math.random() - 0.5) * 30 // centered on green hue
        });
      }
    }
  }

  function handleResize() {
    const changed = resizeCanvasToDisplaySize(canvas);
    if (changed) {
      w = canvas.width; h = canvas.height;
      initMesh();
    }
  }

  initMesh();

  function drawMesh(timeT) {
    // background gradient using theme greens (darker)
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#04120a');
    bg.addColorStop(0.35, '#052415');
    bg.addColorStop(1, '#00120a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // dynamic horizontal waves (cheap, sampled) — user requested speed ~0.5
    try {
      const hwaves = config.hwaves || 5;
      const hwStep = Math.max(20, Math.round(28 * dpr));
      // keep config.hSpeed as a user-facing control but scale it down for calmer motion
      const hwSpeed = (config.hSpeed !== undefined) ? config.hSpeed : 0.5;
      const hwSpeedScale = 0.12; // scale factor to slow perceived fluctuation
      const hwSpeedEff = hwSpeed * hwSpeedScale;
      for (let k = 0; k < hwaves; k++) {
        const hue = 140 + (k * 8);
        // reduced amplitude so waves appear calmer
        const amp = (6 + k * 3) * dpr;
        const freq = 0.0009 + k * 0.00025;
        const baseY = h * (0.18 + k * 0.12);
        ctx.beginPath();
        for (let x = 0; x <= w; x += hwStep) {
          // use the scaled effective speed so a config of 0.5 yields a slow motion
          const y = baseY + Math.sin(x * freq + timeT * hwSpeedEff) * amp;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${hue},78%,60%,${0.06 - k*0.008})`;
        // make horizontal waves visually thicker while respecting DPR
        ctx.lineWidth = Math.max(2, 2.4 * dpr);
        ctx.stroke();
      }
    } catch (e) {
      // safeguard — continue if any rendering error
    }

    // layered soft glow waves (reduced width for perf)
    // use source-over to avoid expensive additive blending on low-powered devices
    ctx.globalCompositeOperation = 'source-over';
    const broad = [ {h:140, s:75, l:30, a:0.03, amp: 0.9, speed:0.05}, {h:170, s:75, l:45, a:0.025, amp:0.6, speed:0.05} ];
    for (let b of broad) {
      ctx.beginPath();
      const step = Math.max(28, Math.round(36 * devicePixelRatio));
      const baseY = h * 0.5 + (b.amp * 40 * devicePixelRatio);
      for (let x = 0; x <= w; x += step) {
        const phase = x * 0.0009 + timeT * b.speed;
        const y = baseY + Math.sin(phase) * (30 * b.amp * devicePixelRatio);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `hsla(${b.h},${b.s}%,${b.l}%,${b.a})`;
      ctx.lineWidth = Math.max(8, 10 * devicePixelRatio);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';

    // draw mesh dots and connecting lines
    const pts = mesh.points;
    const cols = mesh.cols;
    const rows = mesh.rows;
    const connAlphaBase = 0.12;
    const connMax = 2; // only draw to right and down to avoid duplicate lines
    const threshSq = Math.pow(cellSize(), 2);

    ctx.save();
    ctx.translate(0, 0);
    // avoid additive blending for lines/dots to reduce GPU cost
    ctx.globalCompositeOperation = 'source-over';

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      // wave displacement: combine x/y based sin waves + small noise offsets
      const nx = Math.sin((p.bx * 0.0012) + timeT * 0.0009) * (18 * devicePixelRatio);
      const ny = Math.cos((p.by * 0.0015) + timeT * 0.0011) * (18 * devicePixelRatio);
      // layered vertical bias so surface flows left->right
      const flow = Math.sin((p.bx + p.by) * 0.0007 + timeT * 0.0008) * (10 * devicePixelRatio);
      p.x = p.bx + p.ox + nx + flow;
      p.y = p.by + p.oy + ny;

      // color: use hue + slight shift by row for gradient
      const hue = (p.hue + (p.by / h) * 20 + (timeT * 0.002)) % 360;
      const alpha = 0.6;

      // dot (minimal shadow for perf) — increased radius for better visibility
      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue},85%,55%,${alpha * 0.85})`;
      ctx.shadowBlur = 0;
      // use a slightly larger minimum radius scaled by DPR, and modestly scale point size
      ctx.arc(p.x, p.y, Math.max(1.6 * dpr, p.size * 1.4), 0, Math.PI * 2);
      ctx.fill();

      // connect to right neighbor and down neighbor (if exist)
      const col = i % cols;
      const row = Math.floor(i / cols);
      if (col < cols - 1) {
        const q = pts[i + 1];
        const dx = p.x - q.x; const dy = p.y - q.y;
        const dsq = dx*dx + dy*dy;
        if (dsq < threshSq) {
          const a = Math.max(0, connAlphaBase * (1 - (dsq / threshSq)));
          if (a > 0.01) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${hue},80%,55%,${a * 0.9})`;
            // thicker connecting lines for readability; scale with DPR
            ctx.lineWidth = Math.max(0.6, 1.0 * dpr * (1 - (dsq / threshSq)));
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      if (row < rows - 1) {
        const q = pts[i + cols];
        const dx = p.x - q.x; const dy = p.y - q.y;
        const dsq = dx*dx + dy*dy;
        if (dsq < threshSq) {
          const a = Math.max(0, connAlphaBase * (1 - (dsq / threshSq)));
          if (a > 0.01) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${hue},80%,55%,${a * 0.85})`;
            // thicker connecting lines for readability; scale with DPR
            ctx.lineWidth = Math.max(0.6, 1.0 * dpr * (1 - (dsq / threshSq)));
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
    }

    ctx.restore();
  }

  function cellSize() {
    // approximate visual spacing used in initMesh (kept consistent)
    return Math.max(30, Math.round(40 * devicePixelRatio));
  }

  let raf;
  let running = true;

  // throttle drawing to ~25 FPS to reduce CPU/GPU load and pause when tab hidden
  let acc = 0;
  const FRAME_MS = 1000 / 25; // ~25 fps target
  function frame(ts) {
    if (!running) return;
    if (document.hidden) {
      // when backgrounded, avoid heavy work — keep scheduling RAF but do nothing
      raf = requestAnimationFrame(frame);
      return;
    }
    if (!last) last = ts;
    const delta = ts - last;
    last = ts;
    acc += delta;
    if (acc < FRAME_MS) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const use = acc;
    acc = 0;
    t += use * 0.04; // advance logical time scaled by elapsed

    drawMesh(t);

    raf = requestAnimationFrame(frame);
  }

  window.addEventListener('resize', handleResize, {passive: true});
  raf = requestAnimationFrame(frame);

  return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', handleResize); };
}

// Map page id -> starter
const pageMap = {
  'index': (ctx, canvas) => startParticles(ctx, canvas, { bgStart: 'rgba(250,252,255,1)', bgEnd: 'rgba(240,249,245,1)', pColor: 'rgba(5,173,41,0.12)'}),
  'resources': (ctx, canvas) => startGrid(ctx, canvas, { bg: 'rgba(249,251,250,1)'}),
  // Use a dedicated, optimized auth background for smooth, theme-aligned visuals
  'auth': (ctx, canvas) => startAuth(ctx, canvas, { bg: 'rgba(5,10,6,1)' , accents: [{c:'rgba(80,216,120,0.12)', amp:1.0, speed:1.0, phase:0},{c:'rgba(5,173,41,0.10)', amp:0.6, speed:0.35}] }),
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
