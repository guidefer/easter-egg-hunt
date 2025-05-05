/**
 * UI panel management and interactions for the Easter Egg Hunt game
 */

import { AUTO_COLLAPSE_DELAY, GAME_PHASES } from './config.js';
import { 
  setHuntUIPanelCollapsed, isHuntUIPanelCollapsed,
  setSetupControlsCollapsed, isSetupControlsCollapsed,
  setAutoCollapseTimerId, getAutoCollapseTimerId,
  setSetupAutoCollapseTimerId, getSetupAutoCollapseTimerId,
  getCurrentEggIndex, getEggData,
  setGamePhase, getGamePhase,
  setIsNewEgg, setHintUsed, isHintUsed,
  resetGameState
} from './state.js';
import { uiElements, screens, panels, toggleClass, showScreen, updateElementCount } from './dom.js';
import { SoundManager } from './sound.js';
import { AnimationManager } from './animation.js';
import { createGameEggs, updateClickableEggs } from './egg.js';

/**
 * Initialize the hunt UI panel toggle
 */
export function initHuntUIPanelToggle() {
  // Set initial state
  const huntUIPanel = panels.huntUI;
  const toggleBtn = uiElements.buttons.huntUIToggle;
  
  if (huntUIPanel && toggleBtn) {
    huntUIPanel.classList.remove('collapsed');
    toggleBtn.textContent = '▼';
    setHuntUIPanelCollapsed(false);
    
    // Start auto collapse timer
    startAutoCollapseTimer();
  }
}

/**
 * Toggle the hunt UI panel
 */
export function toggleHuntUIPanel() {
  const huntUIPanel = panels.huntUI;
  const toggleBtn = uiElements.buttons.huntUIToggle;
  
  if (!huntUIPanel || !toggleBtn) return;
  
  // Only allow toggle if not currently transitioning
  if (huntUIPanel.classList.contains('transitioning')) return;
  
  // Toggle collapsed state
  const isCollapsed = isHuntUIPanelCollapsed();
  
  if (isCollapsed) {
    // Expand panel
    expandHuntUIPanel();
  } else {
    // Collapse panel
    huntUIPanel.classList.add('transitioning');
    huntUIPanel.classList.add('collapsed');
    toggleBtn.textContent = '▲';
    setHuntUIPanelCollapsed(true);
    
    // Clean up after transition completes
    setTimeout(() => {
      huntUIPanel.classList.remove('transitioning');
    }, 300); // Match the CSS transition duration
    
    // Clear any existing auto-collapse timer
    const timerId = getAutoCollapseTimerId();
    if (timerId) {
      clearTimeout(timerId);
      setAutoCollapseTimerId(null);
    }
  }
}

/**
 * Expand the hunt UI panel
 * @param {boolean} [startTimer=true] - Whether to start the auto-collapse timer
 */
export function expandHuntUIPanel(startTimer = true) {
  const huntUIPanel = panels.huntUI;
  const toggleBtn = uiElements.buttons.huntUIToggle;
  
  if (!huntUIPanel || !toggleBtn) return;
  
  huntUIPanel.classList.add('transitioning');
  huntUIPanel.classList.remove('collapsed');
  toggleBtn.textContent = '▼';
  setHuntUIPanelCollapsed(false);
  
  // Clean up after transition completes
  setTimeout(() => {
    huntUIPanel.classList.remove('transitioning');
  }, 300); // Match the CSS transition duration
  
  // Start auto-collapse timer if requested
  if (startTimer) {
    startAutoCollapseTimer();
  }
}

/**
 * Start the timer to auto-collapse the hunt UI panel
 */
export function startAutoCollapseTimer() {
  // Clear any existing timer
  const existingTimerId = getAutoCollapseTimerId();
  if (existingTimerId) {
    clearTimeout(existingTimerId);
  }
  
  // Set new timer
  const timerId = setTimeout(() => {
    if (!isHuntUIPanelCollapsed()) {
      toggleHuntUIPanel();
    }
  }, AUTO_COLLAPSE_DELAY.HUNT_UI);
  
  setAutoCollapseTimerId(timerId);
}

/**
 * Toggle the setup controls panel
 */
export function toggleSetupControls() {
  const setupControls = panels.setupControls;
  const toggleBtn = uiElements.buttons.setupControlsToggle;
  
  if (!setupControls || !toggleBtn) return;
  
  // Only allow toggle if not currently transitioning
  if (setupControls.classList.contains('transitioning')) return;
  
  // Toggle collapsed state
  const isCollapsed = isSetupControlsCollapsed();
  
  if (isCollapsed) {
    // Expand panel
    setupControls.classList.add('transitioning');
    setupControls.classList.remove('collapsed');
    toggleBtn.textContent = '▼';
    setSetupControlsCollapsed(false);
    
    // Clean up after transition completes
    setTimeout(() => {
      setupControls.classList.remove('transitioning');
    }, 300); // Match the CSS transition duration
    
    // Start auto-collapse timer
    startSetupAutoCollapseTimer();
  } else {
    // Collapse panel
    setupControls.classList.add('transitioning');
    setupControls.classList.add('collapsed');
    toggleBtn.textContent = '▲';
    setSetupControlsCollapsed(true);
    
    // Clean up after transition completes
    setTimeout(() => {
      setupControls.classList.remove('transitioning');
    }, 300); // Match the CSS transition duration
    
    // Clear any existing auto-collapse timer
    const timerId = getSetupAutoCollapseTimerId();
    if (timerId) {
      clearTimeout(timerId);
      setSetupAutoCollapseTimerId(null);
    }
  }
}

/**
 * Start the timer to auto-collapse the setup controls
 */
export function startSetupAutoCollapseTimer() {
  // Clear any existing timer
  const existingTimerId = getSetupAutoCollapseTimerId();
  if (existingTimerId) {
    clearTimeout(existingTimerId);
  }
  
  // Set new timer
  const timerId = setTimeout(() => {
    if (!isSetupControlsCollapsed()) {
      toggleSetupControls();
    }
  }, AUTO_COLLAPSE_DELAY.SETUP_CONTROLS);
  
  setSetupAutoCollapseTimerId(timerId);
}

/**
 * Show the setup screen
 */
export function showSetupScreen() {
  // Show setup screen
  showScreen('setup-screen');
  
  // Show setup controls
  if (panels.setupControls) {
    panels.setupControls.classList.remove('hidden');
  }
  
  // Set game phase
  setGamePhase(GAME_PHASES.SETUP);
  
  // Clear the new egg flag
  setIsNewEgg(false);
}

/**
 * Start the game
 */
export function startGame() {
  // Show loading screen first
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.remove('hidden');
  }
  
  // Set game phase
  setGamePhase(GAME_PHASES.PLAYING);
  
  // Create loading bar
  const loadingBar = document.getElementById('loading-bar');
  if (loadingBar) {
    loadingBar.style.width = '0%';
    
    // Animate loading bar
    setTimeout(() => {
      loadingBar.style.transition = 'width 2s ease';
      loadingBar.style.width = '100%';
      
      // When loading completes, transition to game
      setTimeout(() => {
        // Hide loading and setup screens
        if (loadingScreen) loadingScreen.classList.add('hidden');
        showScreen('game-container');
        
        // Show hunt UI panel
        if (panels.huntUI) {
          panels.huntUI.classList.remove('hidden');
          initHuntUIPanelToggle();
        }
        
        // Hide setup controls
        if (panels.setupControls) {
          panels.setupControls.classList.add('hidden');
          setSetupControlsCollapsed(false); // Reset state for next time
        }
        
        // Reset hint button
        resetHintButton();
        
        // Set up game eggs
        createGameEggs();
        
        // Reset game state
        resetGameState();
        
        // Update UI with egg data
        updateGameUI();
        
        // Start animations
        AnimationManager.init();
        
        // Start background music if not already playing
        if (uiElements.audio.backgroundMusic && uiElements.audio.backgroundMusic.paused) {
          uiElements.audio.backgroundMusic.play().catch(err => {
            console.log('Failed to start background music, autoplay might be disabled');
          });
        }
      }, 2000); // 2s loading animation
    }, 100);
  }
}

/**
 * Update the game UI with the current state
 */
function updateGameUI() {
  const eggData = getEggData();
  const currentEggIndex = getCurrentEggIndex();
  
  if (eggData.length === 0) return;
  
  // Update clue count
  updateElementCount('clue-number', 'total-clues', currentEggIndex + 1, eggData.length);
  
  // Update egg count
  updateElementCount('found-count', 'total-count', 0, eggData.length);
  
  // Update current clue
  showCurrentClue();
}

/**
 * Reset the game
 */
export function resetGame() {
  // Reset to start screen
  showScreen('start-screen');
  
  // Hide panels
  if (panels.huntUI) panels.huntUI.classList.add('hidden');
  if (panels.setupControls) panels.setupControls.classList.add('hidden');
  
  // Reset game state
  resetGameState();
  
  // Clean up any animations
  AnimationManager.cleanup();
}

/**
 * Show the current clue in the hunt UI
 */
export function showCurrentClue() {
  const clueDisplay = uiElements.game.currentClue;
  const eggData = getEggData();
  const currentEggIndex = getCurrentEggIndex();
  
  if (!clueDisplay || !eggData || eggData.length === 0) return;
  
  // Get the current egg
  const currentEgg = eggData[currentEggIndex];
  if (!currentEgg) return;
  
  // Update clue text
  clueDisplay.textContent = currentEgg.clue || 'Look for egg #' + currentEgg.number;
  
  // Highlight the clue with animation
  clueDisplay.classList.add('highlight-clue');
  
  setTimeout(() => {
    clueDisplay.classList.remove('highlight-clue');
  }, 1000);
}

/**
 * Reset the hint button to its default state
 */
export function resetHintButton() {
  const hintButton = uiElements.buttons.hint;
  if (!hintButton) return;
  
  hintButton.classList.remove('used');
  setHintUsed(false);
}

/**
 * Show a hint for the current egg
 */
export function showHint() {
  const hintButton = uiElements.buttons.hint;
  if (!hintButton) return;
  
  // If hint was already used, don't do anything
  if (isHintUsed()) return;
  
  // Mark hint as used
  setHintUsed(true);
  hintButton.classList.add('used');
  
  // Play hint sound
  SoundManager.play('hint');
  
  // Show the current egg briefly
  const eggData = getEggData();
  const currentEggIndex = getCurrentEggIndex();
  
  if (!eggData || eggData.length === 0) return;
  
  // Get the current egg
  const currentEgg = eggData[currentEggIndex];
  if (!currentEgg) return;
  
  // Find the egg element
  const eggElement = document.querySelector(`.egg[data-egg-id="${currentEgg.id}"]`);
  if (!eggElement) return;
  
  // Make the egg visible and add hint animation
  eggElement.classList.remove('hidden');
  eggElement.classList.add('hint-animation');
  
  // Hide egg again after animation
  setTimeout(() => {
    eggElement.classList.remove('hint-animation');
    if (!eggElement.classList.contains('found') && !eggElement.classList.contains('clickable')) {
      eggElement.classList.add('hidden');
    }
  }, 2000);
}

/**
 * Initialize the UI components
 */
export function initUI() {
  console.log('Initializing UI components');
  
  // Initialize UI panels and buttons
  if (panels.setupControls) {
    // Ensure setup controls are visible but collapsed initially
    panels.setupControls.classList.remove('hidden');
    panels.setupControls.classList.add('collapsed');
    setSetupControlsCollapsed(true);
    
    if (uiElements.buttons.setupControlsToggle) {
      uiElements.buttons.setupControlsToggle.textContent = '▲';
    }
  }
  
  // Initialize hint button
  resetHintButton();
  
  console.log('UI initialization complete');
}

/**
 * Show the start screen
 */
export function showStartScreen() {
  // Show start screen
  showScreen('start-screen');
  
  // Hide game panels
  if (panels.huntUI) panels.huntUI.classList.add('hidden');
  if (panels.setupControls) panels.setupControls.classList.add('hidden');
  
  // Set game phase
  setGamePhase(GAME_PHASES.START);
  
  console.log('Showing start screen');
}