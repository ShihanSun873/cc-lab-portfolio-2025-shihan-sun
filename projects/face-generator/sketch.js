let skinColor;
let cx, cy, r;

function setup() {
  createCanvas(400, 400);
  cx = width / 2;
  cy = height / 2;
  r = 120;
  skinColor = color(255, 255, 255);
}

function draw() {
  background(220);

  // Face
  fill(skinColor);
  noStroke();
  ellipse(cx, cy, mouseX, mouseY);

  // Eyes
  fill(255);
  let eyeY = cy - r * 0.4;
  let eyeXOffset = r * 0.5;
 
  fill(0);
  ellipse(cx - eyeXOffset, eyeY, r * 0.1, r * 0.1);
  ellipse(cx + eyeXOffset, eyeY, r * 0.1, r * 0.1);

  // Mouth
  noFill();
  stroke(0);
  strokeWeight(10);
  let smileY = cy + r * 0.35;
  let smileW = mouseY/5;
  arc(cx, smileY, smileW, r * 0.1, 0, PI);
}

function keyPressed() {
  skinColor = color(random(0, 255), random(0, 255), random(0, 255));
  redraw();
}
