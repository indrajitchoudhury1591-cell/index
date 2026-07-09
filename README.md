<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Will you?</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ffe5ec, #ffc2d1);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        }

        .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 90%;
            z-index: 10;
            position: relative;
        }

        h1 {
            color: #ff477e;
            margin-bottom: 30px;
            font-size: 24px;
        }

        .btn-container {
            display: flex;
            justify-content: center;
            gap: 20px;
            height: 60px;
            position: relative;
        }

        button {
            padding: 12px 30px;
            font-size: 18px;
            font-weight: bold;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        #yesBtn {
            background-color: #ff477e;
            color: white;
            box-shadow: 0 5px 15px rgba(255, 71, 126, 0.4);
            position: relative;
        }

        #yesBtn:hover {
            transform: scale(1.1);
            background-color: #ff0a54;
        }

        #noBtn {
            background-color: #e2e8f0;
            color: #64748b;
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(60px);
        }

        .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 100;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        .popup-content {
            background: white;
            padding: 35px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            transform: scale(0.7);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            max-width: 350px;
            width: 85%;
        }

        .popup-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }

        .popup-overlay.active .popup-content {
            transform: scale(1);
        }

        .popup-content h2 {
            color: #ff0a54;
            font-size: 22px;
            margin-bottom: 15px;
        }

        .popup-content p {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }

        .close-btn {
            background: #ff477e;
            color: white;
            font-size: 14px;
            padding: 10px 25px;
        }

        #canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
        }
    </style>
</head>
<body>

    <div class="container">
        <h1>Will you say your name?</h1>
        <div class="btn-container">
            <button id="yesBtn" onclick="sayYes()">Yes</button>
            <button id="noBtn" onclick="sayNo()">No</button>
        </div>
    </div>

    <div class="popup-overlay" id="customPopup">
        <div class="popup-content">
            <h2>Say less! 🤫</h2>
            <p>Slide into my DMs and drop the name right now! 😉🔥</p>
            <button class="close-btn" onclick="closePopup()">On it! 🫡</button>
        </div>
    </div>

    <canvas id="canvas"></canvas>

    <audio id="bgMusic" loop>
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg">
    </audio>

    <script>
        const music = document.getElementById('bgMusic');
        const popup = document.getElementById('customPopup');
        const noBtn = document.getElementById('noBtn');

        function sayNo() {
            music.play().catch(err => console.log("Audio waiting for user interaction: ", err));
            moveNoButton();
        }

        function sayYes() {
            music.pause();
            music.currentTime = 0;
            startConfetti();
            popup.classList.add('active');
        }

        function moveNoButton() {
            const btnWidth = noBtn.offsetWidth;
            const btnHeight = noBtn.offsetHeight;
            const maxX = window.innerWidth - btnWidth - 10;
            const maxY = window.innerHeight - btnHeight - 10;

            const x = Math.random() * maxX;
            const y = Math.random() * maxY;

            noBtn.style.position = 'fixed';
            noBtn.style.left = `${x}px`;
            noBtn.style.top = `${y}px`;
            noBtn.style.transform = 'none';
            noBtn.style.zIndex = '9999';
        }

        function closePopup() {
            popup.classList.remove('active');
        }

        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        let confetti = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function startConfetti() {
            resizeCanvas();
            confetti = [];
            for (let i = 0; i < 150; i++) {
                confetti.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height - canvas.height,
                    r: Math.random() * 6 + 4,
                    d: Math.random() * canvas.height,
                    color: `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*100 + 155)}, ${Math.floor(Math.random()*155 + 100)}, 0.8)`,
                    tilt: Math.random() * 10 - 5,
                    tiltAngleIncremental: Math.random() * 0.07 + 0.02,
                    tiltAngle: 0
                });
            }
            animateConfetti();
        }

        function animateConfetti() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            confetti.forEach((p, index) => {
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.x += Math.sin(p.tiltAngle);
                p.tilt = Math.sin(p.tiltAngle - index / 3) * 15;

                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
                ctx.stroke();
            });

            if (confetti.some(p => p.y < canvas.height)) {
                requestAnimationFrame(animateConfetti);
            }
        }
    </script>
</body>
</html>
