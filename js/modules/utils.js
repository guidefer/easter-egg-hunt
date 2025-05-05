/**
 * Utility functions for the Easter Egg Hunt game
 */

import { GAME_VERSION } from './config.js';

/**
 * Generate a random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number in the specified range
 */
export function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Convert percentage value to pixels
 * @param {string|number} percentage - Percentage value (with or without % symbol)
 * @param {number} dimension - Total dimension in pixels
 * @returns {number} Equivalent pixel value
 */
export function percentageToPixels(percentage, dimension) {
    // Convert string percentage (e.g., "50%") to number (50)
    const numericValue = typeof percentage === 'string' ? 
        parseFloat(percentage) : percentage;
    
    return (numericValue / 100) * dimension;
}

/**
 * Convert pixel value to percentage
 * @param {number} pixels - Pixel value
 * @param {number} dimension - Total dimension in pixels
 * @returns {string} Percentage value with % symbol
 */
export function pixelsToPercentage(pixels, dimension) {
    return ((pixels / dimension) * 100) + '%';
}

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Time to wait in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if passive event listeners are supported
 * @returns {boolean} True if passive listeners are supported
 */
export function isPassiveSupported() {
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
    
    return passiveSupported;
}

/**
 * Update version display in the UI
 * @param {string} version - Version number to display
 */
export function updateVersionDisplay(version) {
    const versionElement = document.getElementById('game-version');
    if (versionElement) {
        versionElement.textContent = version || GAME_VERSION;
    }
}

/**
 * Detect if the current device is a mobile device
 * @returns {boolean} True if the device is mobile
 */
export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Show/hide the cursor after a period of inactivity
 * @param {boolean} visible - Whether the cursor should be visible
 */
export function setCursorVisibility(visible) {
    document.body.style.cursor = visible ? 'auto' : 'none';
}

/**
 * Create a unique ID for elements
 * @returns {string} Unique ID string
 */
export function generateUniqueId() {
    return Date.now().toString();
}

/**
 * Calculate distance between two points
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} Distance between points
 */
export function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}