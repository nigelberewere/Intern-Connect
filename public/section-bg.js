// section-bg.js
// Injects a canvas background for each section with a `data-bg` attribute.
// Supports lightweight animated patterns per section type.

function createSectionCanvas(section) {
  const canvas = document.createElement('canvas');
  canvas.className = 'section-bg-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  // place above the section background but below content; CSS rules expect z-index >= 0
  canvas.style.zIndex = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  // don't rely on blend modes; use normal blend and stronger colors so patterns are visible
  canvas.style.mixBlendMode = 'normal';
  canvas.style.borderRadius = getComputedStyle(section).borderRadius || '0';
  section.style.position = section.style.position || 'relative';
  section.prepend(canvas);
  // initialize size immediately so patterns draw at correct resolution
  try { resizeCanvas(canvas, section); } catch (e) { /* ignore if resize not available yet */ }
  return canvas;
}

function resizeCanvas(canvas, section) {
  const rect = section.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width * devicePixelRatio));
  const h = Math.max(1, Math.floor(rect.height * devicePixelRatio));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w; canvas.height = h;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  }
}

function startHero(ctx, canvas, section) {
  let t = 0;
  // ensure correct initial size
  resizeCanvas(canvas, section);

  function draw() {
    resizeCanvas(canvas, section);
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);

    // soft radial gradient that slowly shifts
    const grd = ctx.createLinearGradient(0,0,w,h);
    grd.addColorStop(0, 'rgba(5,173,41,0.22)');
    grd.addColorStop(1, 'rgba(80,216,120,0.12)');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,w,h);

    // moving light band
    ctx.globalCompositeOperation = 'lighter';
    for (let i=0;i<3;i++){
      const x = (Math.sin(t*0.002 + i) * 0.5 + 0.5) * w;
      const r = Math.max(w,h) * 0.12;
      const g = ctx.createRadialGradient(x, h*0.4, 0, x, h*0.4, r);
      g.addColorStop(0, 'rgba(255,255,255,0.28)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, h*0.4, r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    t++;
  }
  let raf;
  (function loop(){ draw(); raf = requestAnimationFrame(loop); })();
  return () => cancelAnimationFrame(raf);
}

function startMission(ctx, canvas, section) {
  // floating soft circles
  const circles = [];
  // ensure canvas sized before computing count
  resizeCanvas(canvas, section);
  const count = Math.max(8, Math.round((canvas.width/devicePixelRatio)/100));
  for (let i=0;i<count;i++) {
    circles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: (20 + Math.random()*60)*devicePixelRatio,
      vx: (Math.random()-0.5)*0.3,
      vy: (Math.random()-0.5)*0.3,
      a: 0.16 + Math.random()*0.28,
        });
  }

  function draw() {
    resizeCanvas(canvas, section);
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    // subtle translucent wash so highlights show on light sections
    ctx.fillStyle = 'rgba(245,255,249,0.96)';
    ctx.fillRect(0,0,w,h);
    ctx.globalCompositeOperation = 'lighter';
    circles.forEach(c => {
      c.x += c.vx*devicePixelRatio; c.y += c.vy*devicePixelRatio;
      if (c.x < -c.r) c.x = w + c.r; if (c.x > w + c.r) c.x = -c.r;
      if (c.y < -c.r) c.y = h + c.r; if (c.y > h + c.r) c.y = -c.r;
      const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
      g.addColorStop(0, `rgba(5,173,41,${c.a})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  let raf;
  (function loop(){ draw(); raf = requestAnimationFrame(loop); })();
  return () => cancelAnimationFrame(raf);
}

function startTeam(ctx, canvas, section) {
  // diagonal stripes with gentle parallax
  let t = 0;
  // ensure correct initial size
  resizeCanvas(canvas, section);
  function draw() {
    resizeCanvas(canvas, section);
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    // keep background slightly tinted so stripes are visible
    ctx.fillStyle = 'rgba(252,255,252,0.98)'; ctx.fillRect(0,0,w,h);
    ctx.save();
    ctx.translate(0, (Math.sin(t*0.001))*30*devicePixelRatio);
    const stripeW = 80*devicePixelRatio;
    ctx.globalAlpha = 0.18;
    for (let x=-w; x<w*2; x+=stripeW*2) {
      ctx.fillStyle = 'rgba(5,173,41,0.08)';
      ctx.beginPath();
      ctx.moveTo(x + Math.sin(t*0.0007 + x)*20, 0);
      ctx.lineTo(x + stripeW + Math.sin(t*0.0007 + x + 100)*30, 0);
      ctx.lineTo(x + stripeW*2, h);
      ctx.lineTo(x, h);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    t++;
  }
  let raf; (function loop(){ draw(); raf = requestAnimationFrame(loop); })();
  return () => cancelAnimationFrame(raf);
}

const runners = new WeakMap();

function initSectionBackgrounds() {
  const sections = Array.from(document.querySelectorAll('section[data-bg]'));
  if (!sections.length) return;

  sections.forEach(section => {
    // ensure section has relative positioning
    const computed = getComputedStyle(section);
    if (computed.position === 'static') section.style.position = 'relative';
    const canvas = createSectionCanvas(section);
    const ctx = canvas.getContext('2d');
    const type = (section.dataset.bg || '').toLowerCase();
    let stop = null;
    if (type === 'hero') stop = startHero(ctx, canvas, section);
    else if (type === 'mission') stop = startMission(ctx, canvas, section);
    else if (type === 'team') stop = startTeam(ctx, canvas, section);
    else stop = () => {};
    runners.set(canvas, stop);

    // Resize observer for section
    const ro = new ResizeObserver(() => {
      resizeCanvas(canvas, section);
    });
    ro.observe(section);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSectionBackgrounds);
} else {
  initSectionBackgrounds();
}

export { initSectionBackgrounds };
