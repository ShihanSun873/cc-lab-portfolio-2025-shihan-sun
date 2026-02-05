let progress = 0;
let targetProgress = 0;
let opened = false;

let dragActive = false;
let dragStartY = 0;
let dragStartProgress = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Cinzel');
  textAlign(CENTER, CENTER);
  noStroke();

  document.body.style.overscrollBehavior = 'none';

  const backBtn = document.getElementById('backBtn');
  backBtn?.addEventListener('click', () => closePostcard());
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  progress = lerp(progress, targetProgress, 0.12);

  drawBackground();
  drawEnvelope(progress);

  if (!opened && progress > 0.985) {
    opened = true;
    showPostcard(true);
  }
  if (opened && progress < 0.02) {
    opened = false;
    showPostcard(false);
  }
}

function drawBackground() {
  background(8, 6, 12);
  push();
  noFill();
  for (let i = 0; i < 10; i++) {
    const a = map(i, 0, 9, 18, 0);
    stroke(120, 90, 255, a);
    strokeWeight(2);
    ellipse(width * 0.5, height * 0.35, 900 + i * 60, 600 + i * 50);
  }
  pop();
}

function drawEnvelope(t) {
  const cx = width * 0.5;
  const cy = height * 0.48;

  const w = min(width * 0.72, 880);
  const h = w * 0.58;

  const yShift = lerp(0, 26, t);
  const fade = lerp(255, 140, t);

  const baseA = color(20, 14, 35, fade);
  const baseB = color(14, 16, 42, fade);
  const edge = color(233, 230, 255, lerp(60, 20, t));
  const accent = color(140, 120, 255, lerp(60, 18, t));

  push();
  translate(cx, cy + yShift);

  fill(0, 0, 0, 60);
  rectMode(CENTER);
  rect(0, 8, w + 10, h + 10, 26);

  setLinearFillRect(-w / 2, -h / 2, w, h, baseA, baseB);
  rect(0, 0, w, h, 26);

  noFill();
  stroke(edge);
  strokeWeight(1);
  rect(0, 0, w, h, 26);

  stroke(edge);
  line(-w / 2, -h / 2, 0, 0);
  line(w / 2, -h / 2, 0, 0);
  line(-w / 2, h / 2, 0, 0);
  line(w / 2, h / 2, 0, 0);

  const flapOpen = easeOutCubic(constrain(map(t, 0.15, 0.75, 0, 1), 0, 1));
  const flapAngle = lerp(0, -PI * 0.95, flapOpen);

  push();
  translate(0, -h / 2);
  rotate(flapAngle);
  translate(0, h / 2);

  fill(accent);
  noStroke();
  triangle(-w / 2, -h / 2, w / 2, -h / 2, 0, 0);

  stroke(edge);
  noFill();
  triangle(-w / 2, -h / 2, w / 2, -h / 2, 0, 0);
  pop();

  const titleFade = lerp(255, 0, constrain(map(t, 0.40, 1.0, 0, 1), 0, 1));
  fill(233, 230, 255, titleFade);
  noStroke();
  textStyle(BOLD);
  textSize(min(34, w / 18));
  text("Welcome to Shihan’s Portfolio", 0, 0);

  pop();

  const hint = document.getElementById('hint');
  if (hint) hint.style.opacity = String(lerp(1, 0, constrain(map(t, 0.25, 0.85, 0, 1), 0, 1)));
}

function showPostcard(show) {
  const el = document.getElementById('postcard');
  if (!el) return;
  if (show) el.classList.add('show');
  else el.classList.remove('show');
}

function closePostcard() {
  showPostcard(false);
  targetProgress = 0;
}

function mouseWheel(e) {
  const delta = e.deltaY;
  const step = 0.0016 * abs(delta);
  if (delta > 0) targetProgress = constrain(targetProgress + step, 0, 1);
  else targetProgress = constrain(targetProgress - step, 0, 1);
  return false;
}

function mousePressed() {
  dragActive = true;
  dragStartY = mouseY;
  dragStartProgress = targetProgress;
}

function mouseDragged() {
  if (!dragActive) return;
  const dy = mouseY - dragStartY;
  const step = -dy / (height * 0.9);
  targetProgress = constrain(dragStartProgress + step, 0, 1);
}

function mouseReleased() {
  dragActive = false;
  targetProgress = (targetProgress > 0.52) ? 1 : 0;
}

function touchStarted() {
  dragActive = true;
  dragStartY = touches[0]?.y ?? 0;
  dragStartProgress = targetProgress;
  return false;
}

function touchMoved() {
  if (!dragActive) return false;
  const y = touches[0]?.y ?? dragStartY;
  const dy = y - dragStartY;
  const step = -dy / (height * 0.9);
  targetProgress = constrain(dragStartProgress + step, 0, 1);
  return false;
}

function touchEnded() {
  dragActive = false;
  targetProgress = (targetProgress > 0.52) ? 1 : 0;
  return false;
}

function easeOutCubic(x) { return 1 - pow(1 - x, 3); }

function setLinearFillRect(x, y, w, h, c1, c2) {
  const steps = 40;
  noStroke();
  rectMode(CORNER);
  for (let i = 0; i < steps; i++) {
    const tt = i / (steps - 1);
    fill(lerpColor(c1, c2, tt));
    rect(x, y + tt * h, w, h / steps + 1);
  }
  rectMode(CENTER);
}
