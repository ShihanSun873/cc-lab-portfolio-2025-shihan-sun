const MP3_FILENAME = "fire bird.mp3";

let entries = [
  { label: "10/16\nRAISE A SUILEN\n(1h44m)", time: 104, artist: "raise a suilen" },
  { label: "10/15\nNakashima Yuki\n(39m)",   time: 39,  artist: "nakashima yuki" },
  { label: "10/14\nRoselia\n(1h25m)",        time: 85,  artist: "roselia" },
  { label: "10/13\nNakashima Yuki\n(16m)",   time: 16,  artist: "nakashima yuki" },
  { label: "10/12\nYorushika\n(40m)",        time: 40,  artist: "yorushika" },
  { label: "10/11\nRoselia\n(44m)",          time: 44,  artist: "roselia" },
  { label: "10/10\nRoselia\n(2h5m)",         time: 125, artist: "roselia" }
];

let song, amp;
let smoothed = 0;
let maxLevel = 0.1;
let playBtn;

const CANVAS = 900;
const PIE_DIAM = 700;
const LABEL_R = 250;

function preload() {
  song = loadSound(MP3_FILENAME);
}

function setup() {
  createCanvas(CANVAS, CANVAS);
  angleMode(DEGREES);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);
  textWrap(WORD);

  amp = new p5.Amplitude();
  amp.smooth(0.75);
  amp.setInput(song);
  song.setLoop(true);

//button
  playBtn = createButton("Play Music");
  playBtn.position(16, height - 44);
  playBtn.style("font-size", "16px");
  playBtn.mousePressed(toggleMusic);
}

function toggleMusic() {
  userStartAudio();
  if (song.isPlaying()) {
    song.pause();
    playBtn.html("Play Music");
  } else {
    song.play();
    playBtn.html("Stop Music");
  }
}

function draw() {
  background(240);
  translate(width / 2, height / 2);

//music respond
  let rawLevel = (song && (song.isPlaying() || song.isPaused())) ? amp.getLevel() : 0;

  maxLevel = max(maxLevel * 0.995, rawLevel);
  let normalized = constrain(rawLevel / maxLevel, 0, 1);
  smoothed = lerp(smoothed, normalized, 0.25);

  let haloDiam = PIE_DIAM + map(smoothed, 0, 1, 30, 220, true);
  noFill();
  stroke(0, 180);
  strokeWeight(map(smoothed, 0, 1, 6, 28, true));
  ellipse(0, 0, haloDiam, haloDiam);
  noStroke();

//chart
  let total = entries.reduce((s, e) => s + e.time, 0);
  let lastAngle = 0;

  for (let e of entries) {
    let angle = (e.time / total) * 360;

    let c;
    const a = e.artist.toLowerCase();
    if (a === "raise a suilen")      c = color(0, 255, 205);
    else if (a === "roselia")        c = color(0, 0, 255);
    else if (a === "nakashima yuki") c = color(60, 200, 255);
    else if (a === "yorushika")      c = color(255, 255, 255);
    else                             c = color(200);

    fill(c);
    arc(0, 0, PIE_DIAM, PIE_DIAM, lastAngle, lastAngle + angle, PIE);

    let mid = lastAngle + angle / 2;
    let x = cos(mid) * LABEL_R;
    let y = sin(mid) * LABEL_R;

//text
    fill(0);
    push();
    translate(x, y);
    rotate(mid);
    text(e.label, 0, 0);
    pop();

    lastAngle += angle;
  }
}
