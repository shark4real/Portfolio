/* ═══════════════════════════════════════════════════════════════
   player.js  —  ASCII fish animation engine

   FOLDER STRUCTURE:
     index.html
     style.css
     player.js
     ascii_out/
       1.txt
       2.txt
       ...
       194.txt
═══════════════════════════════════════════════════════════════ */

// ╔══════════════════════════════════════════════════════════════╗
// ║                     ⚙️  CONFIG                              ║
// ║   Edit here. Refresh the browser to apply changes.          ║
// ╚══════════════════════════════════════════════════════════════╝

const CONFIG = {
  // Folder with your .txt frame files (relative to index.html)
  framesFolder: 'ascii_out',

  // Frame range — set lastFrame to however many frames you have
  firstFrame: 1,
  lastFrame:  192,

  // File extension
  frameExt: 'txt',

  // ── Playback ──────────────────────────────────────────────────
  // Frames per second — increase for faster swimming, decrease for slow-mo
  fps: 12,

  // Loop forever
  loop: true,

  // ── Hover ripple ──────────────────────────────────────────────
  // Radius (px) within which chars get pushed away from the cursor
  rippleRadius: 90,

  // How far chars fly (px equivalent). Higher = more chaotic scatter
  rippleStrength: 8,

  // ── Background bubbles ────────────────────────────────────────
  // Number of floating bubble particles behind the fish
  bubbleCount: 40,
};

// ╚══════════════════════════════════════════════════════════════╝


// ── DOM ────────────────────────────────────────────────────────
const stage     = document.getElementById('ascii-stage');
const hoverZone = document.getElementById('hover-zone');
const wrapper   = stage.closest('.stage-wrapper');
const bubbleCvs = document.getElementById('bubbles');

// ── State ──────────────────────────────────────────────────────
let frames       = [];
let currentFrame = 0;
let playing      = true;
let fps          = CONFIG.fps;
let lastTick     = 0;
let rafId        = null;
let isHovered    = false;
let mouseX       = 0;
let mouseY       = 0;

// ══════════════════════════════════════════════════════════════
// LOAD FRAMES
// ══════════════════════════════════════════════════════════════

async function loadFrames() {
  const { framesFolder, firstFrame, lastFrame, frameExt } = CONFIG;

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
  startAnimation();
}

// ══════════════════════════════════════════════════════════════
// ANIMATION LOOP
// ══════════════════════════════════════════════════════════════

function startAnimation() {
  if (rafId) cancelAnimationFrame(rafId);
  lastTick = performance.now();
  rafId = requestAnimationFrame(tick);
}

function tick(timestamp) {
  rafId = requestAnimationFrame(tick);
  if (!playing || frames.length === 0) return;

  if (timestamp - lastTick < 1000 / fps) return;
  lastTick = timestamp;

  renderFrame(currentFrame);
  currentFrame = (currentFrame + 1) % frames.length;
}

// ══════════════════════════════════════════════════════════════
// RENDER
// ══════════════════════════════════════════════════════════════

function renderFrame(index) {
  const text = frames[index] || '';

  if (!isHovered) {
    stage.textContent = text;
    return;
  }

  // Hover path — scatter chars near cursor
  const stageRect = stage.getBoundingClientRect();
  const fs   = parseFloat(getComputedStyle(stage).fontSize);
  const charW = fs * 0.601;
  const lineH = fs * CONFIG_lineHeight();

  const lines = text.split('\n');
  let html = '';

  for (let row = 0; row < lines.length; row++) {
    const line = lines[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (ch === ' ') { html += ' '; continue; }

      const cx   = stageRect.left + col * charW;
      const cy   = stageRect.top  + row * lineH;
      const dx   = mouseX - cx;
      const dy   = mouseY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.rippleRadius && dist > 0) {
        const force = (1 - dist / CONFIG.rippleRadius) * CONFIG.rippleStrength;
        const angle = Math.atan2(dy, dx);
        const rx = (-Math.cos(angle) * force).toFixed(1) + 'px';
        const ry = (-Math.sin(angle) * force).toFixed(1) + 'px';
        html += `<span class="char-ripple" style="--rx:${rx};--ry:${ry}">${esc(ch)}</span>`;
      } else {
        html += esc(ch);
      }
    }
    if (row < lines.length - 1) html += '\n';
  }

  stage.innerHTML = html;
}

function CONFIG_lineHeight() {
  const lh = getComputedStyle(stage).lineHeight;
  const fs  = parseFloat(getComputedStyle(stage).fontSize);
  return lh === 'normal' ? 1.2 : parseFloat(lh) / fs;
}

function esc(c) {
  return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c;
}

// ══════════════════════════════════════════════════════════════
// HOVER
// ══════════════════════════════════════════════════════════════

hoverZone.addEventListener('mouseenter', () => {
  isHovered = true;
  wrapper.classList.add('hovered');
});

hoverZone.addEventListener('mouseleave', () => {
  isHovered = false;
  wrapper.classList.remove('hovered');
  stage.textContent = frames[currentFrame] || '';
});

hoverZone.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// ══════════════════════════════════════════════════════════════
// BUBBLE BACKGROUND
// ══════════════════════════════════════════════════════════════

(function initBubbles() {
  const ctx = bubbleCvs.getContext('2d');
  let W, H;

  function resize() {
    W = bubbleCvs.width  = window.innerWidth;
    H = bubbleCvs.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function mkBubble(randomY = false) {
    return {
      x:      Math.random() * W,
      y:      randomY ? Math.random() * H : H + 10,
      r:      0.8 + Math.random() * 2.5,
      speed:  0.15 + Math.random() * 0.45,
      wobble: Math.random() * Math.PI * 2,
      wFreq:  0.008 + Math.random() * 0.018,
      alpha:  0.08 + Math.random() * 0.35,
    };
  }

  const bubbles = Array.from({ length: CONFIG.bubbleCount }, () => mkBubble(true));

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const b of bubbles) {
      b.y      -= b.speed;
      b.wobble += b.wFreq;
      if (b.y + b.r < 0) Object.assign(b, mkBubble());
      ctx.beginPath();
      ctx.arc(b.x + Math.sin(b.wobble) * 2, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,255,224,${b.alpha})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
    requestAnimationFrame(draw);
  })();
})();

// ── Go ──────────────────────────────────────────────────────
loadFrames();