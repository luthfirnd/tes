// ===============================
// ELEMENT
// ===============================

const video = document.querySelector(".input_video");
const canvas = document.querySelector(".output_canvas");
const ctx = canvas.getContext("2d");

// ===============================
// AUDIO
// ===============================

const soundA = new Audio("aset/fah1.mp3");
const soundB = new Audio("aset/fah2.mp3");

// ===============================
// BUTTON
// ===============================

const btnA = document.getElementById("btnA");
const btnB = document.getElementById("btnB");

// ===============================
// STATE
// ===============================

let lastButton = "";

let popupEl = null;

let lastTriggerTime = 0;
const COOLDOWN = 800; // ms

const indexTrail = [];

const MAX_TRAIL = 25;

// ===============================
// MEDIAPIPE
// ===============================

const hands = new Hands({

    locateFile: (file) => {

        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;

    }

});

hands.setOptions({

    maxNumHands: 1,

    modelComplexity: 1,

    minDetectionConfidence: 0.7,

    minTrackingConfidence: 0.7

});

hands.onResults(onResults);

// ===============================
// CAMERA
// ===============================

const camera = new Camera(video, {

    onFrame: async () => {

        await hands.send({

            image: video

        });

    },

    width: 1280,

    height: 720

});

camera.start();

// ===============================
// RESULT
// ===============================

function onResults(results) {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(

        0,
        0,
        canvas.width,
        canvas.height

    );

    ctx.drawImage(

        results.image,

        0,
        0,

        canvas.width,

        canvas.height

    );

    btnA.classList.remove("active");
    btnB.classList.remove("active");

    if (!results.multiHandLandmarks.length) {

        lastButton = "";

        indexTrail.length = 0;

        return;

    }

    // ===============================
    // FINGER
    // ===============================

    const hand = results.multiHandLandmarks[0];

    const index = hand[8];

    const x1 = index.x * canvas.width;
    const y1 = index.y * canvas.height;

    indexTrail.push({

        x: x1,
        y: y1

    });

    if (indexTrail.length > MAX_TRAIL) {

        indexTrail.shift();

    }

    drawTrail(indexTrail, "#ff4444");

    drawPointer(

        x1,
        y1,
        "#ff4444"

    );

    detectButton(

        x1,
        y1

    );
}

    function showPopup(imgSrc) {

    // kalau masih ada popup lama, hapus dulu
    if (popupEl) {
        popupEl.remove();
        popupEl = null;
    }

    popupEl = document.createElement("div");
    popupEl.className = "popup";

    const img = document.createElement("img");
    img.src = imgSrc;

    popupEl.appendChild(img);
    document.body.appendChild(popupEl);

    setTimeout(() => {
        popupEl.classList.add("show");
    }, 10);

    setTimeout(() => {
        if (popupEl) {
            popupEl.remove();
            popupEl = null;
        }
    }, 800);

}

// ===============================
// DRAW POINTER
// ===============================

function drawPointer(x, y, color) {

    ctx.save();

    ctx.shadowBlur = 30;
    ctx.shadowColor = color;

    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);

    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();

}

// ===============================
// DRAW TRAIL
// ===============================

function drawTrail(points, color) {

    if (points.length < 2) return;

    ctx.save();

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = 1; i < points.length; i++) {

        const alpha = i / points.length;

        ctx.beginPath();

        ctx.moveTo(

            points[i - 1].x,
            points[i - 1].y

        );

        ctx.lineTo(

            points[i].x,
            points[i].y

        );

        ctx.strokeStyle = color;

        ctx.globalAlpha = alpha;

        ctx.shadowBlur = 20;

        ctx.shadowColor = color;

        ctx.lineWidth = alpha * 8;

        ctx.stroke();

    }

    ctx.restore();

    ctx.globalAlpha = 1;

}

// ===============================
// COLLISION
// ===============================

function detectButton(x, y) {

    const rectA = btnA.getBoundingClientRect();
    const rectB = btnB.getBoundingClientRect();

    const now = Date.now();

    // ===========================
    // BUTTON A
    // ===========================

    if (
        x > rectA.left &&
        x < rectA.right &&
        y > rectA.top &&
        y < rectA.bottom
    ) {

        btnA.classList.add("active");

        if (lastButton !== "A" && now - lastTriggerTime > 800) {

            soundA.currentTime = 0;
            soundA.play().catch(() => {});
            showPopup("aset/fah1.png");

            lastButton = "A";
            lastTriggerTime = now;
        }

        return;
    }

     // ===========================
    // BUTTON B
    // ===========================

    if (
        x > rectB.left &&
        x < rectB.right &&
        y > rectB.top &&
        y < rectB.bottom
    ) {

        btnB.classList.add("active");

        if (lastButton !== "B" && now - lastTriggerTime > 800) {

            soundB.currentTime = 0;
            soundB.play().catch(() => {});
            showPopup("aset/fah2.png");

            lastButton = "B";
            lastTriggerTime = now;
        }

        return;
    }

    lastButton = "";
}

// ===============================
// RESIZE
// ===============================

window.addEventListener("resize", () => {

    canvas.width = window.innerWidth;

    canvas.height = window.innerHeight;

});

// ===============================
// INITIALIZE
// ===============================

canvas.width = window.innerWidth;

canvas.height = window.innerHeight;
