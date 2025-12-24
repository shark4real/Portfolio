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
  initLandingSplitScroll();
  initHeaderHide();

  const canvasContainer = document.getElementById('projectsCanvas');
  if (!canvasContainer) return;

  const codingProjects = [
    { title: 'Datanaut.ai', description: 'An EDA tool, which lets u upload dataset and get instant insights', github: 'https://github.com/shark4real/Datanaut', demo: 'https://datanaut.onrender.com/', thumbnail: './datanaut.ai.png', image: './datanaut.ai.png' },
    { title: 'Genly.ai', description: 'An AI-Email generator app for professional and bulk emailing', github: 'https://github.com/shark4real/Genly.ai', demo: 'https://genly-ai.onrender.com/', thumbnail: './genlyz.png', image: './genly.png' },
    { title: 'Retail_order', description: 'An end to end Data Analysis pipline journey showcasing my skills in Python , Postgres & Tableau', github: 'https://github.com/shark4real/Retail_order_DA_project', demo: 'https://shark4real.github.io/Retail_order_DA_project', thumbnail: './Retail_order.png', image: '/Retail_order.png' },
    { title: 'TDS_LLM', description: 'This project was developed as part of my academic curriculum at IIT Madras.', github: 'https://github.com/shark4real/tds_llm_project', demo: '#', thumbnail: './tdsllm.png', image: './tdsllm.png' },
    { title: 'Autoparser', description: ' an AI-powered agent in Python that autonomously generates, tests, and self-corrects parsers for unstructured bank statement PDFs', github: 'https://github.com/shark4real/ai-agent-challenge', demo: '#', thumbnail: './Autoparser.png', image: './Autoparser.png' },
    { title: 'Creative Coding', description: 'A small project on creative coding using Fourier Series Transformation', github: 'https://github.com/shark4real/Fourier_python', demo: 'https://shark4real.github.io/fourieronline/', thumbnail: './ftcc.png', image: './ftcc.png' }
  ];

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

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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

  new THREE.RGBELoader().load('./studio.hdr', (hdr) => {
    const envMap = pmrem.fromEquirectangular(hdr).texture;
    scene.environment = envMap;
    scene.background = null;
  }, undefined, (error) => {
    console.warn('HDR not found, using fallback lighting');
  });

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

  // Function to create polaroid-style texture with white border and title
  const createPolaroidTexture = (imageUrl, title) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');

      // White polaroid border
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Image area
      const borderSize = 30;
      const imageHeight = 450;
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
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(title, canvas.width - borderSize - 20, borderSize + imageHeight + 60);
        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
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
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(title, canvas.width - borderSize - 20, borderSize + imageHeight + 60);
        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
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
  const mouseMoveThrottle = 16; // ~60fps
  
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

  const animate = () => {
    requestAnimationFrame(animate);

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

  animate();

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
    },
    onLeave: () => {
      renderer.domElement.style.display = 'none';
    },
    onEnterBack: () => {
      renderer.domElement.style.display = 'block';
    },
    onLeaveBack: () => {
      renderer.domElement.style.display = 'none';
    }
  });

  console.log('3D Guitar Projects Section initialized');
});


// about section
document.addEventListener("DOMContentLoaded", () => {
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
            duration: 0.6,
            ease: "power2.inOut"
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
});


// ===== SKILLS SECTION =====
document.addEventListener("DOMContentLoaded", () => {
    const skillCards = document.querySelectorAll(".skill-card");
    const skillsDisc = document.getElementById("skillsDisc");
    const skillsSection = document.getElementById("skills");
    
    let currentSkillIndex = 0;
    const skillCategories = ["Programming & Web", "Data Science", "Creative Suite", "Industry Knowledge"];
    let isScrollingSkills = false;
    let scrollTimeout;
    let hasViewedAllCategories = false;
    
    // Update active card and disc
    function updateSkillCard(index) {
        skillCards.forEach((card, i) => {
            if (i === index) {
                card.classList.add("active");
            } else {
                card.classList.remove("active");
            }
        });
        
        // Check if user has viewed all categories
        if (index === skillCards.length - 1) {
            hasViewedAllCategories = true;
        }
        
        // Rotate disc - 90° for each of 4 categories with smoother animation
        const angle = index * 90;
        gsap.to(skillsDisc, {
            rotation: angle,
            duration: 0.8,
            ease: "power3.out"
        });
    }
    
    // Check if skills section is in view
    function isSkillsInFocus() {
        const rect = skillsSection.getBoundingClientRect();
        return rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5;
    }
    
    // Scroll handler for skills section
    window.addEventListener("wheel", (e) => {
        if (!isSkillsInFocus()) return;
        
        const goingDown = e.deltaY > 0;
        const goingUp = e.deltaY < 0;
        const atFirst = currentSkillIndex === 0;
        const atLast = currentSkillIndex === skillCards.length - 1;
        
        // Allow natural scroll UP when at first card
        if (goingUp && atFirst) {
            return;
        }
        
        // Only allow scroll DOWN past last card if user has viewed all categories
        if (goingDown && atLast) {
            if (!hasViewedAllCategories) {
                e.preventDefault();
                return;
            }
            // User has viewed all, allow natural scroll to next section
            return;
        }
        
        // Prevent default scrolling inside skills section
        e.preventDefault();
        isScrollingSkills = true;
        
        // Clear previous timeout
        clearTimeout(scrollTimeout);
        
        if (goingDown && !atLast) {
            currentSkillIndex++;
        } else if (goingUp && !atFirst) {
            currentSkillIndex--;
        }
        
        updateSkillCard(currentSkillIndex);
        
        // Reset flag after scroll completes
        scrollTimeout = setTimeout(() => {
            isScrollingSkills = false;
        }, 800);
    }, { passive: false });
    
    // Initialize
    updateSkillCard(currentSkillIndex);
    
    // Skill box click handler
    document.querySelectorAll(".skill-box").forEach(box => {
        box.addEventListener("click", function() {
            const skillCard = this.closest(".skill-card");
            const allBoxesInCard = skillCard.querySelectorAll(".skill-box");
            
            // Get array of all boxes in this card
            const boxesArray = Array.from(allBoxesInCard);
            
            // Toggle the clicked box
            this.classList.toggle("flipped");
            
            // Get other boxes (not the clicked one)
            const otherBoxes = boxesArray.filter(b => b !== this);
            
            // Randomly select 3 boxes from the other boxes
            const randomBoxes = [];
            const tempOtherBoxes = [...otherBoxes];
            const randomCount = Math.min(3, tempOtherBoxes.length);
            
            for (let i = 0; i < randomCount; i++) {
                const randomIndex = Math.floor(Math.random() * tempOtherBoxes.length);
                randomBoxes.push(tempOtherBoxes.splice(randomIndex, 1)[0]);
            }
            
            // Toggle the random boxes
            randomBoxes.forEach(box => {
                box.classList.toggle("flipped");
            });
        });
    });
});
