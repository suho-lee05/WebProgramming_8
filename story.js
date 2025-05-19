const canvas = document.querySelector("#myCanvas");
const ctx = canvas.getContext("2d");

// 상태 변수
let isPaused = false;
let score = 0;
let lives = 3;

// 공
const ballRadius = 10;
let x, y, dx, dy, ballColor;

// 패들
const paddleHeight = 10;
const paddleWidth = 120;
let paddleX;

// 벽돌
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 60;
const brickHeight = 18;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 30;
const bricks = [];

// 키 입력
let rightPressed = false;
let leftPressed = false;

// 초기화
function init() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 3;
    dy = -3;
    ballColor = "#0095DD";
    paddleX = (canvas.width - paddleWidth) / 2;
    initBricks();
}

function initBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

// 이벤트 리스너
document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") 
        rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft")
        leftPressed = true;
    else if (e.key === "Escape") 
        togglePause();
});

document.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

function togglePause() {
    isPaused = !isPaused;
    const pauseMenu = document.getElementById('pause');
    if (isPaused) {
        pauseMenu.classList.remove('hidden');
    } else {
        pauseMenu.classList.add('hidden');
    }
}


// 그리기 함수들
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, 20, 20);
}

function drawLives() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Lives: " + lives, canvas.width - 100, 20);
}

function drawPausedScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "40px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press ESC to Resume", canvas.width / 2, canvas.height / 2 + 40);
}

function randomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    if (score === brickRowCount * brickColumnCount) {
                        alert("YOU WIN, CONGRATULATIONS!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

let isDrawing = false;

function draw() {
    if (isPaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPausedScreen();
        requestAnimationFrame(draw);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    if (x + dx < ballRadius || x + dx > canvas.width - ballRadius) dx = -dx;
    if (y + dy < ballRadius) {
        dy = -dy;
        ballColor = randomColor();
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            if (!lives) {
                window.location.href = "result.html";
            } else {
                resetBallAndPaddle();
            }
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
    else if (leftPressed && paddleX > 0) paddleX -= 7;

    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

function startGameLoopOnce() {
    if (!isDrawing) {
        isDrawing = true;
        requestAnimationFrame(draw);
    }
}


function resetBallAndPaddle() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 3;
    dy = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
}

init();
startGameLoopOnce();
document.querySelector(".homeBtn").addEventListener("click", () => {
    window.location.href = "title.html";
});

document.querySelector(".exitBtn").addEventListener("click",()=>{
    alert("게임이 종료됩니다.");
    window.location.href = "about:blank"; // 또는 'title.html' 등
    
})

document.querySelector(".replayBtn").addEventListener("click", () => {
    score = 0;
    lives = 3;
    isPaused = false;

    init(); // 초기화
    document.getElementById('pause').classList.add('hidden');
    // draw(); 호출 제거!! ✅
});



draw();