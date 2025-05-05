/**
 * Touch-specific interactions and optimizations for the Easter Egg Hunt game
 */

import { isTouchEnabled } from './state.js';
import { TOUCH } from './config.js';

/**
 * Initialize all touch-related functionality
 */
export function init() {
  initFastClick();
  ensureViewportMeta();
  handleOrientationChange();
  addTouchFeedback();
  
  console.log('Touch module initialized');
}

/**
 * Check if device supports touch
 * @returns {boolean} True if touch is supported
 */
export function isTouchDevice() {
  return isTouchEnabled();
}

/**
 * Initialize FastClick to eliminate 300ms delay on mobile devices
 */
export function initFastClick() {
  if (!isTouchDevice()) return;
  
  // Simple FastClick implementation
  document.addEventListener('touchstart', function(e) {
    // Guard against invalid touch events
    if (!e || !e.touches || e.touches.length === 0) return;
    
    // Store touch start time and position
    const touchStartTime = Date.now();
    const touch = e.touches[0];
    const touchStartX = touch.clientX;
    const touchStartY = touch.clientY;
    
    // Function to handle touch end
    const handleTouchEnd = function(e2) {
      // Guard against invalid touch end events
      if (!e2 || !e2.changedTouches || e2.changedTouches.length === 0) return;
      
      // Check if it was a quick tap (less than 300ms)
      const touchTime = Date.now() - touchStartTime;
      
      if (touchTime < 300) {
        // Only prevent default if it was a tap, not a drag
        const touch2 = e2.changedTouches[0];
        const touchEndX = touch2.clientX;
        const touchEndY = touch2.clientY;
        
        // Calculate distance moved
        const distance = Math.sqrt(
          Math.pow(touchEndX - touchStartX, 2) + 
          Math.pow(touchEndY - touchStartY, 2)
        );
        
        // If barely moved, consider it a tap
        if (distance < TOUCH.DRAG_THRESHOLD) {
          // Create and dispatch a synthetic click event
          try {
            // Prevent default click behavior
            e2.preventDefault();
            
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
              detail: 1,
              screenX: touchEndX,
              screenY: touchEndY,
              clientX: touchEndX,
              clientY: touchEndY
            });
            
            // Get the element at the touch position
            const targetElement = document.elementFromPoint(touchEndX, touchEndY);
            if (targetElement) {
              // Dispatch click event at touch position
              targetElement.dispatchEvent(clickEvent);
            }
          } catch (err) {
            console.error('Error in FastClick:', err);
          }
        }
      }
      
      // Clean up listeners
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
    
    // Handle touch cancel
    const handleTouchCancel = function() {
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
    
    // Add temporary listeners for this touch sequence
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchCancel);
  });
}

/**
 * Add event listeners for both mouse and touch events to an area
 * @param {HTMLElement} area - The element to add listeners to
 * @param {Object} handlers - Object containing event handlers
 * @param {Function} handlers.click - Click/tap handler
 * @param {Function} [handlers.mouseDown] - Mouse down handler
 * @param {Function} [handlers.mouseMove] - Mouse move handler
 * @param {Function} [handlers.mouseUp] - Mouse up handler
 * @param {Function} [handlers.touchStart] - Touch start handler
 * @param {Function} [handlers.touchMove] - Touch move handler
 * @param {Function} [handlers.touchEnd] - Touch end handler
 * @param {Function} [handlers.enter] - Mouse enter handler
 * @param {Function} [handlers.leave] - Mouse leave handler
 */
export function addAreaEventListeners(area, handlers) {
  if (!area) return;
  
  // Basic click event (works for both mouse and touch after FastClick)
  if (handlers.click) {
    area.addEventListener('click', function(e) {
      if (e) handlers.click(e);
    });
  }
  
  // Mouse-specific events
  if (handlers.mouseDown) {
    area.addEventListener('mousedown', function(e) {
      if (e) handlers.mouseDown(e);
    });
  }
  
  if (handlers.mouseMove) {
    area.addEventListener('mousemove', function(e) {
      if (e) handlers.mouseMove(e);
    });
  }
  
  if (handlers.mouseUp) {
    area.addEventListener('mouseup', function(e) {
      if (e) handlers.mouseUp(e);
    });
    
    // Also listen for mouse up on document to handle case where mouse is released outside the element
    document.addEventListener('mouseup', function(e) {
      if (e) handlers.mouseUp(e);
    });
  }
  
  // Touch-specific events
  if (handlers.touchStart) {
    area.addEventListener('touchstart', function(e) {
      if (e) handlers.touchStart(e);
    }, { passive: false });
  }
  
  if (handlers.touchMove) {
    area.addEventListener('touchmove', function(e) {
      if (e) handlers.touchMove(e);
    }, { passive: false });
  }
  
  if (handlers.touchEnd) {
    area.addEventListener('touchend', function(e) {
      if (e) handlers.touchEnd(e);
    });
    
    // Also listen for touch end on document to handle case where touch ends outside the element
    document.addEventListener('touchend', function(e) {
      if (e) handlers.touchEnd(e);
    });
  }
  
  // Hover events
  if (handlers.enter) {
    area.addEventListener('mouseenter', function(e) {
      if (e) handlers.enter(e);
    });
  }
  
  if (handlers.leave) {
    area.addEventListener('mouseleave', function(e) {
      if (e) handlers.leave(e);
    });
  }
}

/**
 * Remove event listeners from an area
 * @param {HTMLElement} area - The element to remove listeners from
 * @param {Object} handlers - Object containing event handlers
 */
export function removeAreaEventListeners(area, handlers) {
  if (!area) return;
  
  if (handlers.click) {
    area.removeEventListener('click', handlers.click);
  }
  
  if (handlers.mouseDown) {
    area.removeEventListener('mousedown', handlers.mouseDown);
  }
  
  if (handlers.mouseMove) {
    area.removeEventListener('mousemove', handlers.mouseMove);
  }
  
  if (handlers.mouseUp) {
    area.removeEventListener('mouseup', handlers.mouseUp);
    document.removeEventListener('mouseup', handlers.mouseUp);
  }
  
  if (handlers.touchStart) {
    area.removeEventListener('touchstart', handlers.touchStart);
  }
  
  if (handlers.touchMove) {
    area.removeEventListener('touchmove', handlers.touchMove);
  }
  
  if (handlers.touchEnd) {
    area.removeEventListener('touchend', handlers.touchEnd);
    document.removeEventListener('touchend', handlers.touchEnd);
  }
  
  if (handlers.enter) {
    area.removeEventListener('mouseenter', handlers.enter);
  }
  
  if (handlers.leave) {
    area.removeEventListener('mouseleave', handlers.leave);
  }
}

/**
 * Add visual feedback for touch interactions
 * @param {NodeList|HTMLElement[]} elements - Elements to add touch feedback to
 */
export function addTouchFeedback(elements) {
  if (!isTouchDevice()) return;
  
  if (!elements) {
    // If no elements provided, add to common interactive elements
    elements = document.querySelectorAll('button, .control-btn, .main-btn, .egg, .setup-egg');
  }
  
  elements.forEach(element => {
    element.addEventListener('touchstart', function() {
      this.classList.add('touch-active');
    });
    
    const endTouch = function() {
      this.classList.remove('touch-active');
    };
    
    element.addEventListener('touchend', endTouch);
    element.addEventListener('touchcancel', endTouch);
  });
  
  // Add touch-active style if it doesn't exist
  if (!document.querySelector('#touch-active-style')) {
    const style = document.createElement('style');
    style.id = 'touch-active-style';
    style.textContent = 
      '.touch-active {' +
      '  transform: scale(0.95);' +
      '  opacity: 0.8;' +
      '  transition: transform 0.1s, opacity 0.1s;' +
      '}';
    document.head.appendChild(style);
  }
}

/**
 * Ensure viewport meta tag is present for mobile devices
 */
export function ensureViewportMeta() {
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(meta);
  }
}

/**
 * Handle device orientation changes
 */
export function handleOrientationChange() {
  if (!isTouchDevice()) return;
  
  const orientationHandler = function() {
    // Adjust any elements that need to be repositioned on orientation change
    const gameArea = document.getElementById('game-container');
    
    if (gameArea && !gameArea.classList.contains('hidden')) {
      // Force a reflow to ensure proper positioning after orientation change
      gameArea.style.display = 'none';
      gameArea.offsetHeight; // Trigger reflow
      gameArea.style.display = '';
    }
    
    // Update any orientation-specific styles
    if (window.innerHeight > window.innerWidth) {
      // Portrait
      document.body.classList.add('portrait');
      document.body.classList.remove('landscape');
    } else {
      // Landscape
      document.body.classList.add('landscape');
      document.body.classList.remove('portrait');
    }
  };
  
  // Initial call
  orientationHandler();
  
  // Set up event listener
  window.addEventListener('orientationchange', orientationHandler);
  window.addEventListener('resize', orientationHandler);
}