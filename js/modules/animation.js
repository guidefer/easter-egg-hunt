/**
 * Animation management for the Easter Egg Hunt game
 * Handles visual animations and effects
 */

import { randomInRange } from './utils.js';
import { screens } from './dom.js';

/**
 * AnimationManager object for handling background animations
 */
export const AnimationManager = {
  bunnyInterval: null,
  animationsPaused: false,
  
  /**
   * Initialize background animations
   */
  init: function() {
    // Start bunny animations with random intervals
    this.startBunnyAnimations();
  },
  
  /**
   * Start random bunny animations
   */
  startBunnyAnimations: function() {
    // Clear any existing interval
    if (this.bunnyInterval) {
      clearInterval(this.bunnyInterval);
    }
    
    // Add bunnies at random intervals
    this.bunnyInterval = setInterval(() => {
      if (!this.animationsPaused) {
        this.createHoppingBunny();
      }
    }, Math.random() * 5000 + 5000); // Random interval between 5-10 seconds
    
    // Create an initial bunny
    this.createHoppingBunny();
  },
  
  /**
   * Create a bunny that hops across the screen
   */
  createHoppingBunny: function() {
    const gameArea = screens.game;
    if (!gameArea || gameArea.classList.contains('hidden')) return;
    
    const bunny = document.createElement('div');
    bunny.className = 'background-bunny';
    bunny.textContent = '🐰';
    
    // Randomize bunny size
    const size = Math.random() * 20 + 20; // 20-40px
    bunny.style.fontSize = size + 'px';
    
    // Randomize position (from left to right, or right to left)
    const fromRight = Math.random() > 0.5;
    const topPosition = Math.random() * 70 + 15; // 15-85% from top
    
    bunny.style.top = topPosition + '%';
    
    // Set starting position and animation
    if (fromRight) {
      bunny.style.right = '-50px';
      bunny.style.transform = 'scaleX(-1)'; // Flip horizontally
      bunny.style.animation = 'hop-across 10s linear forwards reverse';
    } else {
      bunny.style.left = '-50px';
      bunny.style.animation = 'hop-across 10s linear forwards';
    }
    
    // Add to container
    gameArea.appendChild(bunny);
    
    // Remove after animation completes
    setTimeout(() => {
      if (bunny.parentNode) {
        bunny.remove();
      }
    }, 10000);
  },
  
  /**
   * Pause all animations
   */
  pauseAnimations: function() {
    this.animationsPaused = true;
  },
  
  /**
   * Resume all animations
   */
  resumeAnimations: function() {
    this.animationsPaused = false;
  },
  
  /**
   * Clean up animations and resources
   */
  cleanup: function() {
    if (this.bunnyInterval) {
      clearInterval(this.bunnyInterval);
      this.bunnyInterval = null;
    }
    
    // Remove all existing background bunnies
    const bunnies = document.querySelectorAll('.background-bunny');
    bunnies.forEach(bunny => {
      if (bunny.parentNode) {
        bunny.parentNode.removeChild(bunny);
      }
    });
  }
};

/**
 * Create a celebration effect when an egg is found
 * @param {string} left - Left position (e.g., "50%")
 * @param {string} top - Top position (e.g., "50%")
 */
export function createCelebration(left, top) {
  const gameArea = screens.game;
  if (!gameArea) return;
  
  const celebration = document.createElement('div');
  celebration.className = 'celebration';
  celebration.style.left = left;
  celebration.style.top = top;
  celebration.innerHTML = '🎉';
  celebration.style.position = 'absolute';
  celebration.style.fontSize = '30px';
  celebration.style.animation = 'celebrate 1s forwards';
  
  // Create the CSS animation if it doesn't exist
  if (!document.querySelector('#celebration-style')) {
    const style = document.createElement('style');
    style.id = 'celebration-style';
    style.innerHTML = 
      '@keyframes celebrate {' +
      '    0% { transform: scale(0.5); opacity: 1; }' +
      '    100% { transform: scale(2); opacity: 0; }' +
      '}' +
      '@keyframes pulse {' +
      '    0% { transform: scale(1); }' +
      '    50% { transform: scale(1.1); }' +
      '    100% { transform: scale(1); }' +
      '}';
    document.head.appendChild(style);
  }
  
  gameArea.appendChild(celebration);
  
  // Remove the celebration element after animation
  setTimeout(() => {
    if (celebration.parentNode) {
      celebration.remove();
    }
  }, 1000);
}

/**
 * Create a celebrating bunny animation near a found egg
 * @param {string} left - Left position (e.g., "50%")
 * @param {string} top - Top position (e.g., "50%")
 * @returns {HTMLElement} The bunny element
 */
export function createCelebratingBunny(left, top) {
  const gameArea = screens.game;
  if (!gameArea) return null;
  
  // Convert position to numbers (remove % if present)
  const leftValue = parseFloat(left);
  const topValue = parseFloat(top);
  
  // Create bunny element
  const bunny = document.createElement('div');
  bunny.className = 'background-bunny';
  bunny.textContent = '🐰';
  bunny.style.position = 'absolute';
  bunny.style.zIndex = '600'; // Above pawprints but below UI
  bunny.style.fontSize = '32px'; // Larger than normal background bunnies
  
  // Set position with a slight offset from the egg
  bunny.style.left = (leftValue + (Math.random() * 10 - 5)) + '%';
  bunny.style.top = (topValue + (Math.random() * 10 - 5)) + '%';
  
  // Create custom animation for celebration
  const animDuration = 2 + Math.random() * 2; // 2-4 seconds
  const jumpHeight = 20 + Math.random() * 30; // 20-50px
  
  // Create animation style if it doesn't exist
  if (!document.querySelector('#bunny-celebration-style')) {
    const style = document.createElement('style');
    style.id = 'bunny-celebration-style';
    style.innerHTML = 
      '@keyframes bunny-celebrate {' +
      '  0%, 100% { transform: translateY(0) rotate(0deg); }' +
      '  25% { transform: translateY(-' + jumpHeight + 'px) rotate(-10deg); }' +
      '  50% { transform: translateY(0) rotate(0deg); }' +
      '  75% { transform: translateY(-' + (jumpHeight * 0.6) + 'px) rotate(10deg); }' +
      '}';
    document.head.appendChild(style);
  }
  
  // Apply the animation
  bunny.style.animation = 'bunny-celebrate ' + animDuration + 's ease-in-out';
  
  // Add to game container
  gameArea.appendChild(bunny);
  
  // Remove after animation completes
  setTimeout(() => {
    if (bunny.parentNode) {
      // Apply a fade out animation
      bunny.style.transition = 'opacity 0.5s, transform 0.5s';
      bunny.style.opacity = '0';
      bunny.style.transform = 'translateY(-20px)';
      
      // Remove from DOM after fade out
      setTimeout(() => {
        if (bunny.parentNode) {
          bunny.remove();
        }
      }, 500);
    }
  }, animDuration * 1000);
  
  return bunny;
}

/**
 * Creates pawprint trail between two eggs
 * @param {HTMLElement} fromEgg - Starting egg element
 * @param {HTMLElement} toEgg - Ending egg element
 */
export function createPawprintTrail(fromEgg, toEgg) {
  const gameArea = screens.game;
  if (!gameArea || !fromEgg || !toEgg) return;
  
  // Get positions
  let fromLeft = parseFloat(fromEgg.style.left);
  let fromTop = parseFloat(fromEgg.style.top);
  let toLeft = parseFloat(toEgg.style.left);
  let toTop = parseFloat(toEgg.style.top);
  
  // Console log for debugging
  console.log('Creating pawprint trail from (' + fromLeft + '%, ' + fromTop + '%) to (' + toLeft + '%, ' + toTop + '%)');
  
  // If the positions are not in percentage, try to get them from dataset
  if (isNaN(fromLeft) || isNaN(fromTop)) {
    fromLeft = parseFloat(fromEgg.dataset.originalLeft || '50');
    fromTop = parseFloat(fromEgg.dataset.originalTop || '50');
  }
  
  if (isNaN(toLeft) || isNaN(toTop)) {
    toLeft = parseFloat(toEgg.dataset.originalLeft || '50');
    toTop = parseFloat(toEgg.dataset.originalTop || '50');
  }
  
  // Calculate distance between eggs
  const distance = Math.sqrt(Math.pow(toLeft - fromLeft, 2) + Math.pow(toTop - fromTop, 2));
  
  // Decide how many pawprints to create based on distance
  const numPawprints = Math.max(3, Math.min(10, Math.round(distance / 5)));
  
  // Create pawprint style if it doesn't exist
  if (!document.querySelector('#pawprint-style')) {
    const style = document.createElement('style');
    style.id = 'pawprint-style';
    style.textContent = 
      '@keyframes fadeInPawprint {' +
      '  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) rotate(var(--rotation)); }' +
      '  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2) rotate(var(--rotation)) translateY(-10px); }' +
      '  100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(var(--rotation)) translateY(0); }' +
      '}';
    document.head.appendChild(style);
  }
  
  // Create pawprints
  for (let i = 1; i < numPawprints; i++) {
    const ratio = i / numPawprints;
    
    // Calculate position with slight random variation
    const pawLeft = fromLeft + (toLeft - fromLeft) * ratio + (Math.random() * 6 - 3);
    const pawTop = fromTop + (toTop - fromTop) * ratio + (Math.random() * 6 - 3);
    
    // Create pawprint element
    const pawprint = document.createElement('div');
    pawprint.className = 'pawprint';
    pawprint.textContent = '🐾';
    
    // Alternate left/right pawprints for a more natural look
    const rotation = (i % 2 === 0) ? '25deg' : '-25deg';
    pawprint.style.setProperty('--rotation', rotation);
    
    // Position the pawprint
    pawprint.style.left = pawLeft + '%';
    pawprint.style.top = pawTop + '%';
    
    // Add to game container
    gameArea.appendChild(pawprint);
    
    // Animate it with a delay based on its position
    pawprint.style.animation = 'fadeInPawprint 0.8s forwards ' + (i * 0.1) + 's';
  }
}

/**
 * Add confetti canvas to the DOM
 * @returns {HTMLCanvasElement} Confetti canvas
 */
export function addConfettiCanvas() {
  const existingCanvas = document.getElementById('confetti-canvas');
  
  if (existingCanvas) {
    return existingCanvas;
  }
  
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.className = 'hidden';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '2000';
  
  document.body.appendChild(canvas);
  
  return canvas;
}

/**
 * Show confetti animation for celebration
 */
export function showConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const ctx = canvas.getContext('2d');
  const confettiCount = 200;
  const confetti = [];
  
  // Create confetti particles
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 5 + 5,
      color: 'hsl(' + (Math.random() * 360) + ', 100%, 70%)',
      speed: Math.random() * 3 + 2,
      angle: Math.random() * Math.PI * 2,
      rotation: Math.random() * 0.2 - 0.1,
      opacity: 1
    });
  }
  
  // Animate confetti
  let animationFrame;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let complete = true;
    confetti.forEach(particle => {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.angle);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.opacity;
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      ctx.restore();
      
      particle.y += particle.speed;
      particle.angle += particle.rotation;
      
      // Fade out particles that reach bottom
      if (particle.y > canvas.height) {
        particle.opacity -= 0.01;
        if (particle.opacity <= 0) particle.opacity = 0;
      }
      
      if (particle.opacity > 0) complete = false;
    });
    
    if (complete) {
      cancelAnimationFrame(animationFrame);
      canvas.style.display = 'none';
    } else {
      animationFrame = requestAnimationFrame(animate);
    }
  }
  
  animationFrame = requestAnimationFrame(animate);
}