/**
 * Main entry point for the Easter Egg Hunt game
 */

// Import modules
import * as config from './modules/config.js';
import * as dom from './modules/dom.js';
import * as state from './modules/state.js';
import { SoundManager } from './modules/sound.js';
import * as animation from './modules/animation.js';
import * as egg from './modules/egg.js';
import * as ui from './modules/ui.js';
import * as modal from './modules/modal.js';
import * as camera from './modules/camera.js';
import * as touch from './modules/touch.js';
import * as utils from './modules/utils.js';
import * as events from './modules/events.js';

// Destructure important constants
const { GAME_VERSION } = config;

/**
 * Verify that all modules loaded correctly
 */
function verifyModules() {
  const modules = {
    config: !!config,
    dom: !!dom,
    state: !!state,
    sound: !!SoundManager,
    animation: !!animation,
    egg: !!egg,
    ui: !!ui,
    modal: !!modal,
    camera: !!camera,
    touch: !!touch,
    utils: !!utils,
    events: !!events
  };
  
  console.log('Module loading verification:');
  let allModulesLoaded = true;
  
  for (const [name, loaded] of Object.entries(modules)) {
    console.log(name + ': ' + (loaded ? '✅ Loaded' : '❌ Failed to load'));
    if (!loaded) allModulesLoaded = false;
  }
  
  if (allModulesLoaded) {
    console.log('All modules loaded successfully! 🎉');
  } else {
    console.error('Some modules failed to load. Check import paths and module exports.');
  }
  
  return allModulesLoaded;
}

/**
 * Initialize the application
 */
function init() {
  console.log('📋 Starting initialization sequence');
  
  // Verify modules before initializing
  if (!verifyModules()) {
    console.error('❌ Initialization halted due to module loading issues.');
    return;
  }
  
  // Check if DOM is ready
  console.log('🔍 Checking document readiness: ' + (document.readyState === 'complete' ? 'Ready' : 'Not Ready'));
  
  try {
    // Initialize DOM references
    console.log('🔄 Initializing DOM references...');
    dom.initDomReferences();
    console.log('✅ DOM references initialized');
    
    // Initialize touch support
    console.log('🔄 Initializing touch support...');
    touch.init();
    console.log('✅ Touch support initialized');
    
    // Set up event listeners
    console.log('🔄 Setting up event listeners...');
    events.setupEventListeners();
    console.log('✅ Event listeners setup complete');
    
    // Initialize sound manager
    console.log('🔄 Initializing sound manager...');
    SoundManager.init();
    console.log('✅ Sound manager initialized');
    
    // Initialize UI components
    console.log('🔄 Initializing UI components...');
    ui.initUI();
    console.log('✅ UI components initialized');
    
    // Initialize camera functionality
    console.log('🔄 Initializing camera support...');
    camera.initCameraSupport();
    console.log('✅ Camera support initialized');
    
    // Display version information
    console.log('🔄 Updating version display...');
    utils.updateVersionDisplay(GAME_VERSION);
    console.log('✅ Version display updated');
    
    // Start at welcome screen
    console.log('🔄 Showing start screen...');
    ui.showStartScreen();
    console.log('✅ Start screen should be visible');
    
    // Debug DOM visibility
    console.log('🔍 Current screen visibilities:');
    const startScreen = document.getElementById('start-screen');
    const setupScreen = document.getElementById('setup-screen');
    const gameContainer = document.getElementById('game-container');
    
    console.log('- start-screen: ' + 
      (startScreen ? (!startScreen.classList.contains('hidden') ? 'VISIBLE' : 'HIDDEN') : 'NOT FOUND'));
    console.log('- setup-screen: ' + 
      (setupScreen ? (!setupScreen.classList.contains('hidden') ? 'VISIBLE' : 'HIDDEN') : 'NOT FOUND'));
    console.log('- game-container: ' + 
      (gameContainer ? (!gameContainer.classList.contains('hidden') ? 'VISIBLE' : 'HIDDEN') : 'NOT FOUND'));
    
    console.log('🎮 Easter Egg Hunt Game initialized - v' + GAME_VERSION);
  } catch (error) {
    console.error('💥 Error during initialization:', error);
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Window load event handler
 */
function onWindowLoad() {
  console.log('🚀 Window load event triggered');
  init();
}

// Setup the application when the window loads
window.addEventListener('load', onWindowLoad);
console.log('⏳ Waiting for window load event...');

// Expose a global API for the game if needed
window.EasterEggHunt = {
  version: GAME_VERSION,
  resetGame: ui.resetGame,
  showSetupScreen: ui.showSetupScreen,
  startGame: ui.startGame,
  // Add these useful functions for external use
  getEggData: state.getEggData,
  showHint: ui.showHint,
  updateBackgroundImage: camera.updateBackgroundImage,
  toggleSound: function() {
    const enabled = !state.isSoundEnabled();
    state.setSoundEnabled(enabled);
    return enabled;
  },
  setVolume: SoundManager.setVolume,
  // Debug utility
  debugShowScreen: function(screenId) {
    console.log('🛠️ Manually showing screen: ' + screenId);
    const screen = document.getElementById(screenId);
    if (screen) {
      document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
      screen.classList.remove('hidden');
      console.log('Screen ' + screenId + ' should now be visible');
      return true;
    }
    console.error('Screen ' + screenId + ' not found');
    return false;
  }
}