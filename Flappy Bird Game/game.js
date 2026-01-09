// Select elements for start screen, game area, and background music
const startScreen = document.getElementById(`start-screen`);
const startButton = document.getElementById(`start-button`);
const gameArea = document.getElementById(`game-area`);
const countdown = document.getElementById(`countdown`);
const countNumber = document.getElementById(`count-number`);
const backgroundMusic = document.getElementById(`bg-music`);
backgroundMusic.volume = 0.1;
// Game over screen elements
const gameOverScreen = document.getElementById(`game-over-screen`);
const finalScore = document.getElementById(`final-score`);
const restartButton = document.getElementById(`restart-button`);

const canvas = document.getElementById(`myCanvas`);
const gl = canvas.getContext(`webgl`);
canvas.width = 700;
canvas.height = 700;
gl.viewport(0, 0, canvas.width, canvas.height);

// Collision sound
const collisionSound = document.getElementById('collision-sound');
collisionSound.volume = 0.4; 

//Variables
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let bird = { x: -0.8, y: 0.2, width: 0.07, height: 0.075, gravity: -0.0015, lift: 0.025, velocity: 0 };
let pipes = [];
let frame = 0;
let gameOver = false;
let nightMode = false;


const vsSource = `
attribute vec2 pos;
void main() { 
    gl_Position = vec4(pos, 0.0, 1.0); 
}`;


const fsSource = `
precision mediump float;
uniform vec4 colour; 
void main() { 
    gl_FragColor = colour; 
}`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vsSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsSource);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const vbuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
const posLoc = gl.getAttribLocation(program, `pos`);
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

const colorLoc = gl.getUniformLocation(program, `colour`);

// Function to draw a rectangle with given position, size, and color
function drawRectangle(x, y, w, h, r, g, b) {
    const vertices = new Float32Array([
        x, y,
        x + w, y,
        x, y - h,
        x, y - h,
        x + w, y,
        x + w, y - h
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.uniform4f(colorLoc, r, g, b, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// Change background color based on score from light to night mode
function updateBackgroundColor() {
    if (nightMode || score > 100) {
        gl.clearColor(0.1, 0.1, 0.1, 1); // Night mode background
    } else if (score < 20) {
        gl.clearColor(0.16, 0.62, 0.03, 1); // Green
    } else if (score > 50 && score <= 100) {
        gl.clearColor(0.3, 0.2, 0.2, 1); // Darker tone
    } else if(score >=20){
        gl.clearColor(0.53, 0.81, 0.98, 1); // Sky blue
    }
    else{
        console.log(`There is an error by updateBackgroundColor`);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
}

// Get pipe color based on score or night mode
function getPipeColor() {
    if (nightMode || score >= 100) return [1, 1, 0]; // Yellow for night mode
    if (score >= 80) return [1, 0.75, 0.8]; // Pink
    if (score >= 60) return [0, 0, 0]; // Black
    if (score >= 40) return [0, 0, 1]; // Blue
    if (score >= 20) return [1, 0, 0]; // Red
    return [0, 1, 0]; // Green
}

// Draw the bird using circle for body and triangles for wings and beak
function drawBird() {
    let [r, g, b] = [1, 1, 0]; // Yellow body
    const segments = 20;
    const centerX = bird.x + bird.width / 2;
    const centerY = bird.y - bird.height / 2;
    const radius = bird.width / 1.5;
    const circleVertices = [centerX, centerY];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        circleVertices.push(centerX + Math.cos(angle) * radius);
        circleVertices.push(centerY + Math.sin(angle) * radius);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);
    gl.uniform4f(colorLoc, r, g, b, 1);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, segments + 2);

    // Draw flapping wing
    const wingOffset = Math.sin(frame * 0.2) * 0.01;
    const wingVertices = new Float32Array([
        bird.x + 0.015, bird.y - 0.03 + wingOffset,
        bird.x + 0.05, bird.y - 0.02 + wingOffset,
        bird.x + 0.035, bird.y - 0.07 + wingOffset
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, wingVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorLoc, 1, 0.5, 0, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Draw eye
    drawRectangle(centerX + 0.01, centerY + 0.01, bird.width / 5, bird.height / 5, 0, 0, 0);

    // Draw beak
    const beakVertices = new Float32Array([
        centerX + radius, centerY,
        centerX + radius + 0.02, centerY + 0.01,
        centerX + radius + 0.02, centerY - 0.01
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, beakVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorLoc, 1, 0.5, 0, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// Update bird physics and check for collisions with screen edges
function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    if (bird.y - 0.07 < -1 || bird.y > 1) gameOver = true;
}

// Generate new pipes at intervals
function createPipes() {
    if (frame % 90 === 0) {
        let gap = 0.4;
        let topHeight = Math.random() * (1 - gap - 0.001);
        let bottomHeight = 1 - (topHeight + gap);
        pipes.push({ x: 1, top: topHeight, bottom: bottomHeight, width: 0.15, passed: false });
    }
}

// Draw pipes
function drawPipes() {
    let [r, g, b] = getPipeColor();
    pipes.forEach(pipe => {
        drawRectangle(pipe.x, 1, pipe.width, pipe.top, r, g, b);
        drawRectangle(pipe.x, pipe.bottom, pipe.width, 1 - pipe.bottom, r, g, b);
    });
}



// Default pipe speed
let pipeSpeed = 0.02;

// Increment value for pipe speed
let speedInc = 0.0000019;

// This variable will track when the score reaches 10 or above
let speedUpTriggered = false;

// Update pipe position and check for collisions
function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        if (pipe.x + pipe.width < -1) pipes.shift();

        if ((bird.x < pipe.x + pipe.width) && (bird.x + bird.width > pipe.x) &&
            (bird.y > 1 - pipe.top || bird.y - bird.height < pipe.bottom)){

            collisionSound.currentTime = 0;
            collisionSound.play();
            gameOver = true;
            } 

        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            score++;
            pipe.passed = true;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);

                 // Flash the score display when high score is beaten
            const scoreDisplay = document.getElementById("score-display");
            scoreDisplay.classList.add("flash");
            setTimeout(() => {
 scoreDisplay.classList.remove("flash");
}, 1500);
            }
        }
    });

    // Increase pipe speed once the score reaches 10
    if (score >= 10 && !speedUpTriggered) {
        speedUpTriggered = true; // Make sure speed increment happens only once
        pipeSpeed += speedInc; // Increase pipe speed by increment
    }

    // Optional: Gradually increase pipe speed as the game progresses
    if (score > 50) {
        pipeSpeed += speedInc; // Keep increasing speed once score is over 50
    }
}

// Main game loop
function loop() {
    if (gameOver) {
        finalScore.textContent = `Your score: ${score} | Best: ${highScore}`;
        gameOverScreen.style.display = "flex";
        return;
    }
    document.getElementById("score-display").textContent = "Score: " + score + " | Best: " + highScore;
    updateBackgroundColor();
    drawBird();
    updateBird();
    createPipes();
    drawPipes();
    updatePipes();
    frame++;
    requestAnimationFrame(loop);
}

// Listen for key presses
document.addEventListener("keydown", e => {
    if (e.code === "Space") {
        bird.velocity = bird.lift;

         // Play the flap sound when spacebar is pressed
         const flapSound = document.getElementById("flap-sound");
         flapSound.volume = 0.1; 
         flapSound.currentTime = 0; // Restart the sound from the beginning (if it's already playing)
    
         flapSound.play().catch((err) => { console.error("Error playing flap sound:", err); });

    } else if (e.code === "ArrowDown") {
        nightMode = !nightMode;
    }
});



// Countdown before starting the game
function startCountdown() {
    let count = 3;
    countNumber.textContent = count;
    countdown.style.display = "block";
    const interval = setInterval(() => {
        count--;
        countNumber.textContent = count;
        if (count <= 0) {
            clearInterval(interval);
            countdown.style.display = "none";
            gameArea.style.display = "block";
            backgroundMusic.play().catch(() => { });
        
            
            // Hide instruction once the game starts
            document.getElementById("instruction").style.display = "none";

            loop();
        }
    }, 1000); //this is how fast the countdown is, 1000 mili sec is 1 sec
}

// Start the game when the start button is clicked
startButton.addEventListener("click", () => {
    startScreen.style.display = "none";
    startCountdown();
});

// Reload the page to restart the game
restartButton.addEventListener("click", () => {
    window.location.reload(); // You can reset the page or restart the game as needed
    document.getElementById("instruction").style.display = "block"; // Show instruction again on restart
});

document.addEventListener("touchstart", e => {
    bird.velocity = bird.lift;
   
         // Play the flap sound when spacebar is pressed
         const flapSound = document.getElementById("flap-sound");
         flapSound.volume = 0.1; 
         flapSound.currentTime = 0; // Restart the sound from the beginning 

    flapSound.play().catch((err) => { console.error("Error playing flap sound:", err); });
});