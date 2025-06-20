// Centralized game state object
const gameState = {
    score: 0,
    fallingObjects: [],
    objectCreationInterval: null,
    frequencySlider: null,
    frequencyValueDisplay: null,
    gameAreaWidth: 0,
    gameAreaHeight: 0,
    keysPressed: {},
    player1: {
        element: null,
        x: 0,
        y: 0,
        width: 80,
        height: 60,
        speed: 10,
        keys: { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }
    },
    player2: {
        element: null,
        x: 0,
        y: 0,
        width: 80,
        height: 60,
        speed: 10,
        keys: { left: 'a', right: 'd', up: 'w', down: 's' }
    },
    // Sound effects
    yippeeSound: new Audio('sfx/yippee.m4a'),
    ouchSound: new Audio('sfx/ouch.m4a'),
    yahooSound: new Audio('sfx/yahoo.m4a'),
    owowowowSound: new Audio('sfx/owowowow.m4a'),
};

// DOM elements (still global for easy access, but their properties are in gameState)
const gameArea = document.getElementById('gameArea');
const scoreBoard = document.getElementById('scoreBoard');

// Update gameAreaWidth and gameAreaHeight after the DOM is loaded and styled
document.addEventListener('DOMContentLoaded', () => {
    gameState.gameAreaWidth = gameArea.clientWidth;
    gameState.gameAreaHeight = gameArea.clientHeight;
});

function initGame() {
    // Create player1 element
    gameState.player1.element = document.createElement('div');
    gameState.player1.element.id = 'player1';
    gameState.player1.element.textContent = '🚀';
    gameArea.appendChild(gameState.player1.element);

    // Create player2 element
    gameState.player2.element = document.createElement('div');
    gameState.player2.element.id = 'player2';
    gameState.player2.element.textContent = '🚀';
    gameArea.appendChild(gameState.player2.element);

    // Set initial player positions
    gameState.player1.x = (gameState.gameAreaWidth / 2) - gameState.player1.width - 10;
    gameState.player1.y = gameState.gameAreaHeight - gameState.player1.height - 50;
    updatePlayerPosition(gameState.player1);

    gameState.player2.x = (gameState.gameAreaWidth / 2) + 10;
    gameState.player2.y = gameState.gameAreaHeight - gameState.player2.height - 50;
    updatePlayerPosition(gameState.player2);

    // Start generating falling objects
    gameState.frequencySlider = document.getElementById('frequencySlider');
    gameState.frequencyValueDisplay = document.getElementById('frequencyValue');

    // Set initial frequency display
    gameState.frequencyValueDisplay.textContent = `${(gameState.frequencySlider.value / 1000).toFixed(1)}s`;

    // Start generating falling objects with initial frequency
    startObjectCreationInterval(parseInt(gameState.frequencySlider.value));

    // Add event listener for slider changes
    gameState.frequencySlider.addEventListener('input', (e) => {
        const newInterval = parseInt(e.target.value);
        gameState.frequencyValueDisplay.textContent = `${(newInterval / 1000).toFixed(1)}s`;
        startObjectCreationInterval(newInterval);
    });

    // Start the game loop
    gameLoop();
}

function startObjectCreationInterval(interval) {
    clearInterval(gameState.objectCreationInterval);
    gameState.objectCreationInterval = setInterval(createFallingObject, interval);
}

function updatePlayerPosition(playerObj) {
    playerObj.element.style.left = `${playerObj.x}px`;
    playerObj.element.style.top = `${playerObj.y}px`;
}

function createFallingObject() {
    const objectTypes = ['good', 'bad', 'diamond', 'skull'];
    const rand = Math.random();
    let type = 'good';
    if (rand < 0.70) {
        type = 'good';
    } else if (rand < 0.85) {
        type = 'bad';
    } else if (rand < 0.95) {
        type = 'diamond';
    } else {
        type = 'skull';
    }

    let className = 'fallingObject';
    let content = '';
    let width = 50;
    let height = 50;
    let speed = 3 + Math.random() * 2;

    const spinSpeeds = ['spin-slow', 'spin-medium', 'spin-fast'];
    const spinDirections = ['cw', 'ccw'];
    const randomSpinSpeed = spinSpeeds[Math.floor(Math.random() * spinSpeeds.length)];
    const randomSpinDirection = spinDirections[Math.floor(Math.random() * spinDirections.length)];
    className += ` ${randomSpinSpeed}-${randomSpinDirection}`;

    if (type === 'good') {
        const goodEmojis = ['⭐', '🌟', '✨', '💫'];
        content = goodEmojis[Math.floor(Math.random() * goodEmojis.length)];
    } else if (type === 'bad') {
        content = '👾';
    } else if (type === 'diamond') {
        const diamondEmojis = ['💎', '💠', '🔷', '🔶'];
        content = diamondEmojis[Math.floor(Math.random() * diamondEmojis.length)];
    } else if (type === 'skull') {
        content = '💀';
    }

    const object = {
        element: document.createElement('div'),
        x: 0,
        y: 0,
        width: width,
        height: height,
        speed: speed,
        type: type,
        dx: 0
    };

    const trajectoryType = Math.random();
    if (trajectoryType < 0.3) {
        object.x = -width;
        object.dx = 1 + Math.random() * 2;
    } else if (trajectoryType < 0.6) {
        object.x = gameState.gameAreaWidth;
        object.dx = -(1 + Math.random() * 2);
    } else {
        object.x = Math.random() * (gameState.gameAreaWidth - width);
        object.dx = (Math.random() - 0.5) * 2;
    }

    object.element.className = className;
    object.element.style.width = `${object.width}px`;
    object.element.style.height = `${object.height}px`;
    object.element.style.left = `${object.x}px`;
    object.element.style.top = `${object.y}px`;
    object.element.textContent = content;
    gameArea.appendChild(object.element);
    gameState.fallingObjects.push(object);
}

function updateFallingObjects() {
    for (let i = 0; i < gameState.fallingObjects.length; i++) {
        const object = gameState.fallingObjects[i];
        object.y += object.speed;
        object.x += object.dx;
        object.element.style.top = `${object.y}px`;
        object.element.style.left = `${object.x}px`;

        if (checkCollision(gameState.player1, object)) {
            handleCollision(object, i);
            i--;
        }
        else if (checkCollision(gameState.player2, object)) {
            handleCollision(object, i);
            i--;
        }
        else if (object.y + object.height > gameState.gameAreaHeight ||
                   object.x + object.width < 0 ||
                   object.x > gameState.gameAreaWidth) {
            removeObject(i);
            i--;
        }
    }
}

function handleCollision(object, index) {
    if (object.type === 'good') {
        gameState.score++;
        gameState.yippeeSound.play();
    } else if (object.type === 'bad') {
        gameState.score--;
        gameState.ouchSound.play();
    } else if (object.type === 'diamond') {
        gameState.score += 10;
        gameState.yahooSound.play();
    } else if (object.type === 'skull') {
        gameState.score = 0;
        gameState.owowowowSound.play();
    }
    scoreBoard.textContent = `Score: ${gameState.score}`;
    removeObject(index);
}

function removeObject(index) {
    gameArea.removeChild(gameState.fallingObjects[index].element);
    gameState.fallingObjects.splice(index, 1);
}

function checkCollision(playerObj, object) {
    return playerObj.x < object.x + object.width &&
           playerObj.x + playerObj.width > object.x &&
           playerObj.y < object.y + object.height &&
           playerObj.y + playerObj.height > object.y;
}

function handlePlayerMovement(playerObj) {
    if (gameState.keysPressed[playerObj.keys.left]) {
        playerObj.x -= playerObj.speed;
    }
    if (gameState.keysPressed[playerObj.keys.right]) {
        playerObj.x += playerObj.speed;
    }
    if (gameState.keysPressed[playerObj.keys.up]) {
        playerObj.y -= playerObj.speed;
    }
    if (gameState.keysPressed[playerObj.keys.down]) {
        playerObj.y += playerObj.speed;
    }

    if (playerObj.x < 0) {
        playerObj.x = 0;
    }
    if (playerObj.x + playerObj.width > gameState.gameAreaWidth) {
        playerObj.x = gameState.gameAreaWidth - playerObj.width;
    }
    if (playerObj.y < 0) {
        playerObj.y = 0;
    }
    if (playerObj.y + playerObj.height > gameState.gameAreaHeight) {
        playerObj.y = gameState.gameAreaHeight - playerObj.height;
    }
    updatePlayerPosition(playerObj);
}

function gameLoop() {
    handlePlayerMovement(gameState.player1);
    handlePlayerMovement(gameState.player2);

    updateFallingObjects();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    const key = e.key;
    if ([gameState.player1.keys.left, gameState.player1.keys.right, gameState.player1.keys.up, gameState.player1.keys.down].includes(key)) {
        gameState.keysPressed[key] = true;
    } else if ([gameState.player2.keys.left, gameState.player2.keys.right, gameState.player2.keys.up, gameState.player2.keys.down].includes(key.toLowerCase())) {
        gameState.keysPressed[key.toLowerCase()] = true;
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key;
    if ([gameState.player1.keys.left, gameState.player1.keys.right, gameState.player1.keys.up, gameState.player1.keys.down].includes(key)) {
        gameState.keysPressed[key] = false;
    } else if ([gameState.player2.keys.left, gameState.player2.keys.right, gameState.player2.keys.up, gameState.player2.keys.down].includes(key.toLowerCase())) {
        gameState.keysPressed[key.toLowerCase()] = false;
    }
});

document.addEventListener('DOMContentLoaded', initGame);