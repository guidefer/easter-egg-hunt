/**
 * Modal dialog handling for the Easter Egg Hunt game
 */

import { uiElements, modals } from './dom.js';
import { getEggData, getSelectedEggId, setSelectedEggId, // Import setSelectedEggId
         findNextAvailableEggNumber, addEgg, // Import addEgg
         removeEgg, updateEgg, isNewEgg, renumberEggs } from './state.js'; // Import renumberEggs
import { createVisualEgg, updateVisualEgg, updateEggList } from './egg.js'; // Import createVisualEgg
import { isSoundEnabled, toggleSoundEnabled } from './state.js';
import { SoundManager } from './sound.js';
import { showConfetti } from './animation.js';
import { generateUniqueId, randomInRange } from './utils.js'; // Import generateUniqueId and randomInRange
import { BACKGROUND_PRESETS } from './config.js';
import { updateBackgroundImage } from './camera.js';
import { createElement } from './dom.js';

let selectedPresetId = null;

// Default clue text template - will be auto-cleared on first focus
const DEFAULT_CLUE_TEXT_TEMPLATE = 'Look for egg #';
let isFirstClueInteraction = true;

/**
 * Show the modal for adding a new egg
 */
export function showAddEggModal() {
  const eggModal = modals.egg;
  const { modal } = uiElements;
  
  if (!eggModal) {
    console.error('Egg modal not found');
    return;
  }
  
  // Ensure selectedEggId is null for this flow
  setSelectedEggId(null);
  
  // Set modal title
  const title = eggModal.querySelector('h3');
  if (title) {
    title.textContent = 'Add New Egg';
  }
  
  // Get next available egg number
  const nextNumber = findNextAvailableEggNumber();
  
  // Set up form fields
  if (modal.eggNumber) {
    modal.eggNumber.value = nextNumber; // Set hidden input value
  }
  
  // Update the display-only egg number
  if (modal.eggNumberDisplay) {
    modal.eggNumberDisplay.textContent = nextNumber; // Set span text
  }
  
  // Reset first interaction flag for new egg
  isFirstClueInteraction = true;
  
  if (modal.eggClue) {
    const defaultText = DEFAULT_CLUE_TEXT_TEMPLATE + nextNumber;
    modal.eggClue.value = defaultText;
    
    // Remove any existing event listeners to prevent duplicates
    modal.eggClue.removeEventListener('focus', handleClueFieldFocus);
    
    // Add focus listener to clear default text
    modal.eggClue.addEventListener('focus', handleClueFieldFocus);
  }
  
  // Show remove button (hidden for new eggs)
  if (modal.removeBtn) {
    modal.removeBtn.style.display = 'none';
  }
  
  // Show the modal
  eggModal.classList.remove('hidden');
  
  // Don't auto-focus the clue field - let user click on it when they're ready
  // This prevents the default text from being cleared prematurely
}

/**
 * Show the modal for editing an existing egg
 * @param {string|number} eggId - ID of egg to edit
 */
export function showEditEggModal(eggId) {
  const eggModal = modals.egg;
  const { modal } = uiElements;
  
  if (!eggModal) {
    console.error('Egg modal not found');
    return;
  }
  
  // Set modal title
  const title = eggModal.querySelector('h3');
  if (title) {
    title.textContent = 'Edit Egg';
  }
  
  // Store the selected egg ID
  setSelectedEggId(eggId);
  
  // Find egg data by ID
  const eggData = getEggData();
  const egg = eggData.find(e => e.id == eggId);
  
  if (!egg) return;
  
  // Set up form fields
  if (modal.eggNumber) {
    modal.eggNumber.value = egg.number; // Set hidden input value
  }
  
  // Update the display-only egg number
  if (modal.eggNumberDisplay) {
    modal.eggNumberDisplay.textContent = egg.number; // Set span text
  }
  
  if (modal.eggClue) {
    const defaultText = DEFAULT_CLUE_TEXT_TEMPLATE + egg.number;
    const hasCustomClue = egg.clue && egg.clue.trim() !== '' && 
                         egg.clue !== defaultText;
    
    // Remove any existing event listeners to prevent duplicates
    modal.eggClue.removeEventListener('focus', handleClueFieldFocus);
    
    // Reset first interaction flag based on whether we have a custom clue
    isFirstClueInteraction = !hasCustomClue;
    
    if (hasCustomClue) {
      // Use existing custom clue
      modal.eggClue.value = egg.clue;
    } else {
      // Use default text and set up auto-clear
      modal.eggClue.value = defaultText;
      
      // Add focus listener to clear default text
      modal.eggClue.addEventListener('focus', handleClueFieldFocus);
    }
  }
  
  // Show remove button
  if (modal.removeBtn) {
    modal.removeBtn.style.display = '';
  }
  
  // Show the modal
  eggModal.classList.remove('hidden');
  
  // Don't auto-focus the clue field - let user click on it when they're ready
  // This prevents the default text from being cleared prematurely
}

/**
 * Handle focus on the clue text field
 * Clears default text on first interaction only
 */
function handleClueFieldFocus() {
  const { modal } = uiElements;
  if (!modal.eggClue) return;
  
  // Only clear if this is the first interaction and it contains the default text
  if (isFirstClueInteraction && modal.eggClue.value.startsWith(DEFAULT_CLUE_TEXT_TEMPLATE)) {
    modal.eggClue.value = '';
    // Mark that we've had our first interaction
    isFirstClueInteraction = false;
    // Remove the listener after the first interaction
    modal.eggClue.removeEventListener('focus', handleClueFieldFocus);
  }
}

/**
 * Close the active modal
 */
export function closeModal() {
  const allModals = document.querySelectorAll('.modal'); // Use querySelectorAll
  allModals.forEach(modal => {
    modal.classList.add('hidden');
  });
  // Clean up clue field listener when closing any modal
  if (uiElements.modal.eggClue) {
    uiElements.modal.eggClue.removeEventListener('focus', handleClueFieldFocus);
  }
}

/**
 * Save changes from the egg modal
 */
export function saveEggFromModal() {
  const eggModal = modals.egg;
  const { modal } = uiElements;
  
  if (!eggModal) {
    console.error('Egg modal not found');
    return;
  }
  
  // Get the state of selectedEggId *before* reading modal values
  const currentSelectedEggId = getSelectedEggId();
  const isAddingNew = currentSelectedEggId === null;
  
  // Get values from the form
  const eggNumber = parseInt(modal.eggNumber.value); // Read from hidden input
  let eggClue = modal.eggClue.value.trim();
  
  // If clue is empty or still default, use a standard clue
  if (!eggClue || eggClue.startsWith(DEFAULT_CLUE_TEXT_TEMPLATE)) {
    eggClue = DEFAULT_CLUE_TEXT_TEMPLATE + eggNumber;
  }
  
  // --- Logic based on Add vs Edit ---
  if (isAddingNew) {
    // ADDING A NEW EGG (via Add Egg button)
    const newId = generateUniqueId();
    const eggInfo = {
      id: newId,
      number: eggNumber, // Number is already determined by findNextAvailableEggNumber
      // Place randomly as there's no click position in this flow
      left: randomInRange(10, 90) + '%',
      top: randomInRange(10, 90) + '%',
      clue: eggClue,
      isNew: true // Mark as new for potential highlighting
    };
    
    addEgg(eggInfo); // This now calls renumberEggs internally
    createVisualEgg(eggInfo); // Create the visual representation
    
  } else {
    // UPDATING AN EXISTING EGG
    const eggId = currentSelectedEggId;
    if (!eggId) {
      console.error('No egg ID selected for editing.');
      return;
    }
    
    const updates = {
      // Number is not updated directly here, it's handled by renumbering if needed
      clue: eggClue
    };
    
    updateEgg(eggId, updates);
    // Visual egg number update happens in updateEggList after renumbering
  }
  
  // --- Common Post-Save Actions ---
  updateEggList(); // Update the list in setup UI (this will reflect renumbered eggs)
  closeModal(); // Close the modal
}

/**
 * Remove egg from the modal
 */
export function removeEggFromModal() {
  const eggId = getSelectedEggId();
  
  if (!eggId) return;
  
  // Confirm deletion
  if (!confirm('Are you sure you want to remove this egg?')) return;
  
  // Store egg data before removal for reference
  const eggData = getEggData();
  const eggBeingRemoved = eggData.find(egg => egg.id == eggId);
  
  if (!eggBeingRemoved) {
    console.error('Egg not found for removal');
    return;
  }
  
  // Get a copy of the data to find which eggs need to be renumbered
  const originalEggData = [...eggData];
  const eggNumberBeingRemoved = eggBeingRemoved.number;
  
  // Remove the egg data (this calls renumberEggs internally)
  removeEgg(eggId);
  
  // Remove the visual egg
  const visualEgg = document.querySelector('.setup-egg[data-egg-id="' + eggId + '"]');
  if (visualEgg) {
    visualEgg.remove();
  }
  
  // Update egg list with renumbered eggs
  updateEggList();
  
  // Close the modal
  closeModal();
}

/**
 * Show the congratulations modal
 */
export function showCongratsModal() {
  const congratsModal = modals.congrats;
  const { modal } = uiElements;
  
  if (!congratsModal) {
    console.error('Congrats modal not found');
    return;
  }
  
  // Show the modal
  congratsModal.classList.remove('hidden');
  
  // Show confetti
  showConfetti();
  
  // Play celebration sound
  SoundManager.play('celebration');
  
  // Set the message
  const eggData = getEggData();
  if (modal.congratsMessage) {
    modal.congratsMessage.innerHTML = `
      <h2>Congratulations!</h2>
      <p>You found all ${eggData.length} eggs!</p>
    `;
  }
}

/**
 * Open the settings modal
 */
export function openSettingsModal() {
  try {
    const settingsModal = modals.settings;
    
    if (!settingsModal) {
      console.error('Settings modal not found');
      return;
    }
    
    // Show the modal
    settingsModal.classList.remove('hidden');
    
    // Initialize settings
    initSettingsModal();
  } catch (err) {
    console.error('Error opening settings modal:', err);
  }
}

/**
 * Initialize the settings modal
 */
export function initSettingsModal() {
  try {
    const { settings, audio } = uiElements;
    
    if (!settings) {
      console.error('Settings elements not found');
      return;
    }
    
    // Define event handlers as named functions to be able to properly remove them
    function volumeChangeHandler(e) {
      if (!e || !e.target || typeof e.target.value !== 'string') return;
      const volume = parseInt(e.target.value) / 100;
      if (!isNaN(volume)) {
        SoundManager.setVolume(volume);
      }
    }
    
    function playPauseHandler() {
      SoundManager.toggleMusic();
      updatePlayPauseButton();
    }
    
    function nextTrackHandler() {
      SoundManager.nextTrack();
    }
    
    function soundToggleHandler() {
      toggleSoundEnabled();
      updateSoundToggleButton();
    }
    
    function closeHandler() {
      closeModal();
    }
    
    // Handle volume slider
    if (settings.volume && audio && audio.backgroundMusic) {
      // First remove any existing listeners to prevent duplicates
      settings.volume.removeEventListener('input', volumeChangeHandler);
      
      // Set current value
      settings.volume.value = Math.round(audio.backgroundMusic.volume * 100);
      
      // Add new listener
      settings.volume.addEventListener('input', volumeChangeHandler);
    }
    
    // Handle play/pause button
    if (settings.playPause) {
      // Remove existing listener if any
      settings.playPause.removeEventListener('click', playPauseHandler);
      
      // Update button state
      updatePlayPauseButton();
      
      // Add new listener
      settings.playPause.addEventListener('click', playPauseHandler);
    }
    
    // Handle next track button
    if (settings.nextTrack) {
      // Remove existing listener if any
      settings.nextTrack.removeEventListener('click', nextTrackHandler);
      
      // Add new listener
      settings.nextTrack.addEventListener('click', nextTrackHandler);
    }
    
    // Handle sound toggle button
    if (settings.soundToggle) {
      // Remove existing listener if any
      settings.soundToggle.removeEventListener('click', soundToggleHandler);
      
      // Update button state
      updateSoundToggleButton();
      
      // Add new listener
      settings.soundToggle.addEventListener('click', soundToggleHandler);
    }
    
    // Handle close button
    if (settings.closeBtn) {
      // Remove existing listener if any
      settings.closeBtn.removeEventListener('click', closeHandler);
      
      // Add new listener
      settings.closeBtn.addEventListener('click', closeHandler);
    }
  } catch (err) {
    console.error('Error initializing settings modal:', err);
  }
}

/**
 * Update the play/pause button state
 */
function updatePlayPauseButton() {
  const { settings } = uiElements;
  
  if (!settings.playPause) return;
  
  if (SoundManager.isMusicPlaying()) {
    settings.playPause.innerHTML = '⏸️ Pause';
  } else {
    settings.playPause.innerHTML = '▶️ Play';
  }
}

/**
 * Update the sound toggle button state
 */
function updateSoundToggleButton() {
  const { settings } = uiElements;
  
  if (!settings.soundToggle) return;
  
  if (isSoundEnabled()) {
    settings.soundToggle.innerHTML = '🔊 Sound On';
  } else {
    settings.soundToggle.innerHTML = '🔇 Sound Off';
  }
}

/**
 * Show the background presets modal
 */
export function openBackgroundPresetsModal() {
  try {
    const presetsModal = modals.backgroundPresets;
    
    if (!presetsModal) {
      console.error('Background presets modal not found');
      return;
    }
    
    // Show the modal
    presetsModal.classList.remove('hidden');
    
    // Initialize presets
    initBackgroundPresetsModal();
  } catch (err) {
    console.error('Error opening background presets modal:', err);
  }
}

/**
 * Initialize the background presets modal
 */
export function initBackgroundPresetsModal() {
  try {
    // Get the container for the presets
    const presetsContainer = document.querySelector('.presets-container');
    if (!presetsContainer) {
      console.error('Presets container not found');
      return;
    }
    
    // Clear any existing presets
    presetsContainer.innerHTML = '';
    
    // Reset selected preset
    selectedPresetId = null;
    
    // Disable apply button
    const applyBtn = document.getElementById('preset-apply-btn');
    if (applyBtn) {
      applyBtn.disabled = true;
    }
    
    // Reset preview
    const presetPreview = document.getElementById('preset-preview');
    if (presetPreview) {
      presetPreview.style.backgroundImage = '';
      
      // Show the placeholder
      const placeholder = document.getElementById('preset-preview-placeholder');
      if (placeholder) {
        placeholder.style.display = 'block';
      }
    }
    
    // Create preset buttons
    BACKGROUND_PRESETS.forEach(preset => {
      const presetBtn = createElement('div', {
        class: 'preset-button',
        attributes: {
          'data-preset-id': preset.id
        },
        parent: presetsContainer
      });
      
      // Add emoji
      createElement('div', {
        class: 'preset-emoji',
        text: preset.emoji,
        parent: presetBtn
      });
      
      // Add name
      createElement('div', {
        class: 'preset-name',
        text: preset.name,
        parent: presetBtn
      });
      
      // Add click handler
      presetBtn.addEventListener('click', function() {
        selectPreset(preset.id);
      });
    });
    
    // Add event listeners for buttons
    const closeBtn = document.getElementById('preset-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    
    const cancelBtn = document.getElementById('preset-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }
    
    if (applyBtn) {
      applyBtn.addEventListener('click', applySelectedPreset);
    }
    
    // Close when clicking outside the modal content
    presetsModal.addEventListener('click', function(event) {
      if (event.target === presetsModal) {
        closeModal();
      }
    });
    
  } catch (err) {
    console.error('Error initializing background presets modal:', err);
  }
}

/**
 * Select a preset background
 * @param {string} presetId - ID of the preset to select
 */
function selectPreset(presetId) {
  // Find the preset
  const preset = BACKGROUND_PRESETS.find(p => p.id === presetId);
  if (!preset) return;
  
  // Update selected preset ID
  selectedPresetId = presetId;
  
  // Update UI
  // Remove selected class from all buttons
  const buttons = document.querySelectorAll('.preset-button');
  buttons.forEach(btn => btn.classList.remove('selected'));
  
  // Add selected class to the clicked button
  const selectedBtn = document.querySelector(`.preset-button[data-preset-id="${presetId}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('selected');
  }
  
  // Update preview
  const presetPreview = document.getElementById('preset-preview');
  if (presetPreview) {
    presetPreview.style.backgroundImage = `url('${preset.image}')`;
    
    // Hide the placeholder
    const placeholder = document.getElementById('preset-preview-placeholder');
    if (placeholder) {
      placeholder.style.display = 'none';
    }
  }
  
  // Enable apply button
  const applyBtn = document.getElementById('preset-apply-btn');
  if (applyBtn) {
    applyBtn.disabled = false;
  }
}

/**
 * Apply the selected background preset
 */
function applySelectedPreset() {
  // Find the preset
  const preset = BACKGROUND_PRESETS.find(p => p.id === selectedPresetId);
  if (!preset) return;
  
  // Update background image
  updateBackgroundImage(preset.image);
  
  // Close the modal
  closeModal();
}