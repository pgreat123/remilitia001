// DOM Elements
const homeInterface = document.getElementById("home-interface");
const gameOverScreen = document.getElementById("game-over-screen");
const gameContainer = document.getElementById("game-container");
const startGameButton = document.getElementById("start-game-button");
const returnHomeButton = document.getElementById("return-home-button");
const restartGameButton = document.getElementById("restart-game-button");
const pauseButton = document.getElementById("pause-button");
const playButton = document.getElementById("play-button");
const gameArea = document.getElementById("game-area");
const chameleon = document.getElementById("chameleon");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const finalScoreElement = document.getElementById("final-score");

// High Score Elements
const scoreList = document.getElementById("score-list");
const returnToHomeButton = document.getElementById("return-to-home-button");

// Game Variables
let score = 0;
let lives = 3;
let fallingSpeed = 2000;
let isGameRunning = false;
let isPaused = false;
let chameleonSpeed = 10;
let keys = {};
let gameInterval;
let movementInterval;
let fallingItems = []; // Track falling items

// Array to store top 5 scores
let topScores = JSON.parse(localStorage.getItem("topScores")) || [];

// Start Game
startGameButton.addEventListener("click", () => {
    homeInterface.style.display = "none";
    gameContainer.style.display = "block";
    resetGame();
    isGameRunning = true;
    startFallingItems();  // Start falling items
    enableChameleonMovement();  // Enable chameleon movement
    document.body.classList.add("no-scroll"); // Disable scrolling and make the page static
    pauseButton.disabled = false; // Enable the pause button when the game starts
});

// Return to Home
returnHomeButton.addEventListener("click", () => {
    gameOverScreen.style.display = "none";
    homeInterface.style.display = "block";
    document.body.classList.remove("no-scroll"); // Enable scrolling when returning to home
});

// Restart Game
restartGameButton.addEventListener("click", () => {
    resetGame();
    restartGameButton.style.display = "none";
    pauseButton.disabled = false; // Enable the pause button when the game restarts
    isGameRunning = true;
    startFallingItems();  // Start falling items
    enableChameleonMovement();  // Enable chameleon movement
    document.body.classList.add("no-scroll"); // Disable scrolling during gameplay
});

// Pause Game
pauseButton.addEventListener("click", () => {
    if (isPaused) return; // Prevent the pause button from being clicked if it's already paused

    isPaused = true;
    pauseButton.disabled = true; // Disable the pause button to prevent re-clicking while paused
    playButton.style.display = "inline-block";
    clearInterval(gameInterval);  // Stop falling items
    clearInterval(movementInterval);  // Stop chameleon movement

    // Stop all falling item intervals (already falling items will stop)
    fallingItems.forEach(item => {
        clearInterval(item.interval); // Stop each falling item's interval
    });
    document.body.classList.remove("no-scroll"); // Enable scrolling when paused
});

// Resume Game
playButton.addEventListener("click", () => {
    isPaused = false;
    playButton.style.display = "none";
    pauseButton.disabled = false; // Enable the pause button when the game is resumed
    pauseButton.style.display = "inline-block"; // Ensure pause button is visible again
    document.body.classList.add("no-scroll"); // Disable scrolling during gameplay

    // Resume falling items
    fallingItems.forEach(item => {
        if (item.interval) {
            item.interval = setInterval(() => {
                item.element.style.top = `${item.element.offsetTop + 5}px`;

                const itemRect = item.element.getBoundingClientRect();
                const chameleonRect = chameleon.getBoundingClientRect();

                // Collision Detection
                if (
                    itemRect.bottom > chameleonRect.top &&
                    itemRect.left < chameleonRect.right &&
                    itemRect.right > chameleonRect.left
                ) {
                    score++;
                    scoreElement.textContent = score;
                    item.element.remove();
                    clearInterval(item.interval);

                    // Increase speed at score milestones
                    if (score % 30 === 0) {
                        fallingSpeed = Math.max(500, fallingSpeed - 500);
                        clearInterval(gameInterval);
                        startFallingItems();
                    }
                }

                // Remove item if it falls past the game area
                if (item.element.offsetTop > gameArea.offsetHeight) {
                    lives--;
                    livesElement.textContent = lives;
                    item.element.remove();
                    clearInterval(item.interval);

                    if (lives <= 0) {
                        endGame();
                    }
                }
            }, 50);  // Resume the falling interval
        }
    });

    startFallingItems();  // Continue spawning new falling items
    enableChameleonMovement();  // Resume chameleon movement
});

// Reset Game
function resetGame() {
    score = 0;
    lives = 3;
    fallingSpeed = 2000; // Reset falling speed
    isGameRunning = false;
    isPaused = false;
    clearInterval(gameInterval);
    clearInterval(movementInterval);
    scoreElement.textContent = score;
    livesElement.textContent = lives;

    // Clear falling items
    const items = document.querySelectorAll(".falling-item");
    items.forEach((item) => item.remove());

    // Reset chameleon position
    chameleon.style.left = "50%";
    fallingItems = [];  // Reset the falling items tracker
}

// Start Falling Items
function startFallingItems() {
    if (isPaused || !isGameRunning) return;  // Prevent starting if the game is paused
    gameInterval = setInterval(() => {
        if (isPaused) return;  // Prevent falling items if paused

        const item = document.createElement("div");
        item.classList.add("falling-item");
        item.style.left = `${Math.random() * (gameArea.offsetWidth - 30)}px`;
        item.style.top = "0px";
        gameArea.appendChild(item);

        const itemData = {
            element: item,
            interval: setInterval(() => {
                item.style.top = `${item.offsetTop + 5}px`;

                const itemRect = item.getBoundingClientRect();
                const chameleonRect = chameleon.getBoundingClientRect();

                // Collision Detection
                if (
                    itemRect.bottom > chameleonRect.top &&
                    itemRect.left < chameleonRect.right &&
                    itemRect.right > chameleonRect.left
                ) {
                    score++;
                    scoreElement.textContent = score;
                    item.remove();
                    clearInterval(itemData.interval);

                    // Increase speed at score milestones
                    if (score % 30 === 0) {
                        fallingSpeed = Math.max(500, fallingSpeed - 500);
                        clearInterval(gameInterval);
                        startFallingItems();
                    }
                }

                // Remove item if it falls past the game area
                if (item.offsetTop > gameArea.offsetHeight) {
                    lives--;
                    livesElement.textContent = lives;
                    item.remove();
                    clearInterval(itemData.interval);

                    if (lives <= 0) {
                        endGame();
                    }
                }
            }, 50),
        };

        // Store the interval for future reference
        fallingItems.push(itemData);
    }, fallingSpeed);
}

// Reduce container size
gameContainer.style.width = "60%";
gameContainer.style.height = "60vh";
gameContainer.style.margin = "auto";

gameArea.style.width = "100%";
gameArea.style.height = "100%";
gameArea.style.position = "relative";
gameArea.style.backgroundSize = "cover";
gameArea.style.backgroundPosition = "center";

chameleon.style.margin = "5px";
chameleon.style.padding = "5px";
// Enable Chameleon Movement
function enableChameleonMovement() {
    window.addEventListener("keydown", (e) => {
        keys[e.key] = true;
    });

    window.addEventListener("keyup", (e) => {
        keys[e.key] = false;
    });

    movementInterval = setInterval(() => {
        if (!isGameRunning || isPaused) return;

        const chameleonLeft = parseInt(window.getComputedStyle(chameleon).left);
        const gameAreaWidth = gameArea.offsetWidth;
        const chameleonWidth = chameleon.offsetWidth;

        // Move Left
        if (keys["ArrowLeft"] && chameleonLeft > 0) {
            chameleon.style.left = `${chameleonLeft - chameleonSpeed}px`;
        }

        // Move Right
        if (keys["ArrowRight"] && chameleonLeft < gameAreaWidth - chameleonWidth) {
            chameleon.style.left = `${Math.min(chameleonLeft + chameleonSpeed, gameAreaWidth - chameleonWidth)}px`;
        }
    }, 20);

    // Mobile and Desktop Touch Support
    let touchStartX = 0;
    let touchEndX = 0;

    gameArea.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    gameArea.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: false });
    
    gameArea.addEventListener("touchmove", (e) => {
        e.preventDefault(); // stop scrolling
    
        const touchX = e.changedTouches[0].clientX;
        const touchDiff = touchX - touchStartX;
    
        const chameleonLeft = parseInt(window.getComputedStyle(chameleon).left);
        const gameAreaWidth = gameArea.offsetWidth;
        const chameleonWidth = chameleon.offsetWidth;
    
        // Ignore small swipes
        if (Math.abs(touchDiff) > 5) {
            const moveAmount = touchDiff / 2; // smaller movement for smoother control
    
            if (moveAmount > 0) {
                // Move right
                chameleon.style.left = `${Math.min(chameleonLeft + moveAmount, gameAreaWidth - chameleonWidth)}px`;
            } else {
                // Move left
                chameleon.style.left = `${Math.max(chameleonLeft + moveAmount, 0)}px`;
            }
    
            // Update starting point to allow continuous dragging
            touchStartX = touchX;
        }
    });
    
    
        if (touchDiff > 5) { // swipe right
            chameleon.style.left = `${Math.min(chameleonLeft + touchDiff, gameAreaWidth - chameleonWidth)}px`;
        } else if (touchDiff < -5) { // swipe left
            chameleon.style.left = `${Math.max(chameleonLeft + touchDiff, 0)}px`;
        }
    
}


// End Game
function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    clearInterval(movementInterval);
    finalScoreElement.textContent = score;
    gameContainer.style.display = "none";
    gameOverScreen.style.display = "block";
    updateHighScores(score);  // Update high scores after game over
    displayHighScores();  // Display high scores
}

// Update High Scores
function updateHighScores(newScore) {
    topScores.push(newScore);
    topScores.sort((a, b) => b - a); // Sort scores in descending order
    if (topScores.length > 5) topScores.pop(); // Keep only top 5 scores
    localStorage.setItem("topScores", JSON.stringify(topScores));
}

// Display High Scores
function displayHighScores() {
    scoreList.innerHTML = ""; // Clear the list
    topScores.forEach((score, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `#${index + 1}: ${score}`;
        scoreList.appendChild(listItem);
    });
}

// Event Listener for Return Home Button
returnToHomeButton.addEventListener("click", () => {
    document.getElementById("high-score-page").style.display = "none";
    document.getElementById("home-interface").style.display = "block";
    document.body.classList.remove("no-scroll"); // Remove static behavior when returning home
})