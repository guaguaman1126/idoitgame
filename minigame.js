const keyBindings = {};
let listeningTarget = null;
// 綁定按鈕
function setupKeyBinding(buttonId, actionName) {
  const button = document.getElementById(buttonId);
  button.addEventListener('click', () => {
    listeningTarget = buttonId;
    button.textContent = `請按下要綁定的鍵（${actionName}）`;
  });
}

document.addEventListener('keydown', (e) => {
  if (listeningTarget) {
    const button = document.getElementById(listeningTarget);
    keyBindings[listeningTarget] = e.key;
    button.textContent = `綁定：${e.key.toUpperCase()}`;
    listeningTarget = null;
    console.log(`[KeyBinding] 綁定 ${e.key} 給 ${button.id}`);
  } else {
    Object.keys(keyBindings).forEach((id) => {
      if (e.key === keyBindings[id]) {

        console.log(`[KeyEvent] 偵測到 ${e.key} 觸發 ${id}`);
        if (id === 'setMoveButtonA' || id === 'setMoveButtonB') {
          movePlayerBy(id, 1);
        } else if (id === 'setScissorA') {
          checkPress('A', 1)
        } else if (id === 'setRockA') {
          checkPress('A', 2)
        } else if (id === 'setPaperA') {
          checkPress('A', 3)
        } else if (id === 'setScissorB') {
          checkPress('B', 1)
        } else if (id === 'setRockB') {
          checkPress('B', 2)
        } else if (id === 'setPaperB') {
          checkPress('B', 3)
        }
      }

    });
  }
});

setupKeyBinding('setMoveButtonA', '移動');
setupKeyBinding('setMoveButtonB', '移動');

setupKeyBinding('setScissorA', '移動');
setupKeyBinding('setRockA', '移動');
setupKeyBinding('setPaperA', '移動');
setupKeyBinding('setScissorB', '移動');
setupKeyBinding('setRockB', '移動');
setupKeyBinding('setPaperB', '移動');

let gameRunning = true;
// 移動往前
function movePlayerBy(id, step) {
  let player;
  let direction = 0;
  if (timerRunning || !gameRunning) return;

  console.log(`[Move] 嘗試移動 ${id} by ${step}`);

  if (id === 'setMoveButtonA') {
    player = document.getElementById('playerA');
    direction = 1;
  } else if (id === 'setMoveButtonB') {
    player = document.getElementById('playerB');
    direction = -1;
  }

  if (!player) return;

  const currentTile = player.parentElement;
  const currentIndex = parseInt(currentTile.dataset.index);
  const newIndex = currentIndex + direction * step;

  const nextTile = document.querySelector(`.tile[data-index='${newIndex}']`);
  if (nextTile) {
    if (newIndex === 0) {
      console.log('[Move] 玩家B到達 0 格，判定勝利');
      win("B");
      return;
    } else if (newIndex === 31) {
      console.log('[Move] 玩家A到達 31 格，判定勝利');
      win("A");
      return;
    }

    const hasOtherPlayer = Array.from(nextTile.children).some(child => child.classList.contains('player') && child !== player);
    if (hasOtherPlayer) {
      console.log('⚠️ 該格已有其他玩家，無法移動');
      triggerRockPaperScissors(player, nextTile); // 呼叫猜拳 function
      return;
    }
    nextTile.appendChild(player);
    console.log(`🚶‍♂️ 玩家移動到格子 ${newIndex}`);
  } else {
    console.log('⛔ 無法移動：目標格子不存在');
  }
}

//猜拳戰鬥
function triggerRockPaperScissors(player, tile) {
  console.log('✊✋✌️ 進入猜拳對戰！');

  const overlay = document.getElementById('rps-overlay');
  overlay.style.display = 'flex'; // 顯示預設隱藏的面板

  startRpsTimer();
}

// 讀條
let timerRunning = false;
let retryInterval;
let info = {};

function startRpsTimer(duration = 3000) {
  const bar = document.getElementById('rps-bar');
  console.log('[startRpsTimer] 啟動倒數計時');
  bar.style.transition = 'none';
  bar.style.width = '100%';
  void bar.offsetWidth;
  bar.style.transition = `width ${duration}ms linear`;
  bar.style.width = '0%';
  timerRunning = true;
  info = {}; // 重設 info
  console.log('[startRpsTimer] 狀態初始化完成');

  bar.addEventListener('transitionend', () => {
    if (Object.keys(info).length === 0) {
      console.log('⏳ 時間到，沒有人按，重新開始');
      startRpsTimer();
    } else if (Object.keys(info).length === 1) {
      console.log('⏳ 時間到，僅一人按下，判定勝負');
      checkwin(info);
      timerRunning = false;
    }
  }, { once: true });
}

// 檢查按下的按鈕式是否有效
function checkPress(player, move) {
  console.log(`[checkPress] 玩家 ${player} 嘗試按鍵，move: ${move}`);
  if (!timerRunning || player in info) {
    console.log(`[checkPress] 忽略事件 - 倒數未啟動或 ${player} 已按過`);
    return;
  }

  const bar = document.getElementById('rps-bar');
  const barWidth = parseFloat(getComputedStyle(bar).width);
  const totalWidth = parseFloat(getComputedStyle(document.getElementById('rps-timer-wrapper')).width);
  const percentage = (barWidth / totalWidth) * 100;
  console.log(`[checkPress] 寬度百分比: ${percentage.toFixed(2)}%`);

  if (percentage > 0 && percentage <= 30) {
    console.log(`✅ 玩家 ${player} 選擇 ${move} 成功按下！`);
    info[player] = move;
    if (Object.keys(info).length === 2) {
      timerRunning = false;
      bar.style.transition = 'none';
      bar.style.width = '0%';
      console.log('🎉 兩位玩家皆成功，結束回合');
      checkwin(info);
    }
  } else {
    console.log(`❌ 玩家 ${player} 失敗，按太早或太晚！`);
  }
}

//檢查猜拳輸贏
function checkwin(info) {
  console.log('[checkwin] 判斷勝負中', info);
  const keys = Object.keys(info);
  if (keys.length === 2) {
    const p1 = keys[0];
    const p2 = keys[1];
    const m1 = info[p1];
    const m2 = info[p2];

    console.log(`[checkwin] 玩家 ${p1} 出 ${m1}, 玩家 ${p2} 出 ${m2}`);

    if ((m1 === 1 && m2 === 2) || (m1 === 2 && m2 === 3) || (m1 === 3 && m2 === 1)) {
      console.log(`[checkwin] 玩家 ${p1} 勝利`);
      spawn(p1);
    } else if ((m2 === 1 && m1 === 2) || (m2 === 2 && m1 === 3) || (m2 === 3 && m1 === 1)) {
      console.log(`[checkwin] 玩家 ${p2} 勝利`);
      spawn(p2);
    } else {
      console.log('平手');
      startRpsTimer();
      return;
    }
  } else if (keys.length === 1) {
    const loser = keys[0] === 'A' ? 'B' : 'A';
    console.log(`[checkwin] 僅有玩家 ${keys[0]} 出拳，${loser} 判定失敗`);
    spawn(loser);
  }

  document.getElementById('rps-overlay').style.display = 'none';
}

//重生
function spawn(player) {
  console.log(`🔁 玩家 ${player} 輸了，移動到出生點`);
  const loser = document.getElementById(`player${player}`);
  const spawnPoint = document.getElementById(`spawnPoint${player}`);
  spawnPoint.append(loser);
}

const winSound = new Audio('阿/win1.mp3');
//贏家特效
function win(winChar) {
  console.log(`🔁 玩家 ${winChar} 贏了`);
  const loseChar = winChar === 'A' ? 'B' : 'A';
  const overlay = document.getElementById('rps-overlay-win');
  const content = document.getElementById('win-content');

  bgm.pause();
  bgm.currentTime = 0;
  winSound.play();

  gameRunning = false;
  if (overlay && content) {
    overlay.style.display = 'flex';
    console.log(`[Win] 顯示勝利畫面，勝者為 ${winChar}`);

    // 取代內文，加入動態勝利文字
    content.innerHTML = `
      <h2>🎉 玩家 ${winChar} 獲勝！</h2>
      <button onclick="restartGame()">再玩一次</button>
    `;
  }
}

function restartGame() {
  console.log('[Restart] 遊戲重新開始');
  const overlay = document.getElementById('rps-overlay-win');
  gameRunning = true;
  overlay.style.display = 'none';
  spawn('A');
  spawn('B');
  winSound.pause();
  winSound.currentTime = 0;
  bgm.play();

}

//背景音樂
const bgm = new Audio('阿/bgm1.mp3');
bgm.loop = true;

function startGame() {
  bgm.play(); // ✅ 一定要用使用者互動觸發
  const overlay = document.getElementById("rps-overlay-start");
  overlay.style.display = 'none';
}


// 行動裝置改layout
function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

if (isMobileDevice()) {
  console.log("使用者是行動裝置！");
  document.body.classList.add("mobile");

  // 找到所有 .setMoveButton 元素並隱藏
  const moveButtons = document.querySelectorAll('.setMoveButton');
  moveButtons.forEach(button => {
    button.style.display = 'none';
  });

} else {
  console.log("使用者是桌機！");
  document.body.classList.add("desktop");
} 
