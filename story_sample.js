// ==== 1. 전역 변수 및 클래스 정의 ====

let canvas = document.querySelector("#myCanvas");
let ctx = canvas.getContext("2d");

let x, y, dx, dy;
let paddleX;
let bar = 100;
let lives = 3;  //아웃 카운트 사용용
let score = 0;
let nowHit = 0;
let isPaused = false;
let isHit = false;
let runnerIndex = 0;
let scores = 0;
let OnBaseCount = 0;

// 키 입력
let rightPressed = false;
let leftPressed = false;

const ballRadius = 10;
const paddleWidth = 100;
const paddleHeight = 10;
const paddleSpeed = 5;

const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 60;
const brickHeight = 18;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 30;

let nowPlayer = 0;
let isDrawing = false;

let hit1 = 50;
let hit2 = 30;
let hit3 = 10;
let hit4 = 0;

const bricks = [];

const playerList = [
  "51,홍창기", "17,박해민", "22,김현수", "23,오스틴",
  "10,오지환", "2,문보경", "27,박동원", "8,문성주", "4,신민재"
];
const positions = [
  { top: '210px', left: '115px' }, // 0: homebar
  { top: '125px', left: '200px' }, // 1: first
  { top: '40px',  left: '115px' }, // 2: second
  { top: '125px', left: '30px'  }  // 3: third
];

let currentDifficulty = "easy";

const clickSound = $("#click")[0];
const batSound = $("#bat")[0];
const wallSound = $("#wall")[0];
let isMuted = false;

class Runner {
  constructor(num) {
    this.num = num;
    this.pos = 0;
  }

  getOnBase(h) {
    this.pos += h;
    if (this.pos > 3) {
      $(`#runner${this.num}`).hide();
      OnBaseCount--;
      this.pos = 0;
      return 1;
    }
    $(`#runner${this.num}`).css(positions[this.pos]).show();
    OnBaseCount++;
    return 0;
  }

  setImg() {
    const num = playerList[nowPlayer].split(",")[0];
    $(`#runner${this.num}`).attr("src", `img/${num}piece.png`);
    $("#batterImg").attr("src", `img/${num}uniform.png`);
  }
}

const runners = [new Runner(1), new Runner(2), new Runner(3), new Runner(4)];

function initGameState() {
  initBall();
  initPaddle();
  initBricks();
  initPlayer();
  initBar();
  nowHit = 0;
  isHit = false;
  runnerIndex = 0;
  OnBaseCount = 0;
  score = 0;
  scores = 0;
}

function initBall() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  x = canvas.width / 2;
  y = canvas.height - 30;
}

function initPaddle() {
  paddleX = (canvas.width - paddleWidth) / 2;
}

function initBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      const rand = Math.floor(Math.random() * 4) + 1; // 1~4
      bricks[c][r] = { x: 0, y: 0, status: rand };
    }
  }
}

function initPlayer() {
  $("#playerList").empty();
  playerList.forEach(p => {
    const [num, name] = p.split(",");
    $("#playerList").append(`<li><span>${num}</span> ${name}</li>`);
  });
  $("#batterImg").attr("src", `img/51uniform.png`);
  $("#runner1").attr("src", `img/51piece.png`);
}

function initBar() {
  bar = 100;
  $("#bar").css("width", bar + "%");
  $("#barText").html("남은 블록 : " + bar + "%");
}

function storyEasy() {
  currentDifficulty = "easy";
  lives = 3;
  dx = 2;
  dy = -2;
  hit1 = 60;
  hit2 = 40;
  hit3 = 20;
  hit4 = 0;
  
  initGameState();
  startGameLoopOnce();
}

function storyNormal() {
  currentDifficulty = "normal";
  lives = 3;
  dx = 3;
  dy = -3;
  hit1 = 50;
  hit2 = 30;
  hit3 = 10;
  hit4 = 0;

  initGameState();
  startGameLoopOnce();
}

function storyHard() {
  currentDifficulty = "hard";
  lives = 3;
  dx = 4;
  dy = -4;
  hit1 = 40;
  hit2 = 25;
  hit3 = 10;
  hit4 = 0;

  initGameState();
  startGameLoopOnce();
}

function storyEndless() {
  currentDifficulty = "endless";
  lives = 3;
  dx = 5;
  dy = -5;
  hit1 = 50;
  hit2 = 30;
  hit3 = 10;
  hit4 = 0;

  initGameState();
  startGameLoopOnce();
}

function draw() {
  if (isPaused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return requestAnimationFrame(draw);
  }

  if (isHit) {
    return requestAnimationFrame(draw);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  // 공 이동
  x += dx;
  y += dy;

  // 벽 반사
  if (x + dx < ballRadius || x + dx > canvas.width - ballRadius){
    wallSound.currentTime = 0;
    wallSound.play();
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    wallSound.currentTime = 0;
    wallSound.play();
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      batSound.currentTime=0;
      batSound.play();
      const hitPos = (x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
      dx = hitPos * 5;
      dy = -Math.abs(dy);
    } else {
      $("#out" + (4 - lives)).attr("src", "img/out.png");
      lives--;
      if (!lives) {
        location.href = "result.html";
      } else {
        resetBallAndPaddle();
      }
    }
  }

  // 패들 이동
  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
  if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;

  requestAnimationFrame(draw);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
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
  const totalWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
  const offsetX = (canvas.width - totalWidth) / 2;
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
        ctx.fillStyle = ["#aaa", "red", "green", "blue"][b.status - 1];
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status >= 1 && b.status <= 4) {
        if (x + ballRadius > b.x && x - ballRadius < b.x + brickWidth &&
            y + ballRadius > b.y && y - ballRadius < b.y + brickHeight) {
          dx = -dx;
          dy = -dy;

          if (nowHit < b.status) hitBlock(b.status);
          b.status = 0;
          decreaseBar();
        }
      }
    }
  }
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
  dx = 2;
  dy = -2;
  paddleX = (canvas.width - paddleWidth) / 2;
}

function decreaseBar() {
  const rate = (1 / (brickColumnCount * brickRowCount)) * 100;
  bar -= rate;

  if (bar < hit1 && nowHit < 2) hitBlock(2);
  else if (bar < hit2 && nowHit < 3) hitBlock(3);
  else if (bar < hit3 && nowHit < 4) hitBlock(4);
  else if (bar <= hit4) hitBlock(5);

  $("#bar").css("width", bar + "%");
  $("#barText").html("남은 블록 : " + bar + "%");
}

function getOnBase() {
  for (let i = 0; i < runners.length; i++) {
    if (runners[i].pos > 0) {
      scores += runners[i].getOnBase(nowHit - 1);
    }
  }

  runners[runnerIndex].pos = 0;
  scores += runners[runnerIndex].getOnBase(nowHit - 1);
  runnerIndex = (runnerIndex + 1) % 4;
  runners[runnerIndex].setImg();

  $("#stadium-container p:nth-of-type(2)").html("YOU: " + scores);
}

function hitBlock(stat) {
  if (stat === 1) return;

  isHit = true;
  $("#hitContainer").show();

  const [num] = playerList[nowPlayer].split(",");

  $("#hitImg2").attr("src", `img/${num}profile.png`);
  switch (stat) {
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
      $("#gostop > div:first-child").hide(); // 고/스탑 버튼 숨기기
      break;
  }
}

function go() {
  isHit = false;
  $("#hitContainer").hide();
}

function stop() {
  isHit = false;
  $("#gostop > div:first-child").show();
  $("#hitContainer").hide();
  getOnBase();                           // 1. 주자 진루
  $("#playerList li").eq(0).remove();    // 2. 현재 타자 제거
  addPlayer();                           // 3. 다음 타자 배치
  nowHit = 0;

  initBall();
  initPaddle();
  initBar();
  initBricks();
}

function addPlayer() {
  const [num, name] = playerList[nowPlayer].split(",");

  $("#playerList").append(`<li><span>${num}</span> ${name}</li>`);

  nowPlayer = (nowPlayer + 1) % 9;

  const runner = runners[runnerIndex];
  runner.pos = 0;
  runner.setImg();
  $(`#runner${runner.num}`).css(positions[0]).show();

  $("#betterImg").attr("src", `img/${num}uniform.png`);
}

function showBlockMessage(message, colorClass) {
  const msg = document.getElementById("blockMessage");
  msg.className = "block-hit-message " + colorClass;
  msg.innerHTML = message;
  msg.classList.remove("hidden");

  setTimeout(() => {
    msg.classList.add("hidden");
  }, 1000);
}

function randomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function togglePause() {
  clickSound.currentTime = 0;
  clickSound.play();
  isPaused = !isPaused;
  const pauseBtn = document.getElementById('pauseBtn');
  const pauseMenu = document.getElementById('pause');

  if (pauseBtn) {
    pauseBtn.src = isPaused ? "img/UIBlock/resume.png" : "img/UIBlock/pause.png";
  }

  if (pauseMenu) {
    pauseMenu.classList.toggle('hidden', !isPaused);
  }

  document.querySelectorAll('.optionImg').forEach(img => {
    img.classList.toggle('hidden', !isPaused);
    $("#pauseSetting").css("display","none");
  });

  if (isPaused) {
    $("#hitContainer").hide();
    isHit = false;
    
  }

}

document.addEventListener("keydown", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
  else if (e.key === "Escape") togglePause();
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

function togglePause() { //togglePause 두개인데 지금 이거 쓰이고 있어요!
  clickSound.currentTime = 0;
  clickSound.play();
  isPaused = !isPaused;
  const pauseMenu = document.getElementById('pause');
  const pauseBtn = document.getElementById('pauseBtn');
  pauseMenu.classList.toggle('hidden', !isPaused);
  $("#pauseSetting").css("display","none");
  if (pauseBtn) {
    pauseBtn.src = isPaused ? "img/UIBlock/resume.png" : "img/UIBlock/pause.png";
  }
}

document.querySelector("#optionBtn1").addEventListener("click", () => {
    clickSound.currentTime = 0;
    clickSound.play();
    $("#pauseSetting").css("display", "block");
});

document.querySelector("#close").addEventListener("click", () => {
    clickSound.currentTime = 0;
    clickSound.play();
    $("#pauseSetting").css("display", "none");
});

let volume = 0.3;
const cheerSong = document.getElementById("cheerSong");

$("#sound").on("click", function(){
    if($(this).attr("src") == "./img/UIBlock/sound.png"){
        $(this).attr("src","./img/UIBlock/mute.png");
        volume = $("#volumeControl").val();
        cheerSong.muted = true;
        clickSound.muted = true;
        batSound.muted = true;
        wallSound.muted = true;
    }else{
      clickSound.currentTime = 0;
      clickSound.play();
      $(this).attr("src","./img/UIBlock/sound.png");
      cheerSong.muted = false;
      clickSound.muted = false;
      batSound.muted = false;
      wallSound.muted = false;
    }
});

$("#volumeControl").on("input", function(){
    const vol = parseFloat($(this).val());
    cheerSong.volume = vol;
    clickSound.volume = vol;
    batSound.volume = vol;
    wallSound.volume = vol;
    volume = vol;

    if (vol === 0) {
        $("#sound").attr("src", "./img/UIBlock/mute.png");
    } else {
        $("#sound").attr("src", "./img/UIBlock/sound.png");
        cheerSong.muted = false;
        clickSound.muted = false;
        batSound.muted = false;
        wallSound.muted = false;
    }
});

let musicTitle = ["무적의 엘지", "사랑한다 엘지", "승리를 위하여", "서울의 아리아", "라인업 송", "깃발 응원", "우리의 함성", "승리의 포효", "포에버 엘지", "최후의 결투", "승리의 노래", "아파트"];
let musicMP3 = [];
let musicNum=0;

$("label").on("click", function(){
  let musicIndex = $(this).attr("for").substring(5);
  const cheerSong = document.getElementById("cheerSong");
  cheerSong.src = `sound/music${musicIndex}.mp3`; 
  cheerSong.currentTime = 0;
  cheerSong.play();
});

document.querySelector(".resumeBtn").addEventListener("click", () => {
  clickSound.currentTime = 0;
  clickSound.play();
  isPaused = false;
  document.getElementById('pause').classList.add('hidden');
});

document.querySelector(".homeBtn").addEventListener("click", () => {
  clickSound.currentTime = 0;
  clickSound.play().then(() => {
    setTimeout(() => {
      window.location.href = "title.html";
    }, 100);
  });
});

document.querySelector(".exitBtn").addEventListener("click", () => {
  clickSound.currentTime = 0;
  clickSound.play();
  alert("게임이 종료됩니다.");
  window.location.href = "about:blank";
});

document.querySelector(".replayBtn").addEventListener("click", () => {
  clickSound.currentTime = 0;
  clickSound.play();
  scores = 0;
  lives = 3;
  nowPlayer = 0;
  OnBaseCount = 0;
  runnerIndex = 0;
  isPaused = false;

  for (let i = 1; i <= 3; i++) {
    $(`#out${i}`).attr("src", "img/noOut.png");
  }
  for (let i = 1; i <= 4; i++) {
    $(`#runner${i}`).hide();
  }

  $("#stadium-container p:nth-of-type(2)").html("YOU: 0");
  document.getElementById("pause").classList.add("hidden");

  switch (currentDifficulty) {
    case "easy": storyEasy(); break;
    case "normal": storyNormal(); break;
    case "hard": storyHard(); break;
    case "endlesss": 
      console.log("endlesss");
      storyEndless(); 
      break;
  }

  musicNum=0;
    $("#music").html(musicTitle[musicNum]);

});

//
