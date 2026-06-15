import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// =========================================
// SUPABASE CONFIGURATION
// =========================================
const SUPABASE_URL = 'https://xrdnxxbnothjtckbegsz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZG54eGJub3RoanRja2JlZ3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDE5NzYsImV4cCI6MjA5NzExNzk3Nn0.xsFZCMXMeAE2LP_UPpcGhOMkKwzRnx5O5-8IE2craOw';
// Initialize Supabase only if keys are provided to avoid console errors
const supabase = (SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  initThreeJS();
  initSwiper();
  initScrollAnimations();
  initInteractions();
});

/* =========================================
   1. THREE.JS BACKGROUND PARTICLES
========================================= */
let scene, camera, renderer, composer, particles;
let mouseX = 0, mouseY = 0;

function initThreeJS() {
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    const bgCanvas = document.getElementById('threejs-canvas');
    if (bgCanvas) bgCanvas.style.display = 'none';
    isThreeJsRunning = false;
    return; // Abort all Three.js setup to completely save mobile GPU
  }

  const canvas = document.getElementById('threejs-canvas');
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Cap pixel ratio at 1 on mobile (if we didn't abort), 2 on desktop to save fill rate
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  
  // Only add heavy Bloom effect on Desktop
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.5;
    composer.addPass(bloomPass);
  }
  
  const heartGeometry = new THREE.BufferGeometry();
  const positions = [];
  const sizes = [];
  
  const particleCount = 800; // Desktop only now
  for (let i = 0; i < particleCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 1500,
      (Math.random() - 0.5) * 1500,
      (Math.random() - 0.5) * 1000
    );
    sizes.push(Math.random() * 2);
  }
  
  heartGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  heartGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  const heartMaterial = new THREE.PointsMaterial({
    size: 3,
    color: 0xff1493,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  particles = new THREE.Points(heartGeometry, heartMaterial);
  scene.add(particles);

  camera.position.z = 200;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  animateThreeJS();
}

let isThreeJsRunning = true;

function animateThreeJS() {
  if (!isThreeJsRunning) return; // Completely pause GPU rendering when not needed
  requestAnimationFrame(animateThreeJS);
  if (particles) {
    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.001;
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
  }
  composer.render();
}

/* =========================================
   2. SWIPER GALLERY
========================================= */
function initSwiper() {
  new Swiper('.mySwiper', {
    spaceBetween: 30,
    centeredSlides: true,
    slidesPerView: 'auto',
    loop: true,
    speed: 3000, // Continuous slow movement
    allowTouchMove: false, // Prevents breaking the loop
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
      pauseOnMouseEnter: false
    }
  });
}

/* =========================================
   3. SCROLLYTELLING ANIMATIONS
========================================= */
function initScrollAnimations() {
  gsap.to('.hero-content', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom center',
      scrub: true
    },
    y: -100,
    opacity: 0
  });

  gsap.to('.spline-container', {
    scrollTrigger: {
      trigger: '#confession',
      start: 'top bottom',
      end: 'top center',
      scrub: true
    },
    opacity: 0.3,
    scale: 0.9
  });

  const revealTexts = document.querySelectorAll('.reveal-text');
  revealTexts.forEach((text, i) => {
    gsap.to(text, {
      scrollTrigger: {
        trigger: text,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out'
    });
  });

  gsap.to('.final-question', {
    scrollTrigger: {
      trigger: '#proposal',
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    y: 0,
    opacity: 1,
    duration: 1.5,
    ease: 'power2.out'
  });

  gsap.to('#reveal-btn', {
    scrollTrigger: {
      trigger: '#proposal',
      start: 'top 50%',
      toggleActions: 'play none none reverse'
    },
    scale: 1,
    opacity: 1,
    duration: 1,
    delay: 0.5,
    ease: 'elastic.out(1, 0.5)'
  });
}

/* =========================================
   4. INTERACTIONS, FINAL DECISION & SUPABASE
========================================= */
async function saveResponseToSupabase(response) {
  if (!supabase) {
    console.warn("Supabase not configured. Please add URL and KEY to script.js");
    return;
  }

  try {
    const { data, error } = await supabase
      .from('proposal_responses')
      .insert([{
        answer: response,
        device_info: navigator.userAgent
      }]);

    if (error) throw error;
    console.log("Response saved successfully!");
  } catch (err) {
    console.error("Error saving response:", err.message);
  }
}

function initInteractions() {
  const bgMusic = document.getElementById('background-music');
  document.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(e => console.log('Audio play failed: ', e));
    }
  }, { once: true });

  const scrollContainer = document.getElementById('scroll-container');
  const revealBtn = document.getElementById('reveal-btn');
  const finalDecision = document.getElementById('final-decision');
  const successScreen = document.getElementById('success-screen');

  // "Click to Reveal" Logic
  revealBtn.addEventListener('click', () => {
    // 1. Shut down the background Three.js entirely to give 100% GPU to the final robot
    isThreeJsRunning = false;
    const bgCanvas = document.getElementById('threejs-canvas');
    if (bgCanvas) bgCanvas.style.display = 'none';

    // 2. Dynamically inject the 2nd robot into the HTML only now
    const finalSplineContainer = document.getElementById('final-spline-container');
    if (finalSplineContainer) {
      finalSplineContainer.insertAdjacentHTML('afterbegin', '<spline-viewer id="interactive-spline" url="https://prod.spline.design/ZdUCFRKMLJFpco3R/scene.splinecode"></spline-viewer>');
      
      // Wake up Spline raycaster after injection
      setTimeout(() => {
        const interactiveSpline = document.getElementById('interactive-spline');
        if (interactiveSpline) {
          interactiveSpline.addEventListener('mouseDown', () => {});
        }
      }, 500);
    }

    // 3. Fade out everything that was scrolled
    gsap.to(scrollContainer, {
      opacity: 0, 
      duration: 1,
      onComplete: () => {
        scrollContainer.style.display = 'none'; 
        const mainSpline = document.getElementById('main-spline');
        // Physically remove the element from DOM so the browser stops rendering its 3D WebGL context
        if (mainSpline) mainSpline.remove(); 
        
        finalDecision.classList.add('active');
        gsap.fromTo('#final-decision .spline-container', { opacity: 0 }, { opacity: 1, duration: 1 });
      }
    });
  });

  // Strict Mathematical Hit Testing (No HTML Overlays required)
  document.addEventListener('mouseup', async (e) => {
    // Only intercept if we are on the final decision screen
    if (!finalDecision.classList.contains('active')) return;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Strict Hitbox Logic: Only trigger in the bottom 30% of the screen where buttons live
    if (e.clientY > screenH * 0.70) {
      const centerX = screenW / 2;
      const deadzone = screenW * 0.05; // 5% deadzone gap in the exact center (robot's feet)

      // YES button is strictly on the left side, outside the center deadzone
      if (e.clientX < (centerX - deadzone)) {
        await saveResponseToSupabase('Yes');
        for (let i = 0; i < 60; i++) { createExplosionHeart(); }
        finalDecision.classList.remove('active');
        setTimeout(() => { successScreen.classList.add('active'); }, 500);
      }
      // NO button is strictly on the right side, outside the center deadzone
      else if (e.clientX > (centerX + deadzone)) {
        await saveResponseToSupabase('No');
        alert("Okay fine...  ");
      }
    }
  }, true); // Use capture phase to intercept before Spline consumes it

  // Heart Trail Effect
  let lastHeartTime = 0;
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastHeartTime < 50) return;
    lastHeartTime = now;

    const heart = document.createElement('div');
    heart.className = 'heart-trail';
    heart.innerHTML = '❤️';
    heart.style.left = `${e.pageX}px`;
    heart.style.top = `${e.pageY}px`;
    document.body.appendChild(heart);

    setTimeout(() => { heart.remove(); }, 1000);
  });

  // Mobile Heart Trail (Touch)
  document.addEventListener('touchmove', (e) => {
    const now = Date.now();
    if (now - lastHeartTime < 50) return;
    lastHeartTime = now;

    const touch = e.touches[0];
    const heart = document.createElement('div');
    heart.className = 'heart-trail';
    heart.innerHTML = '❤️';
    heart.style.left = `${touch.pageX}px`;
    heart.style.top = `${touch.pageY}px`;
    document.body.appendChild(heart);

    setTimeout(() => { heart.remove(); }, 1000);
  });
}

function createExplosionHeart() {
  const heart = document.createElement('div');
  heart.className = 'heart-trail';
  heart.innerHTML = '💖';
  heart.style.left = `${window.innerWidth / 2}px`;
  heart.style.top = `${window.innerHeight / 2}px`;
  heart.style.zIndex = '10000';
  document.body.appendChild(heart);

  const angle = Math.random() * Math.PI * 2;
  const velocity = 100 + Math.random() * 400;
  const tx = Math.cos(angle) * velocity;
  const ty = Math.sin(angle) * velocity - 200;

  gsap.to(heart, {
    x: tx,
    y: ty,
    opacity: 0,
    scale: Math.random() * 2 + 1,
    duration: 1.5 + Math.random(),
    ease: 'power3.out',
    onComplete: () => heart.remove()
  });
}
