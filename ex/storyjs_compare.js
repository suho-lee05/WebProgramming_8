//디버깅용 파일 폐기처리 예정

const canvas = document.querySelector("#myCanvas");
const ctx = canvas.getContext("2d");

// 상태 변수
let isPaused = false;
let score = 0;

//이걸 아웃 카운트로 사용할예정.
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
const bricks = [];//해결

// 키 입력
let rightPressed = false;
let leftPressed = false;

// bar 관련
let bar=100; //해결

let hit1=50;
let hit2=30;
let hit3=10;
let hit4=0;

// 선수 목록
var playerList =["51,홍창기", "17,박해민", "22,김현수", "23,오스틴", "10,오지환", "2,문보경", "27,박동원", "8,문성주", "4,신민재"];

const positions = [
  { top: '210px', left: '115px' }, // 0: homebar
  { top: '125px', left: '200px' }, // 1: first
  { top: '40px',  left: '115px' }, // 2: second
  { top: '125px', left: '30px'  }  // 3: third
];

const playerNumber = [  //const runners로
    "img/51piece.png", "img/17piece.png", "img/22piece.png", "img/23piece.png", "img/10piece.png", "img/2piece.png", "img/27piece.png", "img/8piece.png", "img/4piece.png"
]
// 초기화
function init() {
    initBall();
    initPaddle();
    initBricks();
    initPlayer();
    initGetOnBase();
    initBar();
    nowHit=0;
}



function initBall(){
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;         //공 속도 조절 변수 게임 난이도에 추가함.
    dy = -2;        //공 속도 조절 변수수
    ballColor = "#0095DD";
}

function initPaddle(){
    paddleX = (canvas.width - paddleWidth) / 2;
}

class Runner{
    constructor(num){
        this.num = num;
        this.pos = 0;
        this.img ="";
    }

    getOnBase(h){
        this.pos+=h;
        if(this.pos>3){
            $("#runner" + this.num).css({ top: positions[0].top, left: positions[0].left }).hide();
            OnBaseCount--;
            this.pos=0;
            return 1;
        }
        $("#runner" + this.num).hide();
        $("#runner" + this.num).css({ top: positions[this.pos].top, left: positions[this.pos].left }).show();
        OnBaseCount++;

        return 0;
    }

    setImg(){
        var tmp = playerList[nowPlayer].split(",");
        var num = tmp[0];
        $("#runner" + this.num).attr("src", "img/"+num+"piece.png");
        $("#batterImg").attr("src", "img/" + num + "uniform.png");
    }
}

var OnBaseCount =0; 

function initGetOnBase(){   //빠져있음.
    $("#runner1").css({ top: positions[0].top, left: positions[0].left }).show();
    $("#runner2").hide();
    $("#runner3").hide();
    $("#runner4").hide();
    OnBaseCount++;
    //runnerIndex++;
}

function initPlayer(){
    $("#playerList li").remove();
    for(var i=0; i< 9; i++){
        var tmp = playerList[i].split(",");
        var num = tmp[0];
        var name = tmp[1];
        $("#playerList").append(`<li><span>${num}</span> ${name}</li>`);
    }
    $("#batterImg").attr("src", "img/51uniform.png");
    $("#runner1").attr("src", "img/51piece.png");
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
    const totalBrickWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding; // 전체 가로 너비
    const offsetX = (canvas.width - totalBrickWidth) / 2; // 정중앙 배치용 offset

    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status >= 1 && b.status <= 4) {
                const brickX = c * (brickWidth + brickPadding) + offsetX;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                b.x = brickX;
                b.y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);

                switch (b.status) {
                    case 1: ctx.fillStyle = "#aaaaaa"; break;
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

//2025-05-23 lives 삭제
// function drawLives() {
//     ctx.font = "20px Arial";
//     ctx.fillStyle = "red";
//     ctx.textAlign = "left";
//     ctx.textBaseline = "top";
//     ctx.fillText("Lives: " + lives, canvas.width - 100, 20);
// }

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

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status >= 1 && b.status <= 4) {
                if (x + ballRadius > b.x && x - ballRadius < b.x + brickWidth &&
                    y + ballRadius > b.y && y - ballRadius < b.y + brickHeight) {

                    // 충돌 방향 계산
                    const prevX = x - dx;
                    const prevY = y - dy;

                    const collidedFromLeft = prevX + ballRadius <= b.x;
                    const collidedFromRight = prevX - ballRadius >= b.x + brickWidth;
                    const collidedFromTop = prevY + ballRadius <= b.y;
                    const collidedFromBottom = prevY - ballRadius >= b.y + brickHeight;

                    if (collidedFromLeft || collidedFromRight) {
                        dx = -dx;
                    } else if (collidedFromTop || collidedFromBottom) {
                        dy = -dy;
                    } else {
                        // 대각선 방향 등 불명확한 충돌은 양쪽 모두 반전
                        dx = -dx;
                        dy = -dy;
                    }

                    if(nowHit<b.status){
                        hitBlock(b.status);
                    }
                    b.status = 0;
                    //score++;
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

function showBlockMessage(message, colorClass) {    //어떤 블록 명중했는지 임시방편
  const msg = document.getElementById("blockMessage");
  
  // 클래스 초기화 후 새 색상 클래스 추가
  msg.className = "block-hit-message " + colorClass;
  msg.innerHTML = message;
  msg.classList.remove("hidden");

  // 1초 뒤 숨김 처리
  setTimeout(() => {
    msg.classList.add("hidden");
  }, 1000);
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
        $("#hitContainer").hide();
        isHit = false;
        return;
    }

    if(isHit){
        requestAnimationFrame(draw);
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    //drawScore();

    //drawLives();

    collisionDetection();
    if (x + dx < ballRadius || x + dx > canvas.width - ballRadius) dx = -dx;
    if (y + dy < ballRadius) {
        dy = -dy;
        ballColor = randomColor();
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            // 패들에서 반사 처리
            const hitPos = (x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2); // -1 ~ 1
            dx = hitPos * 5; // 좌우 방향으로 튕김
            dy = -Math.abs(dy); // 항상 위로 튕기도록

        } else {
            // 바닥에 떨어졌을 때
            $("#out" + (4 - lives)).attr("src", "img/out.png");
            lives--;
            console.log('현재 lives: ' + lives);
            if (!lives) {
                window.location.href = "result.html";
            } else {
                resetBallAndPaddle();
            }
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    }
    else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }

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
    scores = 0;
    lives = 3;
    isPaused = false;

    $("#out1").attr("src", "img/noOut.png");
    $("#out2").attr("src", "img/noOut.png");
    $("#out3").attr("src", "img/noOut.png");
    nowPlayer=0;
    OnBaseCount=0;
    runnerIndex=0;
    for (let i = 0; i < runners.length; i++) {
        $("#runner" + i+1).hide();
    }
    init(); // 초기화
    document.getElementById('pause').classList.add('hidden');
    $("#stadium-container p:nth-of-type(2)").html("YOU: " + scores);
    runner.setImg();
    // draw(); 호출 제거!! ✅
});


function initBar(){
    bar =100;
    $("#bar").css("width", bar +"%");

    $("#barText").html("블록 파괴" + bar + "%");
}

function decreaseBar(){
    var rate = (1/(brickColumnCount*brickRowCount))*100;
    bar-=rate;

    if(bar < hit1 && nowHit<2){
        hitBlock(2);
    }else if(bar < hit2 && nowHit<3){
        hitBlock(3);
    }else if(bar < hit3 && nowHit<4){
        hitBlock(4);
    }else if(bar <= hit4){
        hitBlock(5);
    }

    $("#bar").css("width", bar +"%");

    $("#barText").html("블록 파괴" + bar + "%");
}
var isHit =false;
var nowPlayer=0;

const runners = []; 

for (let i = 1; i <= 4; i++) {
    runners.push(new Runner(i));
}

function addPlayer() {
    const tmp = playerList[nowPlayer].split(",");
    const num = tmp[0];
    const name = tmp[1];

    $("#playerList").append(`<li><span>${num}</span> ${name}</li>`);

    nowPlayer = (nowPlayer + 1) % 9;
    // 다음 타자를 Runner 객체로 준비
    const runner = runners[runnerIndex];
    runner.pos = 0;
    runner.setImg(); // 현재 nowPlayer의 번호로 이미지 설정
    $("#runner" + runner.num)
        .css({ top: positions[0].top, left: positions[0].left })
        .show();

    $("#betterImg").attr("src", "img/" + num + "uniform.png");
}
var runnerIndex =0;

let scores = 0;

function getOnBase() {

    // 먼저 기존 주자들 이동
    for (let i = 0; i < runners.length; i++) {
        if (runners[i].pos > 0) {
            scores += runners[i].getOnBase(nowHit-1);
        }
    }

    // 현재 타자 새 Runner로 처리
    runners[runnerIndex].pos = 0;
    scores += runners[runnerIndex].getOnBase(nowHit-1);
    runnerIndex = (runnerIndex + 1) % 4;
    runners[runnerIndex].setImg();

    $("#stadium-container p:nth-of-type(2)").html("YOU: " + scores);
}

nowHit=0;

function hitBlock(stat) {
    if (stat === 1) return;

    isHit = true;
    $("#hitContainer").show();

    let tmp = playerList[nowPlayer].split(",");
    let num = tmp[0];

    $("#hitImg2").attr("src", "img/" + num + "profile.png");
    switch(stat) {
        case 2:
            $("#hitImg1").attr("src", "img/1basehit.png");
            nowHit = 2;
            break;
        case 3:
            $("#hitImg1").attr("src", "img/2basehit.png");
            nowHit = 3;
            break;
        case 4:
            $("#hitImg1").attr("src", "img/3basehit.png");
            nowHit = 4;
            break;
        case 5:
            $("#hitImg2").attr("src", "img/homerun.png");
            nowHit = 5;
            $("#gostop > div:first-child").hide();
            break;
    }
}

function go(){
    isHit = false;
    $("#hitContainer").hide();
}

function stop() {
    isHit = false;
    $("#gostop > div:first-child").show();
    $("#hitContainer").hide();
    getOnBase();                      // 1. 현재 타자는 진루
    $("#playerList li").eq(0).remove();  // 2. 타자 목록에서 제거
    addPlayer();                      // 3. 다음 타자 홈에 배치
    nowHit = 0;


    initBall();
    initPaddle();
    initBar();
    initBricks();
}
