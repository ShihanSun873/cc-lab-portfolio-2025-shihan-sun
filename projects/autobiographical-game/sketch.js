const LANES = 4;
const KEYS = ['D','F','J','K'];
const KEYCODES = [68,70,74,75];

let activeLanes = 4;
let laneX = new Array(LANES);
let laneW = 90;
let noteH = 18;
let hitY;
let approach = 2.0;
let speed;

// state
let started = false;
let paused = false;
let gameOver = false;
let gameTime = 0;
let score = 0, combo = 0, maxCombo = 0;

// timing
let HIT     = 0.20;
let PERFECT = 0.05;
let GOOD    = 0.10;

// audio
let song;
let amp;
let songPeaks = [];
let songDurationSec = 0;

// notes
let CHART = [];
let laneHold = new Array(LANES).fill(null);
let keyDown = new Array(LANES).fill(false);

// stats
let countPerfect = 0;
let countGood    = 0;
let countOK      = 0;
let countMiss    = 0;

// feedback
let feedbackText = "";
let feedbackColor;
let feedbackTimer = 0;

// lane colors
const MEMBER_INFO = [
  { col: [170,140,255] },
  { col: [120,230,220] },
  { col: [255,140,170] },
  { col: [210,180,255] }
];

// Ako color
const AKO = { col: [221,0,136] };

// bpm
const BPM = 150;
const OFFSET = 2.0;

// difficulty
const DIFFICULTIES = {
  Easy: {
    hit: 0.24, perfect: 0.08, good: 0.18,
    spawn: 0.50, hold: 0.10, bonus: 0.15,
    beatSubdiv: 1, speedMult: 0.85
  },
  Normal: {
    hit: 0.18, perfect: 0.06, good: 0.12,
    spawn: 0.65, hold: 0.18, bonus: 0.20,
    beatSubdiv: 2, speedMult: 1.00
  },
  Hard: {
    hit: 0.14, perfect: 0.05, good: 0.10,
    spawn: 0.80, hold: 0.25, bonus: 0.25,
    beatSubdiv: 2, speedMult: 1.15
  }
};
const difficultyOrder = ["Easy", "Normal", "Hard"];
let difficultyIndex = 0;
let currentDifficultyName = difficultyOrder[difficultyIndex];
let currentDiff = DIFFICULTIES[currentDifficultyName];

// music file
function preload(){
  song = loadSound("rhythm_hero_theme.mp3");
}

// setup
function setup(){
  createCanvas(600, 800);
  textAlign(CENTER, CENTER);
  textFont('Georgia');

  hitY = height - 160;
  updateLanePositions();
  applyDifficulty();

  amp = new p5.Amplitude();

  if (song && song.isLoaded()) {
    songDurationSec = song.duration();
    songPeaks = song.getPeaks(2048);
  }

  generateChartBPM();
}

// draw
function draw(){
  drawBackground();

  if (started && !paused && !gameOver){
    gameTime += deltaTime / 1000;
  }

  drawLanes();
  drawJudgeLine();

  const now = currentTime();

  if (started && !paused && !gameOver){
    handleAutoMiss(now);
    updateHolds(now);
  }

  drawNotes(now);
  drawHUD();
  drawProgressBar(now);
  drawEndButton();
  drawFeedback();

  if (!started && !gameOver) drawStartScreen();
  if (paused && started && !gameOver) drawPauseOverlay();

  if (started && !paused && !gameOver){
    if (now > getChartEndTime() + 2){
      gameOver = true;
      if (song && song.isPlaying()) song.stop();
    }
  }

  if (gameOver){
    drawResultOverlay();
    noLoop();
  }
}

// background
function drawBackground(){
  let top = color(12, 8, 30);
  let bottom = color(26, 18, 60);
  for (let y = 0; y < height; y++){
    let c = lerpColor(top, bottom, y / height);
    stroke(c);
    line(0, y, width, y);
  }
}

// lanes
function updateLanePositions(){
  const pad = 18;
  const totalW = activeLanes*laneW + (activeLanes-1)*pad;
  const left = (width - totalW)/2;
  for (let i=0;i<activeLanes;i++){
    laneX[i] = left + i*(laneW+pad);
  }
}

function drawLanes(){
  noStroke();
  for (let i=0;i<activeLanes;i++){
    const mc = MEMBER_INFO[i].col;
    fill(mc[0]*0.25, mc[1]*0.25, mc[2]*0.35, 210);
    rect(laneX[i], 0, laneW, height);
  }
}

// judge line
function drawJudgeLine(){
  const [ar, ag, ab] = AKO.col;
  stroke(ar, ag, ab);
  strokeWeight(3);
  line(laneX[0]-16, hitY, laneX[activeLanes-1]+laneW+16, hitY);
}

// difficulty
function applyDifficulty(){
  currentDiff = DIFFICULTIES[currentDifficultyName];
  HIT     = currentDiff.hit;
  PERFECT = currentDiff.perfect;
  GOOD    = currentDiff.good;

  const yStart = 120;
  const baseSpeed = (hitY - yStart) / approach;
  speed = baseSpeed * currentDiff.speedMult;
}

// notes
function drawNotes(now){
  for (const n of CHART){
    if (!n.isHold && n.judged) continue;

    const yHead = noteY(n.t, now);
    if (yHead < -200 || yHead > height + 200) continue;

    if (n.isHold){
      const tailY = noteY(n.t + n.duration, now);
      const yTop = min(yHead, tailY);
      const h = max(abs(yHead - tailY), noteH);

      const col = n.holdBroken ? color(40,100,90) : color(80,220,190);
      noStroke();
      fill(col);
      rect(laneX[n.lane]+8, yTop, laneW-16, h, 6);

    } else {
      let c1, c2;
      if (n.isBonus){
        c1 = color(255,120,210);
        c2 = color(210,90,255);
      } else {
        c1 = color(120,160,255);
        c2 = color(90,120,220);
      }
      const x = laneX[n.lane] + 8;
      const y = yHead - noteH/2;
      drawGradientNote(x, y, laneW - 16, noteH, c1, c2);
    }
  }
}

// gradient
function drawGradientNote(x, y, w, h, c1, c2){
  noFill();
  for (let i = 0; i < h; i++){
    const t = h > 1 ? i / (h-1) : 0;
    const c = lerpColor(c1, c2, t);
    stroke(c);
    line(x, y + i, x + w, y + i);
  }
  noStroke();
}

// auto miss
function handleAutoMiss(now){
  for (const n of CHART){
    if (n.judged) continue;
    if (now - n.t > HIT + 0.05){
      n.judged = true;
      n.hit = false;
      combo = 0;
      countMiss++;
    }
  }
}

// holds
function updateHolds(now){
  for (let lane=0; lane<activeLanes; lane++){
    const n = laneHold[lane];
    if (!n) continue;
    const endTime = n.t + n.duration;
    if (now > endTime + HIT){
      if (!n.holdBroken){
        score += 30;
      }
      laneHold[lane] = null;
    }
  }
}

// HUD
function drawHUD(){
  fill(24,18,60,210);
  stroke(190,150,255);
  strokeWeight(2);
  rect(14,14,330,100,12);

  noStroke();
  fill(235,230,255);
  textAlign(LEFT,TOP);
  textSize(14);
  text(`Score: ${score}`, 24, 24);
  text(`Combo: ${combo}   Max: ${maxCombo}`, 24, 44);
  text(`Difficulty: ${currentDifficultyName}`, 24, 64);

  textSize(10);
  text("Blue = normal   Green = hold   Pink = bonus", 24, 84);

  for (let i=0;i<activeLanes;i++){
    fill(30,24,70);
    stroke(190,150,255);
    rect(laneX[i], hitY+40, laneW, 56, 10);
    noStroke();
    fill(240);
    textSize(20);
    textAlign(CENTER,CENTER);
    text(KEYS[i], laneX[i]+laneW/2, hitY+68);
  }
}

// progress bar
function drawProgressBar(now){
  const end = getChartEndTime();
  if (end <= 0) return;

  const margin = 40;
  const x = margin;
  const y = 120;
  const w = width - margin*2;
  const h = 10;
  const p = constrain(now / end, 0, 1);

  fill(30,20,70);
  stroke(190,150,255);
  rect(x,y,w,h,5);

  const [ar, ag, ab] = AKO.col;
  noStroke();
  fill(ar, ag, ab);
  rect(x,y,w*p,h,5);
}

// end button
function drawEndButton(){
  if (!started || gameOver) return;

  const x = width - 150, y = 18, w = 130, h = 44;
  fill(30,20,70);
  stroke(190,150,255);
  rect(x,y,w,h,10);

  noStroke();
  fill(235,230,255);
  textSize(14);
  textAlign(CENTER,CENTER);
  text("End", x+w/2, y+h/2);
}

// feedback
function drawFeedback(){
  if (feedbackTimer <= 0) return;
  feedbackTimer -= deltaTime / 1000;

  drawOutlinedText(
    feedbackText,
    width/2,
    hitY - 80,
    32,
    feedbackColor,
    color(0,0,0)
  );
}

// outlined text
function drawOutlinedText(str, x, y, size, fillCol, strokeCol){
  push();
  textSize(size);
  textAlign(CENTER, CENTER);
  stroke(strokeCol);
  strokeWeight(3);
  fill(fillCol);
  text(str, x, y);
  pop();
}

// start screen
function drawStartScreen(){
  fill(0,0,0,180);
  rect(0,0,width,height);

  noStroke();
  for (let i=0; i<20; i++){
    fill(120,100,220, 8);
    ellipse(width/2, height/2 - 120, 400 - i*15, 130 - i*5);
  }

  drawOutlinedText(
    "RHYTHM HERO",
    width/2,
    height/2 - 120,
    32,
    color(240,235,255),
    color(60,0,110)
  );

  fill(240,230,255);
  noStroke();
  textSize(16);
  text(
    "SPACE: Start\n" +
    "DFJK: Hit notes\n" +
    "TAB: Pause\n" +
    "R: Restart\n\n" +
    "1/2/3: Difficulty (Easy / Normal / Hard)",
    width/2,
    height/2
  );
}

// pause
function drawPauseOverlay(){
  fill(0,0,0,150);
  rect(0,0,width,height);

  drawOutlinedText(
    "PAUSED",
    width/2,
    height/2,
    28,
    color(240,230,255),
    color(30,0,60)
  );
}

// results
function drawResultOverlay(){
  fill(0,0,0,200);
  rect(0,0,width,height);

  drawOutlinedText(
    "RESULTS",
    width/2,
    100,
    26,
    color(240,230,255),
    color(30,0,60)
  );

  fill(240,230,255);
  noStroke();
  textSize(16);
  text(
    `Score: ${score}\n` +
    `Max Combo: ${maxCombo}\n\n` +
    `Perfect: ${countPerfect}\n` +
    `Good: ${countGood}\n` +
    `OK: ${countOK}\n` +
    `Miss: ${countMiss}\n`,
    width/2,
    240
  );

  textSize(22);
  fill(255,215,245);
  textAlign(CENTER, CENTER);
  text("「全てを賭けなさい。」", width/2, 360);

  textSize(16);
  fill(230,220,255);
  text("Risk Everything.", width/2, 400);

  textSize(14);
  fill(240,230,255);
  text("\nPress R to restart", width/2, 470);
}

// time
function currentTime(){ return gameTime; }

function noteY(tNote, tNow){
  const yStart = 120;
  return hitY - (tNote - tNow) * speed;
}

function getChartEndTime(){
  let m = 0;
  for (const n of CHART){
    let end = n.t + (n.isHold ? n.duration : 0);
    if (end > m) m = end;
  }
  return m;
}

// intensity from peaks
function getIntensityAtTime(t){
  if (!songPeaks || songPeaks.length === 0 || songDurationSec <= 0) return 1;
  let norm = constrain(t / songDurationSec, 0, 0.999);
  let idx = floor(norm * songPeaks.length);
  let v = abs(songPeaks[idx]);
  return map(v, 0, 1, 0.7, 1.4);
}

// chart generation
function collidesWithHold(t, duration, lane, isHold){
  for (const m of CHART){
    if (m.lane !== lane || !m.isHold) continue;

    const mStart = m.t;
    const mEnd   = m.t + m.duration;

    if (!isHold){
      if (t > mStart - 0.05 && t < mEnd + 0.05) return true;
    } else {
      const s = t, e = t + duration;
      if (max(s,mStart) < min(e,mEnd)+0.05) return true;
    }
  }
  return false;
}

function patternMeasure(measureIndex){
  const patterns = [
    [0, 2, 1, 3],
    [0, 3, 1, 2],
    [1, 3, 0, 2]
  ];
  return patterns[measureIndex % patterns.length];
}

function generateChartBPM(){
  CHART = [];

  let songLen = 10;
  if (song && song.isLoaded()) songLen = max(8, song.duration());

  const secPerBeat = 60 / BPM;
  const subdiv = currentDiff.beatSubdiv;
  const secPerStep = secPerBeat / subdiv;

  const lastTime = songLen - 1.5;
  let step = 0;

  while (true){
    const t = OFFSET + step * secPerStep;
    if (t > lastTime) break;

    const beat = floor(step / subdiv);
    const beatInMeasure = beat % 4;
    const measureIndex = floor(beat / 4);
    const stepInBeat = step % subdiv;

    const measurePattern = patternMeasure(measureIndex);
    const mainLane = measurePattern[beatInMeasure];

    const intensity = getIntensityAtTime(t);

    const baseSpawn = currentDiff.spawn * intensity;
    const spawnChance = stepInBeat === 0
      ? baseSpawn
      : baseSpawn * 0.45;

    if (random() < spawnChance){
      let lane = mainLane;
      let isHold = false;
      let duration = 0;

      const holdChance  = currentDiff.hold  * map(intensity, 0.7, 1.4, 0.6, 1.3);
      const bonusChance = currentDiff.bonus * map(intensity, 0.7, 1.4, 0.5, 1.5);
      const chordChance = 0.2 * map(intensity, 0.7, 1.4, 0.5, 1.5);

      if (stepInBeat === 0){
        if (random() < holdChance && beatInMeasure === 0){
          isHold = true;
          duration = secPerBeat * random([1,2,3]);
        } else if (random() < chordChance){
          const secondLane = constrain(
            mainLane + (random() < 0.5 ? -1 : 1),
            0, activeLanes-1
          );
          if (!collidesWithHold(t, 0, secondLane, false)){
            CHART.push({
              t,
              lane: secondLane,
              duration: 0,
              isHold: false,
              isBonus: random() < bonusChance,
              judged: false,
              hit: false,
              holdBroken: false
            });
          }
        }
      } else {
        const offset = random([0, 1, -1]);
        lane = constrain(mainLane + offset, 0, activeLanes-1);
      }

      if (!collidesWithHold(t, duration, lane, isHold)){
        CHART.push({
          t,
          lane,
          duration,
          isHold,
          isBonus: (!isHold && random() < bonusChance),
          judged: false,
          hit: false,
          holdBroken: false
        });
      }
    }

    step++;
  }
}

// input
function keyPressed(){
  if (key === ' ' && !started){
    startGame();
    return;
  }

  if (key === 'r' || key === 'R'){
    restartGame();
    return;
  }

  if (!started){
    if (key === '1'){ difficultyIndex = 0; }
    if (key === '2'){ difficultyIndex = 1; }
    if (key === '3'){ difficultyIndex = 2; }
    currentDifficultyName = difficultyOrder[difficultyIndex];
    applyDifficulty();
    generateChartBPM();
  }

  if (keyCode === 9){ // Tab
    togglePause();
    return false;
  }

  for (let i=0;i<activeLanes;i++){
    if (keyCode === KEYCODES[i]){
      keyDown[i] = true;
      judgeHit(i);
    }
  }
}

function keyReleased(){
  for (let i=0;i<activeLanes;i++){
    if (keyCode === KEYCODES[i]){
      keyDown[i] = false;

      const n = laneHold[i];
      if (n){
        const now = currentTime();
        const end = n.t + n.duration;
        if (now < end - HIT){
          n.holdBroken = true;
          registerMiss();
        }
        laneHold[i] = null;
      }
    }
  }
}

function mousePressed(){
  if (!started || gameOver) return;

  const x = width - 150, y = 18, w = 130, h = 44;
  if (mouseX>=x && mouseX<=x+w && mouseY>=y && mouseY<=y+h){
    if (song && song.isPlaying()) song.stop();
    gameOver = true;
    paused = false;
    loop();
  }
}

// state control
function togglePause(){
  if (!started || gameOver) return;
  paused = !paused;
  if (paused){
    if (song && song.isPlaying()) song.pause();
  } else {
    if (song && !song.isPlaying()) song.play();
  }
}

function startGame(){
  started = true;
  paused = false;
  gameOver = false;
  gameTime = 0;

  score = combo = maxCombo = 0;
  countPerfect = countGood = countOK = countMiss = 0;
  laneHold.fill(null);

  generateChartBPM();

  if (song && song.isLoaded()){
    song.stop();
    song.play();
  }

  loop();
}

function restartGame(){
  started = false;
  paused = false;
  gameOver = false;
  gameTime = 0;

  score = combo = maxCombo = 0;
  countPerfect = countGood = countOK = countMiss = 0;
  laneHold.fill(null);

  if (song && song.isLoaded()) song.stop();
  generateChartBPM();
  loop();
}

// judge
function judgeHit(lane){
  if (!started || paused || gameOver) return;

  const now = currentTime();
  let best = null;
  let bestDelta = 999;

  for (const n of CHART){
    if (n.lane !== lane || n.judged) continue;
    const d = n.t - now;
    if (abs(d) < abs(bestDelta)){
      best = n;
      bestDelta = d;
    }
    if (n.t - now > HIT) break;
  }

  if (!best || abs(bestDelta) > HIT){
    registerMiss();
    return;
  }

  best.judged = true;
  best.hit = true;

  const absD = abs(bestDelta);
  let base = 0;

  if (absD <= PERFECT){
    feedbackText = "Perfect";
    feedbackColor = color(80,220,255);
    base = 100;
    countPerfect++;
  } else if (absD <= GOOD){
    feedbackText = "Good";
    feedbackColor = color(120,255,140);
    base = 70;
    countGood++;
  } else {
    feedbackText = "OK";
    feedbackColor = color(255,220,120);
    base = 50;
    countOK++;
  }

  if (best.isBonus){
    base += 100;
    feedbackText += " +";
    feedbackColor = color(255,140,210);
  }

  score += base + combo*2;
  combo++;
  maxCombo = max(maxCombo, combo);
  feedbackTimer = 0.35;

  if (best.isHold){
    laneHold[lane] = best;
    best.holdBroken = false;
  }
}

function registerMiss(){
  combo = 0;
  countMiss++;
  feedbackText = "Miss";
  feedbackColor = color(255,100,130);
  feedbackTimer = 0.35;
}
