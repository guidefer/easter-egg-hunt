/**
 * Egg creation and management for the Easter Egg Hunt game
 */

import { ANIMATION_TYPES } from './config.js';
import { 
  setDraggedEgg, getDraggedEgg, setDragOffset, getDragOffset,
  addEgg, updateEgg, removeEgg, getEggData, setSelectedEggId, getSelectedEggId,
  findNextAvailableEggNumber, sortEggsByNumber
} from './state.js';
import { createElement, uiElements } from './dom.js';
import { randomInRange, generateUniqueId, pixelsToPercentage, percentageToPixels } from './utils.js';
import { registerDragHandlers } from './events.js';
import { createCelebration, createCelebratingBunny, createPawprintTrail } from './animation.js';
import { SoundManager } from './sound.js';
import { showEditEggModal } from './modal.js';

/**
 * Create a visual egg element in the setup mode
 * @param {Object} eggInfo - Egg information object
 * @param {HTMLElement} container - Container to append the egg to
 * @returns {HTMLElement} The created egg element
 */
export function createVisualEgg(eggInfo, container) {
  // Default container is egg placement area
  if (!container) {
    container = uiElements.setup.eggPlacementArea;
  }
  
  // Create egg element
  const egg = createElement('div', {
    class: ['setup-egg'],
    attributes: {
      'data-egg-id': eggInfo.id,
      'data-egg-number': eggInfo.number,
      'style': 'transform: translate(-50%, -50%);' // Ensure transform is applied from creation
    }
  });
  
  // Set egg position (these will be the center point with transform applied)
  egg.style.left = eggInfo.left;
  egg.style.top = eggInfo.top;
  
  // Add egg number
  const eggNumber = createElement('span', {
    class: 'egg-number',
    text: eggInfo.number
  });
  
  egg.appendChild(eggNumber);
  
  // Add to container
  container.appendChild(egg);
  
  // Set up drag-and-drop functionality
  setupEggDragAndDrop(egg);
  
  return egg;
}

/**
 * Update a visual egg element
 * @param {Object} eggInfo - Updated egg information
 * @returns {HTMLElement|null} Updated egg element or null if not found
 */
export function updateVisualEgg(eggInfo) {
  const egg = document.querySelector(`.setup-egg[data-egg-id="${eggInfo.id}"]`);
  if (!egg) return null;
  
  // Update position if specified
  if (eggInfo.left !== undefined) {
    egg.style.left = eggInfo.left;
  }
  
  if (eggInfo.top !== undefined) {
    egg.style.top = eggInfo.top;
  }
  
  // Update number if specified
  if (eggInfo.number !== undefined) {
    egg.setAttribute('data-egg-number', eggInfo.number);
    const numElement = egg.querySelector('.egg-number');
    if (numElement) {
      numElement.textContent = eggInfo.number;
    }
  }
  
  return egg;
}

/**
 * Update all visual egg numbers to match their data
 * This is useful after renumbering eggs
 */
export function updateAllVisualEggNumbers() {
  const eggData = getEggData();
  const setupEggs = document.querySelectorAll('.setup-egg');
  
  setupEggs.forEach(eggElement => {
    // Get the egg ID without parsing as integer to avoid issues with non-numeric IDs
    const eggId = eggElement.getAttribute('data-egg-id');
    
    // Find the matching egg data by comparing as strings for safety
    const eggInfo = eggData.find(egg => String(egg.id) === String(eggId));
    
    if (eggInfo) {
      // Update the data-egg-number attribute
      eggElement.setAttribute('data-egg-number', eggInfo.number);
      
      // Find and update the span.egg-number element inside this egg
      const numElement = eggElement.querySelector('.egg-number');
      if (numElement) {
        // Directly update the span text content
        numElement.textContent = eggInfo.number;
      }
    }
  });
}

/**
 * Create all game eggs for the hunt mode
 */
export function createGameEggs() {
  const gameContainer = document.getElementById('game-container');
  const eggData = getEggData();
  
  // Clear any existing eggs
  clearGameEggs();
  
  // Create each egg
  eggData.forEach((eggInfo) => {
    createGameEgg(eggInfo, gameContainer);
  });
  
  // Update which eggs are clickable
  updateClickableEggs();
}

/**
 * Create a single game egg element
 * @param {Object} eggInfo - Egg information object
 * @param {HTMLElement} container - Container to append the egg to
 * @returns {HTMLElement} The created egg element
 */
function createGameEgg(eggInfo, container) {
  // Create the egg element
  const egg = createElement('div', {
    class: ['egg', 'hidden'],
    attributes: {
      'data-egg-id': eggInfo.id,
      'data-egg-number': eggInfo.number
    },
    parent: container
  });
  
  // Set position
  egg.style.left = eggInfo.left;
  egg.style.top = eggInfo.top;
  
  // Store original position in dataset for pawprint trail
  egg.dataset.originalLeft = eggInfo.left.replace('%', '');
  egg.dataset.originalTop = eggInfo.top.replace('%', '');
  
  // Add a random animation class
  const animClass = ANIMATION_TYPES[randomInRange(0, ANIMATION_TYPES.length - 1)];
  egg.classList.add(animClass);
  
  // Add click and mouse event handlers for egg interactions
  egg.addEventListener('click', handleEggClick);
  egg.addEventListener('mouseenter', handleEggHover);
  egg.addEventListener('mouseleave', handleEggMouseLeave);
  
  return egg;
}

/**
 * Clear all game eggs
 */
function clearGameEggs() {
  const gameContainer = document.getElementById('game-container');
  const eggs = gameContainer.querySelectorAll('.egg');
  eggs.forEach(egg => egg.remove());
}

/**
 * Update which eggs are clickable based on the current egg index
 */
export function updateClickableEggs() {
  const gameContainer = document.getElementById('game-container');
  const eggData = getEggData();
  const currentEggIndex = document.getElementById('clue-number') ? 
    parseInt(document.getElementById('clue-number').textContent) - 1 : 0;
    
  // Get the current egg to find
  const currentEgg = eggData[currentEggIndex];
  if (!currentEgg) return;
  
  // Get all egg elements
  const eggs = gameContainer.querySelectorAll('.egg');
  
  eggs.forEach(egg => {
    const eggId = egg.getAttribute('data-egg-id');
    
    // Make only the current egg clickable
    if (eggId === currentEgg.id.toString()) {
      egg.classList.remove('hidden');
      egg.classList.add('clickable');
    } else {
      egg.classList.remove('clickable');
      if (!egg.classList.contains('found')) {
        egg.classList.add('hidden');
      }
    }
  });
}

/**
 * Handle when an egg is found
 * @param {HTMLElement} eggElement - The found egg element
 */
export function eggFound(eggElement) {
  // Mark egg as found
  eggElement.classList.add('found');
  eggElement.classList.remove('clickable');
  
  // Play sound
  SoundManager.play('eggFound');
  
  // Get position for animations
  const left = eggElement.style.left;
  const top = eggElement.style.top;
  
  // Add celebration effects
  createCelebration(left, top);
  createCelebratingBunny(left, top);
  
  // Update next egg
  updateClickableEggs();
  
  // Create pawprint trail to next egg if applicable
  const eggData = getEggData();
  const newEggIndex = document.getElementById('clue-number') ?
    parseInt(document.getElementById('clue-number').textContent) - 1 : 0;
  
  if (newEggIndex < eggData.length) {
    // Find the next egg element
    const nextEgg = document.querySelector(`.egg[data-egg-id="${eggData[newEggIndex].id}"]`);
    if (nextEgg) {
      // Create pawprint trail from the found egg to the next one
      createPawprintTrail(eggElement, nextEgg);
    }
  }
}

/**
 * Handle click on an egg
 * @param {Event} e - Click event
 */
export function handleEggClick(e) {
  const egg = e.currentTarget;
  
  // Only handle clickable eggs
  if (!egg.classList.contains('clickable')) return;
  
  eggFound(egg);
}

/**
 * Handle mouse hover over an egg
 * @param {Event} e - Mouse enter event
 */
export function handleEggHover(e) {
  const egg = e.currentTarget;
  
  // Only handle clickable eggs
  if (!egg.classList.contains('clickable')) return;
  
  egg.classList.add('hover');
}

/**
 * Handle mouse leaving an egg
 * @param {Event} e - Mouse leave event
 */
export function handleEggMouseLeave(e) {
  const egg = e.currentTarget;
  egg.classList.remove('hover');
}

/**
 * Create a new egg at a specific position
 * @param {number} x - X coordinate (pixels)
 * @param {number} y - Y coordinate (pixels)
 * @returns {Object} New egg data object
 */
export function createNewEggAtPosition(x, y) {
  // Safeguard against invalid coordinates
  if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) {
    console.warn('Invalid coordinates for new egg:', x, y);
    return null;
  }
  
  const container = uiElements.setup.eggPlacementArea;
  if (!container) return null;
  
  try {
    // Convert pixel coordinates to percentages
    const rect = container.getBoundingClientRect();
    const left = pixelsToPercentage(x - rect.left, rect.width);
    const top = pixelsToPercentage(y - rect.top, rect.height);
    
    // Find next available egg number
    const nextNumber = findNextAvailableEggNumber();
    
    // Create egg data object
    const eggInfo = {
      id: generateUniqueId(),
      number: nextNumber,
      left: left,
      top: top,
      clue: 'Look for egg #' + nextNumber,
      isNew: true
    };
    
    // Add to egg data
    addEgg(eggInfo);
    
    // Create visual egg
    createVisualEgg(eggInfo, container);
    
    // Update the egg list in setup UI
    updateEggList();
    
    // Set the selected egg ID for the modal
    setSelectedEggId(eggInfo.id);
    
    // Import and show the EDIT egg modal for the newly created egg
    import('./modal.js').then(modal => {
      // Call showEditEggModal instead of showAddEggModal
      modal.showEditEggModal(eggInfo.id);
    }).catch(err => {
      console.error('Failed to load modal module:', err);
    });
    
    return eggInfo;
  } catch (err) {
    console.error('Error creating new egg:', err);
    return null;
  }
}

/**
 * Set up drag-and-drop functionality for an egg
 * @param {HTMLElement} egg - The egg element
 */
function setupEggDragAndDrop(egg) {
  // Register drag handlers for this egg
  registerDragHandlers(egg, 
    // Start drag
    (e) => startDrag(e),
    // Move
    (e) => dragMove(e),
    // End drag
    () => dragEnd()
  );
}

/**
 * Handle start of egg dragging
 * @param {Event} e - Mouse down or touch start event
 */
export function startDrag(e) {
  // Safeguard against null events or missing properties
  if (!e) return;
  
  // Only allow left mouse button for dragging (button 0)
  // Check button property existence before comparing
  if (e.button !== undefined && e.button !== 0) return;
  
  const egg = e.target ? e.target.closest('.setup-egg') : null;
  if (!egg) return;
  
  // Set the dragged egg
  setDraggedEgg(egg);
  
  // No need to calculate offset, we will center the egg on the cursor in dragMove
  // setDragOffset(offsetX, offsetY);
  
  // Add dragging class
  egg.classList.add('dragging');
  
  // Immediately move the egg to the centered position
  dragMove(e);
  
  // Prevent default behavior if preventDefault exists
  if (e.preventDefault) {
    e.preventDefault();
  }
}

/**
 * Handle egg movement during drag
 * @param {Event} e - Mouse move or touch move event
 */
export function dragMove(e) {
  // Safeguard against null events
  if (!e) return;
  
  const draggedEgg = getDraggedEgg();
  if (!draggedEgg) return;
  
  // Get the container
  const container = uiElements.setup.eggPlacementArea;
  if (!container) return;
  
  // Get container boundaries
  const rect = container.getBoundingClientRect();
  
  // Only proceed if we have clientX/Y coordinates
  if (e.clientX === undefined || e.clientY === undefined) return;
  
  // Calculate cursor position relative to container
  const cursorX = e.clientX - rect.left;
  const cursorY = e.clientY - rect.top;
  
  // Convert to percentages - this will be the *center* of the egg
  // No need to adjust for egg dimensions since CSS transform: translate(-50%, -50%) centers the egg
  const newLeftPercent = pixelsToPercentage(cursorX, rect.width);
  const newTopPercent = pixelsToPercentage(cursorY, rect.height);
  
  // Update egg position visually
  draggedEgg.style.left = newLeftPercent;
  draggedEgg.style.top = newTopPercent;
  
  // Update egg data in state (the state also stores the center position)
  const eggId = draggedEgg.getAttribute('data-egg-id');
  updateEgg(eggId, {
    left: newLeftPercent,
    top: newTopPercent
  });
  
  // Prevent default behavior if preventDefault exists
  if (e.preventDefault) {
    e.preventDefault();
  }
}

/**
 * Handle end of egg dragging
 */
export function dragEnd() {
  const draggedEgg = getDraggedEgg();
  
  if (draggedEgg) {
    // The last call to dragMove should have already set the correct
    // style and updated the state. We only need to clean up.
    
    // Remove dragging class
    draggedEgg.classList.remove('dragging');
    
    // Clear dragged egg reference
    setDraggedEgg(null);
  }
}

/**
 * Update the egg list in setup UI
 */
export function updateEggList() {
  const eggList = uiElements.setup.eggList;
  if (!eggList) {
    console.warn('Egg list element not found');
    return;
  }
  
  // Clear existing list
  eggList.innerHTML = '';
  
  try {
    // Update all visual egg numbers first to ensure consistency
    updateAllVisualEggNumbers();
    
    // Get egg data and sort by number
    const eggData = sortEggsByNumber();
    
    // Make sure we have egg data
    if (!eggData || !Array.isArray(eggData) || eggData.length === 0) {
      console.log('No eggs found or empty egg data');
      
      // Update the start game button for empty egg list
      const startButton = uiElements.buttons.startGame;
      if (startButton) {
        startButton.disabled = true;
        startButton.textContent = 'Start the Hunt! (0 eggs)';
      }
      return;
    }
    
    // Create list items for each egg
    eggData.forEach(egg => {
      if (!egg) return; // Skip null/undefined eggs
      
      // Create list item
      const listItem = createElement('li', {
        class: 'egg-list-item', // Add class for styling
        attributes: {
          'data-egg-id': egg.id
        }
      });
      
      // Create container for text content (number + clue)
      const textContainer = createElement('div', {
        class: 'egg-list-text-container' // Add class for styling
      });
      
      // Add egg number
      const eggLabelText = 'Egg #' + egg.number + ': ';
      const eggLabel = createElement('span', {
        class: 'egg-list-number',
        text: eggLabelText
      });
      
      // Add clue text
      const clueText = createElement('span', {
        class: 'egg-list-clue-text', // Add class for styling
        text: egg.clue || 'No clue set'
      });
      
      // Create edit button
      const editButton = createElement('button', {
        class: ['control-btn', 'egg-list-edit-btn'], // Add specific class
        text: 'Edit',
        attributes: {
          'title': 'Edit this egg'
        }
      });
      
      // Add click handler for edit button
      editButton.addEventListener('click', () => {
        setSelectedEggId(egg.id);
        showEditEggModal(egg.id);
      });
      
      // Append children to containers
      textContainer.appendChild(eggLabel);
      textContainer.appendChild(clueText);
      
      // Add containers to list item
      listItem.appendChild(textContainer);
      listItem.appendChild(editButton);
      
      // Add to egg list
      eggList.appendChild(listItem);
    });
    
    // Update the start game button status
    const startButton = uiElements.buttons.startGame;
    if (startButton) {
      if (eggData.length > 0) {
        startButton.disabled = false;
        startButton.textContent = 'Start the Hunt! (' + eggData.length + ' eggs)';
      } else {
        startButton.disabled = true;
        startButton.textContent = 'Start the Hunt! (0 eggs)';
      }
    }
  } catch (err) {
    console.error('Error updating egg list:', err);
  }
}