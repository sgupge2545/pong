// 0: 床, 1: 壁, 2: 敵
let mapData = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 2, 1],
  [1, 0, 1, 1, 0, 1, 1, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 1, 2, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 2, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

let hero = {
  x: 1,
  y: 1,
  name: "勇者",
  maxHp: 20,
  hp: 20,
  attack: 7,
  level: 1,
  exp: 0,
  nextExp: 10,
};

let enemies = [
  { name: "スライム", maxHp: 8, attack: 3, exp: 6 },
  { name: "ゴブリン", maxHp: 12, attack: 5, exp: 10 },
  { name: "ドラキー", maxHp: 10, attack: 4, exp: 8 },
];

// バトル用
let currentEnemy = null;
let battleEnemyObj = null;
let battlePos = { x: 0, y: 0 };

function drawMap() {
  const game = document.getElementById("game");
  game.innerHTML = "";
  for (let y = 0; y < mapData.length; y++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";
    for (let x = 0; x < mapData[y].length; x++) {
      const cellDiv = document.createElement("div");
      cellDiv.className = "cell";
      if (mapData[y][x] === 1) {
        cellDiv.classList.add("wall");
        cellDiv.textContent = "■";
      } else if (mapData[y][x] === 2) {
        cellDiv.classList.add("enemy");
        cellDiv.textContent = "敵";
      } else {
        cellDiv.classList.add("floor");
        cellDiv.textContent = "";
      }
      if (hero.x === x && hero.y === y) {
        cellDiv.classList.add("hero");
        cellDiv.textContent = "勇";
      }
      rowDiv.appendChild(cellDiv);
    }
    game.appendChild(rowDiv);
  }
}

function updateStatus() {
  document.getElementById(
    "status"
  ).textContent = `${hero.name} Lv.${hero.level} HP:${hero.hp}/${hero.maxHp} EXP:${hero.exp}/${hero.nextExp}`;
}

function moveHero(dx, dy) {
  if (document.getElementById("battle").style.display === "block") return;
  const newX = hero.x + dx;
  const newY = hero.y + dy;
  if (
    newX >= 0 &&
    newX < mapData[0].length &&
    newY >= 0 &&
    newY < mapData.length
  ) {
    if (mapData[newY][newX] === 1) return; // 壁
    if (mapData[newY][newX] === 2) {
      // 敵とバトル開始
      startBattle(newX, newY);
      return;
    }
    hero.x = newX;
    hero.y = newY;
    drawMap();
    updateStatus();
  }
}

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      moveHero(0, -1);
      break;
    case "ArrowDown":
      moveHero(0, 1);
      break;
    case "ArrowLeft":
      moveHero(-1, 0);
      break;
    case "ArrowRight":
      moveHero(1, 0);
      break;
  }
});

function startBattle(x, y) {
  // 敵種別をランダム
  const enemyType = enemies[Math.floor(Math.random() * enemies.length)];
  currentEnemy = {
    ...enemyType,
    hp: enemyType.maxHp,
  };
  battleEnemyObj = currentEnemy;
  battlePos = { x, y };
  document.getElementById(
    "battle-title"
  ).textContent = `${currentEnemy.name}が現れた！`;
  document.getElementById("battle-log").textContent = "";
  document.getElementById("battle").style.display = "block";
  document.getElementById("attackBtn").disabled = false;
  document.getElementById("healBtn").disabled = false;
  document.getElementById("battleEndBtn").style.display = "none";
  drawMap();
  updateStatus();
}

function finishBattle(win) {
  document.getElementById("attackBtn").disabled = true;
  document.getElementById("healBtn").disabled = true;
  document.getElementById("battleEndBtn").style.display = "inline-block";
  if (win) {
    // 敵をマップから消す
    mapData[battlePos.y][battlePos.x] = 0;
    // 経験値
    hero.exp += currentEnemy.exp;
    let msg = `敵を倒した！EXP+${currentEnemy.exp} `;
    // レベルアップ判定
    if (hero.exp >= hero.nextExp) {
      hero.level++;
      hero.exp = hero.exp - hero.nextExp;
      hero.nextExp = Math.floor(hero.nextExp * 1.6);
      hero.maxHp += 6;
      hero.hp = hero.maxHp;
      hero.attack += 2;
      msg += "レベルアップ！HP/攻撃力上昇！";
    }
    document.getElementById("battle-log").textContent += "\n" + msg;
    updateStatus();
    // すべての敵がいなくなったらクリア
    if (!mapData.flat().includes(2)) {
      setTimeout(() => {
        alert("全ての敵を倒した！クリア！");
        location.reload();
      }, 1000);
    }
  } else {
    document.getElementById("battle-log").textContent +=
      "\n勇者は倒れた… ゲームオーバー";
  }
}

document.getElementById("attackBtn").onclick = () => {
  // プレイヤー攻撃
  const playerDmg = Math.floor(Math.random() * hero.attack) + 1;
  currentEnemy.hp -= playerDmg;
  document.getElementById(
    "battle-log"
  ).textContent = `勇者の攻撃！${currentEnemy.name}に${playerDmg}ダメージ！`;

  if (currentEnemy.hp <= 0) {
    finishBattle(true);
    return;
  }

  // 敵のターン（少しディレイ）
  setTimeout(() => {
    const enemyDmg = Math.floor(Math.random() * currentEnemy.attack) + 1;
    hero.hp -= enemyDmg;
    document.getElementById(
      "battle-log"
    ).textContent += `\n${currentEnemy.name}の攻撃！勇者に${enemyDmg}ダメージ！`;
    updateStatus();
    if (hero.hp <= 0) {
      hero.hp = 0;
      finishBattle(false);
    }
  }, 800);
};

document.getElementById("healBtn").onclick = () => {
  // 回復（HP10回復・最大超えない）
  let heal = Math.min(10, hero.maxHp - hero.hp);
  hero.hp += heal;
  document.getElementById(
    "battle-log"
  ).textContent = `勇者は回復魔法を使った！HP+${heal}`;
  updateStatus();
  // 敵のターン
  setTimeout(() => {
    const enemyDmg = Math.floor(Math.random() * currentEnemy.attack) + 1;
    hero.hp -= enemyDmg;
    document.getElementById(
      "battle-log"
    ).textContent += `\n${currentEnemy.name}の攻撃！勇者に${enemyDmg}ダメージ！`;
    updateStatus();
    if (hero.hp <= 0) {
      hero.hp = 0;
      finishBattle(false);
    }
  }, 800);
};

document.getElementById("battleEndBtn").onclick = () => {
  document.getElementById("battle").style.display = "none";
  drawMap();
  updateStatus();
};

drawMap();
updateStatus();
