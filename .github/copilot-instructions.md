<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Easter Egg Hunt Game - Coding Guidelines

This project is an HTML, CSS, and JavaScript Easter egg hunt game with the following structure:

## Project Structure
- `index.html` - Main HTML file with game screens and UI components
- `style.css` - Styling with animations and responsive design
- `script.js` - Game logic and interactivity
- `Living-room.png` - Default background image
- `sounds/` - Directory for game sound effects (optional)

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
