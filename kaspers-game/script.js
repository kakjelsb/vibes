// Centralized game state object
const gameState = {
    fallingObjects: [],
    lasers: [],
    objectCreationInterval: null,
    frequencySlider: null,
    frequencyValueDisplay: null,
    muteButton: null,
    muted: false,
    gameAreaWidth: 0,
    gameAreaHeight: 0,
    keysPressed: {},
    score1: 0,
    score2: 0,
    scoreBoard1: null,
    scoreBoard2: null,
    player1: {
        element: null,
        x: 0,
        y: 0,
        width: 80,
        height: 60,
        speed: 10,
        keys: { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' },
        sleepEndTime: 0,
        magnetEndTime: 0
    },
    player2: {
        element: null,
        x: 0,
        y: 0,
        width: 80,
        height: 60,
        speed: 10,
        keys: { left: 'a', right: 'd', up: 'w', down: 's' },
        sleepEndTime: 0,
        magnetEndTime: 0
    },
    // Sound effects
    yippeeSound: new Audio('sfx/yippee.m4a'),
    ouchSound: new Audio('sfx/ouch.m4a'),
    yahooSound: new Audio('sfx/yahoo.m4a'),
    owowowowSound: new Audio('sfx/owowowow.m4a'),
};

// Configuration for falling objects
const fallingObjectConfigs = {
    good: {
        emojis: ['⭐', '🌟', '✨', '💫'],
        points: 1,
        sound: gameState.yippeeSound,
        width: 50,
        height: 50,
        baseSpeed: 3,
        speedVariance: 2,
        spinChance: 0.3
    },
    bad: {
        emojis: ['👾'],
        points: -1,
        sound: gameState.ouchSound,
        width: 50,
        height: 50,
        baseSpeed: 3,
        speedVariance: 2,
        spinChance: 1 // Always spin
    },
    diamond: {
        emojis: ['💎', '💠', '🔷', '🔶'],
        points: 10,
        sound: gameState.yahooSound,
        width: 50,
        height: 50,
        baseSpeed: 3,
        speedVariance: 2,
        spinChance: 1 // Always spin
    },
    skull: {
        emojis: ['💀'],
        points: 0, // Special handling for score reset
        sound: gameState.owowowowSound,
        width: 50,
        height: 50,
        baseSpeed: 3,
        speedVariance: 2,
        spinChance: 1 // Always spin
    },
    powerupSleep: {
        emojis: ['😴'],
        points: 0,
        sound: gameState.yippeeSound,
        width: 50,
        height: 50,
        baseSpeed: 3,
        speedVariance: 2,
        spinChance: 0.3
    },
    powerupMagnet: {
        emojis: ['🧲'],
        points: 0,
        sound: gameState.yahooSound,
        width: 50,
        height: 50,
        baseSpeed: 3,
        speedVariance: 2,
        spinChance: 0.3
    }
};

// DOM elements (still global for easy access, but their properties are in gameState)
const gameArea = document.getElementById('gameArea');

// Update gameAreaWidth and gameAreaHeight after the DOM is loaded and styled
document.addEventListener('DOMContentLoaded', () => {
    gameState.gameAreaWidth = gameArea.clientWidth;
    gameState.gameAreaHeight = gameArea.clientHeight;
});

function initGame() {
    // Initialize score boards
    gameState.scoreBoard1 = document.getElementById('score1');
    gameState.scoreBoard2 = document.getElementById('score2');

    // Create player1 element
    gameState.player1.element = document.createElement('div');
    gameState.player1.element.id = 'player1';
    gameState.player1.element.classList.add('player-ship'); // Add base player-ship class
    gameState.player1.element.textContent = '🚀';
    gameArea.appendChild(gameState.player1.element);

    // Create player2 element
    gameState.player2.element = document.createElement('div');
    gameState.player2.element.id = 'player2';
    gameState.player2.element.classList.add('player-ship'); // Add base player-ship class
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

    // Set up mute button
    gameState.muteButton = document.getElementById('muteButton');
    gameState.muteButton.addEventListener('click', () => {
        gameState.muted = !gameState.muted;
        gameState.muteButton.textContent = gameState.muted ? '🔇 Muted' : '🔊 Unmuted';
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
    const objectTypes = ['good', 'bad', 'diamond', 'skull', 'powerupSleep', 'powerupMagnet'];
    const rand = Math.random();
    let type = 'good';
    if (rand < 0.66) {
        type = 'good';
    } else if (rand < 0.80) {
        type = 'bad';
    } else if (rand < 0.90) {
        type = 'diamond';
    } else if (rand < 0.95) {
        type = 'skull';
    } else if (rand < 0.98) {
        type = 'powerupSleep';
    } else {
        type = 'powerupMagnet';
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
    className += ` glow-${type}`;

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
    } else if (type === 'powerupSleep') {
        content = '😴';
    } else if (type === 'powerupMagnet') {
        content = '🧲';
    }

    const object = {
        element: document.createElement('div'),
        x: 0,
        y: 0,
        width: width,
        height: height,
        speed: speed,
        type: type,
        dx: 0,
        lastShotTime: 0
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

function applyMagnetEffect(object, playerObj) {
    // Only attract positive items
    if (object.type !== 'good' && object.type !== 'diamond') {
        return;
    }

    // Calculate direction to player
    const playerCenterX = playerObj.x + playerObj.width / 2;
    const playerCenterY = playerObj.y + playerObj.height / 2;
    const objectCenterX = object.x + object.width / 2;
    const objectCenterY = object.y + object.height / 2;

    const dx = playerCenterX - objectCenterX;
    const dy = playerCenterY - objectCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        // Normalize direction and apply magnet force
        const magnetForce = 8;
        object.x += (dx / distance) * magnetForce;
        object.y += (dy / distance) * magnetForce;
    }
}

function updateLasers() {
    for (let i = 0; i < gameState.lasers.length; i++) {
        const laser = gameState.lasers[i];
        laser.x += laser.vx;
        laser.y += laser.vy;
        laser.element.style.left = `${laser.x}px`;
        laser.element.style.top = `${laser.y}px`;

        // Check collision with players
        if (checkCollision(gameState.player1, laser)) {
            createExplosion(gameState.player1.x + gameState.player1.width / 2, gameState.player1.y + gameState.player1.height / 2);
            if (gameState.score1 > 0) {
                gameState.score1 -= 1;
            }
            updateScoreDisplay(gameState.player1);
            removeLaser(i);
            i--;
        } else if (checkCollision(gameState.player2, laser)) {
            createExplosion(gameState.player2.x + gameState.player2.width / 2, gameState.player2.y + gameState.player2.height / 2);
            if (gameState.score2 > 0) {
                gameState.score2 -= 1;
            }
            updateScoreDisplay(gameState.player2);
            removeLaser(i);
            i--;
        } else if (laser.x + laser.width < 0 || laser.x > gameState.gameAreaWidth ||
                   laser.y + laser.height < 0 || laser.y > gameState.gameAreaHeight) {
            removeLaser(i);
            i--;
        }
    }
}

function shootLasersFromAliens() {
    for (let i = 0; i < gameState.fallingObjects.length; i++) {
        const object = gameState.fallingObjects[i];
        if (object.type === 'bad') {
            const now = Date.now();
            // Shoot every 2-3 seconds
            if (now - object.lastShotTime > 2000 + Math.random() * 1000) {
                createLaser(object);
                object.lastShotTime = now;
            }
        }
    }
}

function updateFallingObjects() {
    const now = Date.now();
    const player1HasMagnet = now < gameState.player1.magnetEndTime;
    const player2HasMagnet = now < gameState.player2.magnetEndTime;

    for (let i = 0; i < gameState.fallingObjects.length; i++) {
        const object = gameState.fallingObjects[i];
        object.y += object.speed;
        object.x += object.dx;

        // Apply magnet effect if any player has magnet active
        if (player1HasMagnet) {
            applyMagnetEffect(object, gameState.player1);
        }
        if (player2HasMagnet) {
            applyMagnetEffect(object, gameState.player2);
        }

        object.element.style.top = `${object.y}px`;
        object.element.style.left = `${object.x}px`;

        if (checkCollision(gameState.player1, object)) {
            handleCollision(gameState.player1, object, i);
            i--;
        }
        else if (checkCollision(gameState.player2, object)) {
            handleCollision(gameState.player2, object, i);
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

function updateScoreDisplay(playerObj) {
    if (playerObj === gameState.player1) {
        gameState.scoreBoard1.textContent = `🚀 Score: ${gameState.score1}`;
    } else {
        gameState.scoreBoard2.textContent = `🚀 Score: ${gameState.score2}`;
    }
}

function handleCollision(playerObj, object, index) {
    const config = fallingObjectConfigs[object.type];
    if (config) {
        if (object.type === 'skull') { // Special handling for skull
            if (playerObj === gameState.player1) {
                gameState.score1 = 0;
            } else {
                gameState.score2 = 0;
            }
        } else if (object.type === 'powerupSleep') { // Special handling for sleep powerup
            const sleepDuration = 5000; // 5 seconds
            playerObj.sleepEndTime = Date.now() + sleepDuration;
            playerObj.element.classList.add('sleeping');
        } else if (object.type === 'powerupMagnet') { // Special handling for magnet powerup
            const magnetDuration = 8000; // 8 seconds
            playerObj.magnetEndTime = Date.now() + magnetDuration;
            playerObj.element.classList.add('magnetized');
        } else {
            if (playerObj === gameState.player1) {
                gameState.score1 += config.points;
            } else {
                gameState.score2 += config.points;
            }
        }
        if (!gameState.muted) {
            config.sound.play();
        }
    }
    updateScoreDisplay(playerObj);
    removeObject(index);
}

function removeObject(index) {
    gameArea.removeChild(gameState.fallingObjects[index].element);
    gameState.fallingObjects.splice(index, 1);
}

function createLaser(alienObj) {
    const targetPlayer = Math.random() < 0.5 ? gameState.player1 : gameState.player2;
    const laser = {
        element: document.createElement('div'),
        x: alienObj.x + alienObj.width / 2,
        y: alienObj.y + alienObj.height,
        width: 8,
        height: 30,
        speed: 7,
        targetX: targetPlayer.x + targetPlayer.width / 2,
        targetY: targetPlayer.y + targetPlayer.height / 2
    };

    // Calculate direction
    const dx = laser.targetX - laser.x;
    const dy = laser.targetY - laser.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    laser.vx = (dx / distance) * laser.speed;
    laser.vy = (dy / distance) * laser.speed;

    // Calculate rotation angle
    laser.angle = Math.atan2(laser.vy, laser.vx) * (180 / Math.PI) + 90;

    laser.element.className = 'laser';
    laser.element.style.width = `${laser.width}px`;
    laser.element.style.height = `${laser.height}px`;
    laser.element.style.left = `${laser.x}px`;
    laser.element.style.top = `${laser.y}px`;
    laser.element.style.transform = `translate(-50%, -50%) rotate(${laser.angle}deg)`;
    gameArea.appendChild(laser.element);
    gameState.lasers.push(laser);
}

function removeLaser(index) {
    gameArea.removeChild(gameState.lasers[index].element);
    gameState.lasers.splice(index, 1);
}

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;
    gameArea.appendChild(explosion);

    // Remove explosion after animation ends
    setTimeout(() => {
        gameArea.removeChild(explosion);
    }, 600);
}

function checkCollision(playerObj, object) {
    return playerObj.x < object.x + object.width &&
           playerObj.x + playerObj.width > object.x &&
           playerObj.y < object.y + object.height &&
           playerObj.y + playerObj.height > object.y;
}

function handlePlayerMovement(playerObj) {
    // Check if player is sleeping
    const isSleeping = Date.now() < playerObj.sleepEndTime;

    if (isSleeping) {
        return; // Don't move if sleeping
    }

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

function updatePlayerStates(playerObj) {
    const now = Date.now();

    // Handle sleep state
    const isSleeping = now < playerObj.sleepEndTime;
    if (!isSleeping && playerObj.element.classList.contains('sleeping')) {
        playerObj.element.classList.remove('sleeping');
    }

    // Handle magnet state
    const hasMagnet = now < playerObj.magnetEndTime;
    if (!hasMagnet && playerObj.element.classList.contains('magnetized')) {
        playerObj.element.classList.remove('magnetized');
    }
}

function gameLoop() {
    updatePlayerStates(gameState.player1);
    updatePlayerStates(gameState.player2);

    handlePlayerMovement(gameState.player1);
    handlePlayerMovement(gameState.player2);

    updateFallingObjects();
    shootLasersFromAliens();
    updateLasers();
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