# Game Plan: "Gjengen Levi og Kasper"

## Game Concept

*   **Objective:** The player controls a character at the bottom of the screen, moving it left and right using the arrow keys to "catch" objects that fall from the top.
*   **Scoring:** A visible score will track the number of objects successfully caught.
*   **Gameplay:** Continuous play, with no "game over" condition. The focus is on simple, repetitive fun.
*   **Theme:** (To be decided later - for now, placeholders will be used for player and objects).

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
*   A `div` element to serve as the main game area (e.g., `<div id="gameArea"></div>`).
*   A `div` element to display the current score (e.g., `<div id="scoreBoard">Score: 0</div>`).
*   Links to the `style.css` file (in the `<head>`) and the `script.js` file (before the closing `</body>` tag).

### 3. CSS Styling (`kaspers-game/style.css`)

*   **Body:** Basic page styling (e.g., background color, margin reset).
*   **`#gameArea`:**
    *   Define dimensions (width, height).
    *   Set a border and/or background color/image.
    *   Use `position: relative;` to allow absolute positioning of child elements (player, objects).
*   **Player Character (e.g., `<div id="player"></div>` created by JS):**
    *   Define dimensions (width, height).
    *   Set a color or background image (placeholder initially).
    *   Use `position: absolute;` for positioning within `#gameArea`.
    *   Initial bottom and left/right positioning.
*   **Falling Objects (e.g., `<div class="fallingObject"></div>` created by JS):**
    *   Define dimensions (width, height).
    *   Set a color or background image (placeholder initially).
    *   Use `position: absolute;` for positioning.
*   **`#scoreBoard`:**
    *   Style font (family, size, color).
    *   Position on the page (e.g., top-left corner).

### 4. JavaScript Logic (`kaspers-game/script.js`)

*   **DOM Element References:**
    *   Get references to `#gameArea` and `#scoreBoard`.
*   **Game State Variables:**
    *   `player`: Object to store player's properties (e.g., element, x-position, speed).
    *   `fallingObjects`: Array to store active falling object elements and their properties (e.g., y-position, speed).
    *   `score`: Number, initialized to 0.
    *   `gameAreaBounds`: Object storing dimensions of the game area.
*   **Player Logic:**
    *   Function to create and append the player element to `#gameArea`.
    *   Function to update the player's visual position (CSS `left` property).
    *   Event listener for `keydown` to detect `ArrowLeft` and `ArrowRight` presses.
    *   Logic to move the player left/right, ensuring it stays within the `gameAreaBounds`.
*   **Falling Objects Logic:**
    *   Function to create a new falling object element:
        *   Random horizontal starting position (x-coordinate) at the top of `#gameArea`.
        *   Append to `#gameArea`.
        *   Add to the `fallingObjects` array.
    *   Function to update the vertical position (CSS `top` property) of each object in `fallingObjects`, making it fall.
    *   Logic to remove objects from the DOM and the `fallingObjects` array if they fall below the bottom of `#gameArea`.
*   **Collision Detection:**
    *   Function to check for overlap between the player's rectangle and each falling object's rectangle.
    *   If a collision occurs:
        *   Increment `score`.
        *   Update the text content of `#scoreBoard`.
        *   Remove the caught object from the DOM and the `fallingObjects` array.
*   **Game Loop:**
    *   A main function (e.g., `gameTick()`) that uses `requestAnimationFrame(gameTick)` for smooth animation.
    *   Inside the loop:
        *   Periodically call the function to create new falling objects.
        *   Call the function to update positions of all falling objects.
        *   Call the function to update player position (though movement is event-driven, redraw might be needed if not directly manipulating style in event handler).
        *   Call the collision detection function.
*   **Initialization Function (e.g., `initGame()`):**
    *   Called when the script loads.
    *   Sets up initial game state (score = 0, player position).
    *   Creates the player element.
    *   Starts the game loop.

### 5. Visual Enhancements (Iteration 1)

*   **Player Character:**
    *   **Visual:** Change from a gold orb to a spaceship emoji (🚀).
    *   **Implementation:**
        *   **CSS ([`style.css`](kaspers-game/style.css)):** Modify `#player` styles. Remove `background-color` and `border-radius`. Adjust `width`, `height`, and `font-size` to appropriately size the emoji. Ensure it's centered.
        *   **JavaScript ([`script.js`](kaspers-game/script.js)):**
            *   In `initGame()`, set the `textContent` of `player.element` to '🚀'.
            *   Adjust `player.width` and `player.height` in the `player` object to match the visual size of the emoji for accurate collision detection.
*   **Background:**
    *   Apply a subtle, space-themed static background image to the main page (`body`).
    *   A placeholder URL will be used initially. (e.g., `url('https://www.transparenttextures.com/patterns/stardust.png')` or similar, to be refined).
*   **Falling Object Visuals:**
    *   **Good Objects:**
        *   **Colors:** Implement a palette of friendly, bright colors (e.g., bright blue (`#3498db`), green (`#2ecc71`), orange (`#e67e22`), in addition to the existing purple (`#9b59b6`)).
        *   **Shapes:** Continue using simple shapes (circle, square, triangle), randomly assigned.
        *   **Animation:** Some good objects will have a spinning animation.
    *   **Bad Objects:**
        *   **Color:** Remain distinctly red (`#e74c3c`).
        *   **Shape:** Red circles.
    *   **Golden Diamond:**
        *   **Visuals:** Gold (`#f1c40f`), diamond shape, spinning.
    *   **Skull Shape:**
        *   **Visuals:** Dark/black (`#34495e`) with a skull icon (💀).
*   **Implementation Notes:**
    *   [`style.css`](kaspers-game/style.css) will be updated for the player emoji, background image, and new classes for falling object colors, shapes, and animations.
    *   [`script.js`](kaspers-game/script.js) will be updated:
        *   `initGame()` to set player emoji.
        *   `player` object with appropriate dimensions for the emoji.
        *   `createFallingObject` function to randomly assign colors and shapes to "good" objects and ensure other special objects maintain their defined appearances.

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