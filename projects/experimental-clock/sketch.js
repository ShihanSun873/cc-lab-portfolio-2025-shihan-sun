function setup() {
  createCanvas(600, 600);
  angleMode(DEGREES); 
}

function draw() {
  background(0);
  translate(width / 2, height / 2);
  rotate(-90); 

  let hr = hour();
  let mn = minute();
  let sc = second();

  let scAngle = map(sc, 0, 60, 0, -360);
  let mnAngle = map(mn + sc/60, 0, 60, 0, -360);
  let hrAngle = map(hr % 12 + mn/60, 0, 12, 0, -360);

  stroke(1000);
  noFill();
  ellipse(0, 0, 400, 400);

  push();
  rotate(hrAngle);
  strokeWeight(15);
  line(0, 0, 100, 0);
  pop();

  push();
  rotate(mnAngle);
  strokeWeight(10);
  line(0, 0, 140, 0);
  pop();

  push();
  rotate(scAngle);
  strokeWeight(10);
  stroke(200, 0, 0);
  line(0, 0, 170, 0);
  pop();

  stroke(0);
  fill(0);
  ellipse(0, 0, 10, 10);
}
