const gameArea = document.getElementById('gameArea');
const scoreBoard = document.getElementById('scoreBoard');

// Sound effects
const yippeeSound = new Audio('sfx/yippee.m4a');
const ouchSound = new Audio('sfx/ouch.m4a');
const yahooSound = new Audio('sfx/yahoo.m4a'); // New sound for diamond
const owowowowSound = new Audio('sfx/owowowow.m4a'); // New sound for skull

const player1 = {
    element: null,
    x: 0,
    y: 0,
    width: 80,
    height: 60, /* Adjusted for emoji size */
    speed: 10,
    keys: { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }
};

const player2 = {
    element: null,
    x: 0,
    y: 0,
    width: 80,
    height: 60, /* Adjusted for emoji size */
    speed: 10,
    keys: { left: 'a', right: 'd', up: 'w', down: 's' }
};

let score = 0;
let fallingObjects = [];
let objectCreationInterval;
let frequencySlider;
let frequencyValueDisplay;

let gameAreaWidth;
let gameAreaHeight;

// Update gameAreaWidth and gameAreaHeight after the DOM is loaded and styled
document.addEventListener('DOMContentLoaded', () => {
    gameAreaWidth = gameArea.clientWidth;
    gameAreaHeight = gameArea.clientHeight;
});

const keysPressed = {};

function initGame() {
    // Create player1 element
    player1.element = document.createElement('div');
    player1.element.id = 'player1';
    player1.element.textContent = '🚀'; // Set spaceship emoji
    gameArea.appendChild(player1.element);

    // Create player2 element
    player2.element = document.createElement('div');
    player2.element.id = 'player2';
    player2.element.textContent = '🚀'; // Set spaceship emoji
    gameArea.appendChild(player2.element);

    // Set initial player positions
    player1.x = (gameAreaWidth / 2) - player1.width - 10; // Left side
    player1.y = gameAreaHeight - player1.height - 50;
    updatePlayerPosition(player1);

    player2.x = (gameAreaWidth / 2) + 10; // Right side
    player2.y = gameAreaHeight - player2.height - 50;
    updatePlayerPosition(player2);

    // Start generating falling objects
    frequencySlider = document.getElementById('frequencySlider');
    frequencyValueDisplay = document.getElementById('frequencyValue');

    // Set initial frequency display
    frequencyValueDisplay.textContent = `${(frequencySlider.value / 1000).toFixed(1)}s`;

    // Start generating falling objects with initial frequency
    startObjectCreationInterval(parseInt(frequencySlider.value));

    // Add event listener for slider changes
    frequencySlider.addEventListener('input', (e) => {
        const newInterval = parseInt(e.target.value);
        frequencyValueDisplay.textContent = `${(newInterval / 1000).toFixed(1)}s`;
        startObjectCreationInterval(newInterval);
    });

    // Start the game loop
    gameLoop();
}

function startObjectCreationInterval(interval) {
    clearInterval(objectCreationInterval); // Clear existing interval
    objectCreationInterval = setInterval(createFallingObject, interval);
}

function updatePlayerPosition(playerObj) {
    playerObj.element.style.left = `${playerObj.x}px`;
    playerObj.element.style.top = `${playerObj.y}px`;
}

function createFallingObject() {
    const objectTypes = ['good', 'bad', 'diamond', 'skull'];
    // Adjust probabilities for different types
    const rand = Math.random();
    let type = 'good';
    if (rand < 0.70) { // 70% good objects
        type = 'good';
    } else if (rand < 0.85) { // 15% bad objects
        type = 'bad';
    } else if (rand < 0.95) { // 10% golden diamond
        type = 'diamond';
    } else { // 5% skull
        type = 'skull';
    }

    let className = 'fallingObject';
    let content = '';
    let width = 50; // All emojis will be 50x50
    let height = 50; // All emojis will be 50x50
    let speed = 3 + Math.random() * 2;

    const spinSpeeds = ['spin-slow', 'spin-medium', 'spin-fast'];
    const spinDirections = ['cw', 'ccw'];
    const randomSpinSpeed = spinSpeeds[Math.floor(Math.random() * spinSpeeds.length)];
    const randomSpinDirection = spinDirections[Math.floor(Math.random() * spinDirections.length)];
    className += ` ${randomSpinSpeed}-${randomSpinDirection}`; // Apply random spin

    if (type === 'good') {
        const goodEmojis = ['⭐', '🌟', '✨', '💫']; // Space-themed stars
        content = goodEmojis[Math.floor(Math.random() * goodEmojis.length)];
    } else if (type === 'bad') {
        content = '👾'; // Alien emoji
    } else if (type === 'diamond') {
        const diamondEmojis = ['💎', '💠', '🔷', '🔶']; // More gemstone emojis
        content = diamondEmojis[Math.floor(Math.random() * diamondEmojis.length)];
    } else if (type === 'skull') {
        content = '💀'; // Skull emoji
    }

    const object = {
        element: document.createElement('div'),
        x: 0, // Initial x will be set based on trajectory
        y: 0,
        width: width,
        height: height,
        speed: speed,
        type: type,
        dx: 0 // Horizontal speed
    };

    // Determine initial x and dx for varied trajectories
    const trajectoryType = Math.random();
    if (trajectoryType < 0.3) { // Top-left to bottom-right
        object.x = -width; // Start slightly off-screen left
        object.dx = 1 + Math.random() * 2; // Move right
    } else if (trajectoryType < 0.6) { // Top-right to bottom-left
        object.x = gameAreaWidth; // Start slightly off-screen right
        object.dx = -(1 + Math.random() * 2); // Move left
    } else { // Straight down (or slight angle)
        object.x = Math.random() * (gameAreaWidth - width);
        object.dx = (Math.random() - 0.5) * 2; // Small random left/right drift
    }

    object.element.className = className;
    object.element.style.width = `${object.width}px`;
    object.element.style.height = `${object.height}px`;
    object.element.style.left = `${object.x}px`;
    object.element.style.top = `${object.y}px`;
    object.element.textContent = content;
    gameArea.appendChild(object.element);
    fallingObjects.push(object);
}

function updateFallingObjects() {
    for (let i = 0; i < fallingObjects.length; i++) {
        const object = fallingObjects[i];
        object.y += object.speed;
        object.x += object.dx; // Update horizontal position
        object.element.style.top = `${object.y}px`;
        object.element.style.left = `${object.x}px`; // Update element's left style

        // Check for collision with player1
        if (checkCollision(player1, object)) {
            handleCollision(object, i);
            i--; // Adjust index after removal
        }
        // Check for collision with player2
        else if (checkCollision(player2, object)) {
            handleCollision(object, i);
            i--; // Adjust index after removal
        }
        else if (object.y + object.height > gameAreaHeight ||
                   object.x + object.width < 0 || // Off screen left
                   object.x > gameAreaWidth) { // Off screen right
            // Object missed or went off screen, remove it
            removeObject(i);
            i--; // Adjust index after removal
        }
    }
}

function handleCollision(object, index) {
    if (object.type === 'good') {
        score++;
        yippeeSound.play();
    } else if (object.type === 'bad') {
        score--;
        ouchSound.play();
    } else if (object.type === 'diamond') {
        score += 10;
        yahooSound.play(); // Use yahoo sound for diamond
    } else if (object.type === 'skull') {
        score = 0; // Lose all points
        owowowowSound.play(); // Use owowowow sound for skull
    }
    scoreBoard.textContent = `Score: ${score}`;
    removeObject(index);
}

function removeObject(index) {
    gameArea.removeChild(fallingObjects[index].element);
    fallingObjects.splice(index, 1);
}

function checkCollision(playerObj, object) {
    // Simple AABB collision detection
    return playerObj.x < object.x + object.width &&
           playerObj.x + playerObj.width > object.x &&
           playerObj.y < object.y + object.height &&
           playerObj.y + playerObj.height > object.y;
}

function gameLoop() {
    // Update player1 position based on pressed keys
    if (keysPressed[player1.keys.left]) {
        player1.x -= player1.speed;
    }
    if (keysPressed[player1.keys.right]) {
        player1.x += player1.speed;
    }
    if (keysPressed[player1.keys.up]) {
        player1.y -= player1.speed;
    }
    if (keysPressed[player1.keys.down]) {
        player1.y += player1.speed;
    }

    // Keep player1 within game area bounds
    if (player1.x < 0) {
        player1.x = 0;
    }
    if (player1.x + player1.width > gameAreaWidth) {
        player1.x = gameAreaWidth - player1.width;
    }
    if (player1.y < 0) {
        player1.y = 0;
    }
    if (player1.y + player1.height > gameAreaHeight) {
        player1.y = gameAreaHeight - player1.height;
    }
    updatePlayerPosition(player1);

    // Update player2 position based on pressed keys
    if (keysPressed[player2.keys.left]) {
        player2.x -= player2.speed;
    }
    if (keysPressed[player2.keys.right]) {
        player2.x += player2.speed;
    }
    if (keysPressed[player2.keys.up]) {
        player2.y -= player2.speed;
    }
    if (keysPressed[player2.keys.down]) {
        player2.y += player2.speed;
    }

    // Keep player2 within game area bounds
    if (player2.x < 0) {
        player2.x = 0;
    }
    if (player2.x + player2.width > gameAreaWidth) {
        player2.x = gameAreaWidth - player2.width;
    }
    if (player2.y < 0) {
        player2.y = 0;
    }
    if (player2.y + player2.height > gameAreaHeight) {
        player2.y = gameAreaHeight - player2.height;
    }
    updatePlayerPosition(player2);

    updateFallingObjects();
    requestAnimationFrame(gameLoop);
}

// Keyboard input handling
document.addEventListener('keydown', (e) => {
    const key = e.key; // Use original key value
    if ([player1.keys.left, player1.keys.right, player1.keys.up, player1.keys.down].includes(key)) {
        keysPressed[key] = true;
    } else if ([player2.keys.left, player2.keys.right, player2.keys.up, player2.keys.down].includes(key.toLowerCase())) {
        keysPressed[key.toLowerCase()] = true; // Convert WASD to lowercase for consistency
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key; // Use original key value
    if ([player1.keys.left, player1.keys.right, player1.keys.up, player1.keys.down].includes(key)) {
        keysPressed[key] = false;
    } else if ([player2.keys.left, player2.keys.right, player2.keys.up, player2.keys.down].includes(key.toLowerCase())) {
        keysPressed[key.toLowerCase()] = false; // Convert WASD to lowercase for consistency
    }
});

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initGame);