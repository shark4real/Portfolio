// ============================================
// ASSET PRELOADER
// ============================================
(function() {
  const preloader = document.getElementById('preloader');
  const preloaderProgress = document.getElementById('preloaderProgress');
  const preloaderText = document.getElementById('preloaderText');
  
  let totalAssets = 0;
  let loadedAssets = 0;
  
  function updateProgress() {
    const percentage = Math.round((loadedAssets / totalAssets) * 100);
    if (preloaderProgress) {
      preloaderProgress.style.width = percentage + '%';
    }
    if (preloaderText) {
      preloaderText.textContent = `Loading assets... ${percentage}%`;
    }
  }
  
  function assetLoaded() {
    loadedAssets++;
    updateProgress();
    
    if (loadedAssets >= totalAssets) {
      setTimeout(() => {
        if (preloader) {
          preloader.classList.add('loaded');
        }
        // Initialize all interactive features after assets load
        initializeWebsite();
      }, 500);
    }
  }
  
  // Preload critical assets
  function preloadAssets() {
    const assetsToLoad = [
      { type: 'resume', url: './sharik_hassan.pdf' }
    ];
    
    // Add project thumbnails to preload
    if (typeof codingProjects !== 'undefined') {
      codingProjects.forEach(project => {
        if (project.thumbnail) {
          assetsToLoad.push({ type: 'image', url: project.thumbnail });
        }
      });
    }
    
    totalAssets = assetsToLoad.length;
    
    assetsToLoad.forEach(asset => {
      if (asset.type === 'image') {
        const img = new Image();
        img.onload = () => assetLoaded();
        img.onerror = () => assetLoaded();
        img.src = asset.url;
      } else if (asset.type === 'resume') {
        fetch(asset.url)
          .then(() => assetLoaded())
          .catch(() => assetLoaded());
      }
    });
  }
  
  let dismissed = false;
  function dismissPreloader() {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(preloadTimeout);
    if (preloader) preloader.classList.add('loaded');
    initializeWebsite();
  }

  function assetLoaded() {
    loadedAssets++;
    updateProgress();
    if (loadedAssets >= totalAssets) {
      setTimeout(dismissPreloader, 500);
    }
  }

  // Hard timeout — dismiss after 8 seconds no matter what
  const preloadTimeout = setTimeout(dismissPreloader, 8000);

  // Start preloading when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadAssets);
  } else {
    preloadAssets();
  }
})();

// ============================================
// WEBSITE INITIALIZATION (Called after preload)
// ============================================
function onEnterViewportOnce(element, callback, options) {
  if (!element || typeof callback !== 'function') return;

  if (!('IntersectionObserver' in window)) {
    callback();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        observer.disconnect();
        callback();
        break;
      }
    }
  }, options || { root: null, threshold: 0.15 });

  observer.observe(element);
}

// =========================================================
// MOBILE: INITIAL SCROLL GUARD (prevents load-time auto-jumps)
// =========================================================
let __mobileUserInteracted = false;

function initMobileInitialScrollGuard() {
  const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) return;

  const root = document.documentElement;
  const body = document.body;

  // Avoid browsers restoring a previous scroll position on reload/back-forward.
  try {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  } catch (e) {}

  // If a stale hash deep-link is present, mobile can auto-jump into the pinned About.
  // We only neutralize '#about' on initial load; clicking the About link still works.
  try {
    if (!__mobileUserInteracted && location.hash === '#about') {
      history.replaceState(null, '', location.pathname + location.search);
    }
  } catch (e) {}

  root.classList.add('pre-interaction');
  if (body) body.classList.add('pre-interaction');

  const markInteracted = () => {
    __mobileUserInteracted = true;
    root.classList.remove('pre-interaction');
    if (body) body.classList.remove('pre-interaction');
  };

  window.addEventListener('touchstart', markInteracted, { passive: true, once: true });
  window.addEventListener('pointerdown', markInteracted, { passive: true, once: true });
  window.addEventListener('wheel', markInteracted, { passive: true, once: true });
  window.addEventListener('keydown', markInteracted, { once: true });

  // Force top while still in the non-interacted window.
  const forceTop = () => {
    if (__mobileUserInteracted) return;
    if (location.hash && location.hash !== '#landing') return;
    if (window.scrollY > 2) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  };

  // Multiple passes to catch late layout shifts (preloader removal, iframe/image loads).
  requestAnimationFrame(forceTop);
  setTimeout(forceTop, 50);
  setTimeout(forceTop, 250);
  setTimeout(forceTop, 700);
}

// =========================================================
// MOBILE: RAG + CONNECT SECTION SCROLL PIN (mirrors desktop)
// =========================================================
function initMobileRagConnectLock() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  // Avoid ScrollTrigger refresh chaos from mobile keyboard resize.
  try { ScrollTrigger.config({ ignoreMobileResize: true }); } catch (e) {}

  const skills = document.getElementById('skills');
  const connect = document.getElementById('connect');

  // Pin RAG section: same pattern as desktop Connect pin.
  if (skills) {
    ScrollTrigger.create({
      id: 'mobile-pin-skills',
      trigger: skills,
      start: 'top top',
      end: '+=150%',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
    });
  }

  // Pin Connect section.
  if (connect) {
    ScrollTrigger.create({
      id: 'mobile-pin-connect',
      trigger: connect,
      start: 'top top',
      end: '+=150%',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
    });
  }
}

function initMobileSectionLock() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) return;

  // Mobile UX: avoid pin-based section locking; it can trap scroll and break expected momentum.
  return;

  // Requires GSAP + ScrollTrigger (already used elsewhere).
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  // Mobile keyboards change viewport height; avoid ScrollTrigger refresh/jumps.
  try {
    ScrollTrigger.config({ ignoreMobileResize: true });
  } catch (e) {}

  // Also prevent ScrollTrigger's internal auto-refresh on resize (iOS keyboard triggers resize).
  // We'll refresh on orientation changes instead.
  try {
    ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });
  } catch (e) {}

  window.addEventListener('orientationchange', () => {
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  });

  // Disable CSS scroll-snap while we use pin-based locking.
  document.documentElement.classList.add('mobile-lock');
  document.body.classList.add('mobile-lock');

  // Lock only non-form sections on mobile.
  // Pinning sections with inputs (skills chat / connect form) can cause focus loss when the keyboard opens.
  const sectionIds = ['projects', 'skills'];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  // Add ~2 extra viewport scrolls per section (no height changes).
  for (const section of sections) {
    const triggerId = section.id === 'skills' ? 'mobile-lock-skills' : (section.id === 'projects' ? 'mobile-lock-projects' : `mobile-lock-${section.id}`);
    ScrollTrigger.create({
      id: triggerId,
      trigger: section,
      start: 'top top',
      end: '+=200%',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      markers: false,
      refreshPriority: 0,
    });
  }
}

function initMobileKeyboardGuard() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) return;

  // Simple approach: when an input is focused, dock its parent form
  // above the keyboard using visualViewport. Don't fight the browser
  // with overflow locks or GSAP pin toggling.

  let activeForm = null;

  const root = document.documentElement;
  const body = document.body;

  function isTextInput(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toLowerCase();
    if (tag === 'textarea') return true;
    if (tag !== 'input') return false;
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    return !['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'range', 'color', 'image'].includes(type);
  }

  function getParentForm(el) {
    // For chatInput -> chatForm; for connect inputs -> contactForm
    return el.closest('form');
  }

  function dockForm() {
    if (!activeForm) return;
    const vv = window.visualViewport;
    if (!vv) return;

    // Position the form at the bottom of the visible viewport (just above keyboard)
    const visibleBottom = vv.offsetTop + vv.height;
    const keyboardHeight = Math.max(0, window.innerHeight - visibleBottom);

    activeForm.style.position = 'fixed';
    activeForm.style.left = '0';
    activeForm.style.right = '0';
    // Place the form just above the keyboard, with a gap above the fixed footer
    // Footer is 44px tall at bottom: 18px, so we reserve footer + gap space
    const footerHeight = 44;
    const footerBottom = 18;
    const gapAboveFooter = 12;
    const minBottomSpace = footerHeight + footerBottom + gapAboveFooter;
    
    // Use the keyboard space if larger; otherwise keep form above footer
    const bottomValue = Math.max(keyboardHeight + 8, minBottomSpace);
    activeForm.style.top = '';
    activeForm.style.bottom = bottomValue + 'px';
    activeForm.style.zIndex = '9999';
    // Keep the docked form solid and theme-aware on mobile
    activeForm.style.background = 'var(--rag-panel)';
    activeForm.style.padding = '10px 16px';
    activeForm.style.boxSizing = 'border-box';
  }

  function isKeyboardLikelyOpen() {
    const vv = window.visualViewport;
    if (!vv) return false;
    return vv.height < (window.innerHeight - 80);
  }

  function undockForm() {
    if (!activeForm) return;
    // Restore original styles
    ['position', 'left', 'right', 'bottom', 'top', 'zIndex', 'background', 'padding', 'boxSizing'].forEach(prop => {
      activeForm.style[prop] = '';
    });
    activeForm = null;
  }

  function onViewportResize() {
    dockForm();
  }

  document.addEventListener('focusin', (e) => {
    if (!isTextInput(e.target)) return;

    // Disable scroll-snap so it doesn't fight the keyboard
    root.classList.add('keyboard-open');
    body.classList.add('keyboard-open');

    // Only dock the RAG chatForm (single input row).
    // Connect form has multiple fields — let the browser handle it naturally.
    const form = getParentForm(e.target);
    if (!form || form.id !== 'chatForm') return;

    // If already docked on same form, just update
    if (activeForm && activeForm !== form) {
      undockForm();
    }

    activeForm = form;

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', onViewportResize);
      vv.addEventListener('scroll', onViewportResize);
    }

    // Small delay to let the keyboard animation start
    setTimeout(() => {
      dockForm();
    }, 300);
  });

  document.addEventListener('focusout', () => {
    setTimeout(() => {
      if (isTextInput(document.activeElement)) return;
      if (activeForm && activeForm.contains(document.activeElement)) return;
      if (isKeyboardLikelyOpen()) return;

      // Re-enable scroll-snap
      root.classList.remove('keyboard-open');
      body.classList.remove('keyboard-open');

      const vv = window.visualViewport;
      if (vv) {
        vv.removeEventListener('resize', onViewportResize);
        vv.removeEventListener('scroll', onViewportResize);
      }

      undockForm();
    }, 250);
  });
}

function relocateAboutForMobile() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) return;

  const landing = document.getElementById('landing');
  const about = document.getElementById('about');
  if (!landing || !about) return;

  // If the landing split animation is enabled, About must remain inside Landing.
  if (landing.dataset && landing.dataset.splitActive === 'true') return;

  // Only relocate if About is nested inside Landing (current desktop structure)
  if (landing.contains(about)) {
    landing.insertAdjacentElement('afterend', about);
    about.setAttribute('data-mobile-relocated', 'true');
  }
}

function initLandingRotatingText() {
  const textEls = Array.from(document.querySelectorAll('.landing-rotator-text'));
  if (!textEls.length) return;

  const lines = [
    'Aspiring Data Scientist.',
    'Building Projects.',
    'Into Art & Design.',
    'Metalhead.',
    'Cinema Addict.'
  ];

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    for (const el of textEls) {
      el.textContent = lines[0];
      el.classList.remove('slide-in', 'slide-out');
      el.style.opacity = '1';
      el.style.transform = 'none';
    }
    return;
  }

  // Speed control:
  // - 1.0 = normal
  // - >1.0 = faster (e.g. 1.25)
  // - <1.0 = slower (e.g. 0.85)
  const speed = 0.6;

  const baseHoldMs = 1050;
  const baseInMs = 260;
  const baseOutMs = 220;
  const baseBetweenMs = 90;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const scaleMs = (ms) => Math.round(ms / clamp(speed, 0.35, 3));

  // Timing (derived)
  const holdMs = scaleMs(baseHoldMs);
  const inMs = scaleMs(baseInMs);
  const outMs = scaleMs(baseOutMs);
  const betweenMs = scaleMs(baseBetweenMs);

  // Keep CSS animation durations in sync with JS timing
  for (const el of textEls) {
    el.style.setProperty('--rotator-in', `${inMs}ms`);
    el.style.setProperty('--rotator-out', `${outMs}ms`);
  }

  let index = 0;
  let disposed = false;
  let timers = [];

  function schedule(fn, ms) {
    const id = window.setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function clearTimers() {
    for (const id of timers) window.clearTimeout(id);
    timers = [];
  }

  function setText(value) {
    for (const el of textEls) el.textContent = value;
  }

  function removeAnimClasses() {
    for (const el of textEls) el.classList.remove('slide-in', 'slide-out');
  }

  function forceRestart(el, className) {
    el.classList.remove(className);
    // Force reflow so the animation restarts reliably.
    void el.offsetHeight;
    el.classList.add(className);
  }

  function animateAll(className) {
    for (const el of textEls) {
      forceRestart(el, className);
    }
  }

  function cycle() {
    if (disposed) return;

    // Slide out current line
    removeAnimClasses();
    animateAll('slide-out');

    schedule(() => {
      if (disposed) return;

      // Swap text after it has moved out
      index = (index + 1) % lines.length;
      setText(lines[index]);

      removeAnimClasses();
      animateAll('slide-in');

      schedule(cycle, holdMs + inMs + betweenMs);
    }, outMs + betweenMs);
  }

  // Initial line
  setText(lines[0]);
  removeAnimClasses();
  animateAll('slide-in');

  clearTimers();
  schedule(cycle, holdMs + inMs);

  window.addEventListener('beforeunload', () => {
    disposed = true;
    clearTimers();
  });
}

function initLandingHelloHover() {
  const helloEls = Array.from(document.querySelectorAll('.landing-hello-line'));
  if (!helloEls.length) return;

  const lines = [
    "Hello I'm",
    'नमस्ते मैं हूँ',
    'سلام میں ہوں',
    'Hola soy',
    'こんにちは 私は',
    'Bonjour je suis',
    'مرحبا أنا',
    'Ciao sono',
    'Hallo ich bin',
    'Olá eu sou'
  ];

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intervalMs = 900;

  function swapText(el, text) {
    if (reduceMotion) {
      el.textContent = text;
      return;
    }
    el.classList.add('is-fading');
    window.setTimeout(() => {
      el.textContent = text;
      requestAnimationFrame(() => {
        el.classList.remove('is-fading');
      });
    }, 160);
  }

  for (const el of helloEls) {
    let index = 0;

    el.textContent = lines[0];

    window.setInterval(() => {
      index = (index + 1) % lines.length;
      swapText(el, lines[index]);
    }, intervalMs);
  }
}

function initMouseAxesForElement(target, className) {
  if (!target || !window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const axes = document.createElement('div');
  axes.className = className;
  axes.setAttribute('aria-hidden', 'true');
  axes.innerHTML = [
    '<span class="landing-axis landing-axis-x"></span>',
    '<span class="landing-axis landing-axis-y"></span>',
    '<span class="landing-axis-cursor"></span>',
    '<span class="landing-axis-end landing-axis-end-x-start"></span>',
    '<span class="landing-axis-end landing-axis-end-x-end"></span>',
    '<span class="landing-axis-end landing-axis-end-y-start"></span>',
    '<span class="landing-axis-end landing-axis-end-y-end"></span>'
  ].join('');
  target.appendChild(axes);

  let nextX = window.innerWidth / 2;
  let nextY = window.innerHeight / 2;
  let rafId = null;

  function render() {
    rafId = null;
    axes.style.setProperty('--axis-x', `${nextX}px`);
    axes.style.setProperty('--axis-y', `${nextY}px`);
  }

  function queueRender() {
    if (rafId === null) rafId = window.requestAnimationFrame(render);
  }

  function isInsideTarget(x, y) {
    const rect = target.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function moveAxes(e) {
    nextX = e.clientX;
    nextY = e.clientY;
    axes.classList.toggle('is-visible', isInsideTarget(nextX, nextY));
    queueRender();
  }

  function hideAxes() {
    axes.classList.remove('is-visible');
  }

  function spawnLandingClickParticles(e) {
    if (className !== 'landing-mouse-axes' || !isInsideTarget(e.clientX, e.clientY)) return;

    const particles = [
      { dx: 0, dy: -30 },
      { dx: 0, dy: 30 },
      { dx: -30, dy: 0 },
      { dx: 30, dy: 0 },
      { dx: -22, dy: -22 },
      { dx: 22, dy: -22 },
      { dx: -22, dy: 22 },
      { dx: 22, dy: 22 }
    ];

    particles.forEach(({ dx, dy }) => {
      const particle = document.createElement('span');
      particle.className = 'landing-click-particle';
      particle.style.left = `${e.clientX}px`;
      particle.style.top = `${e.clientY}px`;
      particle.style.setProperty('--particle-x', `${dx}px`);
      particle.style.setProperty('--particle-y', `${dy}px`);
      axes.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove(), { once: true });
    });
  }

  target.addEventListener('pointerenter', moveAxes);
  target.addEventListener('pointermove', moveAxes);
  target.addEventListener('pointerdown', spawnLandingClickParticles);
  target.addEventListener('pointerleave', hideAxes);
  window.addEventListener('blur', hideAxes);
  window.addEventListener('scroll', () => {
    axes.classList.toggle('is-visible', isInsideTarget(nextX, nextY));
  }, { passive: true });

  render();
}

function initLandingMouseAxes() {
  const landing = document.getElementById('landing');
  initMouseAxesForElement(landing, 'landing-mouse-axes');
  const projects = document.getElementById('projects');
  initMouseAxesForElement(projects, 'projects-mouse-axes');
}

function initClickFeedback() {
  if (window.__portfolioClickFeedbackReady) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.__portfolioClickFeedbackReady = true;

  const layer = document.createElement('div');
  layer.className = 'click-feedback-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  const particleCount = 8;

  function removeBurst(burst) {
    if (burst && burst.parentNode) {
      burst.parentNode.removeChild(burst);
    }
  }

  function spawnClickFeedback(event) {
    if (event.button !== undefined && event.button !== 0) return;
    if (!event.isPrimary && event.pointerType) return;
    if (event.target && event.target.closest && event.target.closest('#preloader:not(.loaded)')) return;

    const burst = document.createElement('span');
    burst.className = 'portfolio-click-burst';
    burst.style.setProperty('--click-x', `${event.clientX}px`);
    burst.style.setProperty('--click-y', `${event.clientY}px`);

    const ring = document.createElement('span');
    ring.className = 'portfolio-click-ring';
    burst.appendChild(ring);

    const dot = document.createElement('span');
    dot.className = 'portfolio-click-dot';
    burst.appendChild(dot);

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('span');
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 18 + (i % 2) * 8;
      particle.className = 'portfolio-click-particle';
      particle.style.setProperty('--particle-x', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--particle-y', `${Math.sin(angle) * distance}px`);
      burst.appendChild(particle);
    }

    layer.appendChild(burst);
    window.setTimeout(() => removeBurst(burst), 760);
  }

  window.addEventListener('pointerdown', spawnClickFeedback, { passive: true, capture: true });
}

function initFooterLinksToggle() {
  const footer = document.querySelector('.ui-footer');
  const brand = document.getElementById('footerBrand');
  const links = document.getElementById('footerLinks');
  if (!footer || !brand || !links) return;

  const close = () => {
    footer.classList.remove('is-open');
    brand.setAttribute('aria-expanded', 'false');
  };

  const goToConnect = () => {
    const landing = document.getElementById('landing');
    const connect = document.getElementById('connect');
    const trigger = document.getElementById('connectTrigger');

    if (landing && connect) {
      close();
      if (trigger) {
        trigger.click();
      } else {
        connect.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    window.location.href = '/#connect';
  };

  brand.addEventListener('click', (event) => {
    event.stopPropagation();
    goToConnect();
  });

  document.addEventListener('click', (event) => {
    if (!footer.contains(event.target)) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}

function initConnectScrollGate() {
  const landing = document.getElementById('landing');
  const connect = document.getElementById('connect');
  const trigger = document.getElementById('connectTrigger');

  if (!landing || !connect || !trigger) return;

  let unlocked = false;
  let isAutoScrolling = false;
  let touchStartY = null;

  const getLandingBounds = () => {
    const top = landing.offsetTop;
    const bottom = top + landing.offsetHeight;
    return { top, bottom };
  };

  const isInLanding = () => {
    const { top, bottom } = getLandingBounds();
    const y = window.scrollY;
    return y >= top - 1 && y < bottom - 1;
  };

  const isAtLandingTop = () => window.scrollY <= landing.offsetTop + 2;

  const preventDownScroll = (event) => {
    if (unlocked || isAutoScrolling) return;
    if (!isInLanding()) return;
    event.preventDefault();
    window.scrollTo({ top: landing.offsetTop, left: 0, behavior: 'auto' });
  };

  const goToConnect = () => {
    unlocked = true;
    isAutoScrolling = true;
    connect.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      isAutoScrolling = false;
    }, 900);
  };

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    goToConnect();
  });

  if (window.location.hash === '#connect') {
    goToConnect();
  }

  window.addEventListener('scroll', () => {
    if (unlocked && isAtLandingTop()) {
      unlocked = false;
    }
  }, { passive: true });

  window.addEventListener('wheel', (event) => {
    if (event.deltaY > 0) preventDownScroll(event);
  }, { passive: false });

  window.addEventListener('keydown', (event) => {
    if (unlocked || !isInLanding()) return;
    if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
    }
  });

  document.addEventListener('touchstart', (event) => {
    if (!isInLanding()) {
      touchStartY = null;
      return;
    }
    const touch = event.touches && event.touches[0];
    touchStartY = touch ? touch.clientY : null;
  }, { passive: true });

  document.addEventListener('touchmove', (event) => {
    if (unlocked || !isInLanding()) return;
    if (touchStartY === null) return;
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    const delta = touch.clientY - touchStartY;
    if (delta < -2) {
      preventDownScroll(event);
    }
  }, { passive: false });
}

function initializeWebsite() {
  if (typeof initMobileInitialScrollGuard === 'function') {
    initMobileInitialScrollGuard();
  }

  // Initialize all scroll effects and animations
  if (typeof initLandingSplitScroll === 'function') {
    initLandingSplitScroll();
  }

  if (typeof initMobileAboutScrollChaining === 'function') {
    initMobileAboutScrollChaining();
  }

  if (typeof initLandingRotatingText === 'function') {
    initLandingRotatingText();
  }

  if (typeof initLandingHelloHover === 'function') {
    initLandingHelloHover();
  }

  if (typeof initLandingMouseAxes === 'function') {
    initLandingMouseAxes();
  }

  if (typeof initClickFeedback === 'function') {
    initClickFeedback();
  }

  if (typeof initFooterLinksToggle === 'function') {
    initFooterLinksToggle();
  }

  if (typeof initConnectScrollGate === 'function') {
    initConnectScrollGate();
  }

  if (typeof initConnectHoverCursor === 'function') {
    initConnectHoverCursor();
  }

  if (typeof initMobileSectionLock === 'function') {
    initMobileSectionLock();
  }

  if (typeof initMobileKeyboardGuard === 'function') {
    initMobileKeyboardGuard();
  }

  // Mobile fallback: if split is not active, keep About as a normal section
  relocateAboutForMobile();
  if (typeof initAboutSection === 'function') {
    initAboutSection();
  }
  if (typeof initProjectsPin === 'function') {
    initProjectsPin();
  }
  if (typeof initSkillsAnimations === 'function') {
    initSkillsAnimations();
  }
  if (typeof initChatBot === 'function') {
    initChatBot();
  }
  if (typeof initLinkedInCarousel === 'function') {
    initLinkedInCarousel();
  }
  if (typeof initConnectPin === 'function') {
    initConnectPin();
  }
  if (typeof initContactForm === 'function') {
    initContactForm();
  }


  if (typeof initSectionNavArrows === 'function') {
    initSectionNavArrows();
  }

  window.addEventListener('resize', () => {
    // No resize handler defined — resize event listener ready if needed
  });
}

function initConnectHoverCursor() {
  const connect = document.getElementById('connect');
  if (!connect) return;

  const targets = Array.from(connect.querySelectorAll('.connect-info-item a, #connectTitle'));
  if (!targets.length) return;

  let cursor = document.querySelector('.connect-hover-cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'connect-hover-cursor';
    cursor.innerHTML = '<img src="assests/connect.jpeg" alt="" />';
    document.body.appendChild(cursor);
  }

  let isVisible = false;
  let lastX = 0;
  let lastY = 0;
  let rafId = null;

  const move = (x, y) => {
    lastX = x;
    lastY = y;
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      cursor.style.transform = `translate(${lastX}px, ${lastY}px)`;
      rafId = null;
    });
  };

  const show = () => {
    if (isVisible) return;
    isVisible = true;
    cursor.classList.add('is-visible');
  };

  const hide = () => {
    if (!isVisible) return;
    isVisible = false;
    cursor.classList.remove('is-visible');
  };

  targets.forEach((link) => {
    link.addEventListener('mouseenter', show);
    link.addEventListener('mouseleave', hide);
    link.addEventListener('mousemove', (event) => move(event.clientX, event.clientY));
  });

  connect.addEventListener('mouseleave', hide);
}

function initMobileAboutScrollChaining() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) return;

  const about = document.getElementById('about');
  if (!about) return;

  function isSplitActive() {
    return document.documentElement.classList.contains('split-active');
  }

  function atTop(el) {
    return el.scrollTop <= 0;
  }

  function atBottom(el) {
    return el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
  }

  // Wheel/trackpad (mostly for emulators / Android w/ mouse)
  about.addEventListener('wheel', (e) => {
    if (!isSplitActive()) return;
    if (!e || typeof e.deltaY !== 'number') return;

    const dy = e.deltaY;
    if ((dy < 0 && atTop(about)) || (dy > 0 && atBottom(about))) {
      e.preventDefault();
      window.scrollBy({ top: dy, left: 0, behavior: 'auto' });
    }
  }, { passive: false });

  // Touch scroll chaining (iOS/Android)
  let lastY = null;
  about.addEventListener('touchstart', (e) => {
    if (!isSplitActive()) {
      lastY = null;
      return;
    }
    const t = e && e.touches && e.touches[0];
    lastY = t ? t.clientY : null;
  }, { passive: true });

  about.addEventListener('touchmove', (e) => {
    if (!isSplitActive()) return;
    const t = e && e.touches && e.touches[0];
    if (!t || lastY === null) return;

    const currentY = t.clientY;
    const delta = currentY - lastY;
    lastY = currentY;

    // Convert finger movement to scroll intent (finger up => scroll down)
    const scrollDelta = -delta;

    if ((scrollDelta < 0 && atTop(about)) || (scrollDelta > 0 && atBottom(about))) {
      e.preventDefault();
      window.scrollBy({ top: scrollDelta, left: 0, behavior: 'auto' });
    }
  }, { passive: false });
}

function initSectionNavArrows() {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ensureArrows(sectionEl, id) {
    if (!sectionEl) return null;
    let wrap = sectionEl.querySelector(`.section-nav-arrows[data-section="${id}"]`);
    if (wrap) return wrap;

    wrap = document.createElement('div');
    wrap.className = 'section-nav-arrows';
    wrap.dataset.section = id;
    wrap.setAttribute('aria-hidden', 'true');
    // wrap.innerHTML = `
    //   <button type="button" class="section-nav-btn section-nav-btn-up" data-dir="up" aria-label="Go to previous section">↑</button>
    //   <button type="button" class="section-nav-btn section-nav-btn-down" data-dir="down" aria-label="Go to next section">↓</button>
    // `;
    sectionEl.appendChild(wrap);
    return wrap;
  }

  function scrollToSelector(selector) {
    if (!selector) return;

    if (selector === '#landing') {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }

    if (selector === '#about') {
      const landing = document.getElementById('landing');
      const about = document.getElementById('about');
      const isMobile = window.matchMedia('(max-width: 768px)').matches;

      if (landing && about && !isMobile && landing.dataset && landing.dataset.splitActive === 'true') {
        const scrollTarget = landing.offsetTop + (window.innerHeight * 2);
        window.scrollTo({ top: scrollTarget, behavior: reduceMotion ? 'auto' : 'smooth' });
        return;
      }
    }

    const el = document.querySelector(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function canScroll(scrollEl) {
    if (!scrollEl) return false;
    return scrollEl.scrollHeight > scrollEl.clientHeight + 2;
  }

  function isAtBottom(scrollEl) {
    if (!scrollEl) return false;
    const threshold = 8;
    return scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - threshold;
  }

  function shouldShow(scrollEl) {
    if (!canScroll(scrollEl)) return false;
    // Must have scrolled and reached the end.
    if (scrollEl.scrollTop < 10) return false;
    return isAtBottom(scrollEl);
  }

  function shouldShowForPageScroll(sectionEl) {
    if (!sectionEl) return false;
    const rect = sectionEl.getBoundingClientRect();
    const threshold = 10;

    // Only show when user has entered the section and reached its bottom.
    // Hide again if they scroll up (section bottom is no longer at/above viewport bottom).
    const inViewport = rect.bottom > 0;
    const entered = rect.top < -threshold;
    const reachedEnd = rect.bottom <= window.innerHeight + threshold;
    return inViewport && entered && reachedEnd;
  }

  function wire({ id, sectionEl, scrollEl, upTarget, downTarget }) {
    if (!sectionEl || !scrollEl) return;
    const arrows = ensureArrows(sectionEl, id);
    if (!arrows) return;

    const btnUp = arrows.querySelector('[data-dir="up"]');
    const btnDown = arrows.querySelector('[data-dir="down"]');

    if (btnUp) {
      btnUp.addEventListener('click', () => scrollToSelector(upTarget));
    }
    if (btnDown) {
      btnDown.addEventListener('click', () => scrollToSelector(downTarget));
    }

    const usesInternalScroll = canScroll(scrollEl);

    function update() {
      const visible = usesInternalScroll ? shouldShow(scrollEl) : shouldShowForPageScroll(sectionEl);
      arrows.classList.toggle('section-nav-arrows--visible', visible);
      arrows.setAttribute('aria-hidden', visible ? 'false' : 'true');
    }

    if (usesInternalScroll) {
      scrollEl.addEventListener('scroll', update, { passive: true });
    } else {
      window.addEventListener('scroll', update, { passive: true });
    }
    window.addEventListener('resize', update, { passive: true });

    update();
  }

  wire({
    id: 'about',
    sectionEl: document.getElementById('about'),
    scrollEl: document.getElementById('aboutRightScroll') || document.querySelector('#about .about-right-scroll'),
    upTarget: '#landing',
    downTarget: '#projects',
  });

  wire({
    id: 'projects',
    sectionEl: document.getElementById('projects'),
    scrollEl: document.querySelector('#projects .experiments-shell'),
    upTarget: '#about',
    downTarget: '#skills',
  });
}

// ============================================
// ABOUT CONTENT (stored for easy reuse)
// ============================================
const ABOUT_CONTENT = {
  bio: "Hi, I'm Sharik Hassan, a 4th-year student and aspiring Data Scientist. I love exploring data, building intelligent systems, and sharing what I learn through \n\nteaching and community. Beyond tech, I create through digital design, animation, and illustration. I enjoy projects that blend logic with creativity and storytelling.",
  education: [
    {
      school: 'Indian Institute of Technology, Madras',
      degree: 'BSc in Data Science',
      date: 'Sept, 2022 - Present',
      description: '',
    },
    {
      school: 'Dr. Ambedkar Institute Of Technology',
      degree: 'B.E in AI & Machine Learning',
      date: 'Dec, 2022 - Present',
      description: '',
    },
  ],
  work: [
    {
      org: 'Entropik',
      roles: [
        {
          title: 'Associate AI Engineer',
          type: 'Full-time',
          description: '',
        },
        {
          title: 'AI QA Intern',
          type: 'Internship',
          description: 'Worked closely with the Data Science team on Decode, contributing to benchmark score calculations across advertisement categories. Contributed to Decode Copilot and built LangChain-based agent workflows for AI-powered creative studies, contextual Q&A, and research insight extraction. Assisted with updating and evaluating newer LLM versions in the AI Moderator pipeline to improve moderation accuracy and performance.',
        },
      ],
    },
    {
      org: 'GDG DR. AIT',
      role: 'Machine Learning Lead',
      description: 'Led ML learning sessions and taught core Machine Learning concepts with a strong focus on math foundations. Delivered hands-on explanations of Linear Regression to 400+ learners. Mentored participants and simplified complex ideas for beginners.',
    },
    {
      org: 'Colossus 2.0',
      role: 'Design & Social-Media Lead',
      description: 'Led design efforts and co-managed social media strategy for the event. Created visual assets and promotional content that reached 110k+ views and 400k+ overall reach. Collaborated on the event website to ensure consistent design and branding.',
    },
  ],
  hobbies: [
    'Collaborating on new projects.',
    'Sketching and drawing.',
    'Chess (ELO ~1200).',
    'Badminton.',
    'Movies and series.',
    'Music.',
  ],
};

// Expose for debugging / future edits (requested: keep info saved somewhere)
window.aboutContent = ABOUT_CONTENT;

// Pin Connect section on desktop so it doesn't slip away quickly
function initConnectPin() {
  const connect = document.getElementById('connect');

  if (!connect || !window.gsap || !window.ScrollTrigger) return;

  // On mobile, initMobileRagConnectLock handles the pin.
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) return;

  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.create({
    trigger: connect,
    start: 'top top',
    end: '+=150%',
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
  });
}

// Mobile Menu Functionality
function initMobileMenu() {
  // If the header nav is visible on mobile (desktop-mirror mode), don't use the drawer menu.
  try {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const headerNav = document.querySelector('header nav');
    if (isMobile && headerNav) {
      const navDisplay = window.getComputedStyle(headerNav).display;
      if (navDisplay && navDisplay !== 'none') {
        const existingMenu = document.querySelector('.mobile-menu');
        const existingOverlay = document.querySelector('.mobile-overlay');
        if (existingMenu) existingMenu.remove();
        if (existingOverlay) existingOverlay.remove();
        return;
      }
    }
  } catch (e) {}

  // Create mobile menu elements if they don't exist
  let mobileMenu = document.querySelector('.mobile-menu');
  let mobileOverlay = document.querySelector('.mobile-overlay');

  // Mobile UX: the logo itself is the menu button.
  // If an old hamburger toggle exists from a previous build, remove it.
  const header = document.querySelector('header');
  if (header) {
    const oldToggle = header.querySelector('.mobile-nav-toggle');
    if (oldToggle) oldToggle.remove();
  }
  
  if (!mobileMenu) {
    // Create mobile menu
    mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.innerHTML = `
      <button class="mobile-menu-close" aria-label="Close menu">&times;</button>
      <nav>
        <a href="/projects">Personal Experiments</a>
        <a href="/about">About</a>
        <a href="/rag">Rag</a>
      </nav>
    `;
    document.body.appendChild(mobileMenu);
  }
  
  if (!mobileOverlay) {
    // Create overlay
    mobileOverlay = document.createElement('div');
    mobileOverlay.className = 'mobile-overlay';
    document.body.appendChild(mobileOverlay);
  }
  
  const logo = document.querySelector('.logo');
  const closeBtn = mobileMenu.querySelector('.mobile-menu-close');
  const menuLinks = mobileMenu.querySelectorAll('a');
  
  function openMenu() {
    mobileMenu.classList.add('active');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeMenu() {
    mobileMenu.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // Open menu on logo click (mobile only)
  if (logo && window.matchMedia('(max-width: 768px)').matches) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.matchMedia('(max-width: 768px)').matches) {
        openMenu();
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
  
  // Close menu
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }
  
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMenu);
  }
  
  // Close menu when clicking a link
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });
}

// Initialize mobile menu
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
  initMobileMenu();
}

// Refresh ScrollTrigger on resize to handle orientation changes and mobile/desktop switches
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.ScrollTrigger) {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (isMobile) {
        // Mobile keyboards fire resize events; refreshing ScrollTrigger can jump scroll and blur inputs.
        const root = document.documentElement;
        // Also avoid refresh-driven scroll jumps during the initial (no-interaction) load window.
        if (root.classList.contains('pre-interaction')) return;
        const active = document.activeElement;
        const tag = active && active.tagName ? active.tagName.toLowerCase() : '';
        const isTyping = root.classList.contains('keyboard-open') || tag === 'input' || tag === 'textarea';
        if (isTyping) return;
      }
      ScrollTrigger.refresh();
    }
  }, 250);
});

// Smooth scrolling for navigation links with custom speed control
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    const target = document.querySelector(href);
    
    if (!target) return;
    
    // Special handling for about section - scroll through landing animation
    if (href === '#about') {
      unlockAboutAccess();
      const landing = document.getElementById('landing');
      if (landing && !window.matchMedia('(max-width: 768px)').matches) {
        // The landing is pinned for 200% of viewport height
        // So we need to scroll to: landing top + 200vh (the full pin duration)
        const scrollTarget = landing.offsetTop + (window.innerHeight * 2);
        
        window.scrollTo({
          top: scrollTarget,
          behavior: 'smooth'
        });
        return;
      }
    }
    
    // Default smooth scroll for other sections
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
});

function initLandingSplitScroll() {
  const landing = document.getElementById('landing');
  const landingBg = document.querySelector('#landing .landing-bg');
  const overlay = document.querySelector('.landing-split-overlay');
  const topPanel = document.querySelector('.landing-panel-top');
  const bottomPanel = document.querySelector('.landing-panel-bottom');
  const landingContainer = document.querySelector('#landing .landing-container');
  const about = document.getElementById('about');

  if (!landing || !overlay || !topPanel || !bottomPanel || !landingContainer) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  // Mobile browsers frequently change viewport height (address bar/toolbar), which can
  // make ScrollTrigger refresh and shift scroll position. This keeps the split stable.
  if (isMobile) {
    try {
      ScrollTrigger.config({ ignoreMobileResize: true });
    } catch (e) {}
  }

  // Mark split as active so other mobile behaviors can avoid conflicting.
  landing.dataset.splitActive = 'true';

  // Build masked content: clone the landing into each panel so it moves with them.
  const hasPanelContent = topPanel.querySelector('.landing-panel-content') || bottomPanel.querySelector('.landing-panel-content');
  if (!hasPanelContent) {
    const topWrap = document.createElement('div');
    topWrap.className = 'landing-panel-content landing-panel-content-top';
    topWrap.appendChild(landingContainer.cloneNode(true));
    topPanel.appendChild(topWrap);

    const bottomWrap = document.createElement('div');
    bottomWrap.className = 'landing-panel-content landing-panel-content-bottom';
    bottomWrap.appendChild(landingContainer.cloneNode(true));
    bottomPanel.appendChild(bottomWrap);

    landingContainer.classList.add('landing-original-hidden');
  }

  // Grab the cloned landing content inside each panel
  const topLandingLeft = topPanel.querySelector('.landing-panel-content-top .landing-left');
  const bottomLandingLeft = bottomPanel.querySelector('.landing-panel-content-bottom .landing-left');

  // Force initial state - panels cover the landing
  gsap.set(overlay, { autoAlpha: 1 });
  gsap.set(topPanel, { height: '50%', y: 0 });
  gsap.set(bottomPanel, { height: '50%', y: 0 });
  if (landingBg) gsap.set(landingBg, { autoAlpha: 1 });
  if (about) gsap.set(about, { y: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: landing,
      start: 'top top',
      end: '+=200%',
      scrub: 1,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      markers: false,
      refreshPriority: 1,
      onUpdate: (() => {
        let lastReady = false;
        return (self) => {
        // Keep the classic split reveal: About stays under the panels while they open,
        // then becomes fully interactive once the split has essentially completed.
        // Use a lower threshold so the About buttons are usable while About is visible.
        const ready = (self && typeof self.progress === 'number') ? self.progress >= 0.55 : false;
        document.documentElement.classList.toggle('about-ready', ready);
        document.body.classList.toggle('about-ready', ready);
        if (isMobile && ready && !lastReady) {
          const aboutRightScroll = document.getElementById('aboutRightScroll') || document.querySelector('#about .about-right-scroll');
          if (aboutRightScroll) aboutRightScroll.scrollTop = 0;
          if (about) about.scrollTop = 0;
        }
        lastReady = ready;
        };
      })(),
      onEnter: () => {
        if (!isMobile) return;
        document.documentElement.classList.add('split-active');
        document.body.classList.add('split-active');
      },
      onEnterBack: () => {
        if (!isMobile) return;
        document.documentElement.classList.add('split-active');
        document.body.classList.add('split-active');
      },
      onLeave: () => {
        if (!isMobile) return;
        document.documentElement.classList.remove('split-active');
        document.body.classList.remove('split-active');
      },
      onLeaveBack: () => {
        if (!isMobile) return;
        document.documentElement.classList.remove('split-active');
        document.body.classList.remove('split-active');
      },
    }
  });

  // Fade the landing background as panels start to shrink.
  if (landingBg) {
    tl.to(landingBg, { autoAlpha: 0, duration: 0.3, ease: 'power2.inOut' }, 0);
  }

  // Split from the middle by shrinking panel heights to 0.
  tl.to(topPanel, { height: '0%', duration: 0.9, ease: 'power2.inOut' }, 0.2)
    .to(bottomPanel, { height: '0%', duration: 0.9, ease: 'power2.inOut' }, 0.2);

  // Match desktop split movement on mobile too
  if (topLandingLeft) {
    tl.to(topLandingLeft, {
      x: '-58vw',
      y: '-35vh',
      duration: 1.4,
      ease: 'power3.inOut',
    }, 0.25);
  }
  if (bottomLandingLeft) {
    tl.to(bottomLandingLeft, {
      x: '58vw',
      y: '35vh',
      duration: 1.4,
      ease: 'power3.inOut',
    }, 0.45);
  }
  
  if (about) {
    tl.to(about, { y: '-100%', duration: 0.9, ease: 'power2.inOut' }, 0.2);
  }
  
  tl.to(overlay, { autoAlpha: 0, duration: 0.15, ease: 'power2.inOut' }, 0.92);
}

function initHeaderHide() {
  const header = document.querySelector('header');
  const logo = document.querySelector('.logo');
  if (!header) return;

  if (header.classList.contains('ui-header')) {
    header.classList.add('visible');
  } else {
    let lastScroll = window.pageYOffset;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll < lastScroll) {
        // Scrolling up — re-trigger pop animation each time
        if (!header.classList.contains('visible')) {
          header.classList.remove('visible');
          void header.offsetWidth; // force reflow so animation restarts
          header.classList.add('visible');
        }
      } else {
        // Scrolling down — hide header
        header.classList.remove('visible');
      }

      lastScroll = currentScroll;
    });

    document.addEventListener('click', (e) => {
      if (header.classList.contains('visible') && !header.contains(e.target)) {
        header.classList.remove('visible');
      }
    });
  }

  // Clicking the logo always scrolls back to top
  if (logo) {
    logo.addEventListener('click', (e) => {
      const href = logo.getAttribute('href') || '';
      if (href.startsWith('#')) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

}

function initFooterClock() {
  const clockEl = document.getElementById('footerClock');
  if (!clockEl) return;

  const pad = (value, size = 2) => String(value).padStart(size, '0');

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  function render() {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const parts = dateFormatter.formatToParts(utcDate);
    const part = (type) => parts.find((p) => p.type === type)?.value || '';

    const hours = pad(utcDate.getUTCHours());
    const minutes = pad(utcDate.getUTCMinutes());
    const seconds = pad(utcDate.getUTCSeconds());
    const centiseconds = pad(Math.floor(utcDate.getUTCMilliseconds() / 10));

    const label = `${part('weekday')}, ${part('month')} ${part('day')}, Worldwide, ${hours}:${minutes}:${seconds}.${centiseconds}`;
    clockEl.textContent = label;
  }

  render();
  setInterval(render, 100);
}

function initThemeToggle() {
  const toggle = document.querySelector('.ui-toggle-track');
  if (!toggle) return;

  toggle.setAttribute('role', 'button');
  toggle.setAttribute('tabindex', '0');
  toggle.setAttribute('aria-label', 'Toggle theme');

  const key = 'theme';
  const body = document.body;

  const applyTheme = (theme) => {
    body.classList.toggle('theme-dark', theme === 'dark');
    body.classList.toggle('theme-light', theme === 'light');
  };

  const stored = localStorage.getItem(key);
  applyTheme(stored || 'light');

  const toggleTheme = () => {
    const next = body.classList.contains('theme-dark') ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(key, next);
  };

  toggle.addEventListener('click', toggleTheme);
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  });
}

function initCopyEmailLink() {
  const links = Array.from(document.querySelectorAll('.about-copy-email'));
  if (!links.length) return;

  links.forEach((link) => {
    const value = link.getAttribute('data-copy') || link.textContent.trim();

    link.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = value;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'absolute';
          textarea.style.left = '-9999px';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          textarea.remove();
        }
        link.setAttribute('data-tooltip', 'Copied');
        link.classList.add('show-tooltip');
        setTimeout(() => {
          link.setAttribute('data-tooltip', 'Copy URL');
          link.classList.remove('show-tooltip');
        }, 1400);
      } catch (err) {
        link.setAttribute('data-tooltip', 'Copy failed');
        link.classList.add('show-tooltip');
        setTimeout(() => {
          link.setAttribute('data-tooltip', 'Copy URL');
          link.classList.remove('show-tooltip');
        }, 1400);
      }
    });
  });
}

function initHeaderUnderlineClick() {
  const headerLinks = Array.from(document.querySelectorAll('.ui-header a'));
  if (!headerLinks.length) return;

  let clearTimer = null;

  function clearUnderlines() {
    headerLinks.forEach((link) => link.classList.remove('is-underlined'));
  }

  function flashUnderline(link) {
    if (!link) return;
    if (clearTimer) window.clearTimeout(clearTimer);
    clearUnderlines();
    link.classList.add('is-underlined');
    clearTimer = window.setTimeout(() => {
      link.classList.remove('is-underlined');
    }, 420);
  }

  headerLinks.forEach((link) => {
    link.addEventListener('pointerdown', () => {
      flashUnderline(link);
    });

    link.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        flashUnderline(link);
      }
    });
  });
}

const ABOUT_SCROLL_GATE = {
  unlocked: false,
};

function unlockAboutAccess() {
  ABOUT_SCROLL_GATE.unlocked = true;
  document.documentElement.classList.add('about-unlocked');
  document.body.classList.add('about-unlocked');
}

function lockAboutAccess() {
  ABOUT_SCROLL_GATE.unlocked = false;
  document.documentElement.classList.remove('about-unlocked');
  document.body.classList.remove('about-unlocked');
}

function initAboutScrollGate() {
  const about = document.getElementById('about');
  const landing = document.getElementById('landing');
  const projects = document.getElementById('projects');
  if (!about || !landing || !projects) return;

  let lastScroll = window.scrollY;
  let isRedirecting = false;

  function inAboutViewport() {
    const rect = about.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4;
  }

  function handleScroll() {
    if (isRedirecting) return;
    const current = window.scrollY;
    const direction = current > lastScroll ? 'down' : 'up';
    lastScroll = current;

    if (ABOUT_SCROLL_GATE.unlocked) {
      if (!inAboutViewport()) {
        lockAboutAccess();
      }
      return;
    }

    if (!inAboutViewport()) return;

    isRedirecting = true;
    if (direction === 'down') {
      window.scrollTo({ top: projects.offsetTop, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: landing.offsetTop, behavior: 'smooth' });
    }
    setTimeout(() => {
      isRedirecting = false;
    }, 600);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
}

// If you want to control scroll speed more precisely, use this alternative:
// Uncomment and adjust the duration (in milliseconds) - higher value = slower scroll
/*
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const duration = 1000; // Change this value: higher = slower (in ms)
      const start = window.scrollY;
      const end = target.offsetTop;
      const distance = end - start;
      const startTime = performance.now();
      
      function scroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollY = start + distance * progress;
        
        if (progress < 1) {
          requestAnimationFrame(scroll);
        }
      }
      
      requestAnimationFrame(scroll);
    }
  });
});
*/

/**
 * Portfolio Project Gallery
 * Features: 3D Perspective Carousel, Premium Mouse-Tilt, and Parallax Effects
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize other components if they exist
  if (typeof initHeaderHide === 'function') initHeaderHide();
  if (typeof initFooterClock === 'function') initFooterClock();
  if (typeof initAboutScrollGate === 'function') initAboutScrollGate();
  if (typeof initCopyEmailLink === 'function') initCopyEmailLink();
  if (typeof initThemeToggle === 'function') initThemeToggle();
  if (typeof initHeaderUnderlineClick === 'function') initHeaderUnderlineClick();
  
  // Initialize the Projects section (Personal Experiments layout)
  initPersonalExperiments();
  initProjectsScrollLock();
});

// Project Data (updated with provided entries)
const codingProjects = [
  {
    title: 'Datanaut.ai',
    year: 2025,
    tags: ['Django','Supabase','Pandas','Seaborn','PostgreSQL'],
    description: ' Datanaut is an AI-powered data analytics platform that enables users to upload datasets and interact with them using natural language queries. It leverages large language models to generate insights, summarize data, and answer complex questions without requiring SQL knowledge. Built using Django, Pandas, Supabase, and the Groq API, it provides secure dataset management, instant previews, and intelligent analysis. DataNaut makes data exploration faster, more accessible, and user-friendly for both technical and non-technical users.',  
    github: 'https://github.com/shark4real/Datanaut',
    demo: 'https://datanaut.onrender.com/',
    thumbnail: './assests/datanaut.ai.png',
    image: './assests/datanaut.ai.png',
  },
  {
    title: 'Genly.ai',
    year: 2025,
    tags: ['Django','OAuth2','HTML/CSS & Jinja2'],
    description: 'Genly is an AI-powered email automation platform that helps users generate professional, context-aware emails with customizable tones in seconds. It supports both single and bulk email sending with CSV-based personalization, attachments, and live editing capabilities. Built using Django, Python, Google OAuth, the Gmail API, and Mistral 7B via OpenRouter, Genly streamlines communication while ensuring a secure and intuitive user experience. It is designed to save time, improve productivity, and simplify email management for individuals and businesses.',
    github: 'https://github.com/shark4real/Genly.ai',
    demo: 'https://genly-ai.onrender.com/',
    thumbnail: './assests/genlyz.png',
    image: './assests/genlyz.png',
  },
  {
    title: 'Retail_order',
    year: 2023,
    tags: ['Python','Pandas','Postgres', 'Tableau'],
    description: 'Retail Order Data Analysis is an end-to-end data analytics project that transforms raw retail order data into actionable business insights using Python, SQL, and data visualization techniques. The project involves data cleaning, exploratory data analysis, KPI tracking, and trend analysis to uncover patterns in sales, profit, customer behavior, and regional performance. Interactive dashboards and visualizations enable stakeholders to make data-driven decisions and identify opportunities for business growth. This project showcases practical skills in data preprocessing, analytics, and business intelligence.',
    github: 'https://github.com/shark4real/Retail_order_DA_project',
    demo: 'https://shark4real.github.io/Retail_order_DA_project',
    thumbnail: './assests/Retail_order.png',
    image: './assests/Retail_order.png',
  },
  {
    title: 'TDS_LLM',
    year: 2023,
    tags: ['LLM', 'Course'],
    description: 'DataWorks Solutions Automation Agent is an LLM-powered automation system developed as part of the Tools in Data Science course at Indian Institute of Technology Madras. The project processes plain-English instructions to automate file operations, data processing, API interactions, SQL queries, and business workflows through a REST API. Built with Python, Docker, and modern LLM integration, it emphasizes secure execution, workflow automation, and practical applications of AI-driven software engineering.',
    github: 'https://github.com/shark4real/tds_llm_project',
    demo: '#',
    thumbnail: './assests/tdsllm.png',
    image: './assests/tdsllm.png',
  },
  {
    title: 'Autoparser',
    year: 2025,
    tags: ['Python','Gemini','Groq','Pytest','Python PDF Parsing'],
    description: 'AI Agent Challenge is a project developed as part of an AI engineering challenge, where I explored the design and implementation of autonomous AI agents to solve real-world tasks. The project focuses on leveraging modern LLMs, agent workflows, and tool integration to build intelligent, task-oriented systems. It provided hands-on experience with AI agent architectures, prompt engineering, and practical problem-solving in an end-to-end development environment.',
    github: 'https://github.com/shark4real/ai-agent-challenge',
    demo: '#',
    thumbnail: './assests/Autoparser.png',
    image: './assests/Autoparser.png',
  },
  {
    title: 'Creative Coding',
    year: 2022,
    tags: ['Python Scripting','JavaScript','HTML/CSS','Math'],
    description: 'Fourier Python is a creative coding project that demonstrates how Fourier Series can reconstruct complex drawings and shapes using rotating vectors (epicycles). Built with Python, it combines mathematical concepts with visualization to create smooth animations, showcasing the practical application of Fourier Transformations in computer graphics and signal processing.',
    github: 'https://github.com/shark4real/Fourier_python',
    demo: 'https://shark4real.github.io/fourieronline/',
    thumbnail: './assests/ftcc.png',
    image: './assests/ftcc.png',
  },
];

// Global assignment for consistency
window.codingProjects = codingProjects;

function initPersonalExperiments() {
  const feed = document.getElementById('experimentsFeed');
  const counterActive = document.getElementById('experimentsCounterActive');
  const counterNext = document.getElementById('experimentsCounterNext');
  const sidebar = document.querySelector('.experiments-sidebar');
  const counterWrap = document.querySelector('.experiments-counter');
  const scrollContainer = document.querySelector('#projects .experiments-shell');

  const section = document.getElementById('projects');

  if (!feed || !scrollContainer || !Array.isArray(window.codingProjects)) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isSimple = document.body.classList.contains('projects-simple');

  // Mobile should mirror the web/desktop Projects section.
  // (No mobile-only horizontal scrollytelling; keep the same vertical feed + sidebar/counter behavior.)

  const projects = window.codingProjects;

  // Right: project entries
  feed.innerHTML = projects
    .map((p, index) => {
      const year = p.year ? Number(p.year) : '';
      const yearLabel = year ? `${year}` : '';
      const title = p.title ? String(p.title) : '';
      const desc = p.description ? String(p.description) : '';
      const img = p.image || p.thumbnail || '';
      const chips = Array.isArray(p.tags) ? p.tags : [];
      const demo = p.demo && p.demo !== '#' ? String(p.demo) : '';
      const github = p.github && p.github !== '#' ? String(p.github) : '';

      if (isSimple) {
        const linksHtml = [
          demo ? `<a class="exp-link-btn" href="${demo}" target="_blank" rel="noopener noreferrer">Live ↗</a>` : '',
          github ? `<a class="exp-link-btn" href="${github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : ''
        ].filter(Boolean).join('');

        return `
          <article class="exp-item exp-item--simple" data-exp-index="${index}">
            <div class="exp-row">
              <span class="exp-year">${yearLabel}</span>
              ${img ? `
                <figure class="exp-thumb">
                  <img src="${img}" alt="${title}" loading="lazy" style="object-fit: contain; object-position: center center;" />
                </figure>
              ` : ''}
              <div class="exp-content">
                <h3 class="exp-title">${title}</h3>
                <p class="exp-desc">${desc}</p>
                ${linksHtml ? `<div class="exp-links">${linksHtml}</div>` : ''}
              </div>
            </div>
          </article>
        `;
      }

      const chipHtml = chips
        .map((c) => `<span class="exp-chip">${String(c)}</span>`)
        .join('');

      const actionsHtml = `
        <div class="exp-actions">
          ${demo ? `<a class="exp-action exp-action-live" href="${demo}" target="_blank" rel="noopener noreferrer">Live</a>` : ''}
          ${github ? `<a class="exp-action exp-action-github" href="${github}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ''}
        </div>
      `;

      return `
        <article class="exp-item" data-exp-index="${index}">
          <div class="exp-top">
            <span class="exp-year">${yearLabel}</span>
            <h3 class="exp-title">${title}</h3>
            <div class="exp-chips">${chipHtml}</div>
          </div>
          <div class="exp-divider" aria-hidden="true"></div>
          <p class="exp-desc">${desc}</p>
          ${actionsHtml}
          ${
            img
              ? `
                <figure class="exp-media">
                  <img class="exp-image" src="${img}" alt="${title}" loading="lazy" />
                </figure>
              `
              : ''
          }
        </article>
      `;
    })
    .join('');

  const items = Array.from(feed.querySelectorAll('.exp-item'));
  if (!items.length) return;

  // Ensure any previous mobile-only mode class is removed.
  if (section) section.classList.remove('projects-mobile-hscroll');

  // Mobile: remove Projects indexing entirely (no counter updates/animation).
  if (isMobile || isSimple) {
    return;
  }

  if (!counterActive || !counterNext || !sidebar || !counterWrap) return;

  // Sidebar numbers:
  // - Active number moves down while scrolling through the active project
  // - Next number is always visible at a fixed "stop" position
  // - When active reaches the stop, the next becomes active
  const pad2 = (n) => String(n).padStart(2, '0');

  let activeIndex = 0;
  let rafId = 0;
  let lastScrollTop = 0;
  let titleElements = []; // Store references to title elements

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function cacheTitleElements() {
    titleElements = items.map(item => item.querySelector('.exp-title'));
  }

  function setNumbers(index) {
    const n = Math.max(0, Math.min(items.length - 1, Number(index) || 0));
    activeIndex = n;
    counterActive.textContent = pad2(n + 1);
    const nextIdx = n + 1;
    if (nextIdx < items.length) {
      counterNext.textContent = pad2(nextIdx + 1);
      counterNext.style.display = '';
    } else {
      counterNext.style.display = 'none';
    }
  }

  function getTitleY(index) {
    // Get the live Y position of a title relative to the counter container
    if (!titleElements[index]) return 0;
    const counterRect = counterWrap.getBoundingClientRect();
    const titleRect = titleElements[index].getBoundingClientRect();
    return titleRect.top - counterRect.top;
  }

  function computeActiveIndex() {
    // Active switches when a project's title crosses Y=0 (top of counter)
    // Also activate last project when we're near the bottom
    const scrollTop = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight;
    const clientHeight = scrollContainer.clientHeight;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;
    
    if (isNearBottom) {
      return titleElements.length - 1;
    }
    
    for (let i = titleElements.length - 1; i >= 0; i -= 1) {
      const titleY = getTitleY(i);
      if (titleY <= 1) return i;
    }
    return 0;
  }

  function updateCounter() {
    rafId = 0;

    const scrollTop = scrollContainer.scrollTop;
    const dir = scrollTop - lastScrollTop;
    lastScrollTop = scrollTop;

    // Sync active index based on which title is at the top
    const idx = computeActiveIndex();
    if (idx !== activeIndex) setNumbers(idx);

    const nextIdx = activeIndex + 1;
    const gap = 15;

    // Next number: LOCKED to the next project's title position
    let nextY = 0;
    if (nextIdx < titleElements.length && titleElements[nextIdx]) {
      nextY = Math.max(0, getTitleY(nextIdx));
      counterNext.style.transform = `translate3d(0, ${nextY}px, 0)`;

      // When next title hits the top, promote it
      if (dir >= 0 && nextY <= 0.5) {
        setNumbers(nextIdx);
        requestUpdate();
        return;
      }
    }

    // Active number: moves DOWN through the project
    // Start at 0, move down based on scroll progress
    const activeTitleY = getTitleY(activeIndex);
    const nextTitleY = nextIdx < titleElements.length ? getTitleY(nextIdx) : 10000;
    
    // Progress is based on how far we've scrolled past the active title
    const distance = nextTitleY - activeTitleY;
    const scrolledPastTitle = Math.max(0, -activeTitleY); // How far past 0 the active title has scrolled
    const progress = distance > 0 ? clamp(scrolledPastTitle / distance, 0, 1) : 0;
    
    const maxActiveY = Math.max(0, counterWrap.clientHeight - counterActive.offsetHeight);
    const activeH = counterActive.offsetHeight;
    
    // Cap active movement to stop before next number
    const maxTravel = nextIdx < titleElements.length 
      ? Math.max(0, nextY - activeH - gap)
      : maxActiveY;
    
    const activeY = progress * Math.min(maxTravel, maxActiveY);
    counterActive.style.transform = `translate3d(0, ${activeY}px, 0)`;
  }

  function requestUpdate() {
    if (rafId) return;
    rafId = requestAnimationFrame(updateCounter);
  }

  // Initial render
  lastScrollTop = scrollContainer.scrollTop;
  cacheTitleElements();
  setNumbers(0);
  counterActive.style.transform = 'translate3d(0, 0, 0)';
  
  // Position next number correctly on initial load
  if (titleElements.length > 1 && titleElements[1]) {
    // Wait for next frame to ensure elements are rendered
    requestAnimationFrame(() => {
      const initialNextY = Math.max(0, getTitleY(1));
      counterNext.style.transform = `translate3d(0, ${initialNextY}px, 0)`;
      requestUpdate();
    });
  } else {
    requestUpdate();
  }

  scrollContainer.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', () => {
    cacheTitleElements();
    requestUpdate();
  });
}

function initMobileProjectsHorizontalScroll({ section, shell, feed, items }) {
  if (!section || !shell || !feed || !Array.isArray(items) || !items.length) return;

  // Mobile: map vertical scrolling over the Projects section to horizontal translation of the feed.
  // Each project occupies one viewport.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let rafId = 0;
  let currentX = 0;
  let targetX = 0;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function viewportHeight() {
    const vv = window.visualViewport;
    const h = vv && typeof vv.height === 'number' ? vv.height : (window.innerHeight || document.documentElement.clientHeight);
    return Math.max(1, h || 1);
  }

  function viewportWidth() {
    return Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
  }

  function applySectionHeight() {
    // Make the section tall enough to provide N-1 viewport scroll steps.
    const vh = viewportHeight();
    section.style.height = `${items.length * vh}px`;
    // Keep the shell pinned by CSS (sticky). Ensure it's exactly viewport height.
    shell.style.height = `${vh}px`;
  }

  function computeTargetX() {
    const vh = viewportHeight();
    const vw = viewportWidth();
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const scrollY = window.scrollY;
    const totalScroll = Math.max(0, items.length * vh - vh);

    const rawProgress = totalScroll > 0 ? (scrollY - sectionTop) / totalScroll : 0;
    const progress = clamp(rawProgress, 0, 1);
    targetX = -progress * (items.length - 1) * vw;
  }

  function tick() {
    rafId = 0;

    if (prefersReducedMotion) {
      currentX = targetX;
    } else {
      currentX += (targetX - currentX) * 0.14;
      if (Math.abs(targetX - currentX) < 0.6) currentX = targetX;
    }

    feed.style.transform = `translate3d(${currentX}px, 0, 0)`;

    if (!prefersReducedMotion && Math.abs(targetX - currentX) >= 0.6) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function requestTick() {
    if (rafId) return;
    rafId = requestAnimationFrame(tick);
  }

  function onScroll() {
    computeTargetX();
    requestTick();
  }

  function onResize() {
    applySectionHeight();
    computeTargetX();
    // Snap immediately on resize to avoid showing a half-slide.
    currentX = targetX;
    feed.style.transform = `translate3d(${currentX}px, 0, 0)`;
  }

  applySectionHeight();
  computeTargetX();
  currentX = targetX;
  feed.style.transform = `translate3d(${currentX}px, 0, 0)`;

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
}

function initProjectsScrollLock() {
  const section = document.getElementById('projects');
  const scrollContainer = document.querySelector('#projects .experiments-shell');
  if (!section || !scrollContainer) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) return;

  let isSnapping = false;

  function isSectionLockedInView() {
    const r = section.getBoundingClientRect();
    // Projects is a 100vh section; treat it as "active" when it fills the viewport.
    return r.top <= 0 && r.bottom >= window.innerHeight;
  }

  function shouldSnapIntoView(deltaY) {
    if (isSnapping) return false;
    const r = section.getBoundingClientRect();

    const snapBufferPx = 160;
    const snapDeadzonePx = 2;

    // Snap only when ENTERING Projects (prevents "sticky" snap when leaving).
    // - Coming from above (scrolling down): section top is below viewport top.
    // - Coming from below (scrolling up): section top is above viewport top but section overlaps viewport.
    if (deltaY > 0) {
      // Snap slightly before the section fully arrives to avoid it "slipping".
      return r.top > snapDeadzonePx && r.top < window.innerHeight + snapBufferPx;
    }

    if (deltaY < 0) {
      return r.top < -snapDeadzonePx && r.bottom > -snapBufferPx;
    }

    return false;
  }

  function snapSectionToTop() {
    const r = section.getBoundingClientRect();
    isSnapping = true;
    window.scrollBy({ top: r.top, left: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      isSnapping = false;
    }, 260);
  }

  function getScrollState() {
    const top = scrollContainer.scrollTop;
    const max = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
    return { top, max };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function canConsumeDelta(deltaY) {
    const { top, max } = getScrollState();
    if (max <= 0 || deltaY === 0) return false;
    const nextTop = clamp(top + deltaY, 0, max);
    return Math.abs(nextTop - top) > 0.5;
  }

  // Route wheel scrolling into the Projects scroll container while the section is "locked".
  window.addEventListener(
    'wheel',
    (e) => {
      // First scroll: snap Projects into position ("lock-in")
      if (!isSectionLockedInView() && shouldSnapIntoView(e.deltaY)) {
        e.preventDefault();
        snapSectionToTop();
        return;
      }

      if (!isSectionLockedInView()) return;
      // If user can scroll inside Projects, prevent page scroll and scroll Projects instead.
      if (!canConsumeDelta(e.deltaY)) return;
      e.preventDefault();
      const { top, max } = getScrollState();
      scrollContainer.scrollTop = clamp(top + e.deltaY, 0, max);
    },
    { passive: false }
  );

  // Keyboard support (arrows/page/space) to keep behavior consistent.
  window.addEventListener('keydown', (e) => {
    let delta = 0;
    if (e.key === 'ArrowDown') delta = 60;
    else if (e.key === 'ArrowUp') delta = -60;
    else if (e.key === 'PageDown' || e.key === ' ') delta = Math.max(120, scrollContainer.clientHeight * 0.9);
    else if (e.key === 'PageUp') delta = -Math.max(120, scrollContainer.clientHeight * 0.9);
    else if (e.key === 'Home') delta = -Infinity;
    else if (e.key === 'End') delta = Infinity;
    else return;

    // First key scroll: snap Projects into position ("lock-in")
    if (!isSectionLockedInView()) {
      if (delta !== Infinity && delta !== -Infinity && delta !== 0 && shouldSnapIntoView(delta)) {
        e.preventDefault();
        snapSectionToTop();
      }
      return;
    }

    if (delta === -Infinity) {
      if (!canConsumeDelta(-1)) return;
      e.preventDefault();
      scrollContainer.scrollTop = 0;
      return;
    }

    if (delta === Infinity) {
      if (!canConsumeDelta(1)) return;
      e.preventDefault();
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
      return;
    }

    if (!canConsumeDelta(delta)) return;
    e.preventDefault();
    const { top, max } = getScrollState();
    scrollContainer.scrollTop = clamp(top + delta, 0, max);
  });
}

function initProjectCards() {
  const stage = document.getElementById('cardsStage');
  const btnPrev = document.getElementById('cardsPrev');
  const btnNext = document.getElementById('cardsNext');

  if (!stage || !window.codingProjects) return;

  stage.innerHTML = '';
  const projects = window.codingProjects;
  const count = projects.length;
  let currentIndex = 0;
  const cards = [];

  // 1. Generate Card DOM Elements
  projects.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = i;

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    // Helper to create buttons and handle external links
    const createBtn = (text, url, type) => {
      const btn = document.createElement('button');
      btn.className = `proj-btn ${type}-btn`;
      btn.textContent = text;
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents flipping the card when clicking button
        if (url && url !== '#') {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      });
      return btn;
    };

    // Front Face
    const front = document.createElement('div');
    front.className = 'card-face card-front';
    
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    if (p.thumbnail) thumb.style.backgroundImage = `url('${p.thumbnail}')`;

    // remove overlay buttons from thumbnail; add a white info area under the thumbnail
    thumb.appendChild(document.createElement('div')); // placeholder to preserve structure if needed
    front.appendChild(thumb);

    const info = document.createElement('div');
    info.className = 'card-info';

    const infoTitle = document.createElement('h3');
    infoTitle.className = 'card-title';
    infoTitle.textContent = p.title || 'Project';

    // Only show centered project title in the white bar (buttons moved to preview modal)
    info.appendChild(infoTitle);
    front.appendChild(info);

    // Back Face
    const back = document.createElement('div');
    back.className = 'card-face card-back';
    
    const backContent = document.createElement('div');
    backContent.innerHTML = `<h3>${p.title}</h3><p>${p.description}</p>`;
    
    const backBtns = document.createElement('div');
    backBtns.className = 'proj-btns';
    backBtns.appendChild(createBtn('Demo', p.demo, 'demo'));
    backBtns.appendChild(createBtn('Github', p.github, 'github'));

    back.appendChild(backContent);
    back.appendChild(backBtns);

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    // Click to flip + open preview (Only if card is in the center)
    card.addEventListener('click', () => {
      if (card.classList.contains('center')) {
        openPreviewSequence(card, p);
      }
    });

    stage.appendChild(card);
    cards.push(card);
  });

  // 2. Position Cards in 3D Space
  function updateCardPositions() {
    cards.forEach((card, i) => {
      card.classList.remove('center', 'left', 'right', 'far-left', 'far-right', 'hidden', 'flipped');
      
      // Infinite Loop Logic: Finds relative position of each card to the current index
      const diff = (i - currentIndex + count) % count;

      if (diff === 0) {
        card.classList.add('center');
      } else if (diff === 1) {
        card.classList.add('right');
      } else if (diff === count - 1) {
        card.classList.add('left');
      } else if (diff === 2) {
        card.classList.add('far-right');
      } else if (diff === count - 2) {
        card.classList.add('far-left');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  // 3. Premium Interactive Tilt Logic
  // Smooth, inertia-driven hover using RAF and lerp for realism
  cards.forEach((card) => {
    const inner = card.querySelector('.card-inner');
    const thumb = card.querySelector('.thumb');
    const info = card.querySelector('.card-info');
    let bounds = null;

    // target and current values for smoothing
    let targetRx = 0, targetRy = 0;
    let curRx = 0, curRy = 0;
    let targetZ = 0, curZ = 0;
    let animating = false;

    // lerp helper
    const lerp = (a, b, t) => a + (b - a) * t;

    function rafLoop() {
      animating = true;
      // ease factor (smaller = more inertia)
      const t = 0.12;

      curRx = lerp(curRx, targetRx, t);
      curRy = lerp(curRy, targetRy, t);
      curZ = lerp(curZ, targetZ, t);

      const scale = 1 + Math.min(0.07, Math.abs(curRx + curRy) * 0.0025);

      inner.style.transform = `rotateX(${curRx}deg) rotateY(${curRy}deg) translateZ(${curZ}px) scale(${scale})`;

      // update parallax thumb and spotlight variables
      thumb.style.setProperty('--parallax-x', `${curRy * 0.8}px`);
      thumb.style.setProperty('--parallax-y', `${-curRx * 0.8}px`);
      inner.style.setProperty('--mouse-x', `${50 + (curRy/40)*50}%`);
      inner.style.setProperty('--mouse-y', `${50 + (curRx/40)*50}%`);
      if (info) info.style.setProperty('--button-lift', `${-Math.abs(curRx) * 0.5}px`);

      // dynamic shadow intensity tied to Z and rotation
      const shadowDepth = Math.max(20, 40 + curZ * 0.6 + Math.abs(curRx) * 0.6 + Math.abs(curRy) * 0.6);
      inner.style.boxShadow = `0 ${shadowDepth}px ${shadowDepth * 2}px rgba(0,0,0,0.35)`;

      // continue loop while not at rest
      if (Math.abs(curRx - targetRx) > 0.01 || Math.abs(curRy - targetRy) > 0.01 || Math.abs(curZ - targetZ) > 0.1) {
        requestAnimationFrame(rafLoop);
      } else {
        animating = false;
      }
    }

    function onMouseMove(e) {
      if (!card.classList.contains('center') || card.classList.contains('flipped')) return;
      if (!bounds) bounds = inner.getBoundingClientRect();

      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      const cx = bounds.width / 2;
      const cy = bounds.height / 2;

      // softer max tilt (12deg) with a slight offset for realism
      const maxTilt = 12;
      const rx = (-(mouseY - cy) / cy) * maxTilt;
      const ry = ((mouseX - cx) / cx) * maxTilt;

      // Z translation proportional to combined tilt
      const z = 60 + Math.min(80, Math.abs(rx) + Math.abs(ry) * 2);

      targetRx = rx;
      targetRy = ry;
      targetZ = z;

      if (!animating) requestAnimationFrame(rafLoop);
    }

    function onEnter() {
      bounds = inner.getBoundingClientRect();
      // small initial pop
      targetZ = 70;
      if (!animating) requestAnimationFrame(rafLoop);
    }

    function onLeave() {
      // return to neutral
      targetRx = 0; targetRy = 0; targetZ = 0;
      bounds = null;
      if (!animating) requestAnimationFrame(rafLoop);
    }

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onLeave);
  });

  // Modal: create once and attach to body
  let modalEl = null;
  function createPreviewModal() {
    modalEl = document.createElement('div');
    modalEl.id = 'projectPreviewModal';
    modalEl.className = 'project-preview-modal';
    modalEl.innerHTML = `
      <div class="ppm-overlay"></div>
      <div class="ppm-shell" role="dialog" aria-modal="true">
        <button class="ppm-close" aria-label="Close preview">×</button>
        <div class="ppm-content">
          <div class="ppm-thumb"></div>
          <div class="ppm-info">
            <h3 class="ppm-title"></h3>
            <p class="ppm-desc"></p>
            <div class="ppm-links"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    // Close handlers
    modalEl.querySelector('.ppm-close').addEventListener('click', closePreview);
    modalEl.querySelector('.ppm-overlay').addEventListener('click', closePreview);
  }

  function showPreview(project, card) {
    if (!modalEl) createPreviewModal();
    const shell = modalEl.querySelector('.ppm-shell');
    const thumb = modalEl.querySelector('.ppm-thumb');
    const title = modalEl.querySelector('.ppm-title');
    const desc = modalEl.querySelector('.ppm-desc');
    const links = modalEl.querySelector('.ppm-links');

    thumb.style.backgroundImage = project.thumbnail ? `url('${project.thumbnail}')` : '';
    title.textContent = project.title || '';
    desc.textContent = project.description || '';

    links.innerHTML = '';
    if (project.demo && project.demo !== '#') {
      const a = document.createElement('a');
      a.className = 'ppm-link demo-link';
      a.href = project.demo;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Live Demo';
      links.appendChild(a);
    }
    if (project.github && project.github !== '#') {
      const a2 = document.createElement('a');
      a2.className = 'ppm-link github-link';
      a2.href = project.github;
      a2.target = '_blank';
      a2.rel = 'noopener noreferrer';
      a2.textContent = 'GitHub';
      links.appendChild(a2);
    }

    // Show modal
    modalEl.classList.add('open');
    // keep the card flipped while modal open
    if (card) card.classList.add('flipped');
  }

  function closePreview() {
    if (!modalEl) return;
    // remove open state
    modalEl.classList.remove('open');
    // remove flipped class from any card
    cards.forEach(c => c.classList.remove('flipped'));
  }

  function openPreviewSequence(card, project) {
    // flip the card first, then open modal after a short delay for the flip animation
    card.classList.add('flipped');
    setTimeout(() => showPreview(project, card), 380);
  }

  // 4. Navigation Events
  btnPrev?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + count) % count;
    updateCardPositions();
  });

  btnNext?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % count;
    updateCardPositions();
  });

  // Add touch swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  stage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  stage.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchStartX - touchEndX > swipeThreshold) {
      // Swipe left - next card
      currentIndex = (currentIndex + 1) % count;
      updateCardPositions();
    } else if (touchEndX - touchStartX > swipeThreshold) {
      // Swipe right - previous card
      currentIndex = (currentIndex - 1 + count) % count;
      updateCardPositions();
    }
  }

  // Initial render
  updateCardPositions();
}

// Pin projects section for extended scroll (optimized for performance)
function initProjectsPin() {
  const projectsSection = document.getElementById('projects');
  const projectsCanvas = document.getElementById('projectsCanvas');
  
  if (!projectsSection || !projectsCanvas || !window.gsap || !window.ScrollTrigger) return;
  
  gsap.registerPlugin(ScrollTrigger);

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Mobile: NO PIN - just let it scroll naturally
  if (isMobile) {
    console.log('Projects pin disabled on mobile');
    return;
  }

  // Desktop: pin just the canvas; title/controls are sticky.
  ScrollTrigger.create({
    trigger: projectsSection,
    start: 'top top',
    end: '+=150%', // Pin for 150% of viewport height
    pin: projectsCanvas,
    pinSpacing: true,
    anticipatePin: 1,
  });
}

// about section
function initAboutSection() {
  const bioTop = document.getElementById('aboutBioTextTop');
  const bioBottom = document.getElementById('aboutBioTextBottom');
  const experienceList = document.getElementById('aboutExperienceList');
  const educationList = document.getElementById('aboutEducationList');
  const hobbiesList = document.getElementById('aboutHobbiesList');

  // New layout path
  if (bioTop && bioBottom && experienceList && educationList && hobbiesList) {
    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Bio split (so the image can sit between paragraphs)
    {
      const raw = String(ABOUT_CONTENT.bio || '').trim();
      const parts = raw.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

      if (parts.length >= 2) {
        bioTop.textContent = parts[0];
        bioBottom.textContent = parts.slice(1).join('\n\n');
      } else {
        // Fallback: split near the middle at a sentence boundary.
        const mid = Math.max(0, Math.floor(raw.length / 2));
        const left = raw.lastIndexOf('.', mid);
        const right = raw.indexOf('.', mid);
        const cut = right !== -1 ? right + 1 : (left !== -1 ? left + 1 : mid);
        bioTop.textContent = raw.slice(0, cut).trim();
        bioBottom.textContent = raw.slice(cut).trim();
      }
    }

    // Experience
    {
      const items = Array.isArray(ABOUT_CONTENT.work) ? ABOUT_CONTENT.work : [];
      experienceList.innerHTML = `
        <div class="about-work-list">
          ${items
            .map((item) => {
              const org = item?.org ? escapeHtml(item.org) : '';
              const role = item?.role ? escapeHtml(item.role) : '';
              const desc = item?.description ? escapeHtml(item.description) : '';
              const roles = Array.isArray(item?.roles) ? item.roles : [];
              const nestedRoles = roles
                .map((nestedRole) => {
                  const title = nestedRole?.title ? escapeHtml(nestedRole.title) : '';
                  const type = nestedRole?.type ? escapeHtml(nestedRole.type) : '';
                  const nestedDesc = nestedRole?.description ? escapeHtml(nestedRole.description) : '';

                  return `
                    <div class="about-work-role">
                      ${title ? `<p class="about-role-title">${title}</p>` : ''}
                      ${type ? `<p class="about-role-meta">${type}</p>` : ''}
                      ${nestedDesc ? `<p class="about-item-desc about-role-desc">${nestedDesc}</p>` : ''}
                    </div>
                  `;
                })
                .join('');

              return `
                <div class="about-work-item${nestedRoles ? ' about-work-item-grouped' : ''}">
                  <div class="about-work-head">
                    <div class="about-work-titles">
                      ${org ? `<p class="about-item-title">${org}</p>` : ''}
                      ${role && !nestedRoles ? `<p class="about-item-meta">${role}</p>` : ''}
                    </div>
                  </div>
                  ${nestedRoles ? `<div class="about-work-roles">${nestedRoles}</div>` : ''}
                  ${desc && !nestedRoles ? `<p class="about-item-desc">${desc}</p>` : ''}
                </div>
              `;
            })
            .join('')}
        </div>
      `;
    }

    // Education
    {
      const items = Array.isArray(ABOUT_CONTENT.education) ? ABOUT_CONTENT.education : [];
      educationList.innerHTML = `
        <div class="about-edu-list">
          ${items
            .map((edu) => {
              const school = edu?.school ? escapeHtml(edu.school) : '';
              const degree = edu?.degree ? escapeHtml(edu.degree) : '';
              const date = edu?.date ? escapeHtml(edu.date) : '';
              const desc = edu?.description ? escapeHtml(edu.description) : '';
              const meta = [degree, date].filter(Boolean).join(' • ');

              return `
                <div class="about-edu-item">
                  <div class="about-edu-head">
                    <div class="about-edu-titles">
                      ${school ? `<p class="about-item-title">${school}</p>` : ''}
                      ${meta ? `<p class="about-item-meta">${meta}</p>` : ''}
                    </div>
                  </div>
                  ${desc ? `<p class="about-item-desc">${desc}</p>` : ''}
                </div>
              `;
            })
            .join('')}
        </div>
      `;
    }

    // Hobbies
    hobbiesList.replaceChildren();
    {
      function hobbyIconSvg(label) {
        const text = String(label || '').toLowerCase();

        // Simple inline SVG set (stroke-based, inherits currentColor)
        const icons = {
          collaborate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3Z"/><path d="M8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Z"/><path d="M2 20c0-2.76 2.24-5 5-5h2"/><path d="M22 20c0-2.76-2.24-5-5-5h-2"/><path d="M9 15h6"/></svg>',
          pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
          chess: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6l-1 3 3 2-2 3 3 3-3 2"/><path d="M8 21h8"/><path d="M9 21v-3a4 4 0 0 1 6 0v3"/><path d="M7 15h10"/></svg>',
          badminton: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 2c-2.5 2.5-2 6 1.5 9.5S24 15 22 17s-5.5-1-8.5-4S10 9.5 12.5 7 18.5 4.5 16 2Z"/><path d="M9 15l-6 6"/><path d="M7 21l-4-4"/></svg>',
          film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14"/><path d="M17 5v14"/><path d="M3 9h4"/><path d="M3 15h4"/><path d="M17 9h4"/><path d="M17 15h4"/></svg>',
          music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><path d="M9 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M21 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>',
          star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7 7 .6-5.3 4.6 1.7 7.2L12 17.8 5.6 21.4l1.7-7.2L2 9.6 9 9Z"/></svg>',
        };

        if (text.includes('collab') || text.includes('project')) return icons.collaborate;
        if (text.includes('sketch') || text.includes('draw') || text.includes('design') || text.includes('illustr')) return icons.pencil;
        if (text.includes('chess')) return icons.chess;
        if (text.includes('badminton')) return icons.badminton;
        if (text.includes('movie') || text.includes('series') || text.includes('film')) return icons.film;
        if (text.includes('music')) return icons.music;

        return icons.star;
      }

      const list = document.createElement('ul');
      list.className = 'about-hobbies-icons';
      for (const hobby of ABOUT_CONTENT.hobbies || []) {
        const li = document.createElement('li');
        const icon = document.createElement('span');
        icon.className = 'about-hobby-icon';
        icon.setAttribute('role', 'img');
        icon.setAttribute('aria-label', String(hobby));
        icon.setAttribute('data-label', String(hobby));
        icon.innerHTML = hobbyIconSvg(hobby);

        li.appendChild(icon);
        list.appendChild(li);
      }
      hobbiesList.appendChild(list);
    }

    return;
  }

  // Legacy layout fallback (interactive panels)
  const container = document.getElementById('aboutInteractive');
  if (!container) return;

  const bioBody = document.getElementById('aboutPanelBodyBio');
  const workBody = document.getElementById('aboutPanelBodyWork');
  const eduBody = document.getElementById('aboutPanelBodyEducation');
  const hobbiesBody = document.getElementById('aboutPanelBodyHobbies');

  if (!bioBody || !workBody || !eduBody || !hobbiesBody) return;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setActive(key) {
    const nextKey = String(key || '').trim();
    container.dataset.active = nextKey;

    const panels = Array.from(container.querySelectorAll('.about-panel'));
    for (const panel of panels) {
      const panelKey = panel.getAttribute('data-key') || '';
      const btn = panel.querySelector('.about-panel-toggle');
      const isActive = panelKey === nextKey;
      if (btn) {
        btn.setAttribute('aria-expanded', String(isActive));
        // Requested: arrow flips to indicate minimize when expanded.
        btn.textContent = isActive ? '↙' : '↗';
      }
    }
  }

  // Bio
  bioBody.replaceChildren();
  {
    const p = document.createElement('p');
    p.className = 'about-item-desc';
    p.textContent = ABOUT_CONTENT.bio;
    bioBody.appendChild(p);
  }

  // Work
  {
    const items = Array.isArray(ABOUT_CONTENT.work) ? ABOUT_CONTENT.work : [];

    workBody.innerHTML = `
      <div class="about-work-list">
        ${items
          .map((item) => {
            const org = item?.org ? escapeHtml(item.org) : '';
            const role = item?.role ? escapeHtml(item.role) : '';
            const desc = item?.description ? escapeHtml(item.description) : '';
            const roles = Array.isArray(item?.roles) ? item.roles : [];
            const nestedRoles = roles
              .map((nestedRole) => {
                const title = nestedRole?.title ? escapeHtml(nestedRole.title) : '';
                const type = nestedRole?.type ? escapeHtml(nestedRole.type) : '';
                const nestedDesc = nestedRole?.description ? escapeHtml(nestedRole.description) : '';

                return `
                  <div class="about-work-role">
                    ${title ? `<p class="about-role-title">${title}</p>` : ''}
                    ${type ? `<p class="about-role-meta">${type}</p>` : ''}
                    ${nestedDesc ? `<p class="about-item-desc about-role-desc">${nestedDesc}</p>` : ''}
                  </div>
                `;
              })
              .join('');

            return `
              <div class="about-work-item${nestedRoles ? ' about-work-item-grouped' : ''}">
                <div class="about-work-head">
                  <div class="about-work-titles">
                    ${org ? `<p class="about-item-title">${org}</p>` : ''}
                    ${role && !nestedRoles ? `<p class="about-item-meta">${role}</p>` : ''}
                  </div>
                </div>
                ${nestedRoles ? `<div class="about-work-roles">${nestedRoles}</div>` : ''}
                ${desc && !nestedRoles ? `<p class="about-item-desc">${desc}</p>` : ''}
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }

  // Education
  {
    const items = Array.isArray(ABOUT_CONTENT.education) ? ABOUT_CONTENT.education : [];

    eduBody.innerHTML = `
      <div class="about-edu-list">
        ${items
          .map((edu) => {
            const school = edu?.school ? escapeHtml(edu.school) : '';
            const degree = edu?.degree ? escapeHtml(edu.degree) : '';
            const date = edu?.date ? escapeHtml(edu.date) : '';
            const desc = edu?.description ? escapeHtml(edu.description) : '';
            const meta = [degree, date].filter(Boolean).join(' • ');

            return `
              <div class="about-edu-item">
                <div class="about-edu-head">
                  <div class="about-edu-titles">
                    ${school ? `<p class="about-item-title">${school}</p>` : ''}
                    ${meta ? `<p class="about-item-meta">${meta}</p>` : ''}
                  </div>
                </div>
                ${desc ? `<p class="about-item-desc">${desc}</p>` : ''}
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }

  // Hobbies
  hobbiesBody.replaceChildren();
  {
    function hobbyIconSvg(label) {
      const text = String(label || '').toLowerCase();

      const icons = {
        collaborate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3Z"/><path d="M8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Z"/><path d="M2 20c0-2.76 2.24-5 5-5h2"/><path d="M22 20c0-2.76-2.24-5-5-5h-2"/><path d="M9 15h6"/></svg>',
        pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
        chess: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6l-1 3 3 2-2 3 3 3-3 2"/><path d="M8 21h8"/><path d="M9 21v-3a4 4 0 0 1 6 0v3"/><path d="M7 15h10"/></svg>',
        badminton: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 2c-2.5 2.5-2 6 1.5 9.5S24 15 22 17s-5.5-1-8.5-4S10 9.5 12.5 7 18.5 4.5 16 2Z"/><path d="M9 15l-6 6"/><path d="M7 21l-4-4"/></svg>',
        film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14"/><path d="M17 5v14"/><path d="M3 9h4"/><path d="M3 15h4"/><path d="M17 9h4"/><path d="M17 15h4"/></svg>',
        music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><path d="M9 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M21 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>',
        star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7 7 .6-5.3 4.6 1.7 7.2L12 17.8 5.6 21.4l1.7-7.2L2 9.6 9 9Z"/></svg>',
      };

      if (text.includes('collab') || text.includes('project')) return icons.collaborate;
      if (text.includes('sketch') || text.includes('draw') || text.includes('design') || text.includes('illustr')) return icons.pencil;
      if (text.includes('chess')) return icons.chess;
      if (text.includes('badminton')) return icons.badminton;
      if (text.includes('movie') || text.includes('series') || text.includes('film')) return icons.film;
      if (text.includes('music')) return icons.music;

      return icons.star;
    }

    const list = document.createElement('ul');
    list.className = 'about-hobbies-icons';
    for (const hobby of ABOUT_CONTENT.hobbies || []) {
      const li = document.createElement('li');

      const icon = document.createElement('span');
      icon.className = 'about-hobby-icon';
      icon.setAttribute('role', 'img');
      icon.setAttribute('aria-label', String(hobby));
      icon.setAttribute('data-label', String(hobby));
      icon.innerHTML = hobbyIconSvg(hobby);

      li.appendChild(icon);
      list.appendChild(li);
    }
    hobbiesBody.appendChild(list);
  }

  // Interactions: clicking a box (or its button) activates it.
  const panels = Array.from(container.querySelectorAll('.about-panel'));
  for (const panel of panels) {
    const key = panel.getAttribute('data-key');
    if (!key) continue;

    const btn = panel.querySelector('.about-panel-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const current = String(container.dataset.active || '').trim();
        setActive(current === key ? '' : key);
      });
    }

    panel.addEventListener('click', (e) => {
      // Avoid double-trigger when clicking the button.
      if (e.target && e.target.closest && e.target.closest('.about-panel-toggle')) return;
      const current = String(container.dataset.active || '').trim();
      setActive(current === key ? '' : key);
    });
  }

  // Ensure initial state (requested: nothing opened)
  setActive(container.dataset.active || '');
}

// ===== SKILLS SECTION CARD ANIMATIONS =====
function initSkillsAnimations() {
  if (!window.gsap) return;
  
  const skillsSection = document.getElementById('skills');
  if (!skillsSection) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Mobile: avoid ScrollTrigger reliability issues; animate once on enter.
  if (isMobile) {
    const playMobileSkills = () => {
      // Ensure nothing is stuck hidden from previous GSAP state
      const suggestions = document.querySelectorAll('.chat-suggestion, .chat-download-resume');

      const tl = gsap.timeline();
      tl.to('.chat-hero', {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out'
      })
      .to('.chat-label', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: 'back.out(1.7)'
      }, '<+0.1')
      .to('.chat-hero-title', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        ease: 'back.out(1.7)'
      }, '<+0.05')
      .to('.chat-subtitle', {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power2.out'
      }, '<+0.05')
      .to('.chat-suggestions', {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power2.out'
      }, '<+0.05');

      if (suggestions && suggestions.length) {
        tl.to(suggestions, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: 'back.out(2)',
          stagger: 0.08
        }, '<+0.05');
      }
    };

    onEnterViewportOnce(skillsSection, playMobileSkills, { root: null, threshold: 0.2 });
    return;
  }

  // Desktop: keep ScrollTrigger-based reveals
  if (!window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  
  // Animate chat hero
  gsap.to('.chat-hero', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#skills',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    }
  });
  
  // Animate label with bounce
  gsap.to('.chat-label', {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.6,
    delay: 0.2,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: '#skills',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    }
  });
  
  // Animate title with bounce
  gsap.to('.chat-hero-title', {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.8,
    delay: 0.3,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: '#skills',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    }
  });
  
  // Animate subtitle
  gsap.to('.chat-subtitle', {
    opacity: 1,
    y: 0,
    duration: 0.6,
    delay: 0.5,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#skills',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    }
  });
  
  // Animate suggestions container
  gsap.to('.chat-suggestions', {
    opacity: 1,
    y: 0,
    duration: 0.6,
    delay: 0.6,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#skills',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    }
  });
  
  // Animate each suggestion button with stagger and bounce
  const suggestions = document.querySelectorAll('.chat-suggestion, .chat-download-resume');
  suggestions.forEach((suggestion, index) => {
    gsap.to(suggestion, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      delay: 0.7 + (index * 0.1),
      ease: 'back.out(2)',
      scrollTrigger: {
        trigger: '#skills',
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}


// ===== SHARKGPT CHAT =====
function initChatBot() {
  const chatWindow = document.getElementById("chatWindow");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const skillsSection = document.getElementById("skills");
  
  if (!chatWindow || !chatForm || !chatInput) return;

  let chatActivated = false;
  const conversation = [];

  // Pin the SharkGPT section for extra scroll time without increasing its height
  // ONLY on desktop - not on mobile
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  if (window.gsap && window.ScrollTrigger && skillsSection && !isMobile) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: skillsSection,
      start: "top top",
      end: "+=150%",
      pin: true,
      pinSpacing: true
    });
  }

  // Animate connect section cards appearing from SharkGPT section
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    
    const connectLeft = document.querySelector('.connect-left');
    const connectRight = document.querySelector('.connect-right');
    
    if (connectLeft && connectRight) {
      const connectSection = document.getElementById('connect');
      
      // Mobile: never pre-hide Connect; animate once on enter.
      if (isMobile) {
        // Hard safety: if something previously hid it, show it.
        gsap.set([connectLeft, connectRight], { opacity: 1, y: 0, scale: 1, rotateX: 0 });

        onEnterViewportOnce(connectSection, () => {
          gsap.from([connectLeft, connectRight], {
            opacity: 0,
            y: 80,
            scale: 0.96,
            rotateX: 10,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.2,
            immediateRender: false
          });
        }, { root: null, threshold: 0.2 });
      }

      if (!isMobile) {
        // Desktop: ScrollTrigger reveal
        gsap.set([connectLeft, connectRight], {
          opacity: 0,
          y: 120,
          scale: 0.9,
          rotateX: 15
        });

        gsap.to(connectLeft, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#connect",
            start: "top 75%",
            toggleActions: "play none none reverse"
          }
        });

        gsap.to(connectRight, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 1.2,
          delay: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#connect",
            start: "top 75%",
            toggleActions: "play none none reverse"
          }
        });
      }
    }
  }

  function escapeBasic(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function linkify(str) {
    const urlRegex = /(https?:\/\/[^\s]+|#[a-zA-Z][\w-]*)/g;
    return str.replace(urlRegex, (match) => {
      const safe = match.replace(/"/g, "&quot;");
      if (safe.startsWith("#")) {
        return `<a href="${safe}">${safe}</a>`;
      }
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
    });
  }

  // Very small markdown renderer for bot messages (headings, bold, bullets)
  function renderMarkdown(text) {
    const lines = text.split(/\r?\n/);
    const html = [];
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        continue;
      }

      // Headings (#, ##, ###)
      if (/^#{1,3}\s+/.test(trimmed)) {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        const level = trimmed.match(/^#{1,3}/)[0].length;
        const tag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
        let content = trimmed.replace(/^#{1,3}\s+/, "");
        content = escapeBasic(content);
        content = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        content = linkify(content);
        html.push(`<${tag}>${content}</${tag}>`);
        continue;
      }

      // Bullet list (-, *, •)
      if (/^[-*•]\s+/.test(trimmed)) {
        if (!inList) {
          html.push("<ul>");
          inList = true;
        }
        let item = trimmed.replace(/^[-*•]\s+/, "");
        item = escapeBasic(item);
        item = item.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        item = linkify(item);
        html.push(`<li>${item}</li>`);
        continue;
      }

      // Normal paragraph
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      let content = escapeBasic(trimmed);
      content = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      content = linkify(content);
      html.push(`<p>${content}</p>`);
    }

    if (inList) {
      html.push("</ul>");
    }

    return html.join("");
  }

  function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message chat-message-${sender}`;

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";

    if (sender === "bot") {
      bubble.innerHTML = renderMarkdown(text);
    } else {
      bubble.textContent = text;
    }

    messageDiv.appendChild(bubble);
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  const cannedResponses = {
    skills: `# My core skills\n\n- **Programming & Data:** Python, SQL (PostgreSQL), C/C++, HTML/CSS.\n- **Data Science & ML:** EDA, regression and classification, supervised & unsupervised learning, feature engineering, evaluation metrics, NLP basics, LLMs and RAG.\n- **Libraries & Frameworks:** NumPy, Pandas, Matplotlib, Seaborn, Plotly, scikit-learn, LangChain, LangGraph, Hugging Face, NLTK, OpenCV.\n- **Backend & Web:** Django, Streamlit, REST APIs, auth (including Google OAuth), email automation, secure API integrations.\n- **Data & Storage:** PostgreSQL, SQLite, FAISS, Chroma, Supabase Storage.\n- **Tools:** Git & GitHub, CI/CD with GitHub Actions, GCP, Render, Vercel, Tableau, Jupyter, VS Code, Excel/Sheets.\n- **Creative & Design:** Figma, Adobe Illustrator, digital design, animation, and illustration.`,

    socials: `# Where to find me\n\n- **Email:** sharik.hassan.ai@gmail.com\n- **LinkedIn:** https://www.linkedin.com/in/sharik-hassan\n- **GitHub:** https://github.com/shark4real\n- **Instagram:** https://www.instagram.com/llsharikll`,

    projects: `# A quick tour of my projects\n\n- **Datanaut.ai** – an exploratory data analytics tool where you upload a dataset and ask questions in natural language; it turns them into SQL and builds charts for you.\n- **Genly.ai** – a Django-based AI email generator that supports different tones, Google OAuth login, Gmail API integration, and bulk sending.\n- **AutoParser AI** – an AI agent that generates and self-corrects parsers for messy bank statement PDFs using a pytest-based contract testing loop.\n- **Portfolio website with RAG assistant** – this site itself, with a RAG-based assistant that answers questions grounded on my profile.\n\nYou can also explore these visually in the projects section of this website: #projects`
  };

  async function getAIResponse(messages) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error || errorMessage;
        } catch (e) {
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (e2) {}
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error("Chat error:", error);
      return null;
    }
  }

  const suggestionButtons = document.querySelectorAll(".chat-suggestion");

  suggestionButtons.forEach((btn) => {
    const key = btn.getAttribute("data-question");
    btn.addEventListener("click", () => {
      const userText = btn.textContent.trim();
      if (!userText || !cannedResponses[key]) return;

      if (!chatActivated) {
        chatActivated = true;
        skillsSection?.classList.add("chat-active");
      }

      skillsSection?.classList.add("chat-has-input");

      addMessage(userText, "user");
      conversation.push({ role: "user", content: userText });

      const reply = cannedResponses[key];
      conversation.push({ role: "assistant", content: reply });
      addMessage(reply, "bot");
    });
  });

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Activate chat layout on first message
    if (!chatActivated) {
      chatActivated = true;
      skillsSection?.classList.add("chat-active");
    }

    skillsSection?.classList.add("chat-has-input");

    // Show user message
    addMessage(userMessage, "user");
    conversation.push({ role: "user", content: userMessage });
    chatInput.value = "";

    // Get AI response
    const aiReply = await getAIResponse(conversation);
    
    if (aiReply) {
      conversation.push({ role: "assistant", content: aiReply });
      setTimeout(() => addMessage(aiReply, "bot"), 150);
    } else {
      addMessage("Sorry, something went wrong. Please try again.", "bot");
    }
  });
}

// ===== LINKEDIN CAROUSEL =====
function initLinkedInCarousel() {
  const carousel = document.getElementById("linkedinCarousel");
  const dotsContainer = document.getElementById("linkedinDots");
  if (!carousel || !dotsContainer) return;

  const slides = Array.from(carousel.querySelectorAll(".linkedin-slide"));
  const dots = Array.from(dotsContainer.querySelectorAll(".linkedin-dot"));
  if (!slides.length || slides.length !== dots.length) return;

  let current = 0;
  let autoplayId = null;

  function showSlide(index) {
    // Move horizontally by updating data-active on the carousel
    carousel.setAttribute("data-active", String(index));
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
    current = index;
  }

  function nextSlide() {
    const next = (current + 1) % slides.length;
    showSlide(next);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(nextSlide, 9000);
  }

  function stopAutoplay() {
    if (autoplayId !== null) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = parseInt(dot.getAttribute("data-index"), 10);
      if (!isNaN(index)) {
        showSlide(index);
        startAutoplay();
      }
    });
  });

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);

  // Initialize
  showSlide(current);
  startAutoplay();
}

// ===== CONTACT FORM (GOOGLE SHEETS) =====
function initContactForm() {
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("contactStatus");
  
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const subject = formData.get('subject')?.trim();
    const message = formData.get('message')?.trim();

    if (!name || !email || !subject || !message) {
      if (statusEl) statusEl.textContent = "Please fill in all fields.";
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    if (statusEl) statusEl.textContent = "Sending...";

    try {
      const sheetUrl = form.getAttribute('data-sheet-url');
      const apiUrl = form.getAttribute('data-api-url') || '/api/contact';
      const endpoint = sheetUrl || apiUrl;
      const useNoCors = Boolean(sheetUrl);

      const res = await fetch(endpoint, {
        method: "POST",
        mode: useNoCors ? "no-cors" : "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message })
      });

      if (!useNoCors && !res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      if (statusEl) statusEl.textContent = "Message sent! I'll get back to you soon.";
      form.reset();
    } catch (err) {
      console.error("Contact form error:", err);
      if (statusEl) statusEl.textContent = "Could not send message. Please try again later.";
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
