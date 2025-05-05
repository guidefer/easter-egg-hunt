<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Easter Egg Hunt Game - Coding Guidelines

This project is an HTML, CSS, and JavaScript Easter egg hunt game with the following structure:

## Project Structure
- `index.html` - Main HTML file with game screens and UI components
- `style.css` - Styling with animations and responsive design
- `script.js` - Game logic and interactivity
- `Living-room.png` - Default background image
- `sounds/` - Directory for game sound effects (optional)

# TEMPORARY SECTION: ES6 Module Refactoring Plan

## Module Structure Plan
Refactoring the monolithic script.js into ES6 modules while maintaining mobile-first approach.

### Module Organization
```
/js/
  /modules/
    config.js          - Game configuration and constants
    state.js           - Game state management 
    dom.js             - DOM element references and manipulation
    sound.js           - Sound system
    animation.js       - Animation management
    egg.js             - Egg creation and management
    ui.js              - UI panel management
    modal.js           - Modal dialog functionality
    camera.js          - Camera functionality
    touch.js           - Touch and mobile optimizations
    utils.js           - Utility functions
    events.js          - Event handling and registration
  main.js              - Main entry point that imports and initializes all modules
```

### Detailed Module Descriptions with Specific Functions

#### 1. config.js
- **Purpose**: Central location for game constants and configuration
- **Contents**:
  - Game version number (`GAME_VERSION`) - Currently '1.3.2'
  - Animation types array for eggs - 'animation-bobble', 'animation-spin', etc.
  - Default background image path - 'Living-room.png'
  - Z-index constants for different UI layers
  - Sound file paths - './sounds/easter-music1.mp3', etc.
  - Touch target size constants - Minimum 44×44px for mobile
  - Auto-collapse timings - 5000ms for hunt UI, 8000ms for setup controls
- **Specific Functions/Constants**:
  - `export const GAME_VERSION = '1.3.2';` - Game version
  - `export const DEFAULT_BACKGROUND = 'Living-room.png';` - Default background
  - `export const ANIMATION_TYPES = ['animation-bobble', 'animation-spin', 'animation-wiggle', 'animation-bounce', 'animation-pulse'];` - Egg animations
  - `export const SOUND_PATHS = {...};` - Sound file paths
  - `export const AUTO_COLLAPSE_DELAY = {...};` - Timer constants
  - `export const Z_INDICES = {...};` - Z-index hierarchy
- **Element References**:
  - N/A - Configuration module doesn't directly reference DOM elements
- **Approach**:
  - Extract all hard-coded values from script.js
  - Create named exports for each constant
  - Follow existing naming conventions

#### 2. state.js
- **Purpose**: Manage game state and provide state mutation functions
- **Contents**:
  - eggData array and manipulation functions
  - currentEggIndex, foundCount tracking
  - selectedEggId, draggedEgg state
  - Game phase tracking (setup, playing, completed)
  - Panel collapsed states
- **Specific Functions**:
  - `export const gameState = {...}` - Object holding all state variables
  - `export function getEggData()` - Retrieves the egg array
  - `export function addEgg(eggInfo)` - Adds a new egg to eggData
  - `export function updateEgg(eggId, updates)` - Updates an existing egg
  - `export function removeEgg(eggId)` - Removes an egg by ID
  - `export function setCurrentEggIndex(index)` - Updates currentEggIndex
  - `export function incrementFoundCount()` - Increases foundCount by 1
  - `export function setSelectedEggId(id)` - Sets currently selected egg
  - `export function setDraggedEgg(egg)` - Sets currently dragged egg element
  - `export function setGamePhase(phase)` - Updates game phase
  - `export function setHuntUIPanelCollapsed(collapsed)` - Updates UI collapse state
  - `export function setSetupControlsCollapsed(collapsed)` - Updates setup controls state
  - `export function findNextAvailableEggNumber()` - Calculates next egg number
  - `export function sortEggsByNumber()` - Sorts eggs by number property
- **Element References**:
  - Doesn't directly reference DOM elements, but contains IDs like `selectedEggId`
  - Contains references to egg elements via `draggedEgg`
- **Approach**:
  - Create a state object to hold all state variables
  - Implement getter/setter functions for state access
  - Create specific state update functions (e.g., updateEggPosition, incrementFoundCount)
  - Use event-based notifications for state changes

#### 3. dom.js
- **Purpose**: Centralize DOM element access and manipulation
- **Contents**: 
  - Functions to get DOM elements (getById, querySelector wrappers)
  - Screen toggle functions (showScreen, hideScreen)
  - DOM element creation helpers
  - Class addition/removal utility functions
- **Specific Functions**:
  - `export function getById(id)` - Shorthand for document.getElementById
  - `export function getScreens()` - Returns object with all screen elements
  - `export const screens = {...}` - Object containing all screen elements:
    - startScreen - "#start-screen"
    - setupScreen - "#setup-screen" 
    - gameContainer - "#game-container"
    - setupControls - "#setup-controls"
    - huntUIPanel - "#hunt-ui-panel"
  - `export const panels = {...}` - UI panel elements:
    - setupControls - "#setup-controls"
    - huntUIPanel - "#hunt-ui-panel"
  - `export const modals = {...}` - Modal dialog elements:
    - eggModal - "#egg-modal"
    - congratsModal - "#congrats-modal"
    - cameraModal - "#camera-modal"
    - settingsModal - "#settings-modal"
  - `export const loadingScreens = {...}` - Loading screen elements
  - `export function showScreen(screenId)` - Shows a specific screen, hides others
  - `export function hideScreen(screenId)` - Hides a specific screen
  - `export function toggleClass(element, className, force)` - Adds/removes class
  - `export function createElement(type, options)` - Creates DOM element with attributes/classes
  - `export function updateElementText(id, text)` - Updates element text content
  - `export function updateElementCount(countElementId, totalElementId, count, total)` - Updates counters
- **Element References**:
  - Directly references all major DOM elements by ID:
    - "#start-screen", "#setup-screen", "#game-container", etc.
    - "#egg-placement-area", "#egg-list", "#clue-display", etc.
    - All modals: "#egg-modal", "#congrats-modal", etc.
- **Approach**:
  - Create a DOM cache to minimize repeated querySelector calls
  - Implement wrapper functions for common DOM operations
  - Export functions for other modules to use

#### 4. sound.js
- **Purpose**: Handle audio playback and sound effects
- **Contents**:
  - Enhanced SoundManager with its methods
  - Web Audio API fallback functionality
  - Volume control functions
  - Sound initialization and cleanup
- **Specific Functions**:
  - `export const SoundManager = {...}` - Main sound management object with methods:
    - `init()` - Initialize audio elements
    - `setupAudioSource(audioElement, src)` - Sets audio source with error handling 
    - `nextTrack()` - Switch to the next music track
    - `play(soundType)` - Play a specific sound ('eggFound', 'hint', 'celebration')
    - `playWithFallback(audioElement, fallbackType)` - Try HTML audio with fallback to Web Audio
    - `setVolume(level)` - Sets the volume level
    - `toggleMute()` - Toggles mute state
  - `export function createSound(type)` - Creates sounds using Web Audio API:
    - 'pop' - Simple pop sound
    - 'success' - Success sound when finding egg
    - 'complete' - Celebratory sound sequence
  - `export function initSounds()` - Initialize sound system on user interaction
- **Element References**:
  - "#background-music" - Background music audio element
  - "#egg-found-sound" - Egg found sound effect
  - "#hint-sound" - Hint sound effect
  - "#celebration-sound" - Celebration sound effect
- **Approach**:
  - Extract existing SoundManager object
  - Refactor to use ES6 class syntax
  - Maintain backward compatibility
  - Preserve mobile-friendly audio initialization

#### 5. animation.js
- **Purpose**: Manage visual animations and effects
- **Contents**:
  - AnimationManager with its methods
  - Bunny animation code
  - Confetti and celebration effects
  - Pawprint trail generation
- **Specific Functions**:
  - `export const AnimationManager = {...}` - Main animation object with methods:
    - `init()` - Initialize background animations
    - `startBunnyAnimations()` - Start random bunny hopping across screen
    - `createHoppingBunny()` - Creates a bunny that hops across the screen
    - `pauseAnimations()` - Temporarily pause animations
    - `resumeAnimations()` - Resume animations
  - `export function createCelebration(left, top)` - Creates celebration effect at position
  - `export function createCelebratingBunny(left, top)` - Creates bunny celebration at position
  - `export function createPawprintTrail(fromEgg, toEgg)` - Creates pawprint trail between eggs
  - `export function showConfetti()` - Shows confetti animation for celebration
  - `export function addConfettiCanvas()` - Adds confetti canvas to DOM
- **Element References**:
  - "#confetti-canvas" - Canvas for confetti animation
  - "#game-container" - Container where animations are added
  - CSS classes: "background-bunny", "pawprint", "celebration"
- **Approach**:
  - Extract AnimationManager object
  - Convert to class with static methods
  - Ensure animations work properly on mobile
  - Make sure generation is optimized for performance

#### 6. egg.js
- **Purpose**: Handle egg creation, positioning, and interaction
- **Contents**:
  - Functions for creating visual eggs in setup and game modes
  - Egg positioning logic
  - Egg click/touch handler functions
  - Egg drag-and-drop functionality
- **Specific Functions**:
  - `export function createVisualEgg(eggInfo, container)` - Creates visual egg in setup mode
  - `export function updateVisualEgg(eggInfo)` - Updates existing visual egg
  - `export function createGameEggs()` - Creates all game eggs
  - `export function updateClickableEggs()` - Updates which eggs are clickable
  - `export function eggFound(eggElement)` - Handle when an egg is found
  - `export function handleEggClick(e)` - Handle click/touch on egg
  - `export function handleEggHover(e)` - Handle mouse hover over egg
  - `export function handleEggMouseLeave(e)` - Handle mouse leaving egg
  - `export function createNewEggAtPosition(x, y)` - Creates new egg at specific position
  - `export function startDrag(e)` - Handle start of egg dragging (mouse)
  - `export function dragMove(e)` - Handle egg movement during drag (mouse)
  - `export function dragEnd()` - Handle end of egg dragging (mouse)
  - `export function startDragTouch(e)` - Handle start of egg dragging (touch)
  - `export function dragMoveTouch(e)` - Handle egg movement during drag (touch)
  - `export function dragEndTouch()` - Handle end of egg dragging (touch)
  - `export function updateEggList()` - Updates the list of eggs in setup UI
- **Element References**:
  - ".egg" - Game egg elements
  - ".setup-egg" - Setup mode egg elements
  - "#egg-list" - List of eggs in setup UI
  - "#egg-placement-area" - Area where eggs are placed
  - "#start-game-btn" - Button to start the game
- **Approach**:
  - Extract egg-related functions
  - Create clear interfaces for egg operations
  - Maintain percentage-based positioning system
  - Ensure drag-and-drop works on both desktop and mobile

#### 7. ui.js
- **Purpose**: Manage UI panels and their interactions
- **Contents**:
  - Panel collapse/expand functions
  - Auto-collapse timer functionality
  - UI state update functions
  - Screen transition functions
- **Specific Functions**:
  - `export function initHuntUIPanelToggle()` - Initialize hunt UI panel toggle
  - `export function toggleHuntUIPanel()` - Toggle hunt UI panel collapse/expand
  - `export function expandHuntUIPanel(startTimer = true)` - Expand hunt UI panel
  - `export function startAutoCollapseTimer()` - Start timer to auto-collapse hunt UI
  - `export function toggleSetupControls()` - Toggle setup controls collapse/expand
  - `export function startSetupAutoCollapseTimer()` - Start timer to auto-collapse setup
  - `export function showSetupScreen()` - Show setup screen and initialize UI
  - `export function startGame()` - Start the game and transition UI
  - `export function resetGame()` - Reset the game and UI
  - `export function showCurrentClue()` - Update clue text in hunt UI
  - `export function resetHintButton()` - Reset hint button to default state
  - `export function showHint()` - Show hint and update button state
- **Element References**:
  - "#hunt-ui-panel" - Hunt UI panel
  - "#hunt-ui-toggle-btn" - Button to toggle hunt UI
  - "#setup-controls" - Setup controls panel
  - "#setup-controls-toggle-btn" - Button to toggle setup controls
  - "#current-clue" - Clue text element
  - "#clue-number", "#total-clues" - Clue counter elements
  - "#found-count", "#total-count" - Egg counter elements
  - "#hint-button" - Hint button element
  - CSS classes: "collapsed", "transitioning", "highlight-clue", "used"
- **Approach**:
  - Extract UI panel toggle functionality
  - Create consistent interfaces for panel management
  - Preserve animation patterns
  - Maintain mobile-friendly touch targets

#### 8. modal.js
- **Purpose**: Handle modal dialogs and their content
- **Contents**:
  - Modal show/hide functions
  - Modal content update functions
  - Egg modal specific functionality
  - Congrats modal handling
  - Settings modal logic
- **Specific Functions**:
  - `export function showAddEggModal()` - Show modal for adding a new egg
  - `export function showEditEggModal(eggId)` - Show modal for editing an existing egg
  - `export function closeModal()` - Close the egg modal
  - `export function saveEggFromModal()` - Save changes from egg modal
  - `export function removeEggFromModal()` - Remove egg from modal
  - `export function showCongratsModal()` - Show the congratulations modal
  - `export function openSettingsModal()` - Open the settings modal
  - `export function initSettingsModal()` - Initialize the settings modal
  - `export function initMoreSettings()` - Initialize more settings section
- **Element References**:
  - "#egg-modal" - Egg editing modal
  - "#modal-egg-number" - Egg number input in modal
  - "#modal-egg-clue" - Egg clue input in modal
  - "#modal-save-btn", "#modal-remove-btn", "#modal-cancel-btn" - Modal buttons
  - "#congrats-modal" - Congratulations modal
  - "#congrats-message" - Congratulations message
  - "#settings-modal" - Settings modal
  - "#settings-volume" - Volume slider in settings
  - "#settings-play-pause", "#settings-next-track" - Music controls
  - "#settings-sound-toggle" - Sound toggle button
- **Approach**:
  - Extract modal-related functions
  - Create consistent pattern for showing/hiding modals
  - Maintain click-outside-to-close functionality
  - Preserve focus trap for accessibility

#### 9. camera.js
- **Purpose**: Handle camera functionality for background images
- **Contents**:
  - Camera initialization and access
  - Photo capture functionality
  - Camera switching (front/back)
  - Error handling for camera access
- **Specific Functions**:
  - `export function initCamera()` - Initialize camera for taking photos
  - `export function closeCamera()` - Close camera and clean up resources
  - `export function capturePhoto()` - Capture a photo from camera
  - `export function addCameraSwitchButton()` - Add button to switch cameras
  - `export function handleImageFile(file)` - Handle image file from upload or camera
  - `export function showLocalImageNotification()` - Show notification about local processing
  - `export function initBackgroundUpload()` - Initialize background file upload
  - `export function updateBackgroundImage(backgroundImage)` - Update background image in both areas
- **Element References**:
  - "#camera-modal" - Camera modal dialog
  - "#camera-preview" - Video preview element
  - "#camera-canvas" - Canvas for capturing photos
  - "#capture-photo", "#cancel-camera" - Camera control buttons
  - "#background-upload" - File input for background
  - "#file-upload-btn", "#camera-capture" - Background upload buttons
  - "#egg-placement-area", "#game-container" - Areas that need background
- **Approach**:
  - Extract camera-related code
  - Create clean interface for camera operations
  - Preserve mobile device camera access
  - Maintain privacy-focused local processing

#### 10. touch.js
- **Purpose**: Handle touch-specific interactions and optimizations
- **Contents**:
  - Touch detection utility
  - FastClick implementation
  - Touch feedback functions
  - Touch event handlers
- **Specific Functions**:
  - `export function isTouchEnabled()` - Detects if device supports touch
  - `export function initFastClick()` - Initialize FastClick to eliminate delay
  - `export function addAreaEventListeners(area)` - Add both mouse and touch events
  - `export function addTouchFeedback()` - Add visual feedback for touch
  - `export function ensureViewportMeta()` - Add viewport meta tag for mobile
  - `export function handleOrientationChange()` - Handle device orientation changes
- **Element References**:
  - References elements with interaction classes like:
    - "button", ".control-btn", ".main-btn"
    - ".egg", ".setup-egg" 
  - Adds "touch-active" class to elements on touch
  - Monitors viewport and orientation changes
- **Approach**:
  - Extract touch-related code
  - Create utility functions for touch detection
  - Implement touch feedback consistently
  - Ensure proper prevention of default behaviors

#### 11. utils.js
- **Purpose**: Provide utility functions for other modules
- **Contents**:
  - Random number generation
  - Percentage calculation helpers
  - Browser feature detection
  - Animation helpers
  - Viewport management
- **Specific Functions**:
  - `export function randomInRange(min, max)` - Generate random number in range
  - `export function percentageToPixels(percentage, dimension)` - Convert % to px
  - `export function pixelsToPercentage(pixels, dimension)` - Convert px to %
  - `export function debounce(func, wait)` - Debounce function calls
  - `export function isPassiveSupported()` - Check if passive events supported
  - `export function updateVersionDisplay()` - Update version display in UI
  - `export function isMobileDevice()` - Detect if current device is mobile
  - `export function setCursorVisibility(visible)` - Show/hide cursor on inactivity
- **Element References**:
  - ".version-info" - Version info display
  - May reference other elements indirectly through passed parameters
- **Approach**:
  - Extract helper functions
  - Create well-documented utility functions
  - Focus on reusability across modules
  - Implement browser compatibility helpers

#### 12. events.js
- **Purpose**: Centralize event listener registration
- **Contents**:
  - Event attachment functions
  - Delegated event handlers
  - Window resize/orientation handling
  - Event cleanup functions
- **Specific Functions**:
  - `export function setupEventListeners()` - Set up all event listeners
  - `export function setupButtonListeners()` - Set up button click listeners
  - `export function setupModalListeners()` - Set up modal interaction listeners
  - `export function setupWindowListeners()` - Set up window-level events
  - `export function attachEventWithOptions(element, event, handler, options)` - Attach event with options
  - `export function removeEventListeners()` - Clean up event listeners
  - `export function handleWindowResize()` - Handle window resize events
- **Element References**:
  - "#setup-btn" - Setup button
  - "#add-egg-btn" - Add egg button
  - "#start-game-btn" - Start game button
  - "#reset-btn" - Reset game button
  - "#setup-controls-toggle-btn" - Setup controls toggle
  - "#hint-button" - Hint button
  - Various modal buttons and interactive elements
- **Approach**:
  - Create centralized event registration
  - Implement proper event delegation
  - Create cleanup functions to prevent memory leaks
  - Use passive listeners for performance where appropriate

#### 13. main.js
- **Purpose**: Entry point that initializes the application
- **Contents**:
  - Module imports
  - Initialization sequence
  - Window onload handler
  - Game startup logic
- **Specific Functions**:
  - `import {...} from './modules/...'` - Import all necessary modules
  - `function init()` - Initialize the application
  - `function onWindowLoad()` - Window onload handler
  - `window.addEventListener('load', onWindowLoad)` - Entry point
  - Exposed public API functions if needed
- **Element References**:
  - References all major DOM elements through the dom.js module
  - Coordinates initialization that affects all elements
- **Approach**:
  - Import all necessary modules
  - Set up proper initialization sequence
  - Ensure modules are loaded in the right order
  - Create clear game lifecycle management

### Implementation Approach and Best Practices
1. **Working by Feature**: Implement one module at a time, testing thoroughly
2. **Dependency Management**: Handle dependencies carefully to avoid circular imports
   - Create a dependency graph to visualize module relationships
   - Place fundamental modules (config, utils, dom) at the bottom of the hierarchy
   - Ensure state.js doesn't directly depend on UI modules
3. **Commit Strategy**:
   - Create a new branch for the refactoring: `git checkout -b es6-modules`
   - Make atomic commits for each module implementation
   - Use descriptive commit messages referencing the module name
   - Before each commit, review previous changes to avoid redundancies
   - Include the function names and element IDs affected in commit messages
4. **Code Organization**:
   - Always check existing element IDs and class names before modifying functions
   - Keep original function names when possible for easier code review
   - Group related functions together in each module
   - Add JSDoc comments for exported functions
5. **Testing Workflow**:
   - Test each module individually with console.logs where appropriate
   - Use browser dev tools to debug
   - Test on both desktop and mobile after each major change
   - Keep the console open to check for errors
   - Manually test all user interactions after module integration

### Mobile-First Optimizations
- Ensure all event handlers support both touch and mouse interactions
- Optimize touch targets to be at least 44×44px for better accessibility
- Use passive event listeners where appropriate for scroll performance
- Keep FastClick functionality to eliminate delay on mobile devices
- Improve haptic feedback for interactions
- Ensure position calculations work correctly across device orientations
- Preserve existing responsive designs

### Version Control Strategy
- Start new branch for ES6 module refactoring
- Commit after each module is successfully implemented
- Create detailed commit messages explaining changes
- Test thoroughly before merging
- Review the commit history frequently to recall what has been done

## Execution Task List
1. ✅ Set up module directory structure
2. ✅ Update index.html to use main.js instead of script.js
3. ✅ Create empty module files with initial exports
4. ✅ Implement config.js with game constants
5. ✅ Implement utils.js with utility functions
6. ✅ Implement dom.js for DOM element references
7. ✅ Implement state.js for game state management
8. ✅ Implement sound.js for audio functionality
9. ✅ Implement animation.js for visual effects
10. ✅ Implement egg.js for egg functionality
11. ✅ Implement ui.js for panel management
12. ✅ Implement modal.js for dialog functionality
13. ✅ Implement camera.js for photo capture
14. ✅ Implement touch.js for mobile optimizations
15. ✅ Implement events.js for event handling
16. ✅ Create main.js as the application entry point
17. ⬜ Test on desktop browsers
18. ⬜ Test on mobile devices
19. ⬜ Fix bugs and optimize
20. ⬜ Update version number to reflect module refactoring

# Current Implementation Status
We have successfully implemented all modules from our execution plan (1-16). All the module files have been created with their respective functionality:

- **config.js**: Contains game constants and configuration
- **utils.js**: Provides utility functions for other modules
- **dom.js**: Centralizes DOM element access and manipulation
- **state.js**: Manages game state and provides state mutation functions
- **sound.js**: Handles audio playback and sound effects
- **animation.js**: Manages visual animations and effects
- **egg.js**: Handles egg creation, positioning, and interaction
- **ui.js**: Manages UI panels and their interactions
- **modal.js**: Handles modal dialogs and their content
- **camera.js**: Handles camera functionality for background images
- **touch.js**: Handles touch-specific interactions and optimizations
- **events.js**: Centralizes event listener registration
- **main.js**: Entry point that imports and initializes all modules

Next steps:
1. Test the refactored application on desktop browsers
2. Test the refactored application on mobile devices
3. Fix any bugs and optimize the application
4. Update the version number to reflect the completion of the module refactoring

## General Guidelines
- Use clear comments for major functions and complex logic
- Make egg positions easy to adjust in script.js using percentage-based positions
- Don't generate images, only use placeholders or the existing background image
- Maintain mobile/touch compatibility throughout the codebase
- Keep the Comic Neue/Comic Sans styling for the kid-friendly interface
- Follow the existing version numbering (MAJOR.MINOR.PATCH)

## HTML Guidelines
- Structure screens as separate `<div>` elements with the "screen" class
- Use the "hidden" class to toggle visibility instead of display:none in JavaScript
- Keep the semantic structure with proper ARIA attributes for accessibility
- Maintain modal dialogs within the same pattern as existing ones
- Use class names consistently: `.main-btn`, `.control-btn`, `.egg`, etc.

## CSS Guidelines
- Colors should follow the existing pastel/Easter palette:
  - Primary pink: #ff66b3
  - Secondary pink: #ff99cc
  - Light pink: #ffcccc
  - Purple: #8855dd
  - Other accent colors as established in the current scheme
- Maintain the responsive breakpoints:
  - Mobile: max-width 480px
  - Tablet: max-width 768px
- Animations should follow the same naming pattern (bobble, spin, wiggle, etc.)
- Keep z-index hierarchy consistent:
  - Background (-2)
  - Game elements (1-999)
  - UI elements (100-1500)
  - Modals (2000+)
- Use percentage-based positioning for eggs and interactive elements
- Apply proper touch target sizes (minimum 44×44px) for mobile interfaces
- Maintain the rounded corners, soft shadows, and pastel color scheme

## JavaScript Guidelines
- Structured by component/feature area:
  - Game state variables at the top
  - Sound management in SoundManager object
  - Animation handling in AnimationManager object
  - DOM element references grouped together
  - Modal functions grouped with "Modal Functions" comment header
  - Setup and game functions in their respective sections
- Keep the existing event delegation pattern for egg interactions
- Store egg data in the `eggData` array with consistent object structure:
  ```javascript
  {
    id: Number,       // Unique identifier
    number: Number,   // Egg sequence number
    left: String,     // Percentage position (e.g. "50%")
    top: String,      // Percentage position (e.g. "50%")
    clue: String,     // Text clue for finding the egg
    isNew: Boolean    // Flag for newly created eggs (optional)
  }
  ```
- Use the percentage-based positioning system for all egg placement
- Maintain the drag-and-drop functionality for both mouse and touch
- Keep accessibility features (ARIA labels, keyboard support)
- Preserve the adaptive sound system with Web Audio API fallbacks
- Follow the state management pattern already established:
  - Game state variables at top
  - State updates through specific functions
  - UI updates following state changes

## JavaScript Syntax Best Practices
- Prefer standard string concatenation with + operators over template literals (backticks) for compatibility:
  ```javascript
  // Prefer this:
  console.log('Creating pawprint trail from (' + fromLeft + '%, ' + fromTop + '%) to (' + toLeft + '%, ' + toTop + '%)');
  
  // Instead of this:
  console.log(`Creating pawprint trail from (${fromLeft}%, ${fromTop}%) to (${toLeft}%, ${toTop}%)`);
  ```
- When creating CSS in JavaScript, use string concatenation for readability:
  ```javascript
  styleTag.textContent = 
    '@keyframes fadeInPawprint {' +
    '  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) rotate(var(--rotation)); }' +
    '  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2) rotate(var(--rotation)) translateY(-10px); }' +
    '  100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(var(--rotation)) translateY(0); }' +
    '}';
  ```
- For dynamic element styling, use standard concatenation for property values:
  ```javascript
  // Prefer this:
  pawprint.style.left = pawLeft + '%';
  pawprint.style.top = pawTop + '%';
  
  // Instead of this:
  pawprint.style.left = `${pawLeft}%`;
  pawprint.style.top = `${pawTop}%`;
  ```
- When using setTimeout with string manipulation, avoid template literals in favor of concatenation:
  ```javascript
  pawprint.style.animation = 'fadeInPawprint 0.8s forwards ' + (i * 0.1) + 's';
  ```
- Follow proper ternary operator syntax with consistent spacing and line breaks:
  ```javascript
  const rotation = (i % 2 === 0) ? '25deg' : '-25deg';
  ```

## Modal System
- Follow the existing pattern for showing/hiding modals
- Use the `hidden` class toggle for visibility
- Handle modal interactions like the `egg-modal`:
  - Save/cancel/remove functionality
  - Click outside to close
  - Focus trap within modal
  
## Animation Best Practices
- Keep the CSS keyframe animations in style.css
- JavaScript-generated animations should follow the pattern in AnimationManager
- Maintain the bunny, pawprint, and celebration effects
- Ensure compatibility with both mobile and desktop

## Touch Support
- Always maintain the touch event handlers alongside mouse events
- Consider both tap and drag scenarios for eggs
- Use prevent default and stopPropagation to avoid unwanted behaviors
- Keep the FastClick pattern for mobile responsiveness

## Background Image Handling
- Background images should be managed through the updateBackgroundImage function
- Support both the default Living-room.png and user-uploaded images
- Maintain the camera functionality for mobile devices
- Preserve local image processing (no server uploads)

## Performance Considerations
- Minimize repaints by batching DOM updates
- Use CSS transitions where possible instead of JS animations
- Optimize touch events with passive listeners where appropriate
- Manage resources properly (stop audio, clear intervals when not needed)

## Panel Animation Best Practices
- Prefer CSS transitions over JavaScript animations for UI panels
- Use the transitioning class pattern to prevent interaction during animations
- Keep animations smooth by using will-change CSS property for better performance
- Follow a clean two-stage approach for animations:
  1. Add/remove the proper CSS classes
  2. Clean up after the animation completes with a setTimeout
- Avoid inline styles that conflict with CSS transitions
- Properly handle edge cases like multiple quick toggles
- Prevent position jumps by ensuring consistent transform styles

When modifying this project, always ensure changes maintain compatibility with existing features and the established visual style. Test all changes on both desktop and mobile devices.
