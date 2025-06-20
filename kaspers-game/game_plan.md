# Game Plan: "Gjengen Levi og Kasper"

## Game Concept

*   **Objective:** The player controls a character at the bottom of the screen, moving it left and right using the arrow keys to "catch" objects that fall from the top.
*   **Scoring:** A visible score will track the number of objects successfully caught.
*   **Gameplay:** Continuous play, with no "game over" condition. The focus is on simple, repetitive fun.
*   **Theme:** Space theme with emoji-based characters and objects.

## Technical Plan

The game will be built using standard web technologies: HTML, CSS, and JavaScript.

### 1. Project Setup

*   Create a main directory for the game: `kaspers-game/`
*   Inside this directory, create the following files:
    *   `index.html`: For the basic structure of the game page.
    *   `style.css`: For styling the game elements and making it visually appealing.
    *   `script.js`: For all game logic, including player movement, object falling, collision detection, and scoring.

### 2. HTML Structure (`kaspers-game/index.html`)

*   Basic HTML5 boilerplate.
*   A main `div#gameContainer` to hold the game area and controls.
*   A `div#gameArea` for gameplay.
*   A `div#controls` containing a `label` and `input[type=range]#frequencySlider` for object frequency control, and a `span#frequencyValue` to display the current setting.
*   A `div#scoreBoard` to display the score.
*   Links to `style.css` and `script.js`.

### 3. CSS Styling (`kaspers-game/style.css`)

*   **Body:** Space-themed background, flex layout for centering `gameContainer`.
*   **`#gameContainer`:** Flex layout to position `gameArea` and `controls` side-by-side.
*   **`#gameArea`:** Defined dimensions, border, space-themed background, `position: relative`.
*   **Player Characters (`.player-ship`, `#player1`, `#player2`):**
    *   Styled as rotated spaceship emojis (🚀).
    *   `#player2` has a `hue-rotate` filter for visual distinction.
    *   Common styles in `.player-ship`, specific positioning/filters in IDs.
*   **Falling Objects (`.fallingObject`):**
    *   Styled for emoji display (transparent background, font size).
    *   Various `spin-*` animation classes for different rotation speeds and directions.
*   **`#scoreBoard`:** Positioned within `#gameArea`, styled for visibility.
*   **`#controls` & Slider:** Styled for layout and appearance next to the game area.

### 4. JavaScript Logic (`kaspers-game/script.js`)

*   **`gameState` Object:** Centralized object holding:
    *   `score`, `fallingObjects` array.
    *   `objectCreationInterval`, references to `frequencySlider` and `frequencyValueDisplay`.
    *   `gameAreaWidth`, `gameAreaHeight`.
    *   `keysPressed` object for input tracking.
    *   `player1` and `player2` objects, each containing:
        *   `element` (DOM reference), `x`, `y`, `width`, `height`, `speed`.
        *   `keys` object defining their control keys.
    *   `Audio` objects for sound effects (`yippeeSound`, `ouchSound`, `yahooSound`, `owowowowSound`).
*   **`fallingObjectConfigs` Object:** Configuration for different object types:
    *   Defines `emojis` array, `points`, `sound`, `width`, `height`, `baseSpeed`, `speedVariance`, `spinChance` for 'good', 'bad', 'diamond', 'skull' types.
*   **DOM Element References:** `gameArea` and `scoreBoard` obtained globally.
*   **Initialization (`initGame()`):**
    *   Creates and appends player elements (`#player1`, `#player2`) with `player-ship` class and '🚀' content.
    *   Sets initial positions for both players.
    *   Initializes frequency slider and its display.
    *   Starts object creation interval using `startObjectCreationInterval()`.
    *   Starts the `gameLoop()`.
*   **`startObjectCreationInterval(interval)`:** Clears existing interval and sets a new one for `createFallingObject`.
*   **`updatePlayerPosition(playerObj)`:** Updates a player's DOM element style.
*   **`handlePlayerMovement(playerObj)`:**
    *   Updates `playerObj.x`, `playerObj.y` based on `gameState.keysPressed` and `playerObj.keys`.
    *   Performs boundary checks.
    *   Calls `updatePlayerPosition(playerObj)`.
*   **`createFallingObject()`:**
    *   Determines object `type` based on probabilities.
    *   Uses `fallingObjectConfigs` to get properties (emoji, speed, dimensions).
    *   Randomly assigns spin animation class.
    *   Determines initial `x` and `dx` for varied trajectories (top-left, top-right, or top-center with drift).
    *   Creates DOM element, sets properties, appends to `gameArea`, and pushes to `gameState.fallingObjects`.
*   **`updateFallingObjects()`:**
    *   Iterates through `gameState.fallingObjects`.
    *   Updates `y` (vertical speed) and `x` (horizontal speed `dx`).
    *   Updates DOM element styles.
    *   Checks for collisions with `gameState.player1` and `gameState.player2` using `checkCollision()`.
    *   Calls `handleCollision()` if a collision occurs.
    *   Removes objects that go off-screen (bottom, left, or right).
*   **`handleCollision(object, index)`:**
    *   Uses `fallingObjectConfigs` to determine points and sound.
    *   Handles special score reset for 'skull'.
    *   Updates `gameState.score` and `scoreBoard` text.
    *   Plays appropriate sound.
    *   Calls `removeObject()`.
*   **`removeObject(index)`:** Removes object from DOM and `gameState.fallingObjects`.
*   **`checkCollision(playerObj, object)`:** Standard AABB collision detection.
*   **`gameLoop()`:**
    *   Calls `handlePlayerMovement()` for `gameState.player1` and `gameState.player2`.
    *   Calls `updateFallingObjects()`.
    *   Uses `requestAnimationFrame(gameLoop)`.
*   **Keyboard Event Listeners (`keydown`, `keyup`):**
    *   Update `gameState.keysPressed` for both player1 (Arrow keys) and player2 (WASD, case-insensitive for WASD).

### 5. Key Features & Implementation Details (Post-Refactoring)

*   **Two Players:**
    *   `player1` (Arrow Keys) and `player2` (WASD) controlled independently.
    *   Both styled as rotated '🚀' emojis, with `player2` having a green hue via CSS filter.
*   **Visuals:**
    *   Space-themed background for the page and game area.
    *   Falling objects are emojis:
        *   Good: Stars (⭐, 🌟, ✨, 💫)
        *   Bad: Alien (👾)
        *   Diamond: Gemstones (💎, 💠, 🔷, 🔶) - worth +10 points.
        *   Skull: Skull (💀) - resets score to 0.
    *   All falling objects have random spin animations (varied speeds and directions).
*   **Gameplay Mechanics:**
    *   Dynamic object trajectories (falling from top, top-left, top-right with angles/drift).
    *   Shared score for both players.
    *   Sound effects for different collision types (good, bad, diamond, skull).
    *   Slider control for object spawn frequency.
*   **Code Structure ([`script.js`](kaspers-game/script.js)):**
    *   Central `gameState` object manages most game variables and player data.
    *   `fallingObjectConfigs` object defines properties for each object type (emojis, points, sounds, etc.), making `createFallingObject` more declarative.
    *   `handlePlayerMovement(playerObj)` function for reusable player input and boundary logic.
    *   `handleCollision(object, index)` function centralizes collision effects.

## Development Flow (Mermaid Diagram)

```mermaid
graph TD
    A[Start: Define Game Requirements] --> B{Game Concept: Gjengen Levi og Kasper};
    B --> C[Setup Project: Create Files in kaspers-game/];
    C --> C1[HTML Structure: index.html];
    C --> C2[CSS Styling: style.css];
    C --> C3[JavaScript Logic: script.js];

    C1 --> D[Define Game Area & Scoreboard in HTML];
    D --> E[Link CSS and JavaScript files];

    C2 --> F[Style Game Area & Scoreboard];
    F --> G[Style Player Character (Placeholder)];
    G --> H[Style Falling Objects (Placeholder)];

    C3 --> I[Implement Player Character & Movement];
    I --> J[Handle Keyboard Input (Arrow Keys)];
    J --> K[Implement Falling Objects (Generation & Movement)];
    K --> L[Implement Collision Detection];
    L --> M[Implement Scoring & Display Update];
    M --> N[Create Game Loop (Animation)];
    N --> O[Refine & Test (Continuous Play)];
    O --> P[End: Playable Game];