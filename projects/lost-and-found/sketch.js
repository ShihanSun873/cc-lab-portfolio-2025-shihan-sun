function setup() {
  createCanvas(400, 400);
  noLoop();
}

function draw() {
  background(248);

  drawClouds();

  // Ground
  noStroke();
  fill(230);
  rect(0, 260, width, 40);

  // Horizon
  stroke(90);
  line(0, 240, width, 240);

  drawGroundPattern(240);

  // Stalls
  drawStalls(20, 240, 6);

  // Gate
  drawGate(width * 0.78, 240);
}

function drawClouds() {
  noStroke();
  fill(255);
  drawCloud(70, 70, 48);
  drawCloud(180, 55, 38);
  drawCloud(300, 80, 52);
}

function drawCloud(x, y, s) {
  ellipse(x, y, s, s * 0.6);
  ellipse(x - s * 0.35, y + 4, s * 0.7, s * 0.45);
  ellipse(x + s * 0.35, y + 6, s * 0.7, s * 0.45);
}

function drawGroundPattern(y) {
  stroke(210);
  for (let yy = y + 10; yy < height; yy += 14) {
    for (let xx = 0; xx < width; xx += 22) {
      ellipse(xx, yy, 16, 8);
    }
  }
}

function drawStalls(x, baseY, cols) {
  let w = 56;
  let h = 54;
  let roofH = 32;
  let gap = 10;

  for (let i = 0; i < cols; i++) {
    let xx = x + i * (w + gap);
    let y = baseY - h;

    // Roof
    noStroke();
    fill(180, 200, 240);
    triangle(xx, y, xx + w / 2, y - roofH, xx + w, y);

    // Roof trim
    stroke(200);
    line(xx + 4, y, xx + w - 4, y);

    // Body
    stroke(60);
    fill(245);
    rect(xx, y, w, h, 6);

    // Window
    noStroke();
    fill(220);
    rect(xx + w / 2 - 8, y + 10, 16, 18, 3);
    stroke(180);
    noFill();
    rect(xx + w / 2 - 8, y + 10, 16, 18, 3);

    // Counter
    stroke(120);
    line(xx, y + h - 14, xx + w, y + h - 14);

    // Sign
    noStroke();
    fill(250);
    rect(xx + 10, y - 18, w - 20, 14, 4);
    stroke(160);
    noFill();
    rect(xx + 10, y - 18, w - 20, 14, 4);
  }
}

function drawGate(x, groundY) {
  let w = 76;
  let h = 112;

  // Pillar
  stroke(60);
  fill(245);
  rect(x - w / 2, groundY - 12, w, h, 8);

  // Brick hint
  stroke(220);
  for (let y = groundY + 10; y < groundY + h - 20; y += 16) {
    line(x - w / 2 + 6, y, x + w / 2 - 6, y);
  }

  // Opening
  noStroke();
  fill(220);
  rect(x - 24, groundY + 18, 48, 78, 10);
  fill(250);
  arc(x, groundY + 18, 48, 48, PI, TWO_PI);

  // Door split
  stroke(150);
  line(x, groundY + 32, x, groundY + 96);

  // Plaque
  noStroke();
  fill(250);
  rect(x - 28, groundY - 30, 56, 16, 4);
  stroke(180);
  noFill();
  rect(x - 28, groundY - 30, 56, 16, 4);
}
