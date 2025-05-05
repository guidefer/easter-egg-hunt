/**
 * Configuration settings for the Easter Egg Hunt game
 * Central location for game constants and configuration
 */

// Game version - update this when making significant changes
export const GAME_VERSION = '1.4.0'; // Updated for ES6 module refactoring

// Default game background image
export const DEFAULT_BACKGROUND = 'Living-room.png';

// Background presets with name, emoji, and image path
export const BACKGROUND_PRESETS = [
    {
        id: 'easter',
        name: 'Easter',
        emoji: '🐰',
        image: './images/easter-background.png'
    },
    {
        id: 'treasure',
        name: 'Treasure',
        emoji: '💰',
        image: './images/treasure-background.png'
    },
    {
        id: 'christmas',
        name: 'Christmas',
        emoji: '🎄',
        image: './images/christmas-background.png'
    },
    {
        id: 'halloween',
        name: 'Halloween',
        emoji: '🎃',
        image: './images/halloween-background.png'
    }
];

// Animation types for eggs
export const ANIMATION_TYPES = [
    'animation-bobble',
    'animation-spin', 
    'animation-wiggle', 
    'animation-bounce', 
    'animation-pulse'
];

// Z-index hierarchy constants
export const Z_INDICES = {
    BACKGROUND: -2,
    GAME_ELEMENTS: 10,
    EGGS: 1000,
    UI_ELEMENTS: 1500,
    MODALS: 2000
};

// Sound file paths - use relative paths without leading ./
export const SOUND_PATHS = {
    BACKGROUND_MUSIC: [
        'sounds/easter-music1.mp3',
        'sounds/easter-music2.mp3'
    ],
    EGG_FOUND: 'sounds/success.mp3',
    HINT: 'sounds/hint.mp3',
    CELEBRATION: 'sounds/celebration.mp3'
};

// Touch target size constants for mobile
export const TOUCH = {
    MIN_TARGET_SIZE: 44, // Minimum touch target size in pixels
    DRAG_THRESHOLD: 10   // Minimum pixels moved to be considered a drag vs. tap
};

// Auto-collapse timing constants (in milliseconds)
export const AUTO_COLLAPSE_DELAY = {
    HUNT_UI: 5000,       // Hunt UI panel collapses after 5 seconds
    SETUP_CONTROLS: 8000 // Setup controls panel collapses after 8 seconds
};

// Game phases
export const GAME_PHASES = {
    START: 'start',
    SETUP: 'setup',
    PLAYING: 'playing',
    COMPLETED: 'completed'
};