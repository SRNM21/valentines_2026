const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let width, height;
let cols, rows;

const fontSize = 14;
const asciiChars = ".:-=+*#%@";
let grid = [];
let hearts = [];

const HEART_SPAWN_RATE = 0.04;
const HEART_SPEED_MIN = 1;
const HEART_SPEED_MAX = 2.5;
const HEART_SCALE_MIN = 0.6;
const HEART_SCALE_MAX = 1;

const BASE_COLOR = "#f0f0f0";

const PINK_PALETTE = [
    "#ffc1cc", // Classic Baby Pink
    "#ffd1dc", // Pastel Pink
    "#ff99ac", // Salmon Pink
    "#ffb7b2", // Melon
    "#fbcfe8", // Light Pink (Tailwind)
    "#f472b6"  // Rose Pink
];

function getRandomPink() {
    return PINK_PALETTE[Math.floor(Math.random() * PINK_PALETTE.length)];
}

const ASPECT_RATIO = 1.8; 

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    cols = Math.floor(width / fontSize);
    rows = Math.floor(height / fontSize);

    grid = [];
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            row.push({
                char: randomAscii(),
                color: BASE_COLOR
            });
        }
        grid.push(row);
    }
}

window.addEventListener("resize", resize);
resize();

/* Heart Equation: x^2 + (y - sqrt(|x|))^2 - 1 = 0 */
function heartEquation(x, y) {
    const yAdjusted = (y * 1.2) - Math.sqrt(Math.abs(x));
    return x * x + yAdjusted * yAdjusted - 1;
}

function isHeartOutline(x, y) {
    const value = heartEquation(x, y);
    
    const epsilon = 0.25; 
    
    return Math.abs(value) < epsilon;
}

function spawnHeart() {
    hearts.push({
        x: Math.random() * width,
        y: -100,
        scale: random(HEART_SCALE_MIN, HEART_SCALE_MAX),
        speed: random(HEART_SPEED_MIN, HEART_SPEED_MAX)
    });
}

function updateHearts() {
    // Reset grid colors
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            grid[r][c].color = BASE_COLOR;
        }
    }

    hearts.forEach(heart => {
        heart.y += heart.speed;

        const radius = heart.scale * 200;

        const minCol = Math.max(0, Math.floor((heart.x - radius) / fontSize));
        const maxCol = Math.min(cols, Math.ceil((heart.x + radius) / fontSize));
        const minRow = Math.max(0, Math.floor((heart.y - radius) / fontSize));
        const maxRow = Math.min(rows, Math.ceil((heart.y + radius) / fontSize));

        for (let r = minRow; r < maxRow; r++) {
            for (let c = minCol; c < maxCol; c++) {
                const cellX = c * fontSize + fontSize / 2;
                const cellY = r * fontSize + fontSize / 2;

                let dx = (cellX - heart.x) / radius;
                let dy = (cellY - heart.y) / radius;

                dy *= ASPECT_RATIO;

                if (isHeartOutline(dx, -dy)) {
                    grid[r][c].color = getRandomPink();
                }
            }
        }
    });

    hearts = hearts.filter(h => h.y < height + 100);
}

function drawGrid() {
    ctx.clearRect(0, 0, width, height);
    ctx.font = "bold " + fontSize + "px monospace";
    ctx.textBaseline = 'middle';

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = grid[r][c];
            
            ctx.fillStyle = cell.color;
            
            if (cell.color !== BASE_COLOR) {
                // Stronger glow for the pinks
                ctx.shadowBlur = 8;
                ctx.shadowColor = cell.color;
            } else {
                ctx.shadowBlur = 0;
            }
            
            ctx.fillText(cell.char, c * fontSize, r * fontSize + fontSize/2);
        }
    }
}

function animate() {
    if (Math.random() < HEART_SPAWN_RATE) {
        spawnHeart();
    }

    updateHearts();
    drawGrid();
    requestAnimationFrame(animate);
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function randomAscii() {
    return asciiChars[Math.floor(Math.random() * asciiChars.length)];
}

animate();