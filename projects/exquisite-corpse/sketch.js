function setup() {
  createCanvas(600, 600);
  background(255);
}

function draw() {
  background(255);

  // head
  fill(50, 50, 200);
  ellipse(300, 200, 160, 160);

  fill(50, 50, 200);
  ellipse(240, 200, 50, 100);
  ellipse(360, 200, 50, 100);

  fill(255, 200, 50);
  ellipse(240, 240, 40, 40);
  ellipse(360, 240, 40, 40);

  fill(255);
  ellipse(300, 190, 80, 40);
  ellipse(300, 235, 50, 50);

  fill(0);
  ellipse(285, 190, 10, 10);
  ellipse(315, 190, 10, 10);
  rect(290, 230, 20, 10, 3);

  // body
  fill(0, 150, 0);
  rect(240, 280, 120, 110); 
  triangle(240, 390, 260, 380, 250, 400);
  triangle(360, 390, 380, 380, 370, 400);

  fill(255, 150, 100);
  rect(270, 280, 60, 110);

  stroke(200, 100, 50);
  strokeWeight(2);
  for (let y = 300; y <= 370; y += 15) {
    line(275, y, 325, y);
  }
  noStroke();

  // arm
  fill(0, 150, 0);
  rect(210, 300, 40, 20, 5);
  rect(350, 300, 40, 20, 5);
  fill(0);
  ellipse(210, 310, 15, 15);
  ellipse(390, 310, 15, 15);

  // leg
  fill(100, 0, 150);
  rect(260, 390, 30, 80);
  rect(310, 390, 30, 80);

  fill(255);
  rect(265, 420, 10, 10);

  // shoe
  fill(80, 40, 20); 
  ellipse(275, 470, 50, 25);
  ellipse(325, 470, 50, 25);
}
