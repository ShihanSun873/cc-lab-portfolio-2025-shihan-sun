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
let audioReady = false;
let audioFailedMsg = "";

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
  // ✅ 相对路径写法（GitHub Pages 稳）
  song = loadSound(
    "./rhythm_hero_theme.mp3",
    () => { audioReady = true; },
    (e) => {
      audioReady = false;
      audioFailedMsg = "Audio failed to load. Check filename/path + p5.sound.";
      // 这里不 throw，避免黑屏
      console.log("loadSound failed:", e);
    }
  );
}

// setup
function setup(){
  createCanvas(600, 800);
  textAlign(CENTER, CENTER);
  textFont('Georgia');

  hitY = height - 160;
  updateLanePositions();
  applyDifficulty();

  // ✅ Amplitude 只在 p5.sound 存在时使用
  amp = new p5.Amplitude();
  amp.smooth(0.8);
  if (song) amp.setInput(song);

  // peaks：音频没加载也不阻断游戏
  if (song && song.isLoaded()) {
    songDurationSec = song.duration();
    s
