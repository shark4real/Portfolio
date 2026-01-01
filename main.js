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
      { type: 'model', url: './guitar.glb' },
      { type: 'hdr', url: './studio.hdr' },
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
      if (asset.type === 'model') {
        fetch(asset.url)
          .then(response => response.blob())
          .then(blob => {
            window.preloadedAssets.guitarBlob = blob;
            window.assetsLoaded.guitar = true;
            assetLoaded();
          })
          .catch(() => {
            console.warn('Failed to preload guitar model');
            assetLoaded();
          });
      } else if (asset.type === 'hdr') {
        fetch(asset.url)
          .then(response => response.blob())
          .then(blob => {
            window.preloadedAssets.hdrBlob = blob;
            window.assetsLoaded.hdr = true;
            assetLoaded();
          })
          .catch(() => {
            console.warn('Failed to preload HDR');
            assetLoaded();
          });
      } else if (asset.type === 'image') {
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
function initializeWebsite() {
  // Initialize all scroll effects and animations
  if (typeof initLandingSplitScroll === 'function') {
    initLandingSplitScroll();
  }
  if (typeof init3DScene === 'function') {
    init3DScene();
  }
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
}

// Pin Connect section on desktop so it doesn't slip away quickly
function initConnectPin() {
  const connect = document.getElementById('connect');

  if (!connect || !window.gsap || !window.ScrollTrigger) return;

  const isDesktop = window.matchMedia('(min-width: 769px)').matches;
  if (!isDesktop) return;

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
  // Create mobile menu elements if they don't exist
  let mobileMenu = document.querySelector('.mobile-menu');
  let mobileOverlay = document.querySelector('.mobile-overlay');
  
  if (!mobileMenu) {
    // Create mobile menu
    mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.innerHTML = `
      <button class="mobile-menu-close" aria-label="Close menu">&times;</button>
      <nav>
        <a href="#projects">Projects</a>
        <a href="#about">About</a>
        <a href="#skills">RAG</a>
        <a href="#connect">Connect</a>
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

// Smooth scrolling for navigation links with custom speed control
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    const target = document.querySelector(href);
    
    if (!target) return;
    
    // Special handling for about section - scroll through landing animation
    if (href === '#about') {
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

  gsap.set(overlay, { autoAlpha: 1 });
  gsap.set(topPanel, { height: '50%', y: 0 });
  gsap.set(bottomPanel, { height: '50%', y: 0 });
  if (landingBg) gsap.set(landingBg, { autoAlpha: 1 });
  if (about) gsap.set(about, { y: 0 });

  // Grab the cloned landing content inside each panel
  const topLandingLeft = topPanel.querySelector('.landing-panel-content-top .landing-left');
  const bottomLandingLeft = bottomPanel.querySelector('.landing-panel-content-bottom .landing-left');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: landing,
      start: 'top top',
      end: isMobile ? '+=100%' : '+=200%', // Shorter animation on mobile
      scrub: true,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
    }
  });

  // Fade the landing background as panels start to shrink.
  if (landingBg) {
    tl.to(landingBg, { autoAlpha: 0, duration: 0.3, ease: 'power2.inOut' }, 0);
  }

  // Split from the middle by shrinking panel heights to 0.
  tl.to(topPanel, { height: '0%', duration: 0.9, ease: 'power2.inOut' }, 0.2)
    .to(bottomPanel, { height: '0%', duration: 0.9, ease: 'power2.inOut' }, 0.2);

  // Simplified movement for mobile
  if (isMobile) {
    if (topLandingLeft) {
      tl.to(topLandingLeft, {
        y: '-50vh',
        duration: 1.2,
        ease: 'power3.inOut',
      }, 0.25);
    }
    if (bottomLandingLeft) {
      tl.to(bottomLandingLeft, {
        y: '50vh',
        duration: 1.2,
        ease: 'power3.inOut',
      }, 0.35);
    }
  } else {
    // Desktop animation with horizontal movement
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

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // When header is in compact mode, clicking it scrolls to top
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
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
  
  // Initialize the 3D Project Gallery
  initProjectCards();
});

// Project Data (updated with provided entries)
const codingProjects = [
  { title: 'Datanaut.ai', description: 'An EDA tool, which lets u upload dataset and get instant insights', github: 'https://github.com/shark4real/Datanaut', demo: 'https://datanaut.onrender.com/', thumbnail: './datanaut.ai.png', image: './datanaut.ai.png' },
  { title: 'Genly.ai', description: 'An AI-Email generator app for professional and bulk emailing', github: 'https://github.com/shark4real/Genly.ai', demo: 'https://genly-ai.onrender.com/', thumbnail: './genlyz.png', image: './genly.png' },
  { title: 'Retail_order', description: 'An end to end Data Analysis pipline journey showcasing my skills in Python , Postgres & Tableau', github: 'https://github.com/shark4real/Retail_order_DA_project', demo: 'https://shark4real.github.io/Retail_order_DA_project', thumbnail: './Retail_order.png', image: '/Retail_order.png' },
  { title: 'TDS_LLM', description: 'This project was developed as part of my academic curriculum at IIT Madras.', github: 'https://github.com/shark4real/tds_llm_project', demo: '#', thumbnail: './tdsllm.png', image: './tdsllm.png' },
  { title: 'Autoparser', description: 'an AI-powered agent in Python that autonomously generates, tests, and self-corrects parsers for unstructured bank statement PDFs', github: 'https://github.com/shark4real/ai-agent-challenge', demo: '#', thumbnail: './Autoparser.png', image: './Autoparser.png' },
  { title: 'Creative Coding', description: 'A small project on creative coding using Fourier Series Transformation', github: 'https://github.com/shark4real/Fourier_python', demo: 'https://shark4real.github.io/fourieronline/', thumbnail: './ftcc.png', image: './ftcc.png' }
];

// Global assignment for consistency
window.codingProjects = codingProjects;

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
      a2.textContent = 'github';
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

  // Mobile: pin the whole section (title + controls + canvas) so it
  // stays in place for a few scrolls.
  if (isMobile) {
    ScrollTrigger.create({
      trigger: projectsSection,
      start: 'top top',
      end: '+=220%',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
    });
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
    const track = document.querySelector(".about-track");
    const prevBtn = document.getElementById("aboutPrevBtn");
    const nextBtn = document.getElementById("aboutNextBtn");
    const cards = document.querySelectorAll(".polaroid-card");
    const aboutSection = document.getElementById("about");
    
    // Check if elements exist
    if (!track || !prevBtn || !nextBtn || cards.length === 0) {
        console.error("About section elements not found");
        return;
    }
    
    console.log("About section initialized", { track, prevBtn, nextBtn, cardCount: cards.length });
    
    let currentIndex = 0;
    
    // Desktop: 2 cards visible, Mobile: 1 card visible
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const isDesktop = !isMobile;
    const cardsPerView = isDesktop ? 2 : 1;
    const totalCards = cards.length;
    const maxIndex = Math.max(0, totalCards - cardsPerView);
    
    // Function to update button states
    function updateButtonStates() {
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === maxIndex;
    }
    
    // Function to scroll to current index
    function scrollToIndex() {
        const singleCardWidth = isDesktop ? 42 : (100 - 2.5); // vw units
        const gap = isDesktop ? 5 : 1.25; // vw units
        const cardWithGap = singleCardWidth + gap;
        const offset = currentIndex * cardWithGap * (window.innerWidth / 100);
        
        console.log("Scrolling to index", currentIndex, "offset", offset);
        
        gsap.to(track, {
            x: -offset,
            duration: 0.2,
            ease: "power1.out"
        });
        
        updateButtonStates();
    }
    
    // Previous button
    prevBtn.onclick = function(e) {
        console.log("PREV BUTTON CLICKED");
        if (currentIndex > 0) {
            currentIndex--;
            scrollToIndex();
        }
    };
    
    // Next button
    nextBtn.onclick = function(e) {
        console.log("NEXT BUTTON CLICKED");
        if (currentIndex < maxIndex) {
            currentIndex++;
            scrollToIndex();
        }
    };
    
    // Add touch swipe for mobile
    if (isMobile) {
        let touchStartX = 0;
        let touchEndX = 0;
        
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            
            if (touchStartX - touchEndX > swipeThreshold && currentIndex < maxIndex) {
                // Swipe left - next
                currentIndex++;
                scrollToIndex();
            } else if (touchEndX - touchStartX > swipeThreshold && currentIndex > 0) {
                // Swipe right - previous
                currentIndex--;
                scrollToIndex();
            }
        }, { passive: true });
    }
    
    // Show/hide buttons based on about section visibility
    function checkAboutVisibility() {
        if (!aboutSection) return;
        
        const rect = aboutSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Only show when about section is in the main viewport
        // Top edge must be above 80% of screen AND bottom edge must be below 20% of screen
        const isAboutInView = rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.2;
        
        if (isAboutInView) {
            prevBtn.style.opacity = '1';
            prevBtn.style.visibility = 'visible';
            nextBtn.style.opacity = '1';
            nextBtn.style.visibility = 'visible';
        } else {
            prevBtn.style.opacity = '0';
            prevBtn.style.visibility = 'hidden';
            nextBtn.style.opacity = '0';
            nextBtn.style.visibility = 'hidden';
        }
    }
    
    // Check visibility on scroll
    window.addEventListener('scroll', checkAboutVisibility);
    checkAboutVisibility();
    
    // Handle window resize
    window.addEventListener("resize", () => {
        const newIsMobile = window.matchMedia("(max-width: 768px)").matches;
        if (newIsMobile !== isMobile) {
            location.reload();
        }
    });
    
    // Initial button state
    updateButtonStates();
}

// ===== SKILLS SECTION CARD ANIMATIONS =====
function initSkillsAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;
  
  const skillsSection = document.getElementById('skills');
  if (!skillsSection) return;
  
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
  if (window.gsap && window.ScrollTrigger && skillsSection) {
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
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
      const res = await fetch(sheetUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message })
      });

      // no-cors mode means we can't read response, but if no error thrown, it worked
      if (statusEl) {
        statusEl.textContent = "Message sent! I'll get back to you soon.";
      }
      form.reset();
    } catch (err) {
      console.error("Contact form error:", err);
      if (statusEl) statusEl.textContent = "Could not send message. Please try again later.";
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
