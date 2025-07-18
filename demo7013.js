let sound, fft;
let started = false;
let fireworks = [];

function preload() {
  sound = loadSound("assets/Photograph.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  noStroke();
  fft = new p5.FFT();
  fft.setInput(sound); // 添加这一行

  // 用户点击按钮后才开始播放音乐和动画
  let button = document.getElementById("startButton");
  button.addEventListener("click", () => {
    sound.play();
    started = true;
    button.style.display = "none"; // 隐藏按钮
  });
}

function draw() {
  if (!started) return; // 不开始时跳过绘制

  background(0, 0.1);

  let energy = fft.getEnergy("bass");
  let spectrum = fft.analyze();
  console.log("spectrum[0-10]:", spectrum.slice(0, 10));

  console.log("bass energy:", energy);
  if (energy > 180) {
    fireworks.push(new Firework(random(width), height));
  }

  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    if (fireworks[i].isDone()) {
      fireworks.splice(i, 1);
    }
  }
}

// 补充 Firework 类和粒子类
class Firework {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.exploded = false;
    this.hu = random(360);
    this.fire = new Particle(x, y, true, this.hu);
  }
  update() {
    if (!this.exploded) {
      this.fire.applyForce(createVector(0, 0.2));
      this.fire.update();
      if (this.fire.vel.y >= 0) {
        this.exploded = true;
        for (let i = 0; i < 80; i++) {
          this.particles.push(
            new Particle(this.fire.pos.x, this.fire.pos.y, false, this.hu)
          );
        }
      }
    } else {
      for (let p of this.particles) {
        p.applyForce(createVector(0, 0.02));
        p.update();
      }
    }
  }
  show() {
    if (!this.exploded) {
      this.fire.show();
    } else {
      for (let p of this.particles) {
        p.show();
      }
    }
  }
  isDone() {
    if (this.exploded) {
      return this.particles.every((p) => p.done);
    }
    return false;
  }
}

class Particle {
  constructor(x, y, firework, hu) {
    this.pos = createVector(x, y);
    this.firework = firework;
    this.hu = hu;
    this.lifespan = 255;
    if (firework) {
      this.vel = createVector(0, random(-12, -8));
    } else {
      this.vel = p5.Vector.random2D();
      this.vel.mult(random(2, 8));
    }
    this.acc = createVector(0, 0);
    this.done = false;
  }
  applyForce(force) {
    this.acc.add(force);
  }
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    if (!this.firework) {
      this.lifespan -= 4;
      if (this.lifespan < 0) {
        this.done = true;
      }
    }
    this.acc.mult(0);
  }
  show() {
    colorMode(HSB);
    if (!this.firework) {
      stroke(this.hu, 255, 255, this.lifespan);
      strokeWeight(2);
    } else {
      stroke(this.hu, 255, 255);
      strokeWeight(4);
    }
    point(this.pos.x, this.pos.y);
  }
}
