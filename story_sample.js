// ==== 1. 전역 변수 및 클래스 정의 ====

let canvas = document.querySelector("#myCanvas");
let ctx = canvas.getContext("2d");

let x, y, dx, dy;
let paddleX;
let bar = 0;
let lives = 3;  //아웃 카운트 사용용
let score = 0;
let nowHit = 1;
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

let brickRowCount = 5;
let brickColumnCount = 8;
const brickWidth = 60;
const brickHeight = 18;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 30;
let totalBrick;

let nowPlayer = 0;
let isDrawing = false;

let hit1 = 50;
let hit2 = 70;
let hit3 = 90;
let hit4 = 0;

let goCount = 0;
let brickDy = 0;

//2025-06-01 작업

let opponentScore = 0;
let strikes = 0;  //스트라이크 판정 변수
let balls = 0;    //볼 판정 변수


const bricks = [];
const bricksImg = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
bricksImg[0].src = "img/brick1.png";
bricksImg[1].src = "img/brick2.png";
bricksImg[2].src = "img/brick3.png";
bricksImg[3].src = "img/brick4.png";
bricksImg[4].src = "img/brick1.png";  //현재 이미지가 없어서 brick1 이미지로 대체합니다
bricksImg[5].src = "img/brick1.png";  //현재 이미지가 없어서 brick1 이미지로 대체합니다


const ballImg = new Image();
ballImg.src = "img/ball.png";
const paddleImg = new Image();
paddleImg.src = "img/paddle.png";

// ==== 난이도별 블록 개수 제한 전역 변수 선언 ====
let blockCountByStatus = {
  easy:   { 2: 5, 3: 3, 4: 2, 5: 0, 6: 0}, // 2~4만 루타 블록
  normal: { 2: 7, 3: 5, 4: 3, 5: 6, 6: 6},  //status 5 : 스트라이크 6 : 볼
  hard:   { 2: 7, 3: 5, 4: 3, 5: 8, 6: 8}
};

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

const walkSound = document.getElementById("walkSound"); //볼넷 음원
const strikeOutSound = document.getElementById("strikeOutSound"); //삼진 음원
const homerunSounds = [ //홈런 음원
  document.getElementById("homerunSound1"),
  document.getElementById("homerunSound2")
];

let isMuted = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


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

// class Runner {
//   constructor(num) {
//     this.num = num;
//     this.pos = 0;
//   }

//   async getOnBase(h) {
//     for (let i = 0; i < h; i++) {
//       this.pos++;

//       if (this.pos > 3) {
//         await sleep(300); // 마지막 움직임도 살짝 보여주기 위해 잠깐 대기
//         $(`#runner${this.num}`).hide();
//         OnBaseCount--;
//         this.pos = 0;
//         return 1;
//       }

//       $(`#runner${this.num}`).css(positions[this.pos]).show();
//       await sleep(500); // 각 이동 사이 간격
//     }

//     OnBaseCount++;
//     return 0;
//   }

//   setImg() {
//     const num = playerList[nowPlayer].split(",")[0];
//     $(`#runner${this.num}`).attr("src", `img/${num}piece.png`);
//     $("#batterImg").attr("src", `img/${num}uniform.png`);
//   }
// }


const runners = [new Runner(1), new Runner(2), new Runner(3), new Runner(4)];

function initGameState() {
  initBall();
  initPaddle();
  initBricks();
  initPlayer();
  initBar();
  nowHit = 1;
  isHit = false;
  runnerIndex = 0;
  OnBaseCount = 0;
  score = 0;
  scores = 0;
  $("#stadium-container p:nth-of-type(1)").html("OPPONENT: " + opponentScore);
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

// ==== 블록 초기화 함수 수정 ====
// function initBricks() {
//   const total = brickRowCount * brickColumnCount;

//   const statusCounts = blockCountByStatus[currentDifficulty];
//   const totalSpecial = statusCounts[2] + statusCounts[3] + statusCounts[4];
//   const remaining = total - totalSpecial;

//   // status 배열 구성 (주의: 1은 일반 블록, 2~4는 루타 블록)
//   const statusList = [];

//   for (let i = 0; i < statusCounts[2]; i++) statusList.push(2); // 1루타
//   for (let i = 0; i < statusCounts[3]; i++) statusList.push(3); // 2루타
//   for (let i = 0; i < statusCounts[4]; i++) statusList.push(4); // 3루타
//   for (let i = 0; i < statusCounts[5]; i++) statusList.push(5); // 3루타
//   for (let i = 0; i < statusCounts[6]; i++) statusList.push(6); // 3루타
//   for (let i = 0; i < remaining; i++)     statusList.push(1); // 일반 블록

//   // 셔플
//   for (let i = statusList.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [statusList[i], statusList[j]] = [statusList[j], statusList[i]];
//   }

//   // 블록 생성
//   let index = 0;
//   for (let c = 0; c < brickColumnCount; c++) {
//     bricks[c] = [];
//     for (let r = 0; r < brickRowCount; r++) {
//       bricks[c][r] = {
//         x: 0,
//         y: 0,
//         status: statusList[index++] // 0~4
//       };
//     }
//   }
// }

function initBricks() { //2025-06-02 브릭 status 6까지 추가 해서 수정한 함수
  const total = brickRowCount * brickColumnCount;

  const statusCounts = blockCountByStatus[currentDifficulty];
  const totalSpecial = 
    (statusCounts[2] || 0) + 
    (statusCounts[3] || 0) + 
    (statusCounts[4] || 0) + 
    (statusCounts[5] || 0) + 
    (statusCounts[6] || 0);

  const remaining = total - totalSpecial;

  const statusList = [];

  for (let i = 0; i < (statusCounts[2] || 0); i++) statusList.push(2); // 1루타
  for (let i = 0; i < (statusCounts[3] || 0); i++) statusList.push(3); // 2루타
  for (let i = 0; i < (statusCounts[4] || 0); i++) statusList.push(4); // 3루타
  for (let i = 0; i < (statusCounts[5] || 0); i++) statusList.push(5); // 스트라이크
  for (let i = 0; i < (statusCounts[6] || 0); i++) statusList.push(6); // 볼
  for (let i = 0; i < remaining; i++)          statusList.push(1); // 일반 블록

  // 셔플
  for (let i = statusList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [statusList[i], statusList[j]] = [statusList[j], statusList[i]];
  }

  // 블록 생성
  let index = 0;
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = {
        x: 0,
        y: 0,
        status: statusList[index++] // 1~6까지 가능
      };
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
  $("#runner1").attr("src", `img/51piece.png`).css({ top: positions[0].top, left: positions[0].left }).show();
}

function initBar() {
  bar = 0;
  $("#bar").css("width", bar + "%");
  $("#barText").html("홈런까지 : " + bar + "%");
  totalBrick = brickColumnCount * brickRowCount;
}

function storyEasy() {
  currentDifficulty = "easy";
  brickRowCount = 4;
  brickColumnCount = 5;
  lives = 3;
  dx = 3;
  dy = -3;

  hit1 = 40;
  hit2 = 60;
  hit3 = 80;
  goCount=0;
  brickDy = 0;
  
  let result = generateOpponentScore("easy");

  opponentScore = result.total;



  initGameState();
  startGameLoopOnce();
}

function storyNormal() {
  currentDifficulty = "normal";
  brickRowCount = 5;
  brickColumnCount = 6;
  lives = 3;
  dx = 3;
  dy = -3;
  hit1 = 50;
  hit2 = 70;
  hit3 = 90;
  goCount=0;
  brickDy = 0;

  let result = generateOpponentScore("normal");

  opponentScore = result.total;

  initGameState();
  startGameLoopOnce();
}

function storyHard() {
  currentDifficulty = "hard";
  brickRowCount = 5;
  brickColumnCount = 8;
  lives = 3;
  dx = 4;
  dy = -4;
  hit1 = 60;
  hit2 = 75;
  hit3 = 90;

  goCount=0;
  brickDy = 0;

  let result = generateOpponentScore("hard");
  opponentScore = result.total;

  initGameState();
  startGameLoopOnce();
}

function storyEndless() {
  currentDifficulty = "endless";
  lives = 3;
  dx = 5;
  dy = -5;
  hit1 = 50;
  hit2 = 70;
  hit3 = 90;

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
    // 패들 충돌 판정
    const ballBottom = y + ballRadius;
    const ballTop = y - ballRadius;
    const ballLeft = x - ballRadius;
    const ballRight = x + ballRadius;

    const paddleHeight = 15; // 패들의 높이값 (실제 값에 맞춰 조정)
    const paddleTop = canvas.height - paddleHeight;
    const paddleBottom = paddleTop + paddleHeight;
    const paddleLeft = paddleX;
    const paddleRight = paddleX + paddleWidth;

    const isCollision =
      ballRight > paddleLeft &&
      ballLeft < paddleRight &&
      ballBottom > paddleTop &&
      ballTop < paddleBottom;

    if (isCollision) {
      batSound.currentTime = 0;
      batSound.play();

      const relativeIntersectX = (x - paddleX) / paddleWidth; // 0 (왼쪽 끝) ~ 1 (오른쪽 끝)
      const maxBounceAngle = (75 * Math.PI) / 180; // 최대 75도
      const bounceAngle = (relativeIntersectX - 0.5) * 2 * maxBounceAngle;

      const speed = Math.sqrt(dx * dx + dy * dy); // 기존 속도 유지
      dx = speed * Math.sin(bounceAngle);
      dy = -speed * Math.cos(bounceAngle);

      // 공 위치 조정 (패들에 박히지 않게)
      y = paddleTop - ballRadius;
    }else {
      isPaused = true;
      $("#outEvent").show();
      outSound.setTime = 0;
      outSound.play();
      let s1 = $("#blink1").animate({ top: 0 }, 800).promise();
      let s2 = $("#blink2").animate({ bottom: 0 }, 800).promise();
      let s3 = $("#outEvent p").slideDown(800).promise();

      $.when(s1, s2, s3).then(() => {
        setTimeout(() => {
          let h1 = $("#blink1").animate({ top: "-150px" }, 500).promise();
          let h2 = $("#blink2").animate({ bottom: "-150px" }, 500).promise();
          let h3 = $("#outEvent p").fadeOut(500).promise();
          $.when(h1, h2, h3).then(() => {
            $("#outEvent").hide();
            isPaused = false;
          });
        }, 800);
      });
      $("#out" + (4 - lives)).attr("src", "img/out.png");
      lives--;
      $("#playerList li").eq(0).remove();    // 2. 현재 타자 제거
      addPlayer();                           //3. 다음 타자 배치치
      initBricks();
      initBar();  
      initBall();                         
      if (!lives) {
        renewBestScore();
        location.href = "result.html";
      } else { 
        nowHit=1;
        goCount=0;
        brickDy=0;
        resetBallAndPaddle();
      }
    }
  }
  if (checkBricksAtBottom()) {
    isPaused = true;
      $("#outEvent").show();
      outSound.setTime = 0;
      outSound.play();
      let s1 = $("#blink1").animate({ top: 0 }, 800).promise();
      let s2 = $("#blink2").animate({ bottom: 0 }, 800).promise();
      let s3 = $("#outEvent p").slideDown(800).promise();

      $.when(s1, s2, s3).then(() => {
        setTimeout(() => {
          let h1 = $("#blink1").animate({ top: "-150px" }, 500).promise();
          let h2 = $("#blink2").animate({ bottom: "-150px" }, 500).promise();
          let h3 = $("#outEvent p").fadeOut(500).promise();
          $.when(h1, h2, h3).then(() => {
            $("#outEvent").hide();
            isPaused = false;
          });
        }, 800);
      });

    $("#out" + (4 - lives)).attr("src", "img/out.png");
    lives--;
    $("#playerList li").eq(0).remove();    // 2. 현재 타자 제거 
    addPlayer();                           // 3. 다음 타자 배치
    if (!lives) {
        renewBestScore();
        location.href = "result.html";
      } else {
        nowHit=1;
        goCount=0;
        brickDy=0;
        resetBallAndPaddle();
    }
  }

  // 패들 이동
  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
  if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;

  requestAnimationFrame(draw);
}

function checkBricksAtBottom() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status >= 1 && bricks[c][r].y >= canvas.height - paddleHeight - brickHeight / 2) {
        return true;
      }
    }
  }
  return false;
}

function drawBall() {
  const size = ballRadius*2;
  ctx.drawImage(ballImg, x - ballRadius, y - ballRadius, size, size);
  /*ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();*/
}

function drawPaddle() {
  ctx.drawImage(paddleImg, paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  /*ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();*/
}

function drawBricks() {
  const totalWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
  const offsetX = (canvas.width - totalWidth) / 2;
  if(currentDifficulty === "hard"){
          if(goCount===1){
            brickDy += 0.1;
          }
          else if(goCount===2){
            brickDy += 0.4;
          }
          else if(goCount===3){
            brickDy += 0.7;
          }
  }
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status >= 1 && b.status <= 6) { //status 6까지 추가 2025-06-02
        const brickX = c * (brickWidth + brickPadding) + offsetX;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        b.x = brickX;
        b.y = brickY+brickDy;
        let img = bricksImg[b.status-1];
        ctx.drawImage(img, b.x, b.y, brickWidth, brickHeight);
        /*ctx.beginPath();
        ctx.rect(brickX, b.y, brickWidth, brickHeight);
        ctx.fillStyle = ["#aaa", "red", "green", "blue"][b.status - 1];
        ctx.fill();
        ctx.closePath();*/
      }
    }
  }
}

function collisionDetection() {
  const steps = 5;
  const stepDx = dx / steps;
  const stepDy = dy / steps;

  let tempX = x;
  let tempY = y;

  for (let s = 0; s < steps; s++) {
    tempX += stepDx;
    tempY += stepDy;

    let hit = false;
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const b = bricks[c][r];
        if (b.status === 0) continue;

        const brickLeft = b.x;
        const brickRight = b.x + brickWidth;
        const brickTop = b.y;
        const brickBottom = b.y + brickHeight;

        const closestX = Math.max(brickLeft, Math.min(tempX, brickRight));
        const closestY = Math.max(brickTop, Math.min(tempY, brickBottom));

        const distX = tempX - closestX;
        const distY = tempY - closestY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance <= ballRadius) {
          brickSound.currentTime = 0;
          brickSound.play();
          // 충돌 반사
          const overlapLeft = tempX + ballRadius - brickLeft;
          const overlapRight = brickRight - (tempX - ballRadius);
          const overlapTop = tempY + ballRadius - brickTop;
          const overlapBottom = brickBottom - (tempY - ballRadius);
          const minOverlapX = Math.min(overlapLeft, overlapRight);
          const minOverlapY = Math.min(overlapTop, overlapBottom);

          if (minOverlapX < minOverlapY) dx = -dx;
          else dy = -dy;

          if (b.status === 5) {     //스트라이크 판정 추가 2025-06-02
            strikes++;
            console.log("스트라이크: " + strikes);
            updateStrikeBallDisplay();
          } else if (b.status === 6) {  //볼넷 판정 추가 2025-06-02
            balls++;
            console.log("볼: " + balls);
            updateStrikeBallDisplay();
          } else if (nowHit < b.status) {
            hitBlock(b.status); // 2~4: 루타 처리
          }

          b.status = 0;
          totalBrick--;
          decreaseBar();
          hit = true;
          break;
        }
      }
      if (hit) break;
    }
    if (hit) break;
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
  // 난이도에 맞게 공 dx, dy 설정.
  switch (currentDifficulty) {
    case "easy": dx = 2; dy = -2; break;
    case "normal": dx = 3; dy = -3; break;
    case "hard": dx = 4; dy = -4; break;
    case "endless": dx = 5; dy = -5; break;
  }
  paddleX = (canvas.width - paddleWidth) / 2;
}

function decreaseBar() {
  const rate = (1 / (brickColumnCount * brickRowCount)) * 100;
  bar += rate;

  if (bar > hit1 && nowHit < 2) hitBlock(2);
  else if (bar > hit2 && nowHit < 3) hitBlock(3);
  else if (bar > hit3 && nowHit < 4) hitBlock(4);
  else if (totalBrick == 0 ){
    isPaused = true;
    const selectedHomerunSound = homerunSounds[Math.floor(Math.random() * homerunSounds.length)];
      selectedHomerunSound.currentTime = 0;
      selectedHomerunSound.play();
      $("#homerunEvent").slideDown(400, function() {  // slideDown 끝난 후 실행
    let h2 = $("#band1").animate({ left: 0 }, 1800).promise();
    let h3 = $("#band2").animate({ right: 0 }, 1800).promise();

    $.when(h2, h3).then(function(){
      

      isPaused = false;
      isHit = false;
      goCount = 0;
      brickDy = 0;
      nowHit = 5;
      getOnBase();                        // 1. 주자 진루
      $("#playerList li").eq(0).remove(); // 2. 현재 타자 제거
      addPlayer();                        // 3. 다음 타자 배치
      initBall();
      initPaddle();
      initBar();
      initBricks();
      nowHit=0;
      $("#homerunEvent").slideUp();
    });
  });
  }

  $("#bar").css("width", bar.toFixed(1) + "%");
  $("#barText").html("홈런까지 : " + bar.toFixed(1) + "%");
}

function getOnBase() {
  let temp = scores;
  for (let i = 0; i < runners.length; i++) {
    if (runners[i].pos > 0) {
      scores += runners[i].getOnBase(nowHit - 1);
    }
  }

  runners[runnerIndex].pos = 0;
  scores += runners[runnerIndex].getOnBase(nowHit - 1);
  runnerIndex = (runnerIndex + 1) % 4;
  runners[runnerIndex].setImg();
  if(temp != scores){
    scoreSound.currentTime = 0;
    scoreSound.play();
  }
  $("#stadium-container p:nth-of-type(2)").html("YOU: " + scores);
  

  //이 조건문을 어따 배치해야 할지 모르겠어요 ㅠ
  if (scores > opponentScore) {
    setTimeout(() => {
      if (currentDifficulty === "easy") {
        alert("NORMAL 모드로 진입합니다!");
        storyNormal();
      } else if (currentDifficulty === "normal") {
        alert("HARD 모드로 진입합니다!");
        storyHard();
      } else if (currentDifficulty === "hard") {
        alert("축하합니다! 최종 난이도 클리어!");
        location.href = "win.html";
      }
    }, 1000);
  }

}

function hitBlock(stat) {
  if (stat === 1) return;

  isHit = true;
  $("#hitContainer").animate({"bottom":"4px"},500);

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
      nowHit = 5;
      $("#hitImg1").attr("src", "img/homerun.png");
      $("#gostop > div:first-child").hide(); // 고 버튼 숨기기
      break;
  }
}

function go() {
  isHit = false;
  goCount++;
  $("#hitContainer").animate({bottom:"600px"},500);
}

function stop() {
  updateStrikeBallDisplay();//stop으로 출루했을 때 스트라이크, 볼넷 관련
  strikes = 0;  //선수가 출루했을 떄 스트라이크랑 볼 카운트 0 만들어주기
  balls = 0;
  isHit = false;
  goCount=0;
  brickDy = 0;
  $("#gostop > div:first-child").show();
  $("#hitContainer").animate(
  { bottom: "4px", left: "800px"},500,function () {
    $(this).css({ bottom: "600px", left: "0px" });
  }
  
  );
  getOnBase();                           // 1. 주자 진루
  $("#playerList li").eq(0).remove();    // 2. 현재 타자 제거
  addPlayer();                           // 3. 다음 타자 배치
  nowHit = 1;

  initBall();
  initPaddle();
  initBar();
  initBricks();
}

function addPlayer() {
  const [num, name] = playerList[nowPlayer].split(",");

  $("#playerList").append(`<li><span>${num}</span> ${name}</li>`);

  nowPlayer = (nowPlayer + 1) % 9;

  runnerIndex = runnerIndex % runners.length;  // ← 추가!

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

function renewBestScore() {
  if (currentDifficulty === "endless") {
    const prev = parseInt(localStorage.getItem("bestScore") || "0", 10);
    if (scores > prev || localStorage.getItem("bestScore") === null) {
      localStorage.setItem("bestScore", scores);
    }
  }
}

function generateOpponentScore(difficulty) {
  let inning = 0;
  let maxScore = 0;

  switch (difficulty) {
    case "easy":
      inning = 7;
      maxScore = 2;
      break;
    case "normal":
      inning = 8;
      maxScore = 3;
      break;
    case "hard":
      inning = 9;
      maxScore = 4;
      break;
    default:
      inning = 0;
  }

  const scores = Array.from({ length: inning }, () =>
    Math.floor(Math.random() * (maxScore + 1))
  );

  const total = scores.reduce((acc, val) => acc + val, 0);
  console.log(`[${difficulty.toUpperCase()}] 상대팀 점수 (${inning}이닝):`, scores, `=> 총점: ${total}`);
  return { scoreByInning: scores, total };
}

function updateStrikeBallDisplay() {  //스트라이크 볼 판정 관련 함수입니다.

  if (strikes >= 3) {
    console.log("삼진 아웃!");
    strikeOutSound.currentTime = 0;
    strikeOutSound.play();
    strikes = 0;
    balls = 0;
    handleOut();
    return;
  }

  if (balls >= 4) {
    console.log("볼넷 출루!");
    walkSound.currentTime = 0;
    walkSound.play();
    walk(); // ← 기존 로직 대신 함수 호출
    return;
  }
}

function handleOut() {  //삼진아웃일때 아웃카운트 변경과 이미지 업데이트 해주는 함수입니다.
  isPaused = true;
  $("#outEvent").show();
  outSound.currentTime = 0;
  outSound.play();

  let s1 = $("#blink1").animate({ top: 0 }, 800).promise();
  let s2 = $("#blink2").animate({ bottom: 0 }, 800).promise();
  let s3 = $("#outEvent p").slideDown(800).promise();

  $.when(s1, s2, s3).then(() => {
    setTimeout(() => {
      let h1 = $("#blink1").animate({ top: "-150px" }, 500).promise();
      let h2 = $("#blink2").animate({ bottom: "-150px" }, 500).promise();
      let h3 = $("#outEvent p").fadeOut(500).promise();

      $.when(h1, h2, h3).then(() => {
        $("#outEvent").hide();
        isPaused = false;
      });
    }, 800);
  });

  $("#out" + (4 - lives)).attr("src", "img/out.png");
  lives--;
  $("#playerList li").eq(0).remove();
  addPlayer();

  if (!lives) {
    renewBestScore();
    location.href = "result.html";
  } else {
    nowHit = 1;
    goCount = 0;
    brickDy = 0;
    resetBallAndPaddle();
    initBall();
    initPaddle();
    initBricks();
    initBar();
  }
}
//볼넷 진루 관련 함수
function walk() {
  //showBlockMessage("볼넷 출루!", "block-blue");

  // 기존 주자들을 모두 한 루씩 밀어냄
  let tempScore = scores;
  for (let i = 0; i < runners.length; i++) {
    if (runners[i].pos > 0) {
      scores += runners[i].getOnBase(1); // 1루씩 진루
    }
  }

  // 새 주자 출루
  //if (runnerIndex >= runners.length) runnerIndex = 0;
  // 2. 출루 주자 처리
  runnerIndex = runnerIndex % runners.length;
  const runner = runners[runnerIndex];
  runner.setImg();
  scores += runner.getOnBase(1);
  runnerIndex++;

  //점수 업데이트
  if (scores > tempScore) {
    scoreSound.currentTime = 0;
    scoreSound.play();
    $("#stadium-container p:nth-of-type(2)").html("YOU: " + scores);
  }

  //스트라이크/볼 카운트 증가
  strikes = 0;
  balls = 0;
  updateStrikeBallDisplay();

  // 타자 교체 처리
  $("#playerList li").eq(0).remove(); // 현재 타자 제거
  addPlayer();                        // 다음 타자 추가
  // 6. 게임 요소 초기화
  initBall();
  initPaddle();
  initBar();
  initBricks();
  nowHit = 1;  // ← 이거 반드시 필요!

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
const brickSound = document.getElementById("brickSound");
const scoreSound = document.getElementById("scoreSound");
const outSound = document.getElementById("outSound");

$("#sound").on("click", function(){
    if($(this).attr("src") == "./img/UIBlock/sound.png"){
        $(this).attr("src","./img/UIBlock/mute.png");
        volume = $("#volumeControl").val();
        cheerSong.muted = true;
        clickSound.muted = true;
        batSound.muted = true;
        wallSound.muted = true;
        brickSound.muted = true;
        scoreSound.muted = true;
        outSound.muted = true;
        
    }else{
      clickSound.currentTime = 0;
      clickSound.play();
      $(this).attr("src","./img/UIBlock/sound.png");
      cheerSong.muted = false;
      clickSound.muted = false;
      batSound.muted = false;
      wallSound.muted = false;
      brickSound.muted = false;
      scoreSound.muted = false;
      outSound.muted = false;
    }
});

$("#volumeControl").on("input", function(){
  updateSliderBackground(this);
    const vol = parseFloat($(this).val());
    cheerSong.volume = vol;
    clickSound.volume = vol;
    batSound.volume = vol;
    wallSound.volume = vol;
    brickSound.volume = vol;
    scoreSound.volume = vol;
    outSound.volume = vol;''
    volume = vol;

    if (vol === 0) {
        $("#sound").attr("src", "./img/UIBlock/mute.png");
    } else {
        $("#sound").attr("src", "./img/UIBlock/sound.png");
        cheerSong.muted = false;
        clickSound.muted = false;
        batSound.muted = false;
        wallSound.muted = false;
        brickSound.muted = false;
        scoreSound.muted = false;
        outSound.muted = false;
    }
});

const volumeControl = document.getElementById("volumeControl");

function updateSliderBackground(el) {
  const value = el.value;
  const min = el.min || 0;
  const max = el.max || 100;
  const percent = ((value - min) / (max - min)) * 100;

  el.style.background = `linear-gradient(to right, brown ${percent}%, #ddd ${percent}%)`;
}

updateSliderBackground(volumeControl);

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
  nowHit=1;
  OnBaseCount = 0;
  runnerIndex = 0;
  isPaused = false;

  for (let i = 1; i <= 3; i++) {
    $(`#out${i}`).attr("src", "img/noOut.png");
  }
  for (let i = 2; i <= 4; i++) {
    $(`#runner${i}`).hide();
  }

  $("#stadium-container p:nth-of-type(2)").html("YOU: 0");
  document.getElementById("pause").classList.add("hidden");

  switch (currentDifficulty) {
    case "easy": storyEasy(); break;
    case "normal": storyNormal(); break;
    case "hard": storyHard(); break;
    case "endlesss": storyEndless(); break;
  }

  musicNum=0;
    $("#music").html(musicTitle[musicNum]);

});

document.addEventListener("keydown", function (e) {
  const key = e.key.toLowerCase();
  if (isHit) {

    if(nowHit == 5){
      if(key == "s"){
          stop();
      }
    }
    else{
      if (key === "g") {
        go();
      } else if (key === "s") {
        stop();
      }
    }
  }
});


//
