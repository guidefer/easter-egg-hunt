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
let huntUIPanelCollapsed = false; // Track if the hunt UI panel is collapsed
let setupControlsCollapsed = false; // Track if the setup controls panel is collapsed
let autoCollapseTimerId = null; // Timer for auto-collapsing the hunt UI panel
let setupAutoCollapseTimerId = null; // Timer for auto-collapsing the setup controls

// Game version - update this when making significant changes
const GAME_VERSION = '1.3.2'; // Updated version number for collapsible setup controls

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
        // *** CORRECTED typo: setValueAtAtime -> setValueAtTime ***
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
const huntUIPanel = document.getElementById('hunt-ui-panel');
const currentClueText = document.getElementById('current-clue');
const foundCountElement = document.getElementById('found-count');
const totalCountElement = document.getElementById('total-count');
const eggModal = document.getElementById('egg-modal');
const modalEggNumber = document.getElementById('modal-egg-number');
const modalEggClue = document.getElementById('modal-egg-clue');

// Legacy DOM elements (will be deprecated)
const clueDisplayLegacy = document.getElementById('clue-display');
const floatingUILegacy = document.getElementById('floating-ui');
const currentClueTextLegacy = document.getElementById('current-clue-old');
const foundCountElementLegacy = document.getElementById('found-count-old');
const totalCountElementLegacy = document.getElementById('total-count-old');

// Start the game when setup is done
document.getElementById('setup-btn').addEventListener('click', startSetupWithLoading);
document.getElementById('add-egg-btn').addEventListener('click', showAddEggModal);
document.getElementById('start-game-btn').addEventListener('click', startGame);
document.getElementById('reset-btn').addEventListener('click', resetGame);

// Add event listener for setup controls toggle button
document.getElementById('setup-controls-toggle-btn').addEventListener('click', toggleSetupControls);

// Legacy reset button (will be deprecated)
if (document.getElementById('reset-btn-old')) {
    document.getElementById('reset-btn-old').addEventListener('click', resetGame);
}

// Settings buttons - Updated for unique IDs
const settingsBtnSetup = document.getElementById('settings-btn-setup');
const settingsBtnGame = document.getElementById('settings-btn-game');
if (settingsBtnSetup) settingsBtnSetup.addEventListener('click', openSettingsModal);
if (settingsBtnGame) settingsBtnGame.addEventListener('click', openSettingsModal);

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

/**
 * Initialize the Hunt UI panel toggle functionality
 * This sets up event listeners and initial state for the collapsible hunt UI panel
 */
function initHuntUIPanelToggle() {
  const huntUIPanel = document.getElementById('hunt-ui-panel');
  const toggleBtn = document.getElementById('hunt-ui-toggle-btn');
  
  if (!huntUIPanel || !toggleBtn) return;
  
  // Set initial state
  huntUIPanelCollapsed = false;
  toggleBtn.setAttribute('aria-expanded', 'true');
  
  // Add click event listener to toggle button
  toggleBtn.addEventListener('click', toggleHuntUIPanel);
  
  // Also add event listener to the clue container to expand when clicked in collapsed state
  const clueContainer = document.querySelector('.hunt-clue-container');
  if (clueContainer) {
    clueContainer.addEventListener('click', function(e) {
      // Only expand if we didn't click on the hint button
      if (e.target.id !== 'hint-button' && huntUIPanelCollapsed) {
        expandHuntUIPanel();
      }
    });
  }
}

/**
 * Toggle the hunt UI panel between collapsed and expanded states
 */
function toggleHuntUIPanel() {
  const huntUIPanel = document.getElementById('hunt-ui-panel');
  const toggleBtn = document.getElementById('hunt-ui-toggle-btn');
  
  if (!huntUIPanel || !toggleBtn) return;
  
  // Toggle collapsed state
  huntUIPanelCollapsed = !huntUIPanelCollapsed;
  
  // Update panel class and ARIA attributes
  if (huntUIPanelCollapsed) {
    huntUIPanel.classList.add('collapsed');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.innerHTML = '▼'; // Down arrow - consistent with setup controls
  } else {
    huntUIPanel.classList.remove('collapsed');
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.innerHTML = '▲'; // Up arrow - consistent with setup controls
  }
  
  // Reset auto-collapse timer
  startAutoCollapseTimer();
  
  console.log('Hunt UI panel ' + (huntUIPanelCollapsed ? 'collapsed' : 'expanded'));
}

/**
 * Expand the hunt UI panel and optionally start the auto-collapse timer
 * @param {boolean} startTimer - Whether to start the auto-collapse timer (default: true)
 */
function expandHuntUIPanel(startTimer = true) {
  const huntUIPanel = document.getElementById('hunt-ui-panel');
  const toggleBtn = document.getElementById('hunt-ui-toggle-btn');
  
  if (!huntUIPanel || !toggleBtn) return;
  
  // Only do something if the panel is currently collapsed
  if (huntUIPanelCollapsed) {
    // Update collapsed state
    huntUIPanelCollapsed = false;
    
    // Update panel class and ARIA attributes
    huntUIPanel.classList.remove('collapsed');
    toggleBtn.setAttribute('aria-expanded', 'true');
    
    console.log('Hunt UI panel auto-expanded');
  }
  
  // Clear any existing auto-collapse timer
  if (autoCollapseTimerId) {
    clearTimeout(autoCollapseTimerId);
  }
  
  // Start a new auto-collapse timer if requested
  if (startTimer) {
    startAutoCollapseTimer();
  }
}

/**
 * Start or restart the auto-collapse timer for the hunt UI panel
 * Panel will auto-collapse after 5 seconds of inactivity
 */
function startAutoCollapseTimer() {
  // Clear any existing timer
  if (autoCollapseTimerId) {
    clearTimeout(autoCollapseTimerId);
  }
  
  // Set new timer to collapse after 5 seconds
  autoCollapseTimerId = setTimeout(() => {
    if (!huntUIPanelCollapsed) {
      // Only collapse if currently expanded
      toggleHuntUIPanel();
    }
  }, 5000); // 5 seconds
}

/**
 * Create a celebrating bunny animation near a found egg
 * @param {string} left - Left position of the bunny (e.g., '50%')
 * @param {string} top - Top position of the bunny (e.g., '50%')
 */
function createCelebratingBunny(left, top) {
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
  bunny.style.left = `${leftValue + (Math.random() * 10 - 5)}%`;
  bunny.style.top = `${topValue + (Math.random() * 10 - 5)}%`;
  
  // Create custom animation for celebration
  const animDuration = 2 + Math.random() * 2; // 2-4 seconds
  const jumpHeight = 20 + Math.random() * 30; // 20-50px
  
  // Create animation style if it doesn't exist
  if (!document.querySelector('#bunny-celebration-style')) {
    const style = document.createElement('style');
    style.id = 'bunny-celebration-style';
    style.innerHTML = `
      @keyframes bunny-celebrate {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-${jumpHeight}px) rotate(-10deg); }
        50% { transform: translateY(0) rotate(0deg); }
        75% { transform: translateY(-${jumpHeight * 0.6}px) rotate(10deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Apply the animation
  bunny.style.animation = `bunny-celebrate ${animDuration}s ease-in-out`;
  
  // Add to game container
  gameContainer.appendChild(bunny);
  
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

// Fix for startSetupWithLoading function
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
            
            // Hide loading screen and show setup screen after a small delay
            setTimeout(() => {
                setupLoadingScreen.classList.add('hidden');
                showSetupScreen();
            }, 300);
        }
    }, 80); // Slightly faster update for setup
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
    
    // Also show the setup controls since they're now outside the setup container
    const setupControls = document.getElementById('setup-controls');
    setupControls.classList.remove('hidden');
    
    // Initialize egg placement area
    const eggPlacementArea = document.getElementById('egg-placement-area');
    eggPlacementArea.innerHTML = ''; // Clear previous elements
    
    // *** ADDED: Redraw existing eggs from eggData ***
    eggData.forEach(eggInfo => {
        createVisualEgg(eggInfo, eggPlacementArea);
    });
    // *** END ADDED ***
    
    // Setup area for both click and touch
    addAreaEventListeners(eggPlacementArea);
    
    // Initialize setup controls toggle with expanded state
    setupControlsCollapsed = false;
    const toggleBtn = document.getElementById('setup-controls-toggle-btn');
    
    if (setupControls && toggleBtn) {
        setupControls.classList.remove('collapsed');
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.innerHTML = '▲'; // Make sure the arrow is pointing up when expanded
        
        // Start auto-collapse timer (collapse after 8 seconds)
        startSetupAutoCollapseTimer();
    }
}

// ... existing code ...

// ... existing code ...

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
                // *** ADDED: Hide setup controls panel ***
                document.getElementById('setup-controls').classList.add('hidden'); 
                gameContainer.classList.remove('hidden');
                
                // Show the new unified UI panel
                huntUIPanel.classList.remove('hidden');
                
                // Hide legacy UI elements (will be removed in future version)
                clueDisplayLegacy.classList.add('hidden');
                floatingUILegacy.classList.add('hidden');
                
                // Reset game state
                foundCount = 0;
                currentEggIndex = 0;
                foundCountElement.textContent = foundCount;
                totalCountElement.textContent = eggData.length;
                
                // Support legacy elements too (will be removed in future version)
                if (foundCountElementLegacy) foundCountElementLegacy.textContent = foundCount;
                if (totalCountElementLegacy) totalCountElementLegacy.textContent = eggData.length;
                
                // Create eggs in the game container
                createGameEggs();
                
                // Show first clue
                showCurrentClue();
                
                // Initialize huntUI collapse/expand functionality
                initHuntUIPanelToggle();
                
                // Start auto-collapse timer (collapse after 5 seconds)
                startAutoCollapseTimer();
                
                // Ensure the huntUIPanel is visible by setting a slight delay
                setTimeout(() => {
                    if (huntUIPanel.classList.contains('hidden')) {
                        huntUIPanel.classList.remove('hidden');
                        console.log("Hunt UI panel visibility enforced");
                    }
                }, 100);
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
        
        // Remove the bunny emoji text content - it's added by CSS ::before
        egg.textContent = '';
        egg.setAttribute('aria-label', `Easter egg ${index + 1}`);
        
        // Hide all eggs initially
        egg.style.opacity = '0';
        
        // Event listener for clicking eggs
        egg.addEventListener('click', function() {
            // *** ADD console log for debugging ***
            console.log('Egg clicked. Index:', egg.dataset.eggIndex, 'Current Index:', currentEggIndex);
            if (parseInt(egg.dataset.eggIndex) === currentEggIndex) {
                eggFound(egg);
            }
        });
        
        // Add touch event for better mobile experience
        egg.addEventListener('touchend', function(e) {
            e.preventDefault();
            // *** ADD console log for debugging ***
            console.log('Egg touched. Index:', egg.dataset.eggIndex, 'Current Index:', currentEggIndex);
            if (parseInt(egg.dataset.eggIndex) === currentEggIndex) {
                eggFound(egg);
            }
        }, { passive: false });
        
        gameContainer.appendChild(egg);
    });
    
    // Show only the current egg
    updateClickableEggs();
}

/**
 * Creates egg elements in the game
 */
function createEggElements() {
    // Clear existing eggs
    const gameContainer = document.getElementById('game-container');
    const existingEggs = gameContainer.querySelectorAll('.egg');
    existingEggs.forEach(egg => egg.remove());

    // Create new eggs
    eggData.forEach((egg, index) => {
        const eggElement = document.createElement('div');
        eggElement.className = 'egg';
        eggElement.dataset.eggIndex = index;
        
        // Position the egg
        eggElement.style.left = egg.left;
        eggElement.style.top = egg.top;
        
        // If not the current egg to find, make invisible
        if (index !== currentEggIndex) {
            eggElement.style.opacity = '0';
        } else {
            // This is the egg we're looking for
            eggElement.style.opacity = '0'; // Initially hidden until found
        }
        
        // Add event listeners for egg clicking
        eggElement.addEventListener('click', handleEggClick);
        
        // Add hover events for revealing the egg
        eggElement.addEventListener('mouseover', handleEggHover);
        eggElement.addEventListener('mouseleave', handleEggMouseLeave);
        
        // Add touch events for mobile
        eggElement.addEventListener('touchstart', handleEggClick);
        
        // Apply animations and styles
        if (egg.isNew) {
            eggElement.classList.add('new-egg');
            // Remove new egg flag after displaying
            setTimeout(() => {
                eggElement.classList.remove('new-egg');
                egg.isNew = false;
            }, 3000);
        }
        
        // Apply different animations to different eggs
        const animations = ['animation-bobble', 'animation-pulse', 'animation-bounce'];
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
        eggElement.classList.add(randomAnimation);
        
        gameContainer.appendChild(eggElement);
    });
    
    // Update the score and clue text
    updateScoreDisplay();
    updateClueText();
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
            egg.style.cursor = 'pointer';
            egg.style.opacity = '0'; // Start invisible
            egg.style.pointerEvents = 'auto'; // Keep clickable even if invisible
            egg.disabled = false;
            egg.setAttribute('aria-hidden', 'false');
            
            // Add hover effect for desktop users
            egg.addEventListener('mouseenter', handleEggHover);
            egg.addEventListener('mouseleave', handleEggMouseLeave);
            
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
            
            // Remove hover listeners from previously found eggs
            egg.removeEventListener('mouseenter', handleEggHover);
            egg.removeEventListener('mouseleave', handleEggMouseLeave);
        } else {
            // Future eggs - invisible and not clickable
            egg.style.opacity = '0';
            egg.style.pointerEvents = 'none';
            egg.disabled = true;
            egg.setAttribute('aria-hidden', 'true');
            egg.style.animation = '';
            
            // Remove hover listeners from future eggs
            egg.removeEventListener('mouseenter', handleEggHover);
            egg.removeEventListener('mouseleave', handleEggMouseLeave);
        }
    });
    
    // Reset the hint button state for the new egg
    resetHintButton();
}

/**
 * Handle egg hover event - reveals the egg temporarily
 * This provides desktop users with a way to discover eggs by hovering
 */
function handleEggHover(e) {
    // Only reveal the egg if it's the current one being searched for
    if (parseInt(this.dataset.eggIndex) === currentEggIndex) {
        // Fade in the egg
        this.style.transition = 'opacity 0.3s ease';
        this.style.opacity = '0.8';
        
        // Add glow effect to highlight that this is the egg
        this.classList.add('egg-hover-reveal');
    }
}

/**
 * Handle mouse leaving egg - hides the egg again
 */
function handleEggMouseLeave(e) {
    // Only handle if it's the current egg
    if (parseInt(this.dataset.eggIndex) === currentEggIndex) {
        // Don't hide if hint was used
        if (!hintUsed) {
            this.style.opacity = '0';
        }
        
        // Remove the hover effect
        this.classList.remove('egg-hover-reveal');
    }
}

// Handle egg click event
function handleEggClick(e) {
    const eggIndex = parseInt(this.dataset.eggIndex);
    if (eggIndex === currentEggIndex) {
        eggFound(this);
    }
}

function showCurrentClue() {
    if (currentEggIndex < eggData.length) {
        // Update clue text in the new unified UI
        currentClueText.textContent = eggData[currentEggIndex].clue;
        
        // Update clue number counter
        document.getElementById('clue-number').textContent = (currentEggIndex + 1).toString();
        document.getElementById('total-clues').textContent = eggData.length.toString();
        
        // Support legacy elements too (will be removed in future version)
        if (currentClueTextLegacy) {
            currentClueTextLegacy.textContent = eggData[currentEggIndex].clue;
        }
        if (document.getElementById('clue-number-old')) {
            document.getElementById('clue-number-old').textContent = (currentEggIndex + 1).toString();
        }
        if (document.getElementById('total-clues-old')) {
            document.getElementById('total-clues-old').textContent = eggData.length.toString();
        }
        
        // Apply highlight animation to signal new clue
        const clueContainer = document.querySelector('.hunt-clue-container');
        if (clueContainer) {
            clueContainer.classList.add('highlight-clue');
            setTimeout(() => {
                clueContainer.classList.remove('highlight-clue');
            }, 1000);
        }
        
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
  
  // Make the egg fully visible to reveal it - using !important inline style
  eggElement.style.cssText += " opacity: 1 !important;";
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
  
  // Update legacy counter too (will be removed in future version)
  if (foundCountElementLegacy) {
    foundCountElementLegacy.textContent = foundCount;
  }
  
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
    
    // Expand the UI panel when showing a new clue and restart auto-collapse timer
    expandHuntUIPanel();
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
      huntUIPanel.style.backgroundColor = 'rgba(255, 215, 0, 0.8)';
      huntUIPanel.style.border = '3px solid gold';
      
      // For the final clue, keep panel expanded rather than auto-collapsing
      expandHuntUIPanel(false); // Pass false to prevent auto-collapse
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
    huntUIPanel.classList.add('hidden');
    
    // Also hide legacy elements (will be removed in future version)
    clueDisplayLegacy.classList.add('hidden');
    floatingUILegacy.classList.add('hidden');
    
    // *** MODIFIED: Call showSetupScreen to handle showing setup screen AND controls ***
    showSetupScreen();
    
    // Reset UI style for hunt panel (for next game start)
    huntUIPanel.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    huntUIPanel.style.border = '3px solid #ffcccc';
    
    // Also reset legacy UI (will be removed in future version)
    floatingUILegacy.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
    floatingUILegacy.style.border = '3px solid #ffcccc';
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
    container.style.backgroundSize = 'cover'; // Use 'cover' to fill container
    container.style.backgroundPosition = 'center';
    container.style.backgroundRepeat = 'no-repeat';
    
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

// ------ Pawprint Functions ------

// Create a pawprint trail between found eggs
function createPawprintTrail(fromEgg, toEgg) {
  // Extract positions from the egg elements (removing % symbol and converting to numbers)
  const fromLeft = parseFloat(fromEgg.style.left);
  const fromTop = parseFloat(fromEgg.style.top);
  const toLeft = parseFloat(toEgg.style.left);
  const toTop = parseFloat(toEgg.style.top);
  
  // Log the positions to help with debugging
  console.log('Creating pawprint trail from (' + fromLeft + '%, ' + fromTop + '%) to (' + toLeft + '%, ' + toTop + '%)');
  
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
    styleTag.textContent = 
      '@keyframes fadeInPawprint {' +
      '  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) rotate(var(--rotation)); }' +
      '  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2) rotate(var(--rotation)) translateY(-10px); }' +
      '  100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(var(--rotation)) translateY(0); }' +
      '}' +
      '@keyframes bouncePawprint {' +
      '  0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(var(--rotation)); }' +
      '  50% { transform: translate(-50%, -50%) scale(1.1) rotate(var(--rotation)) translateY(-5px); }' +
      '}';
    document.head.appendChild(styleTag);
  }
  
  // Add pawprints along the line
  for (let i = 1; i < numPawprints; i++) {
    const ratio = i / numPawprints;
    
    // Calculate position with slight randomization for natural look
    // Make sure jitter is small enough not to disrupt the path
    const jitterX = Math.random() * 2 - 1;
    const jitterY = Math.random() * 2 - 1;
    
    // Calculate pawprint position as percentage of the container
    const pawLeft = fromLeft + (toLeft - fromLeft) * ratio + jitterX;
    const pawTop = fromTop + (toTop - fromTop) * ratio + jitterY;
    
    // Create a pawprint emoji
    const pawprint = document.createElement('div');
    pawprint.className = 'pawprint';
    pawprint.textContent = '🐾';
    pawprint.style.position = 'absolute';
    pawprint.style.left = pawLeft + '%';
    pawprint.style.top = pawTop + '%';
    pawprint.style.fontSize = '24px';
    pawprint.style.transform = 'translate(-50%, -50%)';
    pawprint.stylecolor = 'rgba(101, 67, 33, 0.9)';
    pawprint.style.filter = 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.9))';
    pawprint.style.pointerEvents = 'none';
    
    // Alternate between slight rotations for a more natural path
    const rotation = (i % 2 === 0) ? '25deg' : '-25deg';
    pawprint.style.setProperty('--rotation', rotation);
    
    // Fade in animation with delay and bounce
    pawprint.style.opacity = '0';
    pawprint.style.animation = 'fadeInPawprint 0.8s forwards ' + (i * 0.1) + 's';
    
    // Add continuous bounce animation after the initial appearance
    setTimeout(function() {
      if (pawprint.parentNode) { // Check if still in the DOM
        pawprint.style.animation = 'bouncePawprint 3s infinite ' + (Math.random() * 3) + 's';
        pawprint.style.opacity = '1'; // Ensure it's fully visible
      }
    }, (i * 100) + 800); // Wait for initial animation to complete
    
    // Add to trail container
    trail.appendChild(pawprint);
  }
  
  // Add trail to game container
  gameContainer.appendChild(trail);
  
  console.log('Created trail with ' + (numPawprints - 1) + ' pawprints');
  
  return trail;
}

// ------ Hint Functions ------

// Add hint button functionality
document.getElementById('hint-button').addEventListener('click', showHint);

// Legacy hint button (will be deprecated)
if (document.getElementById('hint-button-old')) {
    document.getElementById('hint-button-old').addEventListener('click', showHint);
}

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
    hintButton.innerHTML = '✓'; // Change to checkmark when used
    
    // Also update legacy hint button if it exists
    const hintButtonLegacy = document.getElementById('hint-button-old');
    if (hintButtonLegacy) {
      hintButtonLegacy.classList.add('used');
      hintButtonLegacy.textContent = 'Hint Shown';
    }
    
    // Make current egg visible with a highlight effect
    const egg = document.querySelector(`.egg[data-egg-index="${currentEggIndex}"]`);
    if (egg) {
      // Make egg visible and add special highlight effect
      egg.style.opacity = '1';
      egg.classList.add('new-egg'); // Add highlight effect
      
      // Make sure transform properly handles positioning
      // This ensures the egg doesn't create a "duplicate" visual appearance
      if (egg.style.transform && egg.style.transform.includes('translate')) {
        // Keep existing transform if it has translate values
        egg.style.transform = egg.style.transform.replace('scale(1)', 'scale(1.05)');
      } else {
        // Always ensure transform includes the translate adjustment to avoid duplication
        const left = parseFloat(egg.style.left);
        const top = parseFloat(egg.style.top);
        if (!isNaN(left) && !isNaN(top)) {
          // Only adjust if left and top are numeric values
          egg.style.transform = 'translate(-50%, -50%) scale(1.05)';
        }
      }
      
      // Remove highlight effect after 3 seconds
      setTimeout(() => {
        egg.classList.remove('new-egg');
        // Keep the egg visible but return to normal scale
        if (egg.style.transform) {
          egg.style.transform = egg.style.transform.replace('scale(1.05)', 'scale(1)');
        }
      }, 3000);
    }
  }
}

// Reset hint button to its default state for a new egg
function resetHintButton() {
  const hintButton = document.getElementById('hint-button');
  hintButton.classList.remove('used');
  hintButton.innerHTML = '💡'; // Reset to lightbulb emoji
  
  // Also update legacy hint button if it exists
  const hintButtonLegacy = document.getElementById('hint-button-old');
  if (hintButtonLegacy) {
    hintButtonLegacy.classList.remove('used');
    hintButtonLegacy.textContent = 'Need a Hint?';
  }
  
  hintUsed = false;
}

/**
 * Toggle the setup controls panel between collapsed and expanded states
 * with smooth animation transitions
 */
function toggleSetupControls() {
  const setupControls = document.getElementById('setup-controls');
  const toggleBtn = document.getElementById('setup-controls-toggle-btn');
  const content = document.querySelector('.setup-controls-content');
  
  if (!setupControls || !toggleBtn) return;
  
  // Toggle collapsed state
  setupControlsCollapsed = !setupControlsCollapsed;
  
  // Update ARIA attributes
  toggleBtn.setAttribute('aria-expanded', !setupControlsCollapsed);
  toggleBtn.innerHTML = setupControlsCollapsed ? '▼' : '▲';

  
  if (setupControlsCollapsed) {
    // COLLAPSING
    // Calculate starting height for smooth transition
    const startHeight = setupControls.offsetHeight;
    setupControls.style.height = startHeight + 'px';
    
    // Force reflow to ensure height is applied before transition
    setupControls.offsetHeight;
    
    // Apply collapsing class to begin transition
    setupControls.classList.add('collapsing');
    
    // Begin animation for content first
    content.style.opacity = '0';
    
    // After content fades out, animate the container height
    setTimeout(() => {
      setupControls.classList.add('collapsed');
      setupControls.style.height = ''; // Remove explicit height to use CSS value
      
      // Hide certain elements explicitly after animation
      const elementsToHide = setupControls.querySelectorAll('h2, .instructions, .background-section');
      elementsToHide.forEach(el => {
        el.style.display = 'none';
      });
      
      // Remove the collapsing class after animation completes
      setTimeout(() => {
        setupControls.classList.remove('collapsing');
        // Now set to 1 to trigger the CSS transition
        content.style.opacity = '1'; 
      }, 300);
    }, 250);
  } else {
    // EXPANDING
    // Set content opacity to 0 immediately to prevent it from showing
    content.style.opacity = '0';
    
    // First, prepare elements but keep content hidden
    const elementsToShow = setupControls.querySelectorAll('h2, .instructions, .background-section');
    elementsToShow.forEach(el => {
      el.style.display = '';
    });
    
    // Remove collapsed class
    setupControls.classList.remove('collapsed');
    
    // Force reflow to update the DOM
    setupControls.offsetHeight;
    
    // Calculate final height before transition
    const expandedHeight = setupControls.scrollHeight;
    
    // Set initial height (same as collapsed height)
    setupControls.style.height = '375px';  
    
    // Add collapsing class for transition
    setupControls.classList.add('collapsing');
    
    // Force reflow again before changing height
    setupControls.offsetHeight;
    
    // Set target height to trigger animation - need to delay opacity change
    setupControls.style.height = expandedHeight + 'px';
    
    // After panel has expanded significantly but before it completes,
    // begin fading in content with a carefully timed delay
    setTimeout(() => {
      // Ensure content is still set to 0 opacity (defensive)
      content.style.opacity = '0';
      
      // Force a reflow before starting the fade-in animation
      content.offsetHeight;
      
    }, 200); // Slight delay to ensure height transition has progressed enough
    
    // Remove inline styles and animation class after transition completes
    setTimeout(() => {
      setupControls.classList.remove('collapsing');
      setupControls.style.height = '';
      // Now set to 1 to trigger the CSS transition
      content.style.opacity = '1';
    }, 500);
  }
  
  // Reset auto-collapse timer
  startSetupAutoCollapseTimer();
  
  console.log('Setup controls panel ' + (setupControlsCollapsed ? 'collapsed' : 'expanded'));
}

/**
 * Start or restart the auto-collapse timer for the setup controls panel
 * Panel will auto-collapse after 8 seconds of inactivity
 */
function startSetupAutoCollapseTimer() {
  // Clear any existing timer
  if (setupAutoCollapseTimerId) {
    clearTimeout(setupAutoCollapseTimerId);
  }
  
  // Set new timer to collapse after 8 seconds
  setupAutoCollapseTimerId = setTimeout(() => {
    if (!setupControlsCollapsed) {
      // Only collapse if currently expanded
      toggleSetupControls();
    }
  }, 8000); // 8 seconds
}

/**
 * Initialize the settings modal
 * Sets up event listeners and functionality for game settings
 */
function initSettingsModal() {
  const settingsModal = document.getElementById('settings-modal');
  const closeBtn = document.getElementById('settings-close-btn');
  const volumeSlider = document.getElementById('settings-volume');
  const playPauseBtn = document.getElementById('settings-play-pause');
  const nextTrackBtn = document.getElementById('settings-next-track');
  const soundToggleBtn = document.getElementById('settings-sound-toggle');
  
  // Add event listener for close button
  closeBtn.addEventListener('click', function() {
    settingsModal.classList.add('hidden');
  });
  
  // Add event listener for clicking outside the modal
  settingsModal.addEventListener('click', function(e) {
    if (e.target === settingsModal) {
      settingsModal.classList.add('hidden');
    }
  });
  
  // Initialize volume slider
  const savedVolume = localStorage.getItem('eggHuntVolume');
  if (savedVolume !== null) {
    volumeSlider.value = parseFloat(savedVolume) * 100;
  }
  
  // Update volume when slider moves
  volumeSlider.addEventListener('input', function() {
    const volumeLevel = parseFloat(volumeSlider.value) / 100;
    
    // Update background music volume if it exists
    const backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic) {
      backgroundMusic.volume = volumeLevel;
      
      // Save setting to localStorage
      localStorage.setItem('eggHuntVolume', volumeLevel.toString());
    }
  });
  
  // Configure play/pause button
  playPauseBtn.addEventListener('click', function() {
    const backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic) {
      if (backgroundMusic.paused) {
        backgroundMusic.play()
          .then(() => {
            playPauseBtn.textContent = '⏸️';
            playPauseBtn.title = 'Pause';
          })
          .catch(err => console.error('Failed to play music:', err));
      } else {
        backgroundMusic.pause();
        playPauseBtn.textContent = '▶️';
        playPauseBtn.title = 'Play';
      }
    }
  });
  
  // Configure next track button
  nextTrackBtn.addEventListener('click', function() {
    SoundManager.nextTrack();
  });
  
  // Configure sound effects toggle
  soundToggleBtn.addEventListener('click', function() {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
    soundToggleBtn.title = soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects';
    
    // Save preference to localStorage
    localStorage.setItem('eggHuntSoundEnabled', soundEnabled ? '1' : '0');
  });
  
  // Initialize sound effects toggle button state
  const savedSoundEnabled = localStorage.getItem('eggHuntSoundEnabled');
  if (savedSoundEnabled !== null) {
    soundEnabled = savedSoundEnabled === '1';
    soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
    soundToggleBtn.title = soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects';
  }
  
  // Update play/pause button to reflect current state
  const backgroundMusic = document.getElementById('background-music');
  if (backgroundMusic) {
    playPauseBtn.textContent = backgroundMusic.paused ? '▶️' : '⏸️';
  }
}

/**
 * Open the settings modal
 * This is called when either of the settings buttons is clicked
 */
function openSettingsModal() {
  const settingsModal = document.getElementById('settings-modal');
  settingsModal.classList.remove('hidden');
}

/**
 * Initialize more settings section with collapsible functionality
 */
function initMoreSettings() {
  // Find the toggle button and content section
  const toggleBtn = document.querySelector('.more-settings-toggle');
  const contentSection = document.querySelector('.more-settings-content');
  
  // If elements don't exist, return early
  if (!toggleBtn || !contentSection) return;
  
  // Set initial state - collapsed
  let isExpanded = false;
  toggleBtn.setAttribute('aria-expanded', 'false');
  contentSection.style.maxHeight = '0';
  contentSection.style.overflow = 'hidden';
  
  // Add click handler
  toggleBtn.addEventListener('click', function() {
    isExpanded = !isExpanded;
    toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    
    if (isExpanded) {
      contentSection.style.maxHeight = contentSection.scrollHeight + 'px';
      // After transition completes, set to "auto" to handle dynamic content
      setTimeout(() => {
        contentSection.style.maxHeight = 'none';
      }, 300);
    } else {
      // First set a specific height for the transition
      contentSection.style.maxHeight = contentSection.scrollHeight + 'px';
      // Force a reflow
      contentSection.offsetHeight;
      // Then animate to zero
      contentSection.style.maxHeight = '0';
    }
  });
}

/**
 * Add a confetti canvas to the DOM for celebration animations
 */
function addConfettiCanvas() {
  // Check if canvas already exists
  if (document.getElementById('confetti-canvas')) return;
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1500';
  canvas.style.display = 'none';
  
  // Add to body
  document.body.appendChild(canvas);
}

/**
 * Update version display in the UI
 * Shows the current version number in the bottom right corner
 */
function updateVersionDisplay() {
  // Check for existing version display
  let versionDisplay = document.querySelector('.version-info');
  
  // If it doesn't exist, create one
  if (!versionDisplay) {
    versionDisplay = document.createElement('div');
    versionDisplay.className = 'version-info';
    document.body.appendChild(versionDisplay);
  }
  
  // Update the version text
  versionDisplay.textContent = 'v' + GAME_VERSION;
}

/**
 * Add viewport meta tag for mobile devices
 * Ensures proper scaling on mobile devices
 */
function ensureViewportMeta() {
  // Check if viewport meta tag already exists
  let viewport = document.querySelector('meta[name="viewport"]');
  
  // If not, create one
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(viewport);
  }
}

/**
 * Initialize FastClick to eliminate 300ms delay on mobile devices
 * This improves responsiveness on touch devices
 */
function initFastClick() {
  // Check if the device supports touch events
  if (touchEnabled) {
    // Add touch-active class for visual feedback on touch
    document.addEventListener('touchstart', function(e) {
      if (e.target.tagName === 'BUTTON' || 
          e.target.classList.contains('control-btn') ||
          e.target.classList.contains('main-btn') ||
          e.target.classList.contains('egg') ||
          e.target.classList.contains('setup-egg')) {
        e.target.classList.add('touch-active');
      }
    }, { passive: true });

    // Remove touch-active class when touch ends
    document.addEventListener('touchend', function(e) {
      const activeElements = document.querySelectorAll('.touch-active');
      activeElements.forEach(function(element) {
        element.classList.remove('touch-active');
      });
    }, { passive: true });

    // Also remove on touch cancel
    document.addEventListener('touchcancel', function(e) {
      const activeElements = document.querySelectorAll('.touch-active');
      activeElements.forEach(function(element) {
        element.classList.remove('touch-active');
      });
    }, { passive: true });
    
    console.log('FastClick initialized for touch devices');
  } else {
    console.log('FastClick not needed (non-touch device)');
  }
}
