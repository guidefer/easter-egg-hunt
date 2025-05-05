/**
 * Event handling for the Easter Egg Hunt game
 * Centralizes event listener registration
 */

import { uiElements, screens, panels } from './dom.js';
import { isPassiveSupported } from './utils.js';
import { addAreaEventListeners, removeAreaEventListeners } from './touch.js';
import { isTouchEnabled, setSelectedEggId } from './state.js'; // Import setSelectedEggId
import { showSetupScreen, startGame, resetGame, toggleSetupControls, toggleHuntUIPanel, showHint } from './ui.js';
import { showAddEggModal, showEditEggModal, closeModal, openSettingsModal, saveEggFromModal, removeEggFromModal, openBackgroundPresetsModal } from './modal.js';
import { createNewEggAtPosition } from './egg.js';
import { initCamera, handleImageFile } from './camera.js';

// Track registered events for cleanup
const registeredEvents = [];

/**
 * Set up all event listeners for the game
 */
export function setupEventListeners() {
  setupButtonListeners();
  setupModalListeners();
  setupWindowListeners();
}

/**
 * Set up button click listeners
 */
export function setupButtonListeners() {
  const { buttons } = uiElements;
  
  // Main navigation buttons
  if (buttons.setup) {
    attachEventWithCleanup(buttons.setup, 'click', () => {
      showSetupScreen();
    });
  }
  
  if (buttons.startGame) {
    attachEventWithCleanup(buttons.startGame, 'click', () => {
      startGame();
    });
  }
  
  if (buttons.reset) {
    attachEventWithCleanup(buttons.reset, 'click', () => {
      resetGame();
    });
  }
  
  if (buttons.restart) {
    attachEventWithCleanup(buttons.restart, 'click', () => {
      resetGame();
    });
  }
  
  // UI panel toggle buttons
  if (buttons.setupControlsToggle) {
    attachEventWithCleanup(buttons.setupControlsToggle, 'click', () => {
      toggleSetupControls();
    });
  }
  
  if (buttons.huntUIToggle) {
    attachEventWithCleanup(buttons.huntUIToggle, 'click', () => {
      toggleHuntUIPanel();
    });
  }
  
  // Egg management buttons
  if (buttons.addEgg) {
    attachEventWithCleanup(buttons.addEgg, 'click', () => {
      // Explicitly set selectedId to null before showing add modal
      // This signals that the save operation should create a NEW egg
      setSelectedEggId(null); 
      showAddEggModal(); 
    });
  }
  
  // Hint button
  if (buttons.hint) {
    attachEventWithCleanup(buttons.hint, 'click', () => {
      showHint();
    });
  }
  
  // Settings buttons
  if (buttons.settingsSetup) {
    attachEventWithCleanup(buttons.settingsSetup, 'click', () => {
      openSettingsModal();
    });
  }
  
  if (buttons.settingsGame) {
    attachEventWithCleanup(buttons.settingsGame, 'click', () => {
      openSettingsModal();
    });
  }
  
  // Background preset button
  if (buttons.presetsBackgrounds) {
    attachEventWithCleanup(buttons.presetsBackgrounds, 'click', () => {
      openBackgroundPresetsModal();
    });
  }
  
  // Camera and file upload buttons
  if (buttons.fileUpload) {
    attachEventWithCleanup(buttons.fileUpload, 'click', () => {
      // This will trigger the file input
      if (uiElements.setup.backgroundUpload) {
        uiElements.setup.backgroundUpload.click();
      }
    });
  }
  
  if (buttons.cameraCapture) {
    attachEventWithCleanup(buttons.cameraCapture, 'click', () => {
      initCamera();
    });
  }
  
  // Set up file input change event
  if (uiElements.setup.backgroundUpload) {
    attachEventWithCleanup(uiElements.setup.backgroundUpload, 'change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImageFile(e.target.files[0]);
      }
    });
  }
}

/**
 * Set up modal interaction listeners
 */
export function setupModalListeners() {
  const { modal } = uiElements;
  
  // Egg modal buttons
  if (modal.saveBtn) {
    attachEventWithCleanup(modal.saveBtn, 'click', () => {
      saveEggFromModal();
    });
  }
  
  if (modal.removeBtn) {
    attachEventWithCleanup(modal.removeBtn, 'click', () => {
      removeEggFromModal();
    });
  }
  
  if (modal.cancelBtn) {
    attachEventWithCleanup(modal.cancelBtn, 'click', () => {
      closeModal();
    });
  }
  
  // Settings modal
  if (uiElements.settings.closeBtn) {
    attachEventWithCleanup(uiElements.settings.closeBtn, 'click', () => {
      closeModal();
    });
  }
  
  // Modal click-outside-to-close behavior
  document.querySelectorAll('.modal').forEach(modal => {
    attachEventWithCleanup(modal, 'click', (e) => {
      if (e.target === modal) {
        // Only close if clicking the overlay, not the content
        closeModal();
      }
    });
  });
}

/**
 * Set up window-level events
 */
export function setupWindowListeners() {
  // Window resize handler
  attachEventWithCleanup(window, 'resize', handleWindowResize);
  
  // Handle clicks on the egg placement area (for adding eggs)
  if (uiElements.setup.eggPlacementArea) {
    const eggPlacementArea = uiElements.setup.eggPlacementArea;
    
    // Safer click handler for egg placement
    attachEventWithCleanup(eggPlacementArea, 'click', function saferClickHandler(e) {
      try {
        // Prevent handling if this is a touch device event that will be handled by the touch handler
        if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) {
          return;
        }
        
        // Only create a new egg if we're not clicking on an existing egg
        if (e.target && !e.target.closest('.setup-egg')) {
          console.log('Placement area clicked, creating new egg');
          
          // Get reliable coordinates using multiple methods
          let x, y;
          const rect = eggPlacementArea.getBoundingClientRect();
          
          if (typeof e.offsetX === 'number' && typeof e.offsetY === 'number') {
            // Standard mouse event
            x = e.offsetX;
            y = e.offsetY;
            console.log('Using offsetX/Y coordinates:', x, y);
          } else if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
            // Calculate from client coordinates
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
            console.log('Using clientX/Y coordinates:', x, y);
          } else if (typeof e.pageX === 'number' && typeof e.pageY === 'number') {
            // Calculate from page coordinates
            x = e.pageX - rect.left - window.scrollX;
            y = e.pageY - rect.top - window.scrollY;
            console.log('Using pageX/Y coordinates:', x, y);
          }
          
          // Only proceed if we have valid coordinates
          if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
            // Create egg at position
            createNewEggAtPosition(x, y);
          } else {
            console.warn('Could not determine valid coordinates from event:', e);
          }
        }
      } catch (err) {
        console.error('Error in egg placement click handler:', err);
      }
    });
    
    // Separate handler for touch events with better error handling
    attachEventWithCleanup(eggPlacementArea, 'touchend', function saferTouchHandler(e) {
      try {
        // Only handle if we have changedTouches
        if (!e || !e.changedTouches || e.changedTouches.length === 0) {
          console.warn('Invalid touch event:', e);
          return;
        }
        
        // Verify we're not touching an existing egg
        const touch = e.changedTouches[0];
        if (!touch) {
          console.warn('Missing touch data in event:', e);
          return;
        }
        
        // Get the element at touch position
        const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
        if (elementAtPoint && elementAtPoint.closest('.setup-egg')) {
          // We're touching an existing egg, don't create a new one
          console.log('Touch on existing egg, ignoring for egg creation');
          return;
        }
        
        // Get coordinates relative to the placement area
        const rect = eggPlacementArea.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
          console.log('Touch coordinates for new egg:', x, y);
          // Create egg and prevent default to avoid triggering additional click events
          e.preventDefault();
          createNewEggAtPosition(x, y);
        } else {
          console.warn('Invalid touch coordinates:', x, y);
        }
      } catch (err) {
        console.error('Error in egg placement touch handler:', err);
      }
    }, { passive: false });
  }
  
  // Key press handler for accessibility
  attachEventWithCleanup(document, 'keydown', (e) => {
    if (!e) return;
    
    // Handle Escape key to close modals
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

/**
 * Handle window resize events
 */
export function handleWindowResize() {
  // This is a debounced function
  // It will reposition eggs and adjust layout as needed
}

/**
 * Attach an event listener with proper passive option support
 * @param {HTMLElement} element - Element to attach event to
 * @param {string} eventType - Type of event (e.g., 'click')
 * @param {Function} handler - Event handler function
 * @param {Object} [options] - Event listener options
 */
export function attachEventWithOptions(element, eventType, handler, options) {
  if (!element) return;
  
  // Check for passive event support
  if (options && isPassiveSupported()) {
    element.addEventListener(eventType, handler, options);
  } else if (typeof options === 'boolean') {
    // Fallback for older browsers
    element.addEventListener(eventType, handler, options);
  } else {
    element.addEventListener(eventType, handler);
  }
}

/**
 * Attach an event with cleanup registration
 * @param {HTMLElement} element - Element to attach event to
 * @param {string} eventType - Type of event (e.g., 'click')
 * @param {Function} handler - Event handler function
 * @param {Object} [options] - Event listener options
 */
function attachEventWithCleanup(element, eventType, handler, options) {
  if (!element) return;
  
  attachEventWithOptions(element, eventType, handler, options);
  
  // Register for cleanup
  registeredEvents.push({
    element,
    eventType,
    handler,
    options
  });
}

/**
 * Clean up all registered event listeners
 */
export function removeEventListeners() {
  registeredEvents.forEach(({ element, eventType, handler, options }) => {
    if (element) {
      element.removeEventListener(eventType, handler, options);
    }
  });
  
  // Clear the array
  registeredEvents.length = 0;
}

/**
 * Register mouse and touch drag handlers for an element
 * @param {HTMLElement} element - Element to make draggable
 * @param {Function} onDragStart - Function called when drag starts
 * @param {Function} onDragMove - Function called during drag
 * @param {Function} onDragEnd - Function called when drag ends
 */
export function registerDragHandlers(element, onDragStart, onDragMove, onDragEnd) {
  if (!element) return;
  
  // Mouse event handlers
  const mouseDownHandler = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    
    onDragStart(e);
    
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };
  
  const mouseMoveHandler = (e) => {
    onDragMove(e);
  };
  
  const mouseUpHandler = (e) => {
    onDragEnd(); // Call without event argument
    
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };
  
  // Touch event handlers
  const touchStartHandler = (e) => {
    if (!e || !e.touches || e.touches.length === 0) return;
    
    e.preventDefault(); // Prevent scrolling
    
    const touch = e.touches[0];
    const touchEvent = {
      type: 'touchstart', // Add type
      clientX: touch.clientX,
      clientY: touch.clientY,
      target: e.target,
      preventDefault: () => e.preventDefault(),
      button: 0 // Simulate left button for touch events
    };
    
    onDragStart(touchEvent);
    
    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    document.addEventListener('touchend', touchEndHandler);
    document.addEventListener('touchcancel', touchEndHandler);
  };
  
  const touchMoveHandler = (e) => {
    if (!e || !e.touches || e.touches.length === 0) return;
    
    e.preventDefault(); // Prevent scrolling
    
    const touch = e.touches[0];
    const touchEvent = {
      type: 'touchmove', // Add type
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => e.preventDefault()
    };
    
    onDragMove(touchEvent);
  };
  
  const touchEndHandler = (e) => {
    // No need to create a synthetic event if onDragEnd doesn't use it
    onDragEnd(); // Call without event argument
    
    document.removeEventListener('touchmove', touchMoveHandler);
    document.removeEventListener('touchend', touchEndHandler);
    document.removeEventListener('touchcancel', touchEndHandler);
  };
  
  // Attach handlers to element
  element.addEventListener('mousedown', mouseDownHandler);
  element.addEventListener('touchstart', touchStartHandler, { passive: false });
  
  // Return cleanup function
  return function cleanup() {
    // Remove element level listeners
    element.removeEventListener('mousedown', mouseDownHandler);
    element.removeEventListener('touchstart', touchStartHandler);
    
    // Clean up any document level listeners that might be active
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
    document.removeEventListener('touchmove', touchMoveHandler);
    document.removeEventListener('touchend', touchEndHandler);
    document.removeEventListener('touchcancel', touchEndHandler);
  };
}

/**
 * Register event delegation for a container
 * @param {HTMLElement} container - Container element
 * @param {string} selector - CSS selector for target elements
 * @param {string} eventType - Type of event to listen for
 * @param {Function} handler - Event handler function
 */
export function delegateEvent(container, selector, eventType, handler) {
  if (!container) return;
  
  const delegatedHandler = (e) => {
    let target = e.target;
    
    // Traverse up the DOM until we find the matching selector or reach the container
    while (target && target !== container) {
      if (target.matches(selector)) {
        handler.call(target, e);
        break;
      }
      target = target.parentNode;
    }
  };
  
  attachEventWithCleanup(container, eventType, delegatedHandler);
  
  // Return a cleanup function
  return () => {
    container.removeEventListener(eventType, delegatedHandler);
  };
}