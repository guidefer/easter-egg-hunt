/**
 * Sound management for the Easter Egg Hunt game
 * Handles audio playback and sound effects
 */

import { SOUND_PATHS } from './config.js';
import { isSoundEnabled } from './state.js';
import { uiElements } from './dom.js';

// Web Audio API context
let audioContext;

// Sound effects using the Web Audio API as fallback
const sounds = {
  pop: null,
  success: null,
  complete: null
};

/**
 * SoundManager object for handling all audio functionality
 */
export const SoundManager = {
  // Track the current background music index
  currentMusicIndex: 0,
  
  /**
   * Initialize the sound system
   */
  init: function() {
    // Initialize audio context for Web Audio API fallbacks
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported in this browser');
    }
    
    // Get references to audio elements from DOM module
    const { audio } = uiElements;
    
    if (audio.backgroundMusic) {
      audio.backgroundMusic.volume = 0.5;
      
      // Handle errors for audio files that might not exist yet
      audio.backgroundMusic.addEventListener('error', (e) => {
        console.log('Background music file not found, using Web Audio API fallback');
      });
      
      // Set the first track as source
      audio.backgroundMusic.src = SOUND_PATHS.BACKGROUND_MUSIC[this.currentMusicIndex];
      
      // For mobile devices, we need user interaction to start playing
      document.addEventListener('click', () => {
        if (audio.backgroundMusic && !audio.backgroundMusic.src) {
          audio.backgroundMusic.src = SOUND_PATHS.BACKGROUND_MUSIC[this.currentMusicIndex];
        }
      }, { once: true });
      
      // Load volume preference if exists
      const savedVolume = localStorage.getItem('eggHuntVolume');
      if (savedVolume !== null) {
        audio.backgroundMusic.volume = parseFloat(savedVolume);
      }
      
      // Listen for when a track ends and play the next one
      audio.backgroundMusic.addEventListener('ended', () => {
        this.nextTrack();
      });
    }
    
    // Set up other audio sources with error handling
    this.setupAudioSource(audio.eggFoundSound, SOUND_PATHS.EGG_FOUND);
    this.setupAudioSource(audio.hintSound, SOUND_PATHS.HINT);
    this.setupAudioSource(audio.celebrationSound, SOUND_PATHS.CELEBRATION);
    
    // Lower volume for effect sounds if they exist
    if (audio.eggFoundSound) audio.eggFoundSound.volume = 0.6;
    if (audio.hintSound) audio.hintSound.volume = 0.4;
    if (audio.celebrationSound) audio.celebrationSound.volume = 0.7;
    
    // Load sound preference from localStorage
    const savedSoundEnabled = localStorage.getItem('eggHuntSoundEnabled');
    if (savedSoundEnabled !== null) {
      // This will be accessed through state.js
    }
  },
  
  /**
   * Helper method to set audio source with error handling
   * @param {HTMLAudioElement} audioElement - Audio element
   * @param {string} src - Audio source path
   */
  setupAudioSource: function(audioElement, src) {
    if (!audioElement) return;
    
    audioElement.addEventListener('error', (e) => {
      console.log('Audio file not found: ' + src + ', using fallback');
    });
    audioElement.src = src;
  },
  
  /**
   * Play the next music track
   */
  nextTrack: function() {
    const { audio } = uiElements;
    
    this.currentMusicIndex = (this.currentMusicIndex + 1) % SOUND_PATHS.BACKGROUND_MUSIC.length;
    const wasPlaying = !audio.backgroundMusic.paused;
    
    audio.backgroundMusic.src = SOUND_PATHS.BACKGROUND_MUSIC[this.currentMusicIndex];
    
    if (wasPlaying) {
      audio.backgroundMusic.play().catch(e => {
        console.log('Failed to play next track, likely missing file');
      });
    }
  },
  
  /**
   * Play a specific sound
   * @param {string} soundType - Type of sound to play ('eggFound', 'hint', 'celebration')
   */
  play: function(soundType) {
    if (!isSoundEnabled()) return;
    
    const { audio } = uiElements;
    
    switch(soundType) {
      case 'eggFound':
        this.playWithFallback(audio.eggFoundSound, 'success');
        break;
      case 'hint':
        this.playWithFallback(audio.hintSound, 'pop');
        break;
      case 'celebration':
        this.playWithFallback(audio.celebrationSound, 'complete');
        break;
    }
  },
  
  /**
   * Play with fallback to Web Audio API if file not found
   * @param {HTMLAudioElement} audioElement - Audio element to play
   * @param {string} fallbackType - Fallback sound type for Web Audio API
   */
  playWithFallback: function(audioElement, fallbackType) {
    if (!audioElement) {
      // Use Web Audio API fallback
      if (fallbackType === 'success' && sounds.success) sounds.success();
      else if (fallbackType === 'pop' && sounds.pop) sounds.pop();
      else if (fallbackType === 'complete' && sounds.complete) sounds.complete();
      return;
    }
    
    if (audioElement.readyState === 0) {
      // Audio not loaded, use fallback
      if (fallbackType === 'success' && sounds.success) sounds.success();
      else if (fallbackType === 'pop' && sounds.pop) sounds.pop();
      else if (fallbackType === 'complete' && sounds.complete) sounds.complete();
    } else {
      // Try to play the audio file
      audioElement.currentTime = 0;
      audioElement.play().catch(e => {
        // Fall back to Web Audio API
        if (fallbackType === 'success' && sounds.success) sounds.success();
        else if (fallbackType === 'pop' && sounds.pop) sounds.pop();
        else if (fallbackType === 'complete' && sounds.complete) sounds.complete();
      });
    }
  },
  
  /**
   * Set the volume level
   * @param {number} level - Volume level (0-1)
   */
  setVolume: function(level) {
    const { audio } = uiElements;
    
    if (audio.backgroundMusic) {
      audio.backgroundMusic.volume = level;
      
      // Save setting to localStorage
      localStorage.setItem('eggHuntVolume', level.toString());
    }
  },
  
  /**
   * Toggle background music
   * @returns {boolean} New play state (true if playing)
   */
  toggleMusic: function() {
    const { audio } = uiElements;
    
    if (!audio.backgroundMusic) return false;
    
    if (audio.backgroundMusic.paused) {
      audio.backgroundMusic.play().catch(e => {
        console.log('Failed to play music:', e);
      });
      return true;
    } else {
      audio.backgroundMusic.pause();
      return false;
    }
  },
  
  /**
   * Get music play state
   * @returns {boolean} True if music is playing
   */
  isMusicPlaying: function() {
    const { audio } = uiElements;
    return audio.backgroundMusic && !audio.backgroundMusic.paused;
  }
};

/**
 * Create simple sounds with the Web Audio API
 * @param {string} type - Sound type ('pop', 'success', 'complete')
 * @returns {Function} Function that plays the sound
 */
export function createSound(type) {
  // This will create the sounds when first needed (on user interaction)
  // to comply with autoplay policies
  return function() {
    if (!isSoundEnabled() || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different sound types
    switch(type) {
      case 'pop':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'success':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(580, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(780, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'complete':
        // Play a little melody for completion
        const notes = [440, 554, 659, 880];
        for (let i = 0; i < notes.length; i++) {
          const noteOsc = audioContext.createOscillator();
          const noteGain = audioContext.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(audioContext.destination);
          
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(notes[i], audioContext.currentTime + i * 0.2);
          noteGain.gain.setValueAtTime(0.5, audioContext.currentTime + i * 0.2);
          noteGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (i + 1) * 0.2);
          
          noteOsc.start(audioContext.currentTime + i * 0.2);
          noteOsc.stop(audioContext.currentTime + (i + 1) * 0.2);
        }
        break;
    }
  };
}

/**
 * Initialize sounds (called on first user interaction)
 */
export function initSounds() {
  if (!sounds.pop) sounds.pop = createSound('pop');
  if (!sounds.success) sounds.success = createSound('success');
  if (!sounds.complete) sounds.complete = createSound('complete');
}