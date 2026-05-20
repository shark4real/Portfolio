/* ═══════════════════════════════════════════════════════════════
   ascii-fish.js  —  Embedded ASCII fish for portfolio landing
   Place this file in your portfolio ROOT (same folder as main.js)
═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── CONFIG ─────────────────────────────────────────────────
       framesFolder: path relative to the page (index.html)
       The page is at portfolio root, frames are at:
         frame_animation/ascii_out/1.txt … 192.txt
    ────────────────────────────────────────────────────────────── */
    const CFG = {
        framesFolder: 'frame_animation/ascii_out',
        firstFrame: 1,
        lastFrame: 192,
        frameExt: 'txt',
        fps: 12,
        rippleRadius: 90,
        rippleStrength: 8,
        bubbleCount: 30,
    };

    /* ── INJECT CSS ─────────────────────────────────────────────── */
    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'fish-styles';
        style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

    /* ───────────────────────────────────────────────────────────
        FISH LAYER
    ─────────────────────────────────────────────────────────── */
    #fish-layer {
        position: absolute;
        inset: 0;

        /* behind text, above bg */
        z-index: 1;

        overflow: hidden;
        pointer-events: none;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* The fish-stage-wrapper and stage have pointer-events: none,
       but the hover zone needs to be truly interactive */
    #fish-layer #fish-hover-zone {
        pointer-events: auto;
    }

    /* ───────────────────────────────────────────────────────────
        BUBBLES
    ─────────────────────────────────────────────────────────── */
    #fish-bubbles {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;

        pointer-events: none;

        opacity: 0.35;

        filter:
        blur(0.2px)
        brightness(1.2);
    }

    /* ───────────────────────────────────────────────────────────
        FISH WRAPPER
    ─────────────────────────────────────────────────────────── */
    .fish-stage-wrapper {
        position: absolute;

        top: 50%;
        left: 50%;

        transform: translate(-50%, -50%);

        display: inline-block;

        opacity: 0;

        animation:
        fishFadeIn 2s 0.5s ease forwards,
        fishFloat 8s ease-in-out infinite;

        pointer-events: none;

        will-change: transform;
    }

    @keyframes fishFadeIn {
        from {
        opacity: 0;
        transform:
            translate(-50%, -50%)
            scale(0.96);
        }

        to {
        opacity: 1;
        transform:
            translate(-50%, -50%)
            scale(1);
        }
    }

    @keyframes fishFloat {
        0% {
        transform:
            translate(-50%, -50%)
            translateY(0px);
        }

        50% {
        transform:
            translate(-50%, -50%)
            translateY(-12px);
        }

        100% {
        transform:
            translate(-50%, -50%)
            translateY(0px);
        }
    }

    /* ───────────────────────────────────────────────────────────
        ASCII FISH
    ─────────────────────────────────────────────────────────── */
    #fish-stage {
        font-family:
        'Share Tech Mono',
        'Courier New',
        monospace;

        font-size: clamp(9px, 1vw, 14px);

        line-height: 1.02;

        white-space: pre;

        letter-spacing: -0.35px;

        user-select: none;

        margin: 0;
        padding: 0;

        pointer-events: none;

        opacity: 0.96;

        /* MUCH MORE VISIBLE */
        color: rgba(255, 185, 70, 0.78);

        /* GLOW */
        text-shadow:
        0 0 4px rgba(255, 140, 0, 0.35),
        0 0 10px rgba(255, 120, 0, 0.22),
        0 0 22px rgba(255, 80, 0, 0.10);

        /* makes ascii brighter on dark bg */
        mix-blend-mode: screen;

        filter:
        contrast(1.18)
        brightness(1.08);

        transition:
        color 0.35s ease,
        text-shadow 0.35s ease,
        transform 0.2s ease,
        filter 0.3s ease;
    }

    /* ───────────────────────────────────────────────────────────
        HOVER STATE
    ─────────────────────────────────────────────────────────── */
    .fish-stage-wrapper.fish-hovered #fish-stage {
        color: rgba(255, 80, 190, 0.98);

        text-shadow:
        0 0 8px rgba(255, 0, 180, 0.75),
        0 0 18px rgba(255, 0, 220, 0.45),
        0 0 40px rgba(255, 0, 255, 0.22);

        filter:
        contrast(1.3)
        brightness(1.18);
    }

    /* ───────────────────────────────────────────────────────────
        THEME COLORS
    ─────────────────────────────────────────────────────────── */
    body.theme-light #fish-stage {
        color: rgba(255, 42, 166, 0.78);

        text-shadow:
        0 0 4px rgba(255, 42, 166, 0.36),
        0 0 12px rgba(255, 42, 166, 0.22),
        0 0 26px rgba(255, 42, 166, 0.12);

        mix-blend-mode: normal;
    }

    body.theme-light .fish-stage-wrapper.fish-hovered #fish-stage {
        color: rgba(255, 42, 170, 1);

        text-shadow:
        0 0 8px rgba(255, 42, 170, 0.65),
        0 0 20px rgba(255, 42, 170, 0.36),
        0 0 42px rgba(255, 42, 170, 0.18);
    }

    body.theme-dark #fish-stage {
        color: rgba(255, 180, 70, 0.85);

        text-shadow:
        0 0 6px rgba(255, 120, 0, 0.45),
        0 0 16px rgba(255, 140, 0, 0.25),
        0 0 30px rgba(255, 90, 0, 0.12);

        mix-blend-mode: screen;
    }

    body.theme-dark .fish-stage-wrapper.fish-hovered #fish-stage {
        color: rgba(255, 120, 220, 1);

        text-shadow:
        0 0 10px rgba(255, 0, 200, 0.85),
        0 0 24px rgba(255, 0, 255, 0.5),
        0 0 48px rgba(255, 0, 255, 0.25);
    }

    /* ───────────────────────────────────────────────────────────
        HOVER ZONE
    ─────────────────────────────────────────────────────────── */
    #fish-hover-zone {
        position: absolute;
        inset: 0;

        z-index: 260;

        cursor: none;

        pointer-events: auto;
    }

    /* ───────────────────────────────────────────────────────────
        RIPPLE CHARS
    ─────────────────────────────────────────────────────────── */
    .fish-char-ripple {
        display: inline-block;

        animation:
        fishCharPop 0.55s cubic-bezier(0.22,1,0.36,1) both;
    }

    @keyframes fishCharPop {
        0% {
        transform: translate(0, 0);
        }

        35% {
        transform:
            translate(var(--rx), var(--ry))
            scale(1.12);
        }

        65% {
        transform:
            translate(calc(var(--rx) * 0.4), calc(var(--ry) * 0.4))
            scale(1.04);
        }

        100% {
        transform: translate(0, 0);
        }
    }

    /* ───────────────────────────────────────────────────────────
        MOBILE
    ─────────────────────────────────────────────────────────── */
    @media (max-width: 768px) {
        #fish-layer {
        overflow: visible;
        }

        .fish-stage-wrapper {
        top: 50%;
        left: 40%;
        }

        #fish-stage {
        font-size: clamp(9px, 2.1vw, 11px);

        line-height: 1;

        letter-spacing: -0.2px;

        transform: scale(0.9);
        transform-origin: center;

        color: rgba(255, 170, 70, 0.55);

        opacity: 0.92;
        }

        body.theme-light #fish-stage {
        color: rgba(255, 42, 166, 0.72);
        }

        body.theme-dark #fish-stage {
        color: rgba(255, 180, 70, 0.65);
        }

        #fish-bubbles {
        opacity: 0.2;
        }
    }

    /* ───────────────────────────────────────────────────────────
        REDUCED MOTION
    ─────────────────────────────────────────────────────────── */
    @media (prefers-reduced-motion: reduce) {

        .fish-stage-wrapper {
        animation: none !important;
        opacity: 0.75;
        }

        .fish-char-ripple {
        animation: none !important;
        }
    }
`;
        document.head.appendChild(style);
    }

    /* ── BUILD DOM INSIDE #landing ──────────────────────────────── */
    function buildDOM() {
        const landing = document.getElementById('landing');
        if (!landing) {
            console.error('[ascii-fish] #landing element not found.');
            return null;
        }

        // Ensure #landing is a positioned container
        const cs = getComputedStyle(landing);
        if (cs.position === 'static') landing.style.position = 'relative';

        const layer = document.createElement('div');
        layer.id = 'fish-layer';
        layer.innerHTML = `
      <canvas id="fish-bubbles"></canvas>
      <div class="fish-stage-wrapper">
        <pre id="fish-stage"></pre>
        <div id="fish-hover-zone"></div>
      </div>
    `;

        // Insert as very first child so it's behind everything
        landing.insertBefore(layer, landing.firstChild);

        console.log('[ascii-fish] #fish-layer injected into #landing ✓');
        return layer;
    }

    /* ── PLAYER ENGINE ──────────────────────────────────────────── */
    function initPlayer() {
        const stage = document.getElementById('fish-stage');
        const hoverZone = document.getElementById('fish-hover-zone');
        const stageWrap = document.querySelector('.fish-stage-wrapper');
        const bubbleCvs = document.getElementById('fish-bubbles');

        if (!stage || !hoverZone || !stageWrap || !bubbleCvs) {
            console.error('[ascii-fish] Injected elements missing — aborting.');
            return;
        }

        let frames = [];
        let currentFrame = 0;
        let rafId = null;
        let lastTick = 0;
        let isHovered = false;
        let mouseX = 0;
        let mouseY = 0;

        /* ── Load frames ───────────────────────────────────────── */
        async function loadFrames() {
            const { framesFolder, firstFrame, lastFrame, frameExt } = CFG;
            console.log(`[ascii-fish] Fetching frames from "${framesFolder}/"`);

            const promises = [];
            for (let i = firstFrame; i <= lastFrame; i++) {
                const url = `${framesFolder}/${i}.${frameExt}`;
                promises.push(
                    fetch(url)
                        .then(r => r.ok ? r.text() : '')
                        .catch(() => '')
                );
            }

            frames = await Promise.all(promises);
            const loaded = frames.filter(f => f.length > 0).length;
            console.log(`[ascii-fish] ${loaded}/${frames.length} frames loaded ✓`);

            if (loaded === 0) {
                console.error('[ascii-fish] ❌ 0 frames loaded. Check: is frame_animation/ascii_out/ accessible from your server?');
                stage.textContent = '[fish: no frames — check console]';
                return;
            }

            start();
        }

        /* ── Animation loop ────────────────────────────────────── */
        function start() {
            if (rafId) cancelAnimationFrame(rafId);
            lastTick = performance.now();
            rafId = requestAnimationFrame(tick);
        }

        function tick(ts) {
            rafId = requestAnimationFrame(tick);
            if (!frames.length) return;
            if (ts - lastTick < 1000 / CFG.fps) return;
            lastTick = ts;
            renderFrame(currentFrame);
            currentFrame = (currentFrame + 1) % frames.length;
        }

        /* ── Render ─────────────────────────────────────────────── */
        function renderFrame(idx) {
            const text = frames[idx] || '';

            if (!isHovered) {
                stage.textContent = text;
                return;
            }

            const rect = stage.getBoundingClientRect();
            const fs = parseFloat(getComputedStyle(stage).fontSize);
            const charW = fs * 0.601;
            const lhRaw = getComputedStyle(stage).lineHeight;
            const lineH = lhRaw === 'normal' ? fs * 1.2 : parseFloat(lhRaw);

            const lines = text.split('\n');
            let html = '';

            for (let row = 0; row < lines.length; row++) {
                const line = lines[row];
                for (let col = 0; col < line.length; col++) {
                    const ch = line[col];
                    if (ch === ' ') { html += ' '; continue; }

                    const cx = rect.left + col * charW;
                    const cy = rect.top + row * lineH;
                    const dx = mouseX - cx;
                    const dy = mouseY - cy;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CFG.rippleRadius && dist > 0) {
                        const force = (1 - dist / CFG.rippleRadius) * CFG.rippleStrength;
                        const angle = Math.atan2(dy, dx);
                        const rx = (-Math.cos(angle) * force).toFixed(1) + 'px';
                        const ry = (-Math.sin(angle) * force).toFixed(1) + 'px';
                        html += `<span class="fish-char-ripple" style="--rx:${rx};--ry:${ry}">${esc(ch)}</span>`;
                    } else {
                        html += esc(ch);
                    }
                }
                if (row < lines.length - 1) html += '\n';
            }

            stage.innerHTML = html;
        }

        function esc(c) {
            return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c;
        }

        /* ── Hover events ──────────────────────────────────────── */
        hoverZone.addEventListener('mouseenter', () => {
            isHovered = true;
            stageWrap.classList.add('fish-hovered');
        });
        hoverZone.addEventListener('mouseleave', () => {
            isHovered = false;
            stageWrap.classList.remove('fish-hovered');
            stage.textContent = frames[currentFrame] || '';
        });
        hoverZone.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        /* ── Bubbles ─────────────────────────────────────────────── */
        (function initBubbles() {
            const ctx = bubbleCvs.getContext('2d');
            let W = 0, H = 0;

            function resize() {
                const landing = document.getElementById('landing');
                W = bubbleCvs.width = landing ? landing.offsetWidth : window.innerWidth;
                H = bubbleCvs.height = landing ? landing.offsetHeight : window.innerHeight;
            }
            window.addEventListener('resize', resize);
            resize();

            function mkBubble(randomY) {
                return {
                    x: Math.random() * W,
                    y: randomY ? Math.random() * H : H + 10,
                    r: 0.8 + Math.random() * 2.5,
                    speed: 0.12 + Math.random() * 0.4,
                    wobble: Math.random() * Math.PI * 2,
                    wFreq: 0.008 + Math.random() * 0.018,
                    alpha: 0.04 + Math.random() * 0.18,
                };
            }

            const bubbles = Array.from({ length: CFG.bubbleCount }, () => mkBubble(true));

            (function draw() {
                ctx.clearRect(0, 0, W, H);
                for (const b of bubbles) {
                    b.y -= b.speed;
                    b.wobble += b.wFreq;
                    if (b.y + b.r < 0) Object.assign(b, mkBubble(false));
                    ctx.beginPath();
                    ctx.arc(b.x + Math.sin(b.wobble) * 2, b.y, b.r, 0, Math.PI * 2);
                    const isDark = document.body.classList.contains('theme-dark');
                    ctx.strokeStyle = isDark
                        ? `rgba(0,255,224,${b.alpha})`
                        : `rgba(0,100,180,${b.alpha})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
                requestAnimationFrame(draw);
            })();
        })();

        loadFrames();
    }

    /* ── BOOT ───────────────────────────────────────────────────── */
    function boot() {
        injectStyles();
        const layer = buildDOM();
        if (layer) initPlayer();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
