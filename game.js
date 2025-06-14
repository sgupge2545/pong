const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// Game constants
const PADDLE_WIDTH = 15,
  PADDLE_HEIGHT = 100,
  PADDLE_SPEED = 5;
const BALL_RADIUS = 10;
const WIDTH = canvas.width,
  HEIGHT = canvas.height;

// Entities
const player = {
  x: 10,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  color: "#0ff",
};

const ai = {
  x: WIDTH - PADDLE_WIDTH - 10,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  color: "#f0f",
};

const ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  radius: BALL_RADIUS,
  speed: 5,
  dx: 5 * (Math.random() > 0.5 ? 1 : -1),
  dy: 5 * (Math.random() > 0.5 ? 1 : -1),
  color: "#fff",
};

let playerScore = 0,
  aiScore = 0;

// Draw functions
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

function drawText(text, x, y, color, size = "32px") {
  ctx.fillStyle = color;
  ctx.font = `${size} Arial`;
  ctx.fillText(text, x, y);
}

// Reset ball to center
function resetBall() {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = ball.speed * (Math.random() > 0.5 ? 1 : -1);
}

// Mouse movement
canvas.addEventListener("mousemove", (evt) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = evt.clientY - rect.top;
  player.y = mouseY - player.height / 2;

  // Clamp paddle inside canvas
  if (player.y < 0) player.y = 0;
  else if (player.y + player.height > HEIGHT) player.y = HEIGHT - player.height;
});

// Collision
function collision(b, p) {
  return (
    b.x + b.radius > p.x &&
    b.x - b.radius < p.x + p.width &&
    b.y + b.radius > p.y &&
    b.y - b.radius < p.y + p.height
  );
}

// AI movement
function moveAI() {
  const target = ball.y - ai.height / 2;
  if (ai.y < target) {
    ai.y += PADDLE_SPEED;
    if (ai.y > target) ai.y = target;
  } else if (ai.y > target) {
    ai.y -= PADDLE_SPEED;
    if (ai.y < target) ai.y = target;
  }
  // Clamp
  if (ai.y < 0) ai.y = 0;
  if (ai.y + ai.height > HEIGHT) ai.y = HEIGHT - ai.height;
}

// Update game
function update() {
  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision (top/bottom)
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > HEIGHT) {
    ball.dy = -ball.dy;
  }

  // Paddle collision
  if (collision(ball, player)) {
    ball.dx = Math.abs(ball.dx);
    // Add some "spin"
    let collidePoint = ball.y - (player.y + player.height / 2);
    collidePoint = collidePoint / (player.height / 2);
    let angle = (collidePoint * Math.PI) / 4;
    ball.dy = ball.speed * Math.sin(angle);
    ball.dx = ball.speed * Math.cos(angle);
  }

  if (collision(ball, ai)) {
    ball.dx = -Math.abs(ball.dx);
    // Add some "spin"
    let collidePoint = ball.y - (ai.y + ai.height / 2);
    collidePoint = collidePoint / (ai.height / 2);
    let angle = (collidePoint * Math.PI) / 4;
    ball.dy = ball.speed * Math.sin(angle);
    ball.dx = -ball.speed * Math.cos(angle);
  }

  // Score
  if (ball.x - ball.radius < 0) {
    aiScore++;
    resetBall();
  }
  if (ball.x + ball.radius > WIDTH) {
    playerScore++;
    resetBall();
  }

  moveAI();
}

// Render game
function render() {
  // Clear
  drawRect(0, 0, WIDTH, HEIGHT, "#111");

  // Middle line
  for (let i = 10; i < HEIGHT; i += 30) {
    drawRect(WIDTH / 2 - 2, i, 4, 20, "#444");
  }

  // Draw paddles
  drawRect(player.x, player.y, player.width, player.height, player.color);
  drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);

  // Draw ball
  drawCircle(ball.x, ball.y, ball.radius, ball.color);

  // Draw score
  drawText(`${playerScore}`, WIDTH / 4, 50, "#0ff");
  drawText(`${aiScore}`, (WIDTH * 3) / 4, 50, "#f0f");
}

// Game loop
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();
