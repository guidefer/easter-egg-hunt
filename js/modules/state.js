/**
 * State management for the Easter Egg Hunt game
 * Manages game state variables and provides functions to interact with them
 */

import { GAME_PHASES } from './config.js';
// Remove circular import of updateEggList from egg.js

/**
 * Game state object
 * Central store for all game state variables
 */
export const gameState = {
    // Egg data array (stores all egg information)
    eggData: [],
    
    // Current egg index and found count
    currentEggIndex: 0,
    foundCount: 0,
    
    // Currently selected egg ID for editing
    selectedEggId: null,
    
    // Currently dragged egg element
    draggedEgg: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    
    // Flag for new egg creation
    isNewEgg: false,
    
    // Current background image
    currentBackground: 'Living-room.png',
    
    // Touch support detection
    touchEnabled: 'ontouchstart' in window,
    
    // Sound enabled flag
    soundEnabled: true,
    
    // UI panel collapsed states
    huntUIPanelCollapsed: false,
    setupControlsCollapsed: false,
    
    // Auto-collapse timer IDs
    autoCollapseTimerId: null,
    setupAutoCollapseTimerId: null,
    
    // Current game phase
    gamePhase: GAME_PHASES.START,
    
    // Flag for hint usage
    hintUsed: false
};

/**
 * Get the egg data array
 * @returns {Array} Array of egg data objects
 */
export function getEggData() {
    return gameState.eggData;
}

/**
 * Set the egg data array
 * @param {Array} data - Array of egg data objects
 */
export function setEggData(data) {
    gameState.eggData = data;
}

/**
 * Adds a new egg to the eggData array and renumbers all eggs
 * @param {Object} eggInfo - Information about the new egg
 */
export function addEgg(eggInfo) {
    gameState.eggData.push(eggInfo);
    renumberEggs(); // Renumber after adding
    // updateEggList is called after addEgg in the calling context (e.g., saveEggFromModal)
}

/**
 * Update an existing egg
 * @param {number|string} eggId - ID of the egg to update
 * @param {Object} updates - Object containing properties to update
 * @returns {boolean} True if the egg was updated, false otherwise
 */
export function updateEgg(eggId, updates) {
    const eggIndex = gameState.eggData.findIndex(egg => egg.id === eggId);
    
    if (eggIndex !== -1) {
        gameState.eggData[eggIndex] = { ...gameState.eggData[eggIndex], ...updates };
        return true;
    }
    
    return false;
}

/**
 * Removes an egg from the eggData array by ID and renumbers remaining eggs
 * @param {string|number} eggId - ID of the egg to remove
 */
export function removeEgg(eggId) {
    gameState.eggData = gameState.eggData.filter(egg => egg.id != eggId);
    renumberEggs(); // Renumber after removing
    // updateEggList is called after removeEgg in the calling context (e.g., removeEggFromModal)
}

/**
 * Set the current egg index
 * @param {number} index - New index
 */
export function setCurrentEggIndex(index) {
    gameState.currentEggIndex = index;
}

/**
 * Increment the current egg index
 * @returns {number} New index
 */
export function incrementCurrentEggIndex() {
    gameState.currentEggIndex++;
    return gameState.currentEggIndex;
}

/**
 * Get the current egg index
 * @returns {number} Current index
 */
export function getCurrentEggIndex() {
    return gameState.currentEggIndex;
}

/**
 * Set the found count
 * @param {number} count - New count
 */
export function setFoundCount(count) {
    gameState.foundCount = count;
}

/**
 * Increment the found count
 * @returns {number} New count
 */
export function incrementFoundCount() {
    gameState.foundCount++;
    return gameState.foundCount;
}

/**
 * Get the found count
 * @returns {number} Found count
 */
export function getFoundCount() {
    return gameState.foundCount;
}

/**
 * Set the selected egg ID
 * @param {number|string|null} id - Selected egg ID or null
 */
export function setSelectedEggId(id) {
    gameState.selectedEggId = id;
}

/**
 * Get the selected egg ID
 * @returns {number|string|null} Selected egg ID
 */
export function getSelectedEggId() {
    return gameState.selectedEggId;
}

/**
 * Set the dragged egg element
 * @param {HTMLElement|null} egg - Egg element or null
 */
export function setDraggedEgg(egg) {
    gameState.draggedEgg = egg;
}

/**
 * Get the dragged egg element
 * @returns {HTMLElement|null} Dragged egg element
 */
export function getDraggedEgg() {
    return gameState.draggedEgg;
}

/**
 * Set drag offset values
 * @param {number} x - X offset
 * @param {number} y - Y offset
 */
export function setDragOffset(x, y) {
    gameState.dragOffsetX = x;
    gameState.dragOffsetY = y;
}

/**
 * Get drag offset values
 * @returns {Object} Object with x and y offsets
 */
export function getDragOffset() {
    return {
        x: gameState.dragOffsetX,
        y: gameState.dragOffsetY
    };
}

/**
 * Set new egg flag
 * @param {boolean} isNew - Is this a new egg
 */
export function setIsNewEgg(isNew) {
    gameState.isNewEgg = isNew;
}

/**
 * Get new egg flag
 * @returns {boolean} Is this a new egg
 */
export function isNewEgg() {
    return gameState.isNewEgg;
}

/**
 * Set current background image
 * @param {string} background - Background image path or data URL
 */
export function setCurrentBackground(background) {
    gameState.currentBackground = background;
}

/**
 * Get current background image
 * @returns {string} Background image path or data URL
 */
export function getCurrentBackground() {
    return gameState.currentBackground;
}

/**
 * Check if touch is enabled
 * @returns {boolean} True if touch is enabled
 */
export function isTouchEnabled() {
    return gameState.touchEnabled;
}

/**
 * Set sound enabled state
 * @param {boolean} enabled - Whether sound is enabled
 */
export function setSoundEnabled(enabled) {
    gameState.soundEnabled = enabled;
}

/**
 * Get sound enabled state
 * @returns {boolean} Whether sound is enabled
 */
export function isSoundEnabled() {
    return gameState.soundEnabled;
}

/**
 * Toggle sound enabled state
 * @returns {boolean} New sound enabled state
 */
export function toggleSoundEnabled() {
    gameState.soundEnabled = !gameState.soundEnabled;
    return gameState.soundEnabled;
}

/**
 * Set hunt UI panel collapsed state
 * @param {boolean} collapsed - Whether the panel is collapsed
 */
export function setHuntUIPanelCollapsed(collapsed) {
    gameState.huntUIPanelCollapsed = collapsed;
}

/**
 * Get hunt UI panel collapsed state
 * @returns {boolean} Whether the panel is collapsed
 */
export function isHuntUIPanelCollapsed() {
    return gameState.huntUIPanelCollapsed;
}

/**
 * Set setup controls collapsed state
 * @param {boolean} collapsed - Whether the controls are collapsed
 */
export function setSetupControlsCollapsed(collapsed) {
    gameState.setupControlsCollapsed = collapsed;
}

/**
 * Get setup controls collapsed state
 * @returns {boolean} Whether the controls are collapsed
 */
export function isSetupControlsCollapsed() {
    return gameState.setupControlsCollapsed;
}

/**
 * Set auto-collapse timer ID
 * @param {number|null} timerId - Timer ID or null
 */
export function setAutoCollapseTimerId(timerId) {
    gameState.autoCollapseTimerId = timerId;
}

/**
 * Get auto-collapse timer ID
 * @returns {number|null} Timer ID or null
 */
export function getAutoCollapseTimerId() {
    return gameState.autoCollapseTimerId;
}

/**
 * Set setup auto-collapse timer ID
 * @param {number|null} timerId - Timer ID or null
 */
export function setSetupAutoCollapseTimerId(timerId) {
    gameState.setupAutoCollapseTimerId = timerId;
}

/**
 * Get setup auto-collapse timer ID
 * @returns {number|null} Timer ID or null
 */
export function getSetupAutoCollapseTimerId() {
    return gameState.setupAutoCollapseTimerId;
}

/**
 * Set game phase
 * @param {string} phase - Game phase (from GAME_PHASES)
 */
export function setGamePhase(phase) {
    gameState.gamePhase = phase;
}

/**
 * Get game phase
 * @returns {string} Current game phase
 */
export function getGamePhase() {
    return gameState.gamePhase;
}

/**
 * Set hint used flag
 * @param {boolean} used - Whether hint was used
 */
export function setHintUsed(used) {
    gameState.hintUsed = used;
}

/**
 * Get hint used flag
 * @returns {boolean} Whether hint was used
 */
export function isHintUsed() {
    return gameState.hintUsed;
}

/**
 * Find the next available egg number
 * @returns {number} Next available egg number
 */
export function findNextAvailableEggNumber() {
    // Since renumbering happens on add/remove, the next number is just count + 1
    return gameState.eggData.length + 1;
}

/**
 * Sorts eggs by number property
 * @returns {Array} Sorted egg data array
 */
export function sortEggsByNumber() {
  gameState.eggData.sort((a, b) => a.number - b.number);
  return gameState.eggData; // Return the sorted array
}

/**
 * Renumbers all eggs sequentially starting from 1
 */
export function renumberEggs() {
  sortEggsByNumber(); // Ensure eggs are sorted before renumbering
  gameState.eggData.forEach((egg, index) => {
    egg.number = index + 1;
  });
  // Note: We don't call updateEggList here directly.
  // It should be called by the function that triggered the add/remove/update.
}

/**
 * Reset game state for a new game
 */
export function resetGameState() {
    gameState.currentEggIndex = 0;
    gameState.foundCount = 0;
    gameState.hintUsed = false;
    setGamePhase(GAME_PHASES.SETUP);
}

/**
 * Reset all state to initial values
 */
export function resetAllState() {
    gameState.eggData = [];
    resetGameState();
    gameState.selectedEggId = null;
    gameState.draggedEgg = null;
    gameState.dragOffsetX = 0;
    gameState.dragOffsetY = 0;
    gameState.isNewEgg = false;
    gameState.huntUIPanelCollapsed = false;
    gameState.setupControlsCollapsed = false;
    
    // Don't reset background or sound preferences
    // gameState.currentBackground = 'Living-room.png';
    // gameState.soundEnabled = true;
    
    // Clear any existing timers
    if (gameState.autoCollapseTimerId) {
        clearTimeout(gameState.autoCollapseTimerId);
        gameState.autoCollapseTimerId = null;
    }
    
    if (gameState.setupAutoCollapseTimerId) {
        clearTimeout(gameState.setupAutoCollapseTimerId);
        gameState.setupAutoCollapseTimerId = null;
    }
}