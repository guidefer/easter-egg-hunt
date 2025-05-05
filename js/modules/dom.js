/**
 * DOM manipulation utilities and element references for the Easter Egg Hunt game
 */

/**
 * Cached DOM element references
 */

// Screen elements
export let screens = {
    start: null,
    setup: null,
    game: null
};

// Panel elements
export let panels = {
    setupControls: null,
    huntUI: null
};

// Modal elements
export let modals = {
    egg: null,
    congrats: null,
    camera: null,
    settings: null,
    backgroundPresets: null
};

// Loading screen elements
export let loadingScreens = {
    setup: null,
    game: null
};

// Legacy UI elements
export let legacyUI = {
    clueDisplay: null,
    floatingUI: null,
    currentClue: null,
    foundCount: null,
    totalCount: null,
    clueNumber: null,
    totalClues: null,
    hintButton: null,
    resetButton: null
};

// Main UI elements
export let uiElements = {
    // Button elements
    buttons: {
        setup: null,
        addEgg: null,
        startGame: null,
        reset: null,
        hint: null,
        setupControlsToggle: null,
        huntUIToggle: null,
        settingsSetup: null,
        settingsGame: null,
        restart: null,
        fileUpload: null,
        cameraCapture: null,
        presetsBackgrounds: null
    },
    
    // Modal elements
    modal: {
        eggNumber: null,
        eggNumberDisplay: null,
        eggClue: null,
        saveBtn: null,
        removeBtn: null,
        cancelBtn: null,
        congratsMessage: null
    },
    
    // Game UI elements
    game: {
        currentClue: null,
        clueNumber: null,
        totalClues: null,
        foundCount: null,
        totalCount: null
    },
    
    // Camera elements
    camera: {
        preview: null,
        canvas: null,
        captureBtn: null,
        cancelBtn: null
    },
    
    // Setup elements
    setup: {
        eggPlacementArea: null,
        eggList: null,
        backgroundUpload: null
    },
    
    // Settings elements
    settings: {
        volume: null,
        playPause: null,
        nextTrack: null,
        soundToggle: null,
        closeBtn: null
    },
    
    // Background presets elements
    presets: {
        container: null,
        preview: null,
        previewPlaceholder: null,
        applyBtn: null,
        cancelBtn: null,
        closeBtn: null
    },
    
    // Audio elements
    audio: {
        backgroundMusic: null,
        eggFoundSound: null,
        hintSound: null,
        celebrationSound: null
    },
    
    // Other elements
    confettiCanvas: null,
    gameVersion: null
};

/**
 * Initialize DOM references - must be called after DOMContentLoaded
 */
export function initDomReferences() {
    // Initialize screen elements
    screens = {
        start: document.getElementById('start-screen'),
        setup: document.getElementById('setup-screen'),
        game: document.getElementById('game-container')
    };

    // Initialize panel elements
    panels = {
        setupControls: document.getElementById('setup-controls'),
        huntUI: document.getElementById('hunt-ui-panel')
    };

    // Initialize modal elements
    modals = {
        egg: document.getElementById('egg-modal'),
        congrats: document.getElementById('congrats-modal'),
        camera: document.getElementById('camera-modal'),
        settings: document.getElementById('settings-modal'),
        backgroundPresets: document.getElementById('background-presets-modal')
    };

    // Initialize loading screen elements
    loadingScreens = {
        setup: document.getElementById('setup-loading-screen'),
        game: document.getElementById('loading-screen')
    };

    // Initialize legacy UI elements
    legacyUI = {
        clueDisplay: document.getElementById('clue-display'),
        floatingUI: document.getElementById('floating-ui'),
        currentClue: document.getElementById('current-clue-old'),
        foundCount: document.getElementById('found-count-old'),
        totalCount: document.getElementById('total-count-old'),
        clueNumber: document.getElementById('clue-number-old'),
        totalClues: document.getElementById('total-clues-old'),
        hintButton: document.getElementById('hint-button-old'),
        resetButton: document.getElementById('reset-btn-old')
    };

    // Initialize main UI elements
    uiElements = {
        // Button elements
        buttons: {
            setup: document.getElementById('setup-btn'),
            addEgg: document.getElementById('add-egg-btn'),
            startGame: document.getElementById('start-game-btn'),
            reset: document.getElementById('reset-btn'),
            hint: document.getElementById('hint-button'),
            setupControlsToggle: document.getElementById('setup-controls-toggle-btn'),
            huntUIToggle: document.getElementById('hunt-ui-toggle-btn'),
            settingsSetup: document.getElementById('settings-btn-setup'),
            settingsGame: document.getElementById('settings-btn-game'),
            restart: document.getElementById('restart-btn'),
            fileUpload: document.getElementById('file-upload-btn'),
            cameraCapture: document.getElementById('camera-capture'),
            presetsBackgrounds: document.getElementById('preset-backgrounds-btn')
        },
        
        // Modal elements
        modal: {
            eggNumber: document.getElementById('modal-egg-number'),
            eggNumberDisplay: document.getElementById('modal-egg-number-display'),
            eggClue: document.getElementById('modal-egg-clue'),
            saveBtn: document.getElementById('modal-save-btn'),
            removeBtn: document.getElementById('modal-remove-btn'),
            cancelBtn: document.getElementById('modal-cancel-btn'),
            congratsMessage: document.getElementById('congrats-message')
        },
        
        // Game UI elements
        game: {
            currentClue: document.getElementById('current-clue'),
            clueNumber: document.getElementById('clue-number'),
            totalClues: document.getElementById('total-clues'),
            foundCount: document.getElementById('found-count'),
            totalCount: document.getElementById('total-count')
        },
        
        // Camera elements
        camera: {
            preview: document.getElementById('camera-preview'),
            canvas: document.getElementById('camera-canvas'),
            captureBtn: document.getElementById('capture-photo'),
            cancelBtn: document.getElementById('cancel-camera')
        },
        
        // Setup elements
        setup: {
            eggPlacementArea: document.getElementById('egg-placement-area'),
            eggList: document.getElementById('egg-list'),
            backgroundUpload: document.getElementById('background-upload')
        },
        
        // Settings elements
        settings: {
            volume: document.getElementById('settings-volume'),
            playPause: document.getElementById('settings-play-pause'),
            nextTrack: document.getElementById('settings-next-track'),
            soundToggle: document.getElementById('settings-sound-toggle'),
            closeBtn: document.getElementById('settings-close-btn')
        },
        
        // Background presets elements
        presets: {
            container: document.getElementById('presets-container'),
            preview: document.getElementById('preset-preview'),
            previewPlaceholder: document.getElementById('preset-preview-placeholder'),
            applyBtn: document.getElementById('preset-apply-btn'),
            cancelBtn: document.getElementById('preset-cancel-btn'),
            closeBtn: document.getElementById('preset-close-btn')
        },
        
        // Audio elements
        audio: {
            backgroundMusic: document.getElementById('background-music'),
            eggFoundSound: document.getElementById('egg-found-sound'),
            hintSound: document.getElementById('hint-sound'),
            celebrationSound: document.getElementById('celebration-sound')
        },
        
        // Other elements
        confettiCanvas: document.getElementById('confetti-canvas'),
        gameVersion: document.getElementById('game-version')
    };
    
    console.log('DOM references initialized');
}

/**
 * Get a DOM element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} DOM element or null if not found
 */
export function getById(id) {
    return document.getElementById(id);
}

/**
 * Shows a specific screen and hides others
 * @param {string} screenId - ID of the screen to show
 */
export function showScreen(screenId) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.add('hidden');
    });
    
    // Show the requested screen
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) {
        screenToShow.classList.remove('hidden');
    }
}

/**
 * Hides a specific screen
 * @param {string} screenId - ID of the screen to hide
 */
export function hideScreen(screenId) {
    const screenToHide = document.getElementById(screenId);
    if (screenToHide) {
        screenToHide.classList.add('hidden');
    }
}

/**
 * Toggle a class on an element
 * @param {HTMLElement} element - DOM element to modify
 * @param {string} className - Class to toggle
 * @param {boolean} [force] - Force add or remove
 */
export function toggleClass(element, className, force) {
    if (element) {
        if (force === undefined) {
            element.classList.toggle(className);
        } else {
            if (force) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        }
    }
}

/**
 * Create a new DOM element with specified attributes and options
 * @param {string} type - Element type (e.g. 'div', 'button')
 * @param {Object} options - Element options
 * @param {string} [options.id] - Element ID
 * @param {string|Array} [options.class] - Element class name(s)
 * @param {string} [options.text] - Text content
 * @param {string} [options.html] - HTML content
 * @param {Object} [options.attributes] - Element attributes
 * @param {HTMLElement} [options.parent] - Parent element to append to
 * @returns {HTMLElement} - The created element
 */
export function createElement(type, options = {}) {
  const element = document.createElement(type);
  
  // Set element ID
  if (options.id) {
    element.id = options.id;
  }
  
  // Set element class(es)
  if (options.class) {
    if (Array.isArray(options.class)) {
      element.classList.add(...options.class);
    } else {
      element.classList.add(options.class);
    }
  }
  
  // Set text content
  if (options.text !== undefined) {
    element.textContent = options.text;
  }
  
  // Set HTML content
  if (options.html) {
    element.innerHTML = options.html;
  }
  
  // Set attributes
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  
  // Append to parent if provided
  if (options.parent) {
    options.parent.appendChild(element);
  }
  
  return element;
}

/**
 * Update the text content of an element
 * @param {string} id - Element ID
 * @param {string} text - New text content
 */
export function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

/**
 * Update count displays in UI
 * @param {string} countElementId - ID of count element
 * @param {string} totalElementId - ID of total element
 * @param {number} count - Current count
 * @param {number} total - Total count
 */
export function updateElementCount(countElementId, totalElementId, count, total) {
    updateElementText(countElementId, count);
    updateElementText(totalElementId, total);
}