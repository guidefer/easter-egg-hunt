// Easter Egg Hunt Game Logic

// Game state variables
let eggData = []; // Will store {number, left, top, clue}
let currentEggIndex = 0;
let foundCount = 0;
let selectedEggId = null;
let draggedEgg = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let soundEnabled = true; // Allow users to toggle sounds
let isNewEgg = false; // Flag to track if we're creating a new egg or editing existing
let currentBackground = 'Living-room.png'; // Track the current background image
let touchEnabled = 'ontouchstart' in window; // Detect if device supports touch

// Game version - update this when making significant changes
const GAME_VERSION = '1.3.0'; // Major.Minor.Patch format

// Sound effects using the Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const sounds = {
  pop: null,
  success: null,
  complete: null
};

// Create simple sounds with the Web Audio API
function createSound(type) {
  // This will create the sounds when first needed (on user interaction)
  // to comply with autoplay policies
  return function() {
    if (!soundEnabled) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different sound types
    switch(type) {
      case 'pop':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'success':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(580, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(780, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'complete':
        // Play a little melody for completion
        const notes = [440, 554, 659, 880];
        for (let i = 0; i < notes.length; i++) {
          const noteOsc = audioContext.createOscillator();
          const noteGain = audioContext.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(audioContext.destination);
          
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(notes[i], audioContext.currentTime + i * 0.2);
          noteGain.gain.setValueAtTime(0.5, audioContext.currentTime + i * 0.2);
          noteGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (i + 1) * 0.2);
          
          noteOsc.start(audioContext.currentTime + i * 0.2);
          noteOsc.stop(audioContext.currentTime + (i + 1) * 0.2);
        }
        break;
    }
  };
}

// Enhanced Sound System
const SoundManager = {
  // Sound URLs - using local references for audio (these won't work until actual files are added)
  sounds: {
    backgroundMusic: [
      './sounds/easter-music1.mp3',
      './sounds/easter-music2.mp3'
    ],
    eggFound: './sounds/success.mp3',
    hint: './sounds/hint.mp3',
    celebration: './sounds/celebration.mp3'
  },
  
  // Track the current background music index
  currentMusicIndex: 0,
  
  // References to audio elements
  elements: {
    backgroundMusic: null,
    eggFound: null,
    hint: null,
    celebration: null
  },
  
  // Initialize the sound system
  init: function() {
    // Get references to audio elements
    this.elements.backgroundMusic = document.getElementById('background-music');
    this.elements.eggFound = document.getElementById('egg-found-sound');
    this.elements.hint = document.getElementById('hint-sound');
    this.elements.celebration = document.getElementById('celebration-sound');
    
    // Set initial volume - use a default value
    if (this.elements.backgroundMusic) {
      this.elements.backgroundMusic.volume = 0.5;
      
      // Handle errors for audio files that might not exist yet
      this.elements.backgroundMusic.addEventListener('error', (e) => {
        console.log('Background music file not found, using Web Audio API fallback');
        // The game will fall back to Web Audio API sounds
      });
      
      // Set the first track as source
      this.elements.backgroundMusic.src = this.sounds.backgroundMusic[this.currentMusicIndex];
      
      // For mobile devices, we need user interaction to start playing
      document.addEventListener('click', () => {
        if (this.elements.backgroundMusic && !this.elements.backgroundMusic.src) {
          this.elements.backgroundMusic.src = this.sounds.backgroundMusic[this.currentMusicIndex];
        }
      }, { once: true });
      
      // Load volume preference if exists
      const savedVolume = localStorage.getItem('eggHuntVolume');
      if (savedVolume !== null) {
        this.elements.backgroundMusic.volume = parseFloat(savedVolume);
      }
      
      // Listen for when a track ends and play the next one
      this.elements.backgroundMusic.addEventListener('ended', () => {
        this.nextTrack();
      });
    }
    
    // Set other audio sources with error handling
    this.setupAudioSource(this.elements.eggFound, this.sounds.eggFound);
    this.setupAudioSource(this.elements.hint, this.sounds.hint);
    this.setupAudioSource(this.elements.celebration, this.sounds.celebration);
    
    // Lower volume for effect sounds if they exist
    if (this.elements.eggFound) this.elements.eggFound.volume = 0.6;
    if (this.elements.hint) this.elements.hint.volume = 0.4;
    if (this.elements.celebration) this.elements.celebration.volume = 0.7;
  },
  
  // Helper method to set audio source with error handling
  setupAudioSource: function(audioElement, src) {
    audioElement.addEventListener('error', (e) => {
      console.log(`Audio file not found: ${src}, using fallback`);
    });
    audioElement.src = src;
  },
  
  // Play the next music track
  nextTrack: function() {
    this.currentMusicIndex = (this.currentMusicIndex + 1) % this.sounds.backgroundMusic.length;
    const wasPlaying = !this.elements.backgroundMusic.paused;
    
    this.elements.backgroundMusic.src = this.sounds.backgroundMusic[this.currentMusicIndex];
    
    if (wasPlaying) {
      this.elements.backgroundMusic.play().catch(e => {
        console.log('Failed to play next track, likely missing file');
      });
    }
  },
  
  // Play a specific sound
  play: function(soundType) {
    if (!soundEnabled) return;
    
    switch(soundType) {
      case 'eggFound':
        this.playWithFallback(this.elements.eggFound, 'success');
        break;
      case 'hint':
        this.playWithFallback(this.elements.hint, 'pop');
        break;
      case 'celebration':
        this.playWithFallback(this.elements.celebration, 'complete');
        break;
    }
  },
  
  // Play with fallback to Web Audio API if file not found
  playWithFallback: function(audioElement, fallbackType) {
    if (audioElement.readyState === 0) {
      // Audio not loaded, use fallback
      if (fallbackType === 'success' && sounds.success) sounds.success();
      else if (fallbackType === 'pop' && sounds.pop) sounds.pop();
      else if (fallbackType === 'complete' && sounds.complete) sounds.complete();
    } else {
      // Try to play the audio file
      audioElement.currentTime = 0;
      audioElement.play().catch(e => {
        // Fall back to Web Audio API
        if (fallbackType === 'success' && sounds.success) sounds.success();
        else if (fallbackType === 'pop' && sounds.pop) sounds.pop();
        else if (fallbackType === 'complete' && sounds.complete) sounds.complete();
      });
    }
  }
};

// Animation manager for dynamic background elements
const AnimationManager = {
  bunnyInterval: null,
  animationsPaused: false,
  
  // Initialize background animations
  init: function() {
    // Start bunny animations with random intervals
    this.startBunnyAnimations();
  },
  
  // Start random bunny animations
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
  
  // Create a bunny that hops across the screen
  createHoppingBunny: function() {
    const gameArea = document.getElementById('game-container');
    if (!gameArea || gameArea.classList.contains('hidden')) return;
    
    const bunny = document.createElement('div');
    bunny.className = 'background-bunny';
    bunny.textContent = '🐰';
    
    // Randomize bunny size
    const size = Math.random() * 20 + 20; // 20-40px
    bunny.style.fontSize = `${size}px`;
    
    // Randomize position (from left to right, or right to left)
    const fromRight = Math.random() > 0.5;
    const topPosition = Math.random() * 70 + 15; // 15-85% from top
    
    bunny.style.top = `${topPosition}%`;
    
    // Set starting position and animation
    if (fromRight) {
      bunny.style.right = '-50px';
      bunny.style.transform = 'scaleX(-1)'; // Flip horizontally
      bunny.style.animation = `hop-across 10s linear forwards reverse`;
    } else {
      bunny.style.left = '-50px';
      bunny.style.animation = `hop-across 10s linear forwards`;
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
  
  // Pause all animations
  pauseAnimations: function() {
    this.animationsPaused = true;
  },
  
  // Resume all animations
  resumeAnimations: function() {
    this.animationsPaused = false;
  }
};

// DOM Elements
const startScreen = document.getElementById('start-screen');
const setupScreen = document.getElementById('setup-screen');
const gameContainer = document.getElementById('game-container');
const clueDisplay = document.getElementById('clue-display');
const floatingUI = document.getElementById('floating-ui');
const currentClueText = document.getElementById('current-clue');
const foundCountElement = document.getElementById('found-count');
const totalCountElement = document.getElementById('total-count');
const eggModal = document.getElementById('egg-modal');
const modalEggNumber = document.getElementById('modal-egg-number');
const modalEggClue = document.getElementById('modal-egg-clue');

// Setup buttons
document.getElementById('setup-btn').addEventListener('click', startSetupWithLoading);
document.getElementById('add-egg-btn').addEventListener('click', showAddEggModal);
document.getElementById('start-game-btn').addEventListener('click', startGame);
document.getElementById('reset-btn').addEventListener('click', resetGame);

// Modal buttons
document.getElementById('modal-save-btn').addEventListener('click', saveEggFromModal);
document.getElementById('modal-remove-btn').addEventListener('click', removeEggFromModal);
document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

// Close modal if clicking outside the modal content
eggModal.addEventListener('click', function(e) {
    if (e.target === eggModal) {
        closeModal();
    }
});

// Initialize sounds (called on first user interaction)
function initSounds() {
  if (!sounds.pop) sounds.pop = createSound('pop');
  if (!sounds.success) sounds.success = createSound('success');
  if (!sounds.complete) sounds.complete = createSound('complete');
}

// Initialize the app when the page loads
window.onload = function() {
  // Add a confetti effect for celebration
  addConfettiCanvas();
  
  // Add event listener for restart button in congratulation modal
  document.getElementById('restart-btn').addEventListener('click', function() {
    // Hide congratulation modal
    document.getElementById('congrats-modal').classList.add('hidden');
    // Reset the game
    resetGame();
  });
  
  // Set up the background image selector
  initBackgroundUpload();
  
  // Add viewport meta tag for mobile if not present
  ensureViewportMeta();
  
  // Add FastClick to eliminate 300ms delay on mobile devices
  initFastClick();
  
  // Initialize sound manager
  SoundManager.init();
  
  // Initialize animation manager
  AnimationManager.init();
  
  // Initialize the collapsible "More Settings" section
  initMoreSettings();
  
  // Update version number in the UI
  updateVersionDisplay();
  
  // Initialize settings modal
  initSettingsModal();
};

// Update version number in the UI
function updateVersionDisplay() {
  const versionElement = document.getElementById('game-version');
  if (versionElement) {
    versionElement.textContent = GAME_VERSION;
  }
}

// Add a canvas for confetti effects
function addConfettiCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  canvas.style.display = 'none';
  document.body.appendChild(canvas);
}

// Ensure viewport meta tag is present
function ensureViewportMeta() {
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(meta);
  }
}

// Initialize FastClick to eliminate the 300ms click delay on touch devices
function initFastClick() {
  if (touchEnabled) {
    document.addEventListener('DOMContentLoaded', function() {
      // Apply touch-action manipulation to all interactive elements
      document.body.style.touchAction = 'manipulation';
      
      // Enhanced touch event handlers for all buttons
      const enhanceButtonTouchSupport = () => {
        // Find all buttons and button-like elements
        const buttons = document.querySelectorAll('button, .main-btn, .control-btn, .egg, .setup-egg, .more-settings-toggle');
        buttons.forEach(button => {
          // Remove existing touch handlers if any, to prevent duplicates
          button.removeEventListener('touchstart', handleTouchStart);
          button.removeEventListener('touchend', handleTouchEnd);
          
          // Add active state for visual feedback
          button.addEventListener('touchstart', handleTouchStart, { passive: true });
          button.addEventListener('touchend', handleTouchEnd);
        });
      };
      
      // Touch handlers for better visual feedback and reliability
      function handleTouchStart(e) {
        // Add an active state class
        this.classList.add('touch-active');
      }
      
      function handleTouchEnd(e) {
        // Remove the active state
        this.classList.remove('touch-active');
        
        // Stop event propagation to prevent unwanted clicks
        e.stopPropagation();
        
        // Small delay to ensure click event is processed
        setTimeout(() => {
          // Check if this was a tap rather than a drag
          const target = e.currentTarget;
          if (target && !target.classList.contains('setup-egg')) {
            // For non-draggable elements, trigger a click
            if (!e.defaultPrevented) {
              // Create and dispatch a click event
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              target.dispatchEvent(clickEvent);
            }
          }
        }, 10);
      }
      
      // Initial enhancement
      enhanceButtonTouchSupport();
      
      // Re-enhance after any screen changes
      ['setup-btn', 'start-game-btn', 'reset-btn'].forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
          const originalClick = btn.onclick;
          btn.onclick = function(e) {
            if (originalClick) originalClick.call(this, e);
            // Re-apply touch enhancements after a delay to allow screen changes
            setTimeout(enhanceButtonTouchSupport, 500);
          };
        }
      });
    });
  }
}

// ------ Modal Functions ------

// Show modal for adding a new egg
function showAddEggModal() {
    isNewEgg = true;
    selectedEggId = null;
    
    // Set the next available egg number
    modalEggNumber.value = findNextAvailableEggNumber();
    modalEggClue.value = '';
    
    // Hide remove button for new eggs
    document.getElementById('modal-remove-btn').style.display = 'none';
    
    // Show the modal
    eggModal.classList.remove('hidden');
    modalEggClue.focus();
}

// Show modal for editing an existing egg
function showEditEggModal(eggId) {
    isNewEgg = false;
    selectedEggId = eggId;
    
    // Find the egg data
    const eggInfo = eggData.find(egg => egg.id === eggId);
    if (!eggInfo) return;
    
    // Fill the modal with egg data
    modalEggNumber.value = eggInfo.number;
    modalEggClue.value = eggInfo.clue;
    
    // Show remove button for existing eggs
    document.getElementById('modal-remove-btn').style.display = 'block';
    
    // Show the modal
    eggModal.classList.remove('hidden');
    modalEggClue.focus();
}

// Close the modal
function closeModal() {
    eggModal.classList.add('hidden');
    selectedEggId = null;
}

// Save changes from modal
function saveEggFromModal() {
    const eggNumber = parseInt(modalEggNumber.value);
    const eggClue = modalEggClue.value.trim();
    
    // Basic validation
    if (!eggClue) {
        alert('Please enter a clue for the egg.');
        return;
    }
    
    if (isNewEgg) {
        // Check if this number already exists
        const existingEgg = eggData.find(egg => egg.number === eggNumber);
        if (existingEgg) {
            alert(`Egg #${eggNumber} already exists. Please use a different number.`);
            return;
        }
        
        // Get position from stored data or use center position
        const left = modalEggClue.dataset.tempLeft || '50%';
        const top = modalEggClue.dataset.tempTop || '50%';
        
        // Create a new egg with isNew flag
        const newEgg = {
            id: Date.now(),
            number: eggNumber,
            left: left,
            top: top,
            clue: eggClue,
            isNew: true  // Flag to highlight new eggs
        };
        
        eggData.push(newEgg);
        
        // Create visual egg
        createVisualEgg(newEgg, document.getElementById('egg-placement-area'));
        
        // Clear temp position data
        delete modalEggClue.dataset.tempLeft;
        delete modalEggClue.dataset.tempTop;
    } else {
        // Check if this number already exists (excluding the current selected egg)
        const duplicateEgg = eggData.find(egg => egg.number === eggNumber && egg.id !== selectedEggId);
        if (duplicateEgg) {
            alert(`Egg #${eggNumber} already exists. Please use a different number.`);
            return;
        }
        
        // Update existing egg
        const eggIndex = eggData.findIndex(egg => egg.id === selectedEggId);
        if (eggIndex !== -1) {
            eggData[eggIndex].number = eggNumber;
            eggData[eggIndex].clue = eggClue;
            
            // Update visual egg
            updateVisualEgg(eggData[eggIndex]);
        }
    }
    
    // Update the egg list and close the modal
    updateEggList();
    closeModal();
}

// Remove egg from modal
function removeEggFromModal() {
    if (!selectedEggId) return;
    
    // Ask for confirmation
    if (confirm('Are you sure you want to remove this egg?')) {
        // Remove the egg data
        eggData = eggData.filter(egg => egg.id !== selectedEggId);
        
        // Remove visual egg
        const eggElement = document.querySelector(`.setup-egg[data-egg-id="${selectedEggId}"]`);
        if (eggElement) {
            eggElement.remove();
        }
        
        // Update the egg list and close the modal
        updateEggList();
        closeModal();
    }
}

// ------ Setup Screen Functions ------

function showSetupScreen() {
    startScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    
    // Initialize egg placement area with the living room image
    const eggPlacementArea = document.getElementById('egg-placement-area');
    eggPlacementArea.innerHTML = '';
    
    // Setup area for both click and touch
    addAreaEventListeners(eggPlacementArea);
}

// Add events for both mouse and touch to the placement area
function addAreaEventListeners(area) {
    // Click event for mouse
    area.addEventListener('click', function(e) {
        if (e.target === area) {
            createNewEggAtPosition(e.offsetX, e.offsetY);
        }
    });

    // Touch event for mobile
    area.addEventListener('touchend', function(e) {
        if (e.target === area) {
            e.preventDefault(); // Prevent mouse event from firing too
            const touch = e.changedTouches[0];
            const rect = area.getBoundingClientRect();
            const offsetX = touch.clientX - rect.left;
            const offsetY = touch.clientY - rect.top;
            createNewEggAtPosition(offsetX, offsetY);
        }
    });
}

function createNewEggAtPosition(x, y) {
    // Store click position for the new egg
    const eggPlacementArea = document.getElementById('egg-placement-area');
    const areaRect = eggPlacementArea.getBoundingClientRect();
    
    // Calculate position as percentages for responsive behavior
    // This position represents the top-left corner of the egg
    const left = Math.max(0, Math.min(100, (x / areaRect.width) * 100));
    const top = Math.max(0, Math.min(100, (y / areaRect.height) * 100));
    
    // Set global variables for the new egg
    isNewEgg = true;
    selectedEggId = null;
    
    // Set the next available egg number in the modal
    modalEggNumber.value = findNextAvailableEggNumber();
    modalEggClue.value = '';
    
    // Store the position information - will be used when saving
    // Store as percentage values for responsive positioning
    modalEggClue.dataset.tempLeft = left + '%';
    modalEggClue.dataset.tempTop = top + '%';
    
    // Hide remove button for new eggs
    document.getElementById('modal-remove-btn').style.display = 'none';
    
    // Show the modal
    eggModal.classList.remove('hidden');
    modalEggClue.focus();
}

// Helper function to find the next available egg number
function findNextAvailableEggNumber() {
    if (eggData.length === 0) return 1;
    
    // Get all existing egg numbers
    const usedNumbers = eggData.map(egg => egg.number);
    
    // Find the first available number starting from 1
    let nextNumber = 1;
    while (usedNumbers.includes(nextNumber)) {
        nextNumber++;
    }
    
    return nextNumber;
}

function createVisualEgg(eggInfo, container) {
    const egg = document.createElement('div');
    egg.className = 'setup-egg';
    egg.dataset.eggId = eggInfo.id;
    
    // Set data-number attribute for CSS ::after content
    egg.dataset.number = eggInfo.number;
    
    // Position consistently - store original values without any adjustment
    const leftPos = eggInfo.left;
    const topPos = eggInfo.top;
    
    egg.style.left = leftPos;
    egg.style.top = topPos;
    egg.title = `Egg #${eggInfo.number}: ${eggInfo.clue}`;
    
    // Flag to track if we're dragging
    let isDragging = false;
    let startX, startY;
    
    // Add mouse event listeners
    egg.addEventListener('mousedown', (e) => {
        isDragging = false;
        startDrag(e);
    });
    
    egg.addEventListener('mouseup', (e) => {
        if (!isDragging) {
            e.stopPropagation();
            showEditEggModal(parseInt(egg.dataset.eggId));
        }
    });
    
    egg.addEventListener('mousemove', () => {
        if (draggedEgg === egg) {
            isDragging = true;
        }
    });
    
    // Add touch event listeners for mobile
    if (touchEnabled) {
        egg.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            isDragging = false;
            startDragTouch(e);
        }, { passive: false });
        
        egg.addEventListener('touchmove', (e) => {
            if (draggedEgg === egg) {
                isDragging = true;
                dragMoveTouch(e);
            }
        }, { passive: false });
        
        egg.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            const deltaX = Math.abs(touch.clientX - startX);
            const deltaY = Math.abs(touch.clientY - startY);
            
            // If movement was minimal, consider it a tap
            if (deltaX < 10 && deltaY < 10) {
                e.stopPropagation();
                showEditEggModal(parseInt(egg.dataset.eggId));
            }
            
            dragEndTouch();
        });
    }
    
    // Highlight new eggs with a different class
    if (eggInfo.isNew) {
        egg.classList.add('new-egg');
        // Remove the "new" status after a short delay
        setTimeout(() => {
            egg.classList.remove('new-egg');
            delete eggInfo.isNew;
        }, 2000);
    }
    
    container.appendChild(egg);
}

function updateVisualEgg(eggInfo) {
    const egg = document.querySelector(`.setup-egg[data-egg-id="${eggInfo.id}"]`);
    if (egg) {
        egg.dataset.number = eggInfo.number;
        egg.title = `Egg #${eggInfo.number}: ${eggInfo.clue}`;
    }
}

// Mouse drag handlers
function startDrag(e) {
    e.preventDefault();
    draggedEgg = e.target;
    const eggRect = draggedEgg.getBoundingClientRect();
    dragOffsetX = e.clientX - eggRect.left;
    dragOffsetY = e.clientY - eggRect.top;
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
}

function dragMove(e) {
    if (!draggedEgg) return;
    
    const container = document.getElementById('egg-placement-area');
    const containerRect = container.getBoundingClientRect();
    
    let left = ((e.clientX - containerRect.left - dragOffsetX) / containerRect.width) * 100;
    let top = ((e.clientY - containerRect.top - dragOffsetY) / containerRect.height) * 100;
    
    left = Math.max(0, Math.min(left, 100));
    top = Math.max(0, Math.min(top, 100));
    
    draggedEgg.style.left = left + '%';
    draggedEgg.style.top = top + '%';
    
    const eggId = parseInt(draggedEgg.dataset.eggId);
    const eggIndex = eggData.findIndex(egg => egg.id === eggId);
    if (eggIndex !== -1) {
        eggData[eggIndex].left = left + '%';
        eggData[eggIndex].top = top + '%';
    }
}

function dragEnd() {
    draggedEgg = null;
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
}

// Touch drag handlers for mobile
function startDragTouch(e) {
    e.preventDefault();
    draggedEgg = e.target;
    const touch = e.touches[0];
    const eggRect = draggedEgg.getBoundingClientRect();
    dragOffsetX = touch.clientX - eggRect.left;
    dragOffsetY = touch.clientY - eggRect.top;
}

function dragMoveTouch(e) {
    if (!draggedEgg) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const container = document.getElementById('egg-placement-area');
    const containerRect = container.getBoundingClientRect();
    
    let left = ((touch.clientX - containerRect.left - dragOffsetX) / containerRect.width) * 100;
    let top = ((touch.clientY - containerRect.top - dragOffsetY) / containerRect.height) * 100;
    
    left = Math.max(0, Math.min(left, 100));
    top = Math.max(0, Math.min(top, 100));
    
    draggedEgg.style.left = left + '%';
    draggedEgg.style.top = top + '%';
    
    const eggId = parseInt(draggedEgg.dataset.eggId);
    const eggIndex = eggData.findIndex(egg => egg.id === eggId);
    if (eggIndex !== -1) {
        eggData[eggIndex].left = left + '%';
        eggData[eggIndex].top = top + '%';
    }
}

function dragEndTouch() {
    draggedEgg = null;
}

function updateEggList() {
    const eggList = document.getElementById('egg-list');
    eggList.innerHTML = '';
    
    // Sort eggs by their number
    const sortedEggs = [...eggData].sort((a, b) => a.number - b.number);
    
    sortedEggs.forEach(egg => {
        const li = document.createElement('li');
        li.textContent = `Egg #${egg.number}: ${egg.clue.substring(0, 20)}${egg.clue.length > 20 ? '...' : ''}`;
        li.dataset.eggId = egg.id;
        
        // Add the title attribute for "Click to edit" tooltip on hover
        li.title = "Click to edit this egg";
        
        // Add both click and touch event listeners
        const editEgg = () => {
            showEditEggModal(parseInt(egg.id));
        };
        
        li.addEventListener('click', editEgg);
        li.addEventListener('touchend', (e) => {
            e.preventDefault();
            editEgg();
        });
        
        eggList.appendChild(li);
    });
    
    // Update total count for start game button
    document.getElementById('start-game-btn').disabled = eggData.length === 0;
    document.getElementById('start-game-btn').textContent = 
        `Start the Hunt! (${eggData.length} egg${eggData.length !== 1 ? 's' : ''})`;
}

// ------ Game Functions ------

function startGame() {
    if (eggData.length === 0) {
        alert('Please add at least one egg before starting the game.');
        return;
    }
    
    // Initialize sounds on user interaction
    initSounds();
    
    // Show loading screen
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.remove('hidden');
    
    // Sort eggs by number to ensure sequential order
    eggData.sort((a, b) => a.number - b.number);
    
    // Simulate loading process
    let progress = 0;
    const loadingBar = document.getElementById('loading-bar');
    const loadingInterval = setInterval(() => {
        progress += 5;
        loadingBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            
            // Hide loading screen and show game screen after a small delay
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                
                // Hide setup screen and show game screen
                setupScreen.classList.add('hidden');
                gameContainer.classList.remove('hidden');
                clueDisplay.classList.remove('hidden');
                floatingUI.classList.remove('hidden');
                
                // Reset game state
                foundCount = 0;
                currentEggIndex = 0;
                foundCountElement.textContent = foundCount;
                totalCountElement.textContent = eggData.length;
                
                // Create eggs in the game container
                createGameEggs();
                
                // Show first clue
                showCurrentClue();
            }, 300);
        }
    }, 100); // Update every 100ms for a smoother animation
}

/**
 * Create game eggs with corrected position calculations to avoid scaling issues
 * The issue was that eggs positioned farther from center had greater offsets
 */
function createGameEggs() {
    // Clear game container
    gameContainer.innerHTML = '';
    
    // Get the background size information
    const setupArea = document.getElementById('egg-placement-area');
    const gameArea = gameContainer;
    
    // Define animation types to cycle through
    const animationTypes = ['animation-bobble', 'animation-spin', 'animation-wiggle', 'animation-bounce', 'animation-pulse'];
    
    // Use a consistent coordinate system across both containers
    // Create all eggs with exact positioning to match setup phase
    eggData.forEach((eggInfo, index) => {
        const egg = document.createElement('button');
        egg.className = 'egg';
        egg.dataset.eggIndex = index;
        
        // Assign a different animation style based on the egg number
        // This creates visual variety between the eggs
        const animationType = animationTypes[index % animationTypes.length];
        egg.classList.add(animationType);
        
        // Extract exact percentage values and apply directly without modification
        // This ensures consistent positioning that's proportional in both phases
        const leftPos = typeof eggInfo.left === 'string' ? 
            eggInfo.left : eggInfo.left + '%';
        const topPos = typeof eggInfo.top === 'string' ? 
            eggInfo.top : eggInfo.top + '%';
        
        // Store original position in data attributes for reference
        egg.dataset.originalLeft = leftPos;
        egg.dataset.originalTop = topPos;
        
        // Apply positions directly without any adjustments or calculations
        egg.style.left = leftPos;
        egg.style.top = topPos;
        
        // Add the bunny emoji content 
        egg.textContent = '🐰';
        egg.setAttribute('aria-label', `Easter egg ${index + 1}`);
        
        // Hide all eggs initially
        egg.style.opacity = '0';
        
        // Event listener for clicking eggs
        egg.addEventListener('click', function() {
            if (parseInt(egg.dataset.eggIndex) === currentEggIndex) {
                eggFound(egg);
            }
        });
        
        // Add touch event for better mobile experience
        egg.addEventListener('touchend', function(e) {
            e.preventDefault();
            if (parseInt(egg.dataset.eggIndex) === currentEggIndex) {
                eggFound(egg);
            }
        }, { passive: false });
        
        gameContainer.appendChild(egg);
    });
    
    // Show only the current egg
    updateClickableEggs();
}

function updateClickableEggs() {
    // Get all eggs in the game container
    const eggs = document.querySelectorAll('.egg');
    
    // Make sure all eggs are first reset to their proper positions
    eggs.forEach((egg) => {
        // Restore original position from data attributes
        egg.style.left = egg.dataset.originalLeft;
        egg.style.top = egg.dataset.originalTop;
    });
    
    // Then update visibility based on current egg index
    eggs.forEach((egg, index) => {
        if (index === currentEggIndex) {
            // Current egg - make it invisible initially, but still clickable
            // It will become visible only when the hint button is clicked
            egg.style.cursor = 'pointer';
            egg.style.opacity = '0'; // Start invisible
            egg.style.pointerEvents = 'auto'; // Keep clickable even if invisible
            egg.disabled = false;
            egg.setAttribute('aria-hidden', 'false');
            
            // Extra verification to ensure this egg is properly positioned
            const eggInfo = eggData[index];
            egg.style.left = eggInfo.left;
            egg.style.top = eggInfo.top;
        } else if (index < currentEggIndex) {
            // Already found eggs - visible but not clickable
            egg.style.opacity = '1';
            egg.style.pointerEvents = 'none';
            egg.disabled = true;
            egg.setAttribute('aria-hidden', 'true');
            egg.style.animation = '';
        } else {
            // Future eggs - invisible and not clickable
            egg.style.opacity = '0';
            egg.style.pointerEvents = 'none';
            egg.disabled = true;
            egg.setAttribute('aria-hidden', 'true');
            egg.style.animation = '';
        }
    });
    
    // Reset the hint button state for the new egg
    resetHintButton();
}

function showCurrentClue() {
    if (currentEggIndex < eggData.length) {
        // Update clue text with animation
        const clueElement = document.getElementById('current-clue');
        clueElement.textContent = eggData[currentEggIndex].clue;
        
        // Update clue number counter
        document.getElementById('clue-number').textContent = (currentEggIndex + 1).toString();
        document.getElementById('total-clues').textContent = eggData.length.toString();
        
        // Apply highlight animation to signal new clue
        const clueDisplay = document.getElementById('clue-display');
        clueDisplay.classList.add('highlight-clue');
        setTimeout(() => {
            clueDisplay.classList.remove('highlight-clue');
        }, 1000);
        
        // Update which egg is clickable
        updateClickableEggs();
        
        // Play a pop sound when showing a new clue
        if (currentEggIndex > 0 && sounds.pop) {
            sounds.pop();
        }
    }
}

function eggFound(eggElement) {
  // Initialize sounds on first interaction
  initSounds();
  
  // Play enhanced success sound
  SoundManager.play('eggFound');
  
  // Add celebration effect
  createCelebration(eggElement.style.left, eggElement.style.top);
  
  // Make the egg fully visible to reveal it
  eggElement.style.opacity = '1';
  eggElement.style.cursor = 'default';
  eggElement.style.pointerEvents = 'none';
  eggElement.disabled = true;
  
  // Stop any animations
  eggElement.style.animation = '';
  
  // Add the "found" class to show the checkmark
  eggElement.classList.add('found');
  
  // Create pawprint trail from previous egg to this one if this isn't the first egg
  if (currentEggIndex > 0) {
    // Get previous egg element
    const previousEgg = document.querySelector(`.egg[data-egg-index="${currentEggIndex - 1}"]`);
    if (previousEgg) {
      createPawprintTrail(previousEgg, eggElement);
    }
  }
  
  // Update counter
  foundCount++;
  foundCountElement.textContent = foundCount;
  
  // Add haptic feedback for mobile devices if available
  if (touchEnabled && navigator.vibrate) {
    navigator.vibrate(100);
  }
  
  // Create a special animated bunny celebration (jumps around found egg)
  createCelebratingBunny(eggElement.style.left, eggElement.style.top);
  
  // Move to next egg
  currentEggIndex++;
  
  // Show next clue or end game
  if (currentEggIndex < eggData.length) {
    showCurrentClue();
  } else {
    // All eggs found!
    setTimeout(() => {
      // Play completion sound
      SoundManager.play('celebration');
      
      // Show confetti
      showConfetti();
      
      // Create multiple celebrating bunnies
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const randomX = Math.random() * 80 + 10; // 10-90%
          const randomY = Math.random() * 80 + 10; // 10-90%
          createCelebratingBunny(randomX + '%', randomY + '%');
        }, i * 300);
      }
      
      // Vibrate in a pattern for celebration on mobile
      if (touchEnabled && navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
      
      // Show completion modal instead of alert
      const congratsModal = document.getElementById('congrats-modal');
      const congratsMessage = document.getElementById('congrats-message');
      congratsMessage.textContent = `You found all ${eggData.length} eggs! Great job!`;
      congratsModal.classList.remove('hidden');
      
      // Update UI
      currentClueText.textContent = 'All eggs found! Great job!';
      floatingUI.style.backgroundColor = 'rgba(255, 215, 0, 0.8)';
      floatingUI.style.border = '3px solid gold';
    }, 500);
  }
}

// Create a celebration effect when an egg is found
function createCelebration(left, top) {
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
        style.innerHTML = `
            @keyframes celebrate {
                0% { transform: scale(0.5); opacity: 1; }
                100% { transform: scale(2); opacity: 0; }
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    gameContainer.appendChild(celebration);
    
    // Remove the celebration element after animation
    setTimeout(() => {
        celebration.remove();
    }, 1000);
}

// Add the confetti effect when all eggs are found
function showConfetti() {
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
      color: `hsl(${Math.random() * 360}, 100%, 70%)`,
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

function resetGame() {
    // Go back to setup screen
    gameContainer.classList.add('hidden');
    clueDisplay.classList.add('hidden');
    floatingUI.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    
    // Reset UI style
    floatingUI.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
    floatingUI.style.border = '3px solid #ffcccc';
}

// Initialize background file upload
function initBackgroundUpload() {
  const backgroundUpload = document.getElementById('background-upload');
  const fileUploadBtn = document.getElementById('file-upload-btn');
  const cameraButton = document.getElementById('camera-capture');
  const cameraModal = document.getElementById('camera-modal');
  const cameraPreview = document.getElementById('camera-preview');
  const cameraCanvas = document.getElementById('camera-canvas');
  const captureButton = document.getElementById('capture-photo');
  const cancelButton = document.getElementById('cancel-camera');
  
  // Set initial background image
  updateBackgroundImage(currentBackground);
  
  // Add click event for file upload button emoji
  fileUploadBtn.addEventListener('click', function() {
    // Trigger the file input click
    backgroundUpload.click();
  });
  
  // Add change event listener for file upload
  backgroundUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    
    // Check if user selected a file
    if (file) {
      handleImageFile(file);
    }
  });
  
  // Check if camera is available and add camera button functionality
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    cameraButton.classList.remove('hidden');
    
    // Camera button click handler
    cameraButton.addEventListener('click', function() {
      // Initialize camera stream
      initCamera();
    });
    
    // Capture photo button click handler
    captureButton.addEventListener('click', function() {
      capturePhoto();
    });
    
    // Cancel camera button click handler
    cancelButton.addEventListener('click', function() {
      closeCamera();
    });
  } else {
    // Hide camera button if camera not available
    cameraButton.classList.add('hidden');
  }
  
  // Add explanation for users about local file handling
  const fileInfoText = document.createElement('div');
  fileInfoText.className = 'file-info';
  fileInfoText.textContent = 'Upload your custom art or use the camera to take a photo!';
  fileInfoText.style.fontSize = '0.9em';
  fileInfoText.style.opacity = '0.7';
  fileInfoText.style.marginTop = '4px';
  
  // Insert after the file input
  backgroundUpload.parentNode.insertBefore(fileInfoText, backgroundUpload.nextSibling);
}

// Handle image files whether from file upload or camera
function handleImageFile(file) {
  // Validate that it's an image file
  if (file.type.match('image.*')) {
    // Create a FileReader to read the image
    const reader = new FileReader();
    
    // Set up the FileReader onload event
    reader.onload = function(readerEvent) {
      // Update the current background with the data URL
      currentBackground = readerEvent.target.result;
      
      // Process the file locally - no server upload occurs
      console.log('Image processed locally. No server upload occurred.');
      
      // Update background image in both areas
      updateBackgroundImage(currentBackground);
      
      // Clear the file input to avoid keeping the file reference
      const backgroundUpload = document.getElementById('background-upload');
      if (backgroundUpload) backgroundUpload.value = '';
      
      // Display notification
      showLocalImageNotification();
    };
    
    // Read the file as a data URL (keeps it in browser memory)
    reader.readAsDataURL(file);
  } else {
    alert('Please select an image file (jpg, png, gif, etc.)');
  }
}

// Show notification that image is processed locally
function showLocalImageNotification() {
  const notification = document.createElement('div');
  notification.textContent = 'Image loaded locally - not uploaded to any server';
  notification.style.position = 'fixed';
  notification.style.bottom = '10px';
  notification.style.left = '10px';
  notification.style.backgroundColor = 'rgba(0,0,0,0.7)';
  notification.style.color = 'white';
  notification.style.padding = '8px 12px';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '9999';
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Initialize camera for taking photos
function initCamera() {
  const cameraModal = document.getElementById('camera-modal');
  const cameraPreview = document.getElementById('camera-preview');
  
  // Show camera modal
  cameraModal.classList.remove('hidden');
  
  // Get user media options - include option for front camera on mobile
  const mediaOptions = { 
    video: { 
      facingMode: { ideal: 'environment' }, // Prefer back camera but also support front
      width: { ideal: 1280 },
      height: { ideal: 720 } 
    } 
  };
  
  // Get user media (camera)
  navigator.mediaDevices.getUserMedia(mediaOptions)
  .then(function(stream) {
    // Store the stream to stop it later
    window.cameraStream = stream;
    
    // Connect the stream to the video element
    cameraPreview.srcObject = stream;
    
    // Add camera switch button if multiple cameras available
    if (navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        if (videoDevices.length > 1) {
          addCameraSwitchButton();
        }
      });
    }
  })
  .catch(function(err) {
    console.error("Error accessing camera: ", err);
    alert('Could not access the camera: ' + err.message);
    closeCamera();
  });
}

// Add camera switch button for mobile devices with front and back cameras
function addCameraSwitchButton() {
  // Check if button already exists
  if (document.getElementById('switch-camera')) return;
  
  const switchButton = document.createElement('button');
  switchButton.id = 'switch-camera';
  switchButton.textContent = '🔄 Switch Camera';
  switchButton.className = 'control-btn';
  switchButton.style.position = 'absolute';
  switchButton.style.bottom = '60px';
  switchButton.style.left = '50%';
  switchButton.style.transform = 'translateX(-50%)';
  
  switchButton.addEventListener('click', function() {
    // Get current facing mode
    const track = window.cameraStream.getVideoTracks()[0];
    const settings = track.getSettings();
    const newFacingMode = settings.facingMode === 'user' ? 'environment' : 'user';
    
    // Stop current stream
    closeCamera();
    
    // Start new stream with different facing mode
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: newFacingMode } }
    })
    .then(function(stream) {
      window.cameraStream = stream;
      document.getElementById('camera-preview').srcObject = stream;
    })
    .catch(function() {
      // If exact mode fails, try with ideal as fallback
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: newFacingMode } }
      })
      .then(function(stream) {
        window.cameraStream = stream;
        document.getElementById('camera-preview').srcObject = stream;
      })
      .catch(function(err) {
        alert('Failed to switch camera: ' + err.message);
      });
    });
  });
  
  document.getElementById('camera-modal').appendChild(switchButton);
}

// Capture a photo from camera
function capturePhoto() {
  const cameraPreview = document.getElementById('camera-preview');
  const cameraCanvas = document.getElementById('camera-canvas');
  const context = cameraCanvas.getContext('2d');
  
  // Set canvas dimensions to match video
  cameraCanvas.width = cameraPreview.videoWidth;
  cameraCanvas.height = cameraPreview.videoHeight;
  
  // Draw video frame to canvas
  context.drawImage(cameraPreview, 0, 0, cameraCanvas.width, cameraCanvas.height);
  
  try {
    // Convert canvas to image data URL
    const imageDataURL = cameraCanvas.toDataURL('image/png');
    
    // Use the captured image as background
    currentBackground = imageDataURL;
    updateBackgroundImage(currentBackground);
    
    // Show confirmation
    showLocalImageNotification();
    
    // Close camera
    closeCamera();
  } catch(e) {
    console.error("Error capturing photo: ", e);
    alert('Error capturing photo. Please try again.');
  }
}

// Close camera and clean up resources
function closeCamera() {
  const cameraModal = document.getElementById('camera-modal');
  
  // Hide modal
  cameraModal.classList.add('hidden');
  
  // Stop camera stream if it exists
  if (window.cameraStream) {
    window.cameraStream.getTracks().forEach(track => {
      track.stop();
    });
    window.cameraStream = null;
  }
  
  // Clear video source
  const cameraPreview = document.getElementById('camera-preview');
  cameraPreview.srcObject = null;
  
  // Remove switch camera button if it exists
  const switchButton = document.getElementById('switch-camera');
  if (switchButton) switchButton.remove();
}

// Update background image in both setup and game screens
function updateBackgroundImage(backgroundImage) {
  // Get references to the containers
  const eggPlacementArea = document.getElementById('egg-placement-area');
  const gameContainer = document.getElementById('game-container');
  
  console.log(`Updating background image: ${backgroundImage}`);
  
  // Use default image if none provided
  if (!backgroundImage) {
    backgroundImage = 'Living-room.png';
  }
  
  // Common function to handle background image in each container
  const updateContainerBackground = (container) => {
    if (!container) return;
    
    // Clear any existing background image element
    const existingImg = container.querySelector('.background-img');
    if (existingImg) {
      existingImg.remove();
    }
    
    // Set a background color
    container.style.backgroundColor = '#f9f9f9';
    
    // Use CSS background-image instead of img element for better event handling
    container.style.backgroundImage = `url('${backgroundImage}')`;
    container.style.backgroundSize = 'contain'; // Use 'contain' to ensure full height is visible
    container.style.backgroundPosition = 'center';
    
    // Ensure container styling is consistent
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
  };
  
  // Update both containers
  updateContainerBackground(eggPlacementArea);
  updateContainerBackground(gameContainer);
  
  console.log('Background image updated in both phases');
}

// Handle orientation changes specifically for mobile
window.addEventListener('orientationchange', function() {
  // Small delay to let the browser update dimensions
  setTimeout(function() {
    // Recreate background with new dimensions
    updateBackgroundImage(currentBackground);
    
    // Update egg positions for the new orientation
    if (gameContainer.classList.contains('hidden')) {
      // In setup mode - update visual eggs
      document.querySelectorAll('.setup-egg').forEach(egg => {
        const eggId = parseInt(egg.dataset.eggId);
        const eggInfo = eggData.find(e => e.id === eggId);
        if (eggInfo) {
          egg.style.left = eggInfo.left;
          egg.style.top = eggInfo.top;
        }
      });
    } else {
      // In game mode - update clickable eggs
      updateClickableEggs();
    }
  }, 300);
});

// Add support for passive listeners for better scroll performance on mobile
document.addEventListener('DOMContentLoaded', function() {
  // Detect passive support
  let passiveSupported = false;
  try {
    const options = Object.defineProperty({}, 'passive', {
      get: function() {
        passiveSupported = true;
        return true;
      }
    });
    window.addEventListener('test', null, options);
    window.removeEventListener('test', null, options);
  } catch (err) {
    passiveSupported = false;
  }
  
  // Replace non-passive listeners with passive ones where appropriate
  const passiveListenerOpts = passiveSupported ? { passive: true } : false;
  
  // Listen for scrolling with passive listener
  document.addEventListener('scroll', function() {}, passiveListenerOpts);
  
  // Prevent zoom on double-tap for iOS
  if (touchEnabled) {
    // This helps prevent iOS zoom
    document.addEventListener('touchend', function(e) {
      // Prevent zooming when tapping buttons quickly
      if (e.target.tagName === 'BUTTON' || 
          e.target.classList.contains('egg') || 
          e.target.classList.contains('setup-egg')) {
        e.preventDefault();
      }
    }, { passive: false });
  }
});

// Create a pawprint trail between found eggs
function createPawprintTrail(fromEgg, toEgg) {
  // Extract positions from the egg elements (removing % symbol and converting to numbers)
  const fromLeft = parseFloat(fromEgg.style.left);
  const fromTop = parseFloat(fromEgg.style.top);
  const toLeft = parseFloat(toEgg.style.left);
  const toTop = parseFloat(toEgg.style.top);
  
  // Log the positions to help with debugging
  console.log(`Creating pawprint trail from (${fromLeft}%, ${fromTop}%) to (${toLeft}%, ${toTop}%)`);
  
  // Calculate distance between eggs
  const distance = Math.sqrt(Math.pow(toLeft - fromLeft, 2) + Math.pow(toTop - fromTop, 2));
  
  // Determine number of pawprints based on distance (1 pawprint per ~5% of container width)
  const numPawprints = Math.max(3, Math.floor(distance / 5));
  
  // Create trail container
  const trail = document.createElement('div');
  trail.className = 'pawprint-trail';
  trail.style.position = 'absolute';
  trail.style.zIndex = '500'; // Below eggs but above background
  trail.style.pointerEvents = 'none'; // Don't interfere with clicks
  trail.style.width = '100%';
  trail.style.height = '100%';
  trail.style.top = '0';
  trail.style.left = '0';
  
  // Add CSS for the animations if they don't exist
  if (!document.getElementById('pawprint-animation-style')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'pawprint-animation-style';
    styleTag.textContent = `
      @keyframes fadeInPawprint {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) rotate(var(--rotation)); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2) rotate(var(--rotation)) translateY(-10px); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(var(--rotation)) translateY(0); }
      }
      @keyframes bouncePawprint {
        0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(var(--rotation)); }
        50% { transform: translate(-50%, -50%) scale(1.1) rotate(var(--rotation)) translateY(-5px); }
      }
    `;
    document.head.appendChild(styleTag);
  }
  
  // Add pawprints along the line
  for (let i = 1; i < numPawprints; i++) {
    const ratio = i / numPawprints;
    
    // Calculate position with slight randomization for natural look
    // Make sure jitter is small enough not to disrupt the path
    const jitterX = Math.random() * 2 - 1; // +/- 1%
    const jitterY = Math.random() * 2 - 1; // +/- 1%
    
    // Calculate pawprint position as percentage of the container
    const pawLeft = fromLeft + (toLeft - fromLeft) * ratio + jitterX;
    const pawTop = fromTop + (toTop - fromTop) * ratio + jitterY;
    
    // Create a pawprint emoji
    const pawprint = document.createElement('div');
    pawprint.className = 'pawprint';
    pawprint.textContent = '🐾';
    pawprint.style.position = 'absolute';
    pawprint.style.left = `${pawLeft}%`;
    pawprint.style.top = `${pawTop}%`;
    pawprint.style.fontSize = '24px'; // Increased from 16px to 24px for better visibility
    pawprint.style.transform = 'translate(-50%, -50%)';
    pawprint.style.color = 'rgba(101, 67, 33, 0.9)'; // Darker brown color for better contrast
    pawprint.style.filter = 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.9))'; // Stronger drop shadow
    pawprint.style.pointerEvents = 'none';
    
    // Alternate between slight rotations for a more natural path
    const rotation = (i % 2 === 0) ? '25deg' : '-25deg';
    pawprint.style.setProperty('--rotation', rotation);
    
    // Fade in animation with delay and bounce
    pawprint.style.opacity = '0';
    pawprint.style.animation = `fadeInPawprint 0.8s forwards ${i * 0.1}s`;
    
    // Add continuous bounce animation after the initial appearance
    setTimeout(() => {
      if (pawprint.parentNode) { // Check if still in the DOM
        pawprint.style.animation = `bouncePawprint 3s infinite ${Math.random() * 3}s`;
        pawprint.style.opacity = '1'; // Ensure it's fully visible
      }
    }, (i * 100) + 800); // Wait for initial animation to complete
    
    // Add to trail container
    trail.appendChild(pawprint);
  }
  
  // Add trail to game container
  gameContainer.appendChild(trail);
  
  console.log(`Created trail with ${numPawprints - 1} pawprints`);
  
  return trail;
}

// Add hint button functionality
document.getElementById('hint-button').addEventListener('click', showHint);

// Variable to track if a hint has been used for the current egg
let hintUsed = false;

// Function to show hint when button is clicked
function showHint() {
  if (currentEggIndex < eggData.length) {
    // Mark hint as used
    hintUsed = true;
    
    // Change hint button appearance
    const hintButton = document.getElementById('hint-button');
    hintButton.classList.add('used');
    hintButton.textContent = 'Hint Shown';
    
    // Make current egg visible with a highlight effect
    const egg = document.querySelector(`.egg[data-egg-index="${currentEggIndex}"]`);
    if (egg) {
      // Make egg visible and add special highlight effect
      egg.style.opacity = '1';
      egg.classList.add('new-egg'); // Add highlight effect
      
      // Remove highlight effect after 3 seconds
      setTimeout(() => {
        egg.classList.remove('new-egg');
      }, 3000);
    }
  }
}

// Reset hint button to its default state for a new egg
function resetHintButton() {
  const hintButton = document.getElementById('hint-button');
  hintButton.classList.remove('used');
  hintButton.textContent = 'Need a Hint?';
  hintUsed = false;
}

// Create a special celebrating bunny that appears near a found egg
function createCelebratingBunny(leftPos, topPos) {
  const bunny = document.createElement('div');
  bunny.className = 'background-bunny';
  bunny.textContent = '🐰';
  
  // Parse position values to numbers
  const left = parseFloat(leftPos);
  const top = parseFloat(topPos);
  
  // Set bunny position near the egg location
  // Add a small offset so it's not directly on top of the egg
  const offsetX = Math.random() * 10 - 5; // Random offset between -5 and 5
  const offsetY = Math.random() * 10 - 5;
  
  bunny.style.position = 'absolute';
  bunny.style.left = `${left + offsetX}%`;
  bunny.style.top = `${top + offsetY}%`;
  bunny.style.fontSize = '32px';
  bunny.style.zIndex = '1500'; // Above eggs
  bunny.style.filter = 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))';
  
  // Create the CSS animation if it doesn't exist
  if (!document.querySelector('#celebration-bunny-style')) {
    const style = document.createElement('style');
    style.id = 'celebration-bunny-style';
    style.innerHTML = `
      @keyframes bunnyDance {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        20% { transform: translateY(-15px) rotate(-5deg); }
        40% { transform: translateY(0) rotate(5deg); }
        60% { transform: translateY(-10px) rotate(-5deg); }
        80% { transform: translateY(0) rotate(5deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Apply dancing animation
  bunny.style.animation = 'bunnyDance 1s infinite';
  
  // Add to the game container
  gameContainer.appendChild(bunny);
  
  // Remove the bunny after a short celebration
  setTimeout(() => {
    if (bunny.parentNode) {
      // Fade out animation
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
  }, Math.random() * 2000 + 2000); // Random duration between 2-4 seconds
}

// ------ Setup Loading Function ------

// Start setup with loading animation
function startSetupWithLoading() {
    // Show loading screen
    startScreen.classList.add('hidden');
    const setupLoadingScreen = document.getElementById('setup-loading-screen');
    setupLoadingScreen.classList.remove('hidden');
    
    // Simulate loading process
    let progress = 0;
    const loadingBar = document.getElementById('setup-loading-bar');
    const loadingInterval = setInterval(() => {
        progress += 10; // Faster progress for setup
        loadingBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            
            // Hide loading screen and show setup screen
            setTimeout(() => {
                setupLoadingScreen.classList.add('hidden');
                showSetupScreen();
            }, 300);
        }
    }, 80); // Slightly faster update for setup
}

// Initialize collapsible "More Settings" section
function initMoreSettings() {
  const moreSettingsToggle = document.querySelector('.more-settings-toggle');
  const moreSettingsContent = document.querySelector('.more-settings-content');
  
  if (moreSettingsToggle && moreSettingsContent) {
    // Set up click handler for the toggle button
    moreSettingsToggle.addEventListener('click', function() {
      // Toggle the expanded state
      const isExpanded = moreSettingsToggle.getAttribute('aria-expanded') === 'true';
      moreSettingsToggle.setAttribute('aria-expanded', !isExpanded);
      
      // Toggle visibility of content
      if (isExpanded) {
        moreSettingsContent.classList.add('hidden');
      } else {
        moreSettingsContent.classList.remove('hidden');
      }
    });
    
    // Connect setup audio controls to the main audio controls
    const setupVolumeSlider = document.getElementById('volume-slider-setup');
    const mainVolumeSlider = document.getElementById('volume-slider');
    const playPauseSetupBtn = document.getElementById('play-pause-btn-setup');
    const nextTrackSetupBtn = document.getElementById('next-track-btn-setup');
    const soundToggleSetupBtn = document.getElementById('sound-toggle-setup');
    
    if (setupVolumeSlider && mainVolumeSlider) {
      // Sync initial value
      setupVolumeSlider.value = mainVolumeSlider.value;
      
      // Setup volume slider changes update main volume
      setupVolumeSlider.addEventListener('input', function(e) {
        const volume = e.target.value / 100;
        // Update the main volume slider
        mainVolumeSlider.value = e.target.value;
        // Update actual volume
        const backgroundMusic = document.getElementById('background-music');
        if (backgroundMusic) {
          backgroundMusic.volume = volume;
        }
        // Store the volume preference
        localStorage.setItem('eggHuntVolume', volume);
      });
    }
    
    // Play/Pause button in setup mirrors main play/pause
    if (playPauseSetupBtn) {
      playPauseSetupBtn.addEventListener('click', function() {
        const backgroundMusic = document.getElementById('background-music');
        if (backgroundMusic) {
          if (backgroundMusic.paused) {
            backgroundMusic.play().catch(e => {
              console.log('Failed to play background music, likely missing file');
            });
            playPauseSetupBtn.textContent = '⏸️';
            // Sync with main play button
            const mainPlayBtn = document.getElementById('play-pause-btn');
            if (mainPlayBtn) mainPlayBtn.textContent = '⏸️';
          } else {
            backgroundMusic.pause();
            playPauseSetupBtn.textContent = '▶️';
            // Sync with main play button
            const mainPlayBtn = document.getElementById('play-pause-btn');
            if (mainPlayBtn) mainPlayBtn.textContent = '▶️';
          }
        }
      });
    }
    
    // Next track button in setup mirrors main next track
    if (nextTrackSetupBtn) {
      nextTrackSetupBtn.addEventListener('click', function() {
        SoundManager.nextTrack();
      });
    }
    
    // Sound toggle in setup mirrors main sound toggle
    if (soundToggleSetupBtn) {
      // Set initial state
      soundToggleSetupBtn.textContent = soundEnabled ? '🔊' : '🔇';
      
      // Add click handler
      soundToggleSetupBtn.addEventListener('click', function() {
        // Toggle sound enabled state
        soundEnabled = !soundEnabled;
        // Update button text
        soundToggleSetupBtn.textContent = soundEnabled ? '🔊' : '🔇';
        // Also update the main sound toggle button
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
          soundToggle.innerHTML = soundEnabled ? '🔊' : '🔇';
          soundToggle.title = soundEnabled ? 'Mute Sounds' : 'Enable Sounds';
        }
      });
    }
    
    // On mobile, hide the floating audio controls and only use the setup panel
    if (touchEnabled) {
      const audioControls = document.getElementById('audio-controls');
      if (audioControls) {
        audioControls.classList.add('hidden');
      }
    }
  }
}

// Settings Modal Functions
function initSettingsModal() {
    // Get DOM elements
    const settingsModal = document.getElementById('settings-modal');
    const settingsBtn = document.querySelectorAll('#settings-btn'); // Multiple buttons with same ID
    const closeBtn = document.getElementById('settings-close-btn');
    const volumeSlider = document.getElementById('settings-volume');
    const playPauseBtn = document.getElementById('settings-play-pause');
    const nextTrackBtn = document.getElementById('settings-next-track');
    const soundToggleBtn = document.getElementById('settings-sound-toggle');
    
    // Set initial values based on current settings
    if (volumeSlider) {
        const backgroundMusic = document.getElementById('background-music');
        if (backgroundMusic) {
            volumeSlider.value = backgroundMusic.volume * 100;
        } else {
            // Default value if element doesn't exist yet
            const savedVolume = localStorage.getItem('eggHuntVolume');
            if (savedVolume !== null) {
                volumeSlider.value = parseFloat(savedVolume) * 100;
            }
        }
    }
    
    // Set initial button states
    if (playPauseBtn) {
        const backgroundMusic = document.getElementById('background-music');
        playPauseBtn.textContent = backgroundMusic && !backgroundMusic.paused ? '⏸️' : '▶️';
    }
    
    if (soundToggleBtn) {
        soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
    }
    
    // Add event listeners to settings buttons (may be multiple)
    settingsBtn.forEach(btn => {
        btn.addEventListener('click', openSettingsModal);
    });
    
    // Close button event
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSettingsModal);
    }
    
    // Close on click outside modal content
    if (settingsModal) {
        settingsModal.addEventListener('click', function(e) {
            if (e.target === settingsModal) {
                closeSettingsModal();
            }
        });
    }
    
    // Volume slider event
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function(e) {
            const volume = e.target.value / 100;
            updateVolume(volume);
        });
    }
    
    // Play/Pause button event
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', function() {
            togglePlayPause();
            playPauseBtn.textContent = isPlaying() ? '⏸️' : '▶️';
        });
    }
    
    // Next track button event
    if (nextTrackBtn) {
        nextTrackBtn.addEventListener('click', function() {
            SoundManager.nextTrack();
        });
    }
    
    // Sound toggle button event
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', function() {
            soundEnabled = !soundEnabled;
            soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
            
            // Update all other sound toggle buttons for consistency
            const otherSoundToggles = document.querySelectorAll('[id^="sound-toggle"]');
            otherSoundToggles.forEach(btn => {
                if (btn !== soundToggleBtn) {
                    btn.textContent = soundEnabled ? '🔊' : '🔇';
                }
            });
        });
    }
}

// Open the settings modal
function openSettingsModal() {
    const settingsModal = document.getElementById('settings-modal');
    
    // Before opening, update values to match current state
    updateSettingsModalValues();
    
    // Show the modal
    if (settingsModal) {
        settingsModal.classList.remove('hidden');
    }
}

// Close the settings modal
function closeSettingsModal() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        // Settings are applied immediately so no need for explicit save
        settingsModal.classList.add('hidden');
    }
}

// Update all values in the settings modal
function updateSettingsModalValues() {
    const volumeSlider = document.getElementById('settings-volume');
    const playPauseBtn = document.getElementById('settings-play-pause');
    const soundToggleBtn = document.getElementById('settings-sound-toggle');
    
    // Update volume slider
    if (volumeSlider) {
        const backgroundMusic = document.getElementById('background-music');
        if (backgroundMusic) {
            volumeSlider.value = backgroundMusic.volume * 100;
        }
    }
    
    // Update play/pause button
    if (playPauseBtn) {
        playPauseBtn.textContent = isPlaying() ? '⏸️' : '▶️';
    }
    
    // Update sound toggle button
    if (soundToggleBtn) {
        soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
    }
}

// Save settings
function saveSettings() {
    // Currently all settings are applied immediately
    // This function could be expanded for future settings
    closeSettingsModal();
}

// Helper for play/pause toggle
function togglePlayPause() {
    const backgroundMusic = document.getElementById('background-music');
    if (!backgroundMusic) return;
    
    if (backgroundMusic.paused) {
        backgroundMusic.play().catch(e => {
            console.log('Failed to play background music, likely missing file');
        });
    } else {
        backgroundMusic.pause();
    }
    
    // Update all play/pause buttons for consistency
    updateAllPlayPauseButtons();
}

// Check if music is playing
function isPlaying() {
    const backgroundMusic = document.getElementById('background-music');
    return backgroundMusic && !backgroundMusic.paused;
}

// Update all play/pause buttons in the game
function updateAllPlayPauseButtons() {
    const isCurrentlyPlaying = isPlaying();
    const playPauseButtons = document.querySelectorAll('[id$="play-pause"], [id$="play-pause-btn-setup"]');
    
    playPauseButtons.forEach(btn => {
        btn.textContent = isCurrentlyPlaying ? '⏸️' : '▶️';
    });
}

// Update volume across the game
function updateVolume(volume) {
    // Update the audio element
    const backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic) {
        backgroundMusic.volume = volume;
    }
    
    // Save volume preference
    localStorage.setItem('eggHuntVolume', volume);
    
    // Update all volume sliders for consistency
    const volumeSliders = document.querySelectorAll('[id$="volume"], [id$="volume-slider-setup"]');
    volumeSliders.forEach(slider => {
        slider.value = volume * 100;
    });
}
