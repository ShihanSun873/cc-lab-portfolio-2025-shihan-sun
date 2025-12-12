function setup() {
  createCanvas(600, 600);
  noStroke();
}

function draw() {
  background(10, 30, 60);

  // Outer loop
  for (let y = 0; y < height; y += 40) {
    let baseColor = color(0, 100 + y / 5, 200 + y / 10, 180);

    // Inner loop
    for (let x = 0; x < width; x += 15) {
      let wave = sin((x + frameCount * 2) * 0.05 + y * 0.1);
      let offset = wave * 15;

      // IF/ELSE
      if (wave > 0) {
        fill(50, 150 + y / 10, 255, 200);
      } else {
        fill(0, 80 + y / 10, 180, 200);
      }

      rect(x, y + offset, 15, 40);
    }
  }
}
