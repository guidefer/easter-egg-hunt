/**
 * Camera functionality for the Easter Egg Hunt game
 * Handles camera access, photo capture, and background image management
 */

import { DEFAULT_BACKGROUND } from './config.js';
import { uiElements, modals } from './dom.js';

// Keep track of camera stream for cleanup
let cameraStream = null;

/**
 * Initialize camera support and background functionality
 * Called during application initialization
 */
export function initCameraSupport() {
  console.log('Initializing camera support');
  
  // Initialize background upload
  initBackgroundUpload();
  
  // Load saved background or default
  loadSavedBackground();
  
  console.log('Camera support initialized');
}

/**
 * Initialize camera for taking background photos
 */
export function initCamera() {
  const cameraModal = modals.camera;
  
  // Show camera modal
  if (cameraModal) {
    cameraModal.classList.remove('hidden');
  } else {
    console.error('Camera modal not found');
    return;
  }
  
  // Get camera elements
  const cameraPreview = document.getElementById('camera-preview');
  const captureButton = document.getElementById('capture-photo');
  const cancelButton = document.getElementById('cancel-camera');
  
  if (!cameraPreview) return;
  
  // Check if browser supports getUserMedia
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Your browser does not support camera access. Please use a different browser or upload an image file instead.');
    closeCamera();
    return;
  }
  
  // Request camera access
  navigator.mediaDevices.getUserMedia({ 
    video: { 
      facingMode: 'environment', // Prefer back camera on mobile
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false 
  })
  .then(stream => {
    // Store for later cleanup
    cameraStream = stream;
    
    // Connect stream to video element
    cameraPreview.srcObject = stream;
    cameraPreview.play();
    
    // Add camera switch button if multiple cameras available
    checkForMultipleCameras();
    
    // Set up capture button
    if (captureButton) {
      captureButton.disabled = false;
      captureButton.addEventListener('click', capturePhoto);
    }
    
    // Set up cancel button
    if (cancelButton) {
      cancelButton.addEventListener('click', closeCamera);
    }
  })
  .catch(error => {
    console.error('Error accessing camera:', error);
    alert('Could not access camera. Error: ' + error.message);
    closeCamera();
  });
}

/**
 * Close camera and clean up resources
 */
export function closeCamera() {
  // Stop camera stream if active
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => {
      track.stop();
    });
    cameraStream = null;
  }
  
  // Hide camera modal
  const cameraModal = modals.camera;
  if (cameraModal) {
    cameraModal.classList.add('hidden');
  }
}

/**
 * Capture a photo from the camera
 */
export function capturePhoto() {
  const cameraPreview = document.getElementById('camera-preview');
  const canvas = document.getElementById('camera-canvas');
  
  if (!cameraPreview || !canvas || !cameraStream) return;
  
  // Set canvas size to match video
  canvas.width = cameraPreview.videoWidth;
  canvas.height = cameraPreview.videoHeight;
  
  // Draw the current video frame to the canvas
  const ctx = canvas.getContext('2d');
  ctx.drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);
  
  // Convert canvas to image data URL
  try {
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    
    // Use the captured image as background
    updateBackgroundImage(imageDataUrl);
    
    // Close camera
    closeCamera();
  } catch (error) {
    console.error('Error capturing photo:', error);
    alert('Error capturing photo. Please try again.');
  }
}

/**
 * Check if multiple cameras are available and add switch button if yes
 */
export function checkForMultipleCameras() {
  // Only available in browsers that support enumerateDevices
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return;
  }
  
  navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      // Count video input devices (cameras)
      const cameras = devices.filter(device => device.kind === 'videoinput');
      
      // If more than one camera is available, add a switch button
      if (cameras.length > 1) {
        addCameraSwitchButton();
      }
    })
    .catch(error => {
      console.error('Error checking for cameras:', error);
    });
}

/**
 * Add button to switch between cameras
 */
export function addCameraSwitchButton() {
  const cameraContainer = document.querySelector('.camera-container');
  if (!cameraContainer) return;
  
  // Check if switch button already exists
  if (document.getElementById('switch-camera')) return;
  
  // Create switch button
  const switchButton = document.createElement('button');
  switchButton.id = 'switch-camera';
  switchButton.className = 'control-btn';
  switchButton.innerHTML = '🔄 Switch Camera';
  
  // Add switch button to container
  cameraContainer.appendChild(switchButton);
  
  // Set up click handler
  switchButton.addEventListener('click', () => {
    // Stop current stream
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    
    // Toggle camera facing mode
    const currentFacingMode = cameraStream.getVideoTracks()[0].getSettings().facingMode;
    const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    
    // Start new stream with opposite camera
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: newFacingMode },
      audio: false
    })
    .then(stream => {
      // Update stream
      cameraStream = stream;
      
      // Update video element
      const cameraPreview = document.getElementById('camera-preview');
      if (cameraPreview) {
        cameraPreview.srcObject = stream;
      }
    })
    .catch(error => {
      console.error('Error switching camera:', error);
      alert('Could not switch camera. Error: ' + error.message);
    });
  });
}

/**
 * Handle image file from upload or camera
 * @param {File} file - Image file to handle
 */
export function handleImageFile(file) {
  // Check if file is an image
  if (!file.type.match('image.*')) {
    alert('Please select an image file.');
    return;
  }
  
  // Show notification about local processing
  showLocalImageNotification();
  
  // Create a FileReader to read the image
  const reader = new FileReader();
  
  reader.onload = function(e) {
    // Get image data URL
    const imageDataUrl = e.target.result;
    
    // Update background image
    updateBackgroundImage(imageDataUrl);
  };
  
  // Read the file as data URL
  reader.readAsDataURL(file);
}

/**
 * Show notification about local image processing
 */
export function showLocalImageNotification() {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('local-processing-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'local-processing-notification';
    notification.className = 'notification';
    notification.innerHTML = 'Processing image locally... Your image stays on your device.';
    document.body.appendChild(notification);
  }
  
  // Show notification
  notification.classList.add('show');
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

/**
 * Initialize background file upload
 */
export function initBackgroundUpload() {
  const backgroundUpload = uiElements.setup.backgroundUpload;
  
  if (!backgroundUpload) return;
  
  // Set up file input change event
  backgroundUpload.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  });
}

/**
 * Update background image in both areas
 * @param {string} backgroundImage - Background image URL or data URL
 */
export function updateBackgroundImage(backgroundImage) {
  // Set background in setup area
  const setupArea = uiElements.setup.eggPlacementArea;
  if (setupArea) {
    setupArea.style.backgroundImage = 'url("' + backgroundImage + '")';
  }
  
  // Set background in game container
  const gameArea = document.getElementById('game-container');
  if (gameArea) {
    gameArea.style.backgroundImage = 'url("' + backgroundImage + '")';
  }
  
  // Store in local storage for persistence
  try {
    localStorage.setItem('easterEggHuntBackground', backgroundImage);
  } catch (error) {
    console.warn('Could not save background to local storage. Error:', error);
  }
}

/**
 * Load background image from local storage or use default
 */
export function loadSavedBackground() {
  let backgroundImage;
  
  try {
    backgroundImage = localStorage.getItem('easterEggHuntBackground');
  } catch (error) {
    console.warn('Could not load background from local storage. Error:', error);
  }
  
  // Use saved background or default
  if (backgroundImage) {
    updateBackgroundImage(backgroundImage);
  } else {
    // Use default background
    updateBackgroundImage(DEFAULT_BACKGROUND);
  }
}

/**
 * Reset background to default
 */
export function resetBackground() {
  updateBackgroundImage(DEFAULT_BACKGROUND);
  
  // Remove from local storage
  try {
    localStorage.removeItem('easterEggHuntBackground');
  } catch (error) {
    console.warn('Could not remove background from local storage. Error:', error);
  }
}