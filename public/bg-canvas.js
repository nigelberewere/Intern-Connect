(function () {
    // Lightweight animated background: colorful wavy lines + moving dots
    const canvas = document.getElementById('auth-bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = 0, h = 0, dpr = 1;
    const lines = [
        // teal / cyan / green-blue palette
        {color: 'rgba(5,173,41,0.36)', amplitude: 46, speed: 0.6, frequency: 0.008, phase: 0},
        {color: 'rgba(56,189,248,0.30)', amplitude: 76, speed: 0.45, frequency: 0.006, phase: Math.PI / 2},
        {color: 'rgba(16,185,129,0.26)', amplitude: 116, speed: 0.3, frequency: 0.004, phase: Math.PI},
    ];

    const dots = [];
    // dot count relative to viewport area but clamped for performance
    const DOT_COUNT = Math.max(32, Math.min(160, Math.round((window.innerWidth * window.innerHeight) / 30000)));

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function resize() {
        dpr = Math.max(1, window.devicePixelRatio || 1);
        w = canvas.clientWidth || window.innerWidth;
        h = canvas.clientHeight || window.innerHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initDots() {
        dots.length = 0;
        for (let i = 0; i < DOT_COUNT; i++) {
                dots.push({
                    x: rand(0, w),
                    y: rand(0, h),
                    r: rand(1.6, 4.2),
                    vx: rand(-0.45, 0.45),
                    vy: rand(-0.45, 0.45),
                    hue: rand(190, 320),
                });
        }
    }

    let t0 = performance.now();

    function drawWaves(time) {
        lines.forEach((line, idx) => {
            ctx.beginPath();
            const yBase = h * (0.3 + idx * 0.22);
            ctx.moveTo(0, yBase);
            const phase = time * 0.001 * line.speed + line.phase;
            for (let x = 0; x <= w; x += 12) {
                const y = yBase + Math.sin((x * line.frequency) + phase) * line.amplitude;
                ctx.lineTo(x, y);
            }
            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, line.color);
            grad.addColorStop(0.5, 'rgba(255,255,255,0.12)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 3.5;
            ctx.stroke();
        });
    }

    function drawDots() {
        for (let i = 0; i < dots.length; i++) {
            const p = dots[i];
            ctx.beginPath();
            ctx.fillStyle = `hsla(${p.hue}, 92%, 60%, 0.98)`; // hue will be set into green/blue range below
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function updateDots(delta) {
        for (let p of dots) {
            p.x += p.vx * delta * 0.06;
            p.y += p.vy * delta * 0.06;
            if (p.x < -20) p.x = w + 20;
            if (p.x > w + 20) p.x = -20;
            if (p.y < -20) p.y = h + 20;
            if (p.y > h + 20) p.y = -20;
        }
    }

    function drawConnections() {
        const maxDist = 180;
        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const a = dots[i], b = dots[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    const alpha = 1 - (dist / maxDist);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(80,230,200,${0.28 * alpha})`;
                    ctx.lineWidth = 1.6 * alpha;
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
    }

    function frame(now) {
        const delta = now - t0;
        t0 = now;
        ctx.clearRect(0, 0, w, h);

        // subtle gradient background (dark teal -> deep blue)
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, '#001a17');
        g.addColorStop(1, '#042a3a');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        // composite lighter to enhance glow of overlapping colors
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawWaves(now);
        drawDots();
        drawConnections();
        ctx.restore();
        updateDots(delta);
        requestAnimationFrame(frame);
    }

    function start() {
        resize();
        initDots();
        t0 = performance.now();
        requestAnimationFrame(frame);
    }

    window.addEventListener('resize', () => {
        resize();
        initDots();
    }, {passive: true});

    // wait for DOM paint and start
    requestAnimationFrame(() => {
        // small delay to ensure canvas styles applied
        start();
    });
})();
