// Game variables
let canvas, context, player, obstacles, gameLoop, gameOver, score;
let playerImage, obstacleImage;

// Game settings
let botSpeed = 0.1; // Adjust the bot car speed
let spawnChance = 0.5; // Adjust the spawn chance of obstacles
let maxActiveBotCars = 1; // Adjust the maximum number of active bot cars as needed

// Mobile controls
let leftButton, rightButton, upButton, downButton;

// Define sound effects
let carMoveSound = new Audio("/sounds/car-move.wav");
let gameOverSound = new Audio("sounds/game-over.wav");

// Initialize the game
function initialize() {
  canvas = document.getElementById("game-canvas");
  context = canvas.getContext("2d");
  player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 100,
    speed: 50,
  };

  // Set the background image
  canvas.style.backgroundImage = "url('/img/bg.png')";
  obstacles = []; // Array to store obstacle objects
  gameOver = false;
  score = 0;

  // Load car images
  playerImage = new Image();
  playerImage.src = "/img/player.png";
  obstacleImage = new Image();
  obstacleImage.src = "/img/bot.png";
  playerImage.onload = () => {
    obstacleImage.onload = () => {
      // Add event listeners
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);

      // Create mobile control buttons
      createMobileControls();

      // Start the game loop
      gameLoop = setInterval(updateGame, 20);
    };
  };
}

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

// Handle keyboard key down events
function handleKeyDown(event) {
  // Handle specific key codes for player movement
  if (event.keyCode === 37 || event.keyCode === 65) {
    // Left arrow key or 'A' key
    player.x -= player.speed;
  } else if (event.keyCode === 39 || event.keyCode === 68) {
    // Right arrow key or 'D' key
    player.x += player.speed;
  } else if (event.keyCode === 38 || event.keyCode === 87) {
    // Up arrow key or 'W' key
    player.y -= player.speed;
  } else if (event.keyCode === 40 || event.keyCode === 83) {
    // Down arrow key or 'S' key
    player.y += player.speed;
  }
}

// Play car movement sound effect
function playCarMoveSound() {
  carMoveSound.currentTime = 0;
  carMoveSound.play();
}

// Play game over sound effect
function playGameOverSound() {
  gameOverSound.currentTime = 0;
  gameOverSound.play();
}

// Handle keyboard key up events
function handleKeyUp(event) {
  // Handle specific key codes for player movement
  if (
    event.keyCode === 38 ||
    event.keyCode === 40 ||
    event.keyCode === 87 ||
    event.keyCode === 83
  ) {
    // Stop player movement
    player.y = player.y;
  }
}

// Update the game state
function updateGame() {
  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the player's car
  context.drawImage(
    playerImage,
    player.x,
    player.y,
    player.width,
    player.height
  );

  if (!gameOver) {
    // Spawn obstacles randomly
    if (Math.random() < spawnChance && obstacles.length < maxActiveBotCars) {
      let obstacle = {
        x: getRandomNumber(0, canvas.width - 50), // Random x position
        y: -100, // Start the bot car above the canvas
        width: 150,
        height: 150,
        speed: getRandomNumber(0.01, 0.05), // Adjust the speed range as needed
        passed: false,
      };
      obstacles.push(obstacle);
      playCarMoveSound();
    }

    // Update obstacle positions and check for passing
    for (let i = 0; i < obstacles.length; i++) {
      let obstacle = obstacles[i];
      obstacle.y += obstacle.speed;

      // Check if player has passed an obstacle
      if (obstacle.y > player.y + player.height && !obstacle.passed) {
        obstacle.passed = true;
        score++;
      }

      // Reset obstacle position and passed status if it moves out of the canvas
      if (obstacle.y > canvas.height) {
        obstacles.splice(i, 1); // Remove the obstacle from the array
        i--; // Decrement the index to account for the removed obstacle
      }

      // Draw obstacles
      context.drawImage(
        obstacleImage,
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );

      // Detect collision between player and obstacle
      if (isColliding(player, obstacle)) {
        // Game over logic
        gameOver = true;
        clearInterval(gameLoop);
        showGameOver();

        // Play game over sound effect
        playGameOverSound();
        return; // Exit the function to stop further processing
      }
    }
  }

  // Draw score
  context.fillStyle = "#fff";
  context.font = "24px Arial";
  context.fillText("Score: " + score, 10, 30);

  // Restrict player movement within the canvas
  if (player.x < 0) {
    player.x = 0;
  } else if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
  if (player.y < 0) {
    player.y = 0;
  } else if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
  }

  if (!gameOver) {
    // Continue the game loop
    requestAnimationFrame(updateGame);
  }
}

// Function to check collision between two objects
function isColliding(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Show game over message and play again button
function showGameOver() {
  // Create game over message
  let gameOverMsg = document.createElement("div");
  gameOverMsg.innerHTML = "Game Over!";
  gameOverMsg.style.color = "#fff";
  gameOverMsg.style.fontSize = "24px";
  gameOverMsg.style.position = "absolute";
  gameOverMsg.style.top = "50%";
  gameOverMsg.style.left = "50%";
  gameOverMsg.style.transform = "translate(-50%, -50%)";
  document.body.appendChild(gameOverMsg);

  // Create play again button
  let playAgainBtn = document.createElement("button");
  playAgainBtn.innerHTML = "Play Again";
  playAgainBtn.style.position = "absolute";
  playAgainBtn.style.top = "30%";
  playAgainBtn.style.left = "50%";
  playAgainBtn.style.width = "176px";
  playAgainBtn.style.height = "36px";
  playAgainBtn.style.backgroundColor = "yellow";
  playAgainBtn.style.transform = "translateX(-50%)";
  playAgainBtn.addEventListener("click", restartGame);
  document.body.appendChild(playAgainBtn);
}

// Restart the game
function restartGame() {
  document.location.reload();
}

// Create mobile control buttons
function createMobileControls() {
  function createButton(id, imageUrl, size) {
    let button = document.createElement("img");
    button.id = id;
    button.src = imageUrl;
    button.style.position = "absolute";
    button.style.width = size + "px";
    button.style.height = size + "px";
    button.style.opacity = "0.5";
    button.style.touchAction = "none";
    document.body.appendChild(button);
    return button;
  }

  function positionButton(button, top, left, transform) {
    button.style.top = top;
    button.style.left = left;
    button.style.transform = transform;
  }

  const buttonSize = 150; // Adjust the button size as needed

  // Create left button
  let leftButton = createButton("left-button", "/img/left.png", buttonSize);
  leftButton.addEventListener("touchstart", () => {
    player.x -= player.speed;
  });
  leftButton.addEventListener("touchend", () => {
    player.x = player.x;
  });
  positionButton(leftButton, "38%", "182px", "translate(-50%, -50%)");

  // Create right button
  let rightButton = createButton("right-button", "/img/right.png", buttonSize);
  rightButton.addEventListener("touchstart", () => {
    player.x += player.speed;
  });
  rightButton.addEventListener("touchend", () => {
    player.x = player.x;
  });
  positionButton(
    rightButton,
    "38%",
    "calc(100% - 782px)",
    "translate(50%, -50%)"
  );

  // Create up button
  let upButton = createButton("up-button", "/img/up.png", buttonSize);
  upButton.addEventListener("touchstart", () => {
    player.y -= player.speed;
  });
  upButton.addEventListener("touchend", () => {
    player.y = player.y;
  });
  positionButton(upButton, "816px", "83%", "translate(-50%, -50%)");

  // Create down button
  let downButton = createButton("down-button", "/img/down.png", buttonSize);
  downButton.addEventListener("touchstart", () => {
    player.y += player.speed;
  });
  downButton.addEventListener("touchend", () => {
    player.y = player.y;
  });
  positionButton(
    downButton,
    "calc(100% - 1300px)",
    "83%",
    "translate(-50%, 50%)"
  );
}

// Start the game
initialize();
createMobileControls();
