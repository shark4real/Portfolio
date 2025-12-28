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
  if (typeof initSkillsAnimations === 'function') {
    initSkillsAnimations();
  }
  if (typeof initChatBot === 'function') {
    initChatBot();
  }
  if (typeof initLinkedInCarousel === 'function') {
    initLinkedInCarousel();
  }
  if (typeof initContactForm === 'function') {
    initContactForm();
  }
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
      if (landing) {
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

  // Grab the cloned landing content inside each panel so we can
  // gently slide it toward the corners during the split.
  const topLandingLeft = topPanel.querySelector('.landing-panel-content-top .landing-left');
  const bottomLandingLeft = bottomPanel.querySelector('.landing-panel-content-bottom .landing-left');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: landing,
      start: 'top top',
      end: '+=200%',
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
  // About section rises up with the top panel.
  tl.to(topPanel, { height: '0%', duration: 0.9, ease: 'power2.inOut' }, 0.2)
    .to(bottomPanel, { height: '0%', duration: 0.9, ease: 'power2.inOut' }, 0.2);

  // As the panels split, nudge the top content toward the top-left
  // and then the bottom content toward the bottom-right, with a
  // slight delay between them for a staggered feel.
  if (topLandingLeft) {
    tl.to(
      topLandingLeft,
      {
        x: '-58vw',
        y: '-35vh',
        duration: 1.4,
        ease: 'power3.inOut',
      },
      0.25
    );
  }

  if (bottomLandingLeft) {
    tl.to(
      bottomLandingLeft,
      {
        x: '58vw',
        y: '35vh',
        duration: 1.4,
        ease: 'power3.inOut',
      },
      0.45
    );
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

document.addEventListener('DOMContentLoaded', () => {
  initHeaderHide();
  // 3D scene will be initialized by initializeWebsite() after assets load
});

// Store codingProjects globally so preloader can access it
const codingProjects = [
  { title: 'Datanaut.ai', description: 'An EDA tool, which lets u upload dataset and get instant insights', github: 'https://github.com/shark4real/Datanaut', demo: 'https://datanaut.onrender.com/', thumbnail: './datanaut.ai.png', image: './datanaut.ai.png' },
  { title: 'Genly.ai', description: 'An AI-Email generator app for professional and bulk emailing', github: 'https://github.com/shark4real/Genly.ai', demo: 'https://genly-ai.onrender.com/', thumbnail: './genlyz.png', image: './genly.png' },
  { title: 'Retail_order', description: 'An end to end Data Analysis pipline journey showcasing my skills in Python , Postgres & Tableau', github: 'https://github.com/shark4real/Retail_order_DA_project', demo: 'https://shark4real.github.io/Retail_order_DA_project', thumbnail: './Retail_order.png', image: '/Retail_order.png' },
  { title: 'TDS_LLM', description: 'This project was developed as part of my academic curriculum at IIT Madras.', github: 'https://github.com/shark4real/tds_llm_project', demo: '#', thumbnail: './tdsllm.png', image: './tdsllm.png' },
  { title: 'Autoparser', description: ' an AI-powered agent in Python that autonomously generates, tests, and self-corrects parsers for unstructured bank statement PDFs', github: 'https://github.com/shark4real/ai-agent-challenge', demo: '#', thumbnail: './Autoparser.png', image: './Autoparser.png' },
  { title: 'Creative Coding', description: 'A small project on creative coding using Fourier Series Transformation', github: 'https://github.com/shark4real/Fourier_python', demo: 'https://shark4real.github.io/fourieronline/', thumbnail: './ftcc.png', image: './ftcc.png' }
];

function init3DScene() {
  const canvasContainer = document.getElementById('projectsCanvas');
  if (!canvasContainer) return;

  const sketchProjects = [
    { title: 'Sketch 1', thumbnail: '' },
    { title: 'Sketch 2', thumbnail: '' },
    { title: 'Sketch 3', thumbnail: '' },
    { title: 'Sketch 4', thumbnail: '' },
    { title: 'Sketch 5', thumbnail: '' },
    { title: 'Sketch 6', thumbnail: '' }
  ];

  let currentMode = 'coding';

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 20, 30);
  camera.lookAt(0, 5, 0);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (err) {
    console.error('WebGL not available or failed to initialize:', err);
    const loadingIndicator = document.getElementById('guitarLoadingIndicator');
    const loadingProgress = document.getElementById('loadingProgress');
    if (loadingIndicator) {
      loadingIndicator.classList.add('error');
      const status = loadingIndicator.querySelector('.guitar-status');
      if (status) status.textContent = '3D view not supported on this device.';
    }
    if (loadingProgress) {
      loadingProgress.textContent = '';
    }
    return;
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  canvasContainer.appendChild(renderer.domElement);

  const pmrem = new THREE.PMREMGenerator(renderer);

  // Use preloaded HDR if available
  if (window.assetsLoaded.hdr && window.preloadedAssets.hdrBlob) {
    const objectURL = URL.createObjectURL(window.preloadedAssets.hdrBlob);
    new THREE.RGBELoader().load(objectURL, (hdr) => {
      const envMap = pmrem.fromEquirectangular(hdr).texture;
      scene.environment = envMap;
      scene.background = null;
      URL.revokeObjectURL(objectURL);
    }, undefined, (error) => {
      console.warn('HDR failed to load from preloaded blob, using fallback lighting');
    });
  } else {
    // Fallback to regular loading if preload failed
    new THREE.RGBELoader().load('./studio.hdr', (hdr) => {
      const envMap = pmrem.fromEquirectangular(hdr).texture;
      scene.environment = envMap;
      scene.background = null;
    }, undefined, (error) => {
      console.warn('HDR not found, using fallback lighting');
    });
  }

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(10, 15, 10);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
  fillLight.position.set(-10, 10, -10);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 2);
  rimLight.position.set(0, 15, -15);
  scene.add(rimLight);

  let guitar = null;
  const loader = new THREE.GLTFLoader();

  const guitarPath = './guitar.glb';

  const loadingIndicator = document.getElementById('guitarLoadingIndicator');
  const loadingProgress = document.getElementById('loadingProgress');

  // Use preloaded guitar model if available
  if (window.assetsLoaded.guitar && window.preloadedAssets.guitarBlob) {
    const objectURL = URL.createObjectURL(window.preloadedAssets.guitarBlob);
    
    loader.load(
      objectURL,
      (gltf) => {
        console.log('Guitar loaded from preloaded blob');
        guitar = gltf.scene;

        const box = new THREE.Box3().setFromObject(guitar);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        guitar.position.sub(center);

        const scaleFactor = 3;
        guitar.scale.set(scaleFactor, scaleFactor, scaleFactor);

        let meshCount = 0;
        guitar.traverse((child) => {
          if (child.isMesh) {
            meshCount++;
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material && child.material.transparent) {
              child.material.opacity = 1;
            }
          }
        });

        scene.add(guitar);

        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }
        
        URL.revokeObjectURL(objectURL);
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          if (loadingProgress) {
            loadingProgress.textContent = `${percent}%`;
          }
        }
      },
      (error) => {
        console.error('Failed to load guitar from preloaded blob:', error);
        if (loadingProgress) {
          loadingProgress.textContent = 'Load failed';
        }
        if (loadingIndicator) {
          loadingIndicator.classList.add('error');
        }
        URL.revokeObjectURL(objectURL);
      }
    );
  } else {
    // Fallback to regular loading if preload failed
    loader.load(
      guitarPath,
      (gltf) => {
        console.log('Guitar loaded');
        guitar = gltf.scene;

        const box = new THREE.Box3().setFromObject(guitar);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        guitar.position.sub(center);

        const scaleFactor = 3;
        guitar.scale.set(scaleFactor, scaleFactor, scaleFactor);

        let meshCount = 0;
        guitar.traverse((child) => {
          if (child.isMesh) {
            meshCount++;
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material && child.material.transparent) {
              child.material.opacity = 1;
            }
          }
        });

        scene.add(guitar);

        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          if (loadingProgress) {
            loadingProgress.textContent = `${percent}%`;
          }
        }
      },
      (error) => {
        console.error('Failed to load guitar:', error);
        if (loadingProgress) {
          loadingProgress.textContent = 'Load failed';
        }
        if (loadingIndicator) {
          loadingIndicator.classList.add('error');
        }
      }
    );
  }

  const projectPlanes = [];
  const planeRadius = 13;
  const planeCount = 6;

  const textureLoader = new THREE.TextureLoader();

  // Placeholder if texture fails
  const placeholder = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    roughness: 0.4,
    metalness: 0,
    emissive: 0x111111,
    emissiveIntensity: 0.3
  });

  // Texture cache to avoid recreating the same textures
  const textureCache = new Map();
  
  // Function to create polaroid-style texture with white border and title
  const createPolaroidTexture = (imageUrl, title) => {
    const cacheKey = `${imageUrl}_${title}`;
    if (textureCache.has(cacheKey)) {
      return Promise.resolve(textureCache.get(cacheKey));
    }
    
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 320;
      const ctx = canvas.getContext('2d', { willReadFrequently: false });

      // White polaroid border
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Image area
      const borderSize = 15;
      const imageHeight = 225;
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(borderSize, borderSize, canvas.width - borderSize * 2, imageHeight);

      // Load and draw image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Flip canvas horizontally to show correct orientation
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, borderSize, borderSize, canvas.width - borderSize * 2, imageHeight);
        ctx.restore();

        // Draw title at bottom (polaroid text area) - also flipped
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(title, canvas.width - borderSize - 10, borderSize + imageHeight + 30);
        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.generateMipmaps = true;
        textureCache.set(cacheKey, texture);
        resolve(texture);
      };
      img.onerror = () => {
        // Fallback - also flip the text
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(borderSize, borderSize, canvas.width - borderSize * 2, imageHeight);
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(title, canvas.width - borderSize - 10, borderSize + imageHeight + 30);
        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        textureCache.set(cacheKey, texture);
        resolve(texture);
      };
      img.src = imageUrl;
    });
  };

  for (let i = 0; i < planeCount; i++) {
    const angle = (i / planeCount) * Math.PI * 2;
    const x = Math.cos(angle) * planeRadius;
    const z = Math.sin(angle) * planeRadius;
    const y = 10 + (i * 2.5);

    const planeGeometry = new THREE.PlaneGeometry(4, 5);

    // Create polaroid texture with title
    createPolaroidTexture(codingProjects[i].thumbnail, codingProjects[i].title).then((texture) => {
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        roughness: 0.3,
        metalness: 0,
        emissive: 0x111111,
        emissiveIntensity: 0.2
      });

      const planeMesh = projectPlanes[i];
      planeMesh.material = material;
    });

    const material = codingProjects[i].thumbnail
      ? new THREE.MeshStandardMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          roughness: 0.4,
          metalness: 0,
          emissive: 0x111111,
          emissiveIntensity: 0.3
        })
      : placeholder;

    const planeMesh = new THREE.Mesh(planeGeometry, material);

    planeMesh.position.set(x, y, z);

    // Make sure plane always faces outward (no inversion)
    planeMesh.rotation.y = angle;

    planeMesh.castShadow = false;
    planeMesh.receiveShadow = false;

    planeMesh.userData = {
      projectIndex: i,
      initialAngle: angle,
      initialY: y,
      hovered: false
    };

    scene.add(planeMesh);
    projectPlanes.push(planeMesh);
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let frontCardIndex = 0;

  const onMouseMove = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(projectPlanes);

    // Reset all planes - only update the one that changed
    projectPlanes.forEach((plane, idx) => {
      const wasHovered = plane.userData.hovered;
      plane.userData.hovered = false;
      
      if (wasHovered) {
        plane.scale.set(1, 1, 1);
        plane.material.emissiveIntensity = 0.1;
      }
    });

    if (intersects.length > 0) {
      const hoveredPlane = intersects[0].object;
      hoveredPlane.userData.hovered = true;
      hoveredPlane.scale.set(1.15, 1.15, 1.15);
      hoveredPlane.material.emissiveIntensity = 0.3;
      renderer.domElement.style.cursor = 'pointer';
    } else {
      renderer.domElement.style.cursor = 'default';
    }
  };

  // Create project cards
  const cardsContainer = document.getElementById('projectCardsContainer');
  const projectCards = [];

  for (let i = 0; i < 6; i++) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.id = `project-card-${i}`;
    
    const project = currentMode === 'coding' ? codingProjects[i] : sketchProjects[i];
    
    // Set background image from thumbnail
    if (project.thumbnail) {
      card.style.backgroundImage = `url('${project.thumbnail}')`;
    }
    
    // Build buttons conditionally - only show Demo if demo link exists
    let buttonsHTML = '';
    if (project.demo && project.demo !== '#') {
      buttonsHTML += `<button class="project-card-btn demo-btn">Demo</button>`;
    }
    if (project.github && project.github !== '#') {
      buttonsHTML += `<button class="project-card-btn github-btn">Github</button>`;
    }
    
    card.innerHTML = `
      <div class="project-card-image" style="background-image: url('${project.thumbnail}');"></div>
      <button class="project-card-close">×</button>
      <div class="project-card-content">
        <h3>${project.title}</h3>
        <p>${project.description || ''}</p>
        <div class="project-card-buttons">
          ${buttonsHTML}
        </div>
      </div>
    `;
    
    // Add event listeners
    const closeBtn = card.querySelector('.project-card-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.remove('active');
    });
    
    const demoBtn = card.querySelector('.demo-btn');
    if (demoBtn) {
      demoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(project.demo, '_blank');
      });
    }
    
    const githubBtn = card.querySelector('.github-btn');
    if (githubBtn) {
      githubBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(project.github, '_blank');
      });
    }
    
    cardsContainer.appendChild(card);
    projectCards.push(card);
  }

  const onMouseClick = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(projectPlanes);

    if (intersects.length > 0) {
      const clickedPlane = intersects[0].object;
      const clickedIndex = clickedPlane.userData.projectIndex;

      // Rotate all planes to bring clicked one to front with smooth animation
      const rotationNeeded = (clickedIndex - frontCardIndex) * (Math.PI * 2 / planeCount);

      projectPlanes.forEach((plane, idx) => {
        const targetAngle = plane.userData.initialAngle + rotationNeeded;
        
        gsap.to(plane.position, {
          x: Math.cos(targetAngle) * planeRadius,
          z: Math.sin(targetAngle) * planeRadius,
          duration: 0.8,
          ease: 'power2.inOut'
        });
      });

      frontCardIndex = clickedIndex;

      // Show clicked card after a short delay
      setTimeout(() => {
        projectCards.forEach(card => {
          card.classList.remove('active');
        });

        const card = projectCards[clickedIndex];
        card.style.left = '50%';
        card.style.top = '50%';
        card.style.transform = 'translate(-50%, -50%)';
        card.classList.add('active');
      }, 400);
    }
  };

  // Close card on click outside
  document.addEventListener('click', (event) => {
    if (!renderer.domElement.contains(event.target) && !cardsContainer.contains(event.target)) {
      projectCards.forEach(card => {
        card.classList.remove('active');
      });
    }
  });

  // Throttle mouse move to improve performance
  let lastMouseMoveTime = 0;
  const mouseMoveThrottle = 100; // ~10fps - lighter on CPU
  
  const throttledMouseMove = (event) => {
    const now = performance.now();
    if (now - lastMouseMoveTime > mouseMoveThrottle) {
      onMouseMove(event);
      lastMouseMoveTime = now;
    }
  };

  renderer.domElement.addEventListener('mousemove', throttledMouseMove);
  renderer.domElement.addEventListener('click', onMouseClick);

  const codingBtn = document.getElementById('codingProjectsBtn');
  const sketchesBtn = document.getElementById('sketchesBtn');

  const switchToMode = (mode) => {
    currentMode = mode;

    if (mode === 'coding') {
      codingBtn.classList.add('active');
      sketchesBtn.classList.remove('active');
    } else {
      sketchesBtn.classList.add('active');
      codingBtn.classList.remove('active');
    }

    projectPlanes.forEach((plane, i) => {
      if (mode === 'coding') {
        // For coding mode, create polaroid texture with title
        createPolaroidTexture(codingProjects[i].thumbnail, codingProjects[i].title).then((texture) => {
          plane.material.map = texture;
          plane.material.needsUpdate = true;
        });
      } else {
        // For sketches mode, use basic texture loader
        const newTexture = sketchProjects[i].thumbnail;
        if (newTexture) {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(
            newTexture,
            (texture) => {
              texture.encoding = THREE.sRGBEncoding;
              plane.material.map = texture;
              plane.material.needsUpdate = true;
            },
            undefined,
            () => {
              plane.material.color.set(0xcccccc);
              plane.material.map = null;
              plane.material.needsUpdate = true;
            }
          );
        } else {
          plane.material.map = null;
          plane.material.needsUpdate = true;
        }
      }

      gsap.to(plane.rotation, {
        y: plane.rotation.y + Math.PI,
        duration: 0.6,
        ease: 'power2.inOut'
      });
    });
  };

  codingBtn.addEventListener('click', () => switchToMode('coding'));
  sketchesBtn.addEventListener('click', () => switchToMode('sketches'));

  gsap.registerPlugin(ScrollTrigger);

  let scrollProgress = { value: 0 };

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#projects',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      pin: '#projectsCanvas',
      pinSpacing: false,
      markers: false,
      onUpdate: (self) => {
        scrollProgress.value = self.progress;
      }
    }
  });

  tl.to(camera.position, {
    y: -20,
    z: 30,
    duration: 1,
    ease: 'none'
  });

  const cameraLookAt = { y: 5 };
  tl.to(cameraLookAt, {
    y: -10,
    duration: 1,
    ease: 'none',
    onUpdate: () => {
      camera.lookAt(0, cameraLookAt.y, 0);
    }
  }, 0);

  const planeInitialData = projectPlanes.map((plane, i) => ({
    angle: (i / planeCount) * Math.PI * 2,
    y: 10 + (i * 1.5)
  }));

  projectPlanes.forEach((plane, i) => {
    tl.fromTo(
      plane.material,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.2
      },
      0.1 + i * 0.03
    );

    tl.to(
      plane.position,
      {
        y: -10 - (i * 1.5),
        duration: 1,
        ease: 'none'
      },
      0
    );
  });

  let isProjectsVisible = false;
  let animationFrameId = null;
  
  const animate = () => {
    if (!isProjectsVisible) {
      animationFrameId = null;
      return; // Stop animation when not visible
    }
    
    animationFrameId = requestAnimationFrame(animate);

    if (guitar) {
      guitar.rotation.y = scrollProgress.value * Math.PI * 2;
    }

    projectPlanes.forEach((plane, i) => {
      const baseAngle = planeInitialData[i].angle;
      const scrollRotation = scrollProgress.value * Math.PI * 2;
      const angle = baseAngle + scrollRotation;

      plane.position.x = Math.cos(angle) * planeRadius;
      plane.position.z = Math.sin(angle) * planeRadius;

      plane.lookAt(0, plane.position.y, 0);
    });

    renderer.render(scene, camera);
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  window.addEventListener('resize', onWindowResize);

  ScrollTrigger.create({
    trigger: '#projects',
    start: 'top bottom',
    end: 'bottom top',
    onEnter: () => {
      renderer.domElement.style.display = 'block';
      isProjectsVisible = true;
      if (!animationFrameId) animate(); // Start animation
    },
    onLeave: () => {
      renderer.domElement.style.display = 'none';
      isProjectsVisible = false; // Stop animation
    },
    onEnterBack: () => {
      renderer.domElement.style.display = 'block';
      isProjectsVisible = true;
      if (!animationFrameId) animate(); // Restart animation
    },
    onLeaveBack: () => {
      renderer.domElement.style.display = 'none';
      isProjectsVisible = false; // Stop animation
    }
  });

  console.log('3D Guitar Projects Section initialized');
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
    const isDesktop = window.innerWidth > 768;
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
        const newIsDesktop = window.innerWidth > 768;
        if (newIsDesktop !== isDesktop) {
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
