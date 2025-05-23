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
const paddleWidth = 100;    //야구 빠따 변수
let paddleX;
let paddleSpeed = 5;  // 패들 속도 변수 추가


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

let bar=100;

// 초기화
function init() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;         //공 속도 조절 변수
    dy = -2;        //공 속도 조절 변수수
    ballColor = "#0095DD";
    paddleX = (canvas.width - paddleWidth) / 2;
    initBricks();
}

function initBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            const rand = Math.floor(Math.random() * 4) + 1; // 1~4 사이 랜덤
            bricks[c][r] = { x: 0, y: 0, status: rand };
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
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
        pauseBtn.src = isPaused ? "img/UIBlock/resume.png" : "img/UIBlock/pause.png";
    }
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
            const b = bricks[c][r];
            if (b.status >= 1 && b.status <= 4) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                b.x = brickX;
                b.y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);

                switch (b.status) {
                    case 1: ctx.fillStyle = "#aaaaaa"; break; // 일반
                    case 2: ctx.fillStyle = "red"; break;
                    case 3: ctx.fillStyle = "green"; break;
                    case 4: ctx.fillStyle = "blue"; break;
                }

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
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "40px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
    ctx.font = "20px Arial";
    // ctx.fillText("Press ESC to Resume", canvas.width / 2, canvas.height / 2 + 40);
}

function randomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function collisionDetection() {     //공 충돌했을때 alert로 1차 구분해둠 그리고 status변수가 공 객체 구분하는 방법
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status >= 1 && b.status <= 4) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;

                    // 색상별 alert 출력
                    // switch (b.status) {
                    //     case 1:
                    //         alert("일반 블록에 충돌했습니다!");
                    //         break;
                    //     case 2:
                    //         alert("빨간 블록에 충돌했습니다!");
                    //         break;
                    //     case 3:
                    //         alert("초록 블록에 충돌했습니다!");
                    //         break;
                    //     case 4:
                    //         alert("파란 블록에 충돌했습니다!");
                    //         break;
                    // }

                    b.status = 0;
                    score++;

                    decreaseBar();

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
        document.getElementsByClassName('optionImg')[0].classList.remove('hidden');
        document.getElementsByClassName('optionImg')[1].classList.remove('hidden');
        document.getElementsByClassName('optionImg')[2].classList.remove('hidden');
        document.getElementsByClassName('optionImg')[3].classList.remove('hidden');
        document.getElementsByClassName('optionImg')[4].classList.remove('hidden'); 
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

    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
    else if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;

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
    dx = 2;     //공 속도 조절 변수
    dy = -2;    //공 속도 조절 변수수
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
    
});

document.querySelector(".resumeBtn").addEventListener("click", () => {
    isPaused = false;
    document.getElementsByClassName('optionImg')[0].classList.add('hidden');
    document.getElementsByClassName('optionImg')[1].classList.add('hidden');
    document.getElementsByClassName('optionImg')[2].classList.add('hidden');
    document.getElementsByClassName('optionImg')[3].classList.add('hidden');
    document.getElementsByClassName('optionImg')[4].classList.add('hidden');
});

document.querySelector(".replayBtn").addEventListener("click", () => {
    score = 0;
    lives = 3;
    isPaused = false;

    init(); // 초기화
    document.getElementById('pause').classList.add('hidden');
    // draw(); 호출 제거!! ✅
});

function decreaseBar(){
    var rate = (1/(brickColumnCount*brickRowCount))*100;
    bar-=rate;
    $("#bar").css("width", bar +"%");

    $("#barText").html("블록 파괴" + bar + "%");
}



draw();