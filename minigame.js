const keyBindings = {};
let listeningTarget = null;

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
  } else {
    Object.keys(keyBindings).forEach((id) => {
      if (e.key === keyBindings[id]) {
        if (id === 'moveButtonA' || id === 'moveButtonB') {
          movePlayerBy(id, 1);
        }
      }
    });
  }
});

setupKeyBinding('moveButtonA', '移動');
setupKeyBinding('moveButtonB', '移動');

function movePlayerBy(id, step) {
  let player;
  let direction = 0;

  if (id === 'moveButtonA') {
    player = document.getElementById('playerA');
    direction = 1;
  } else if (id === 'moveButtonB') {
    player = document.getElementById('playerB');
    direction = -1;
  }

  if (!player) return;

  const currentTile = player.parentElement;
  const currentIndex = parseInt(currentTile.dataset.index);
  const newIndex = currentIndex + direction * step;

  const nextTile = document.querySelector(`.tile[data-index='${newIndex}']`);
  if (nextTile) {
    const hasOtherPlayer = Array.from(nextTile.children).some(child => child.classList.contains('player') && child !== player);
    if (hasOtherPlayer) {
      console.log('⚠️ 該格已有其他玩家，無法移動');
      return;
    }
    nextTile.appendChild(player);
    console.log(`🚶‍♂️ 玩家移動到格子 ${newIndex}`);
  } else {
    console.log('⛔ 無法移動：目標格子不存在');
  }
}
