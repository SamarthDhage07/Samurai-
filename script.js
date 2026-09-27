/**
 * SAMURAI — Fullscreen Fixed Parallax Engine
 * Pure 60FPS Wheel & Touch Scrubbing, Zero Box Overlays, Locked Viewport Frame Sync
 */

document.addEventListener('DOMContentLoaded', () => {
    const TOTAL_FRAMES = 631;
    const FRAME_PREFIX = 'frames/smooth_';
    const FRAME_EXT = '.jpg';

    function getFramePath(index) {
        const padded = String(index).padStart(4, '0');
        return `${FRAME_PREFIX}${padded}${FRAME_EXT}`;
    }

    // DOM Elements
    const canvas = document.getElementById('samurai-canvas');
    const ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loader-bar');
    const loaderText = document.getElementById('loader-text');
    const frameNumDisplay = document.getElementById('frame-num');
    const hudProgressFill = document.getElementById('hud-progress-fill');
    const hudScrubThumb = document.getElementById('hud-scrub-thumb');
    const hudRail = document.getElementById('hud-rail');
    const slashFlash = document.getElementById('slash-flash');
    const kanjiWatermark = document.getElementById('kanji-watermark');
    
    const titleOverlay = document.getElementById('title-overlay');
    const chapterSubtitle = document.getElementById('chapter-subtitle');
    const subChapter = document.getElementById('sub-chapter');
    const subTitle = document.getElementById('sub-title');
    const subKanji = document.getElementById('sub-kanji');

    // Preload Frames
    const images = new Array(TOTAL_FRAMES + 1);
    let loadedCount = 0;
    let isInitialReady = false;

    // Scrub state (0 to 1)
    let targetProgress = 0;
    let currentProgress = 0;
    let currentRenderedFrame = 1;
    let isDraggingRail = false;
    let hasTriggeredClash = false;

    function handleFrameLoaded() {
        loadedCount++;
        const percent = Math.min(100, Math.round((loadedCount / TOTAL_FRAMES) * 100));
        
        if (loaderBar) loaderBar.style.width = `${percent}%`;
        if (loaderText) loaderText.textContent = `INITIALIZING FRAMES ${percent}%`;

        if (loadedCount === 1) {
            renderFrame(1);
        }

        // Reveal site as soon as initial cache batch is ready
        if (!isInitialReady && loadedCount >= 25) {
            isInitialReady = true;
            setTimeout(() => {
                if (loader) loader.classList.add('loaded');
            }, 200);
        }
    }

    // Preload all 631 frames asynchronously
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        img.onload = () => {
            images[i] = img;
            handleFrameLoaded();
        };
        img.onerror = () => {
            handleFrameLoaded();
        };
    }

    // Canvas Sizing
    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderFrame(currentRenderedFrame);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Render Frame to Canvas with Nearest-Frame Fallback
    function renderFrame(frameIndex) {
        if (!ctx || !canvas) return;
        const clampedIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameIndex)));
        let img = images[clampedIndex];

        // If target frame is still downloading, find the closest available frame
        if (!img || !img.complete || img.naturalWidth === 0) {
            for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
                const prev = images[clampedIndex - offset];
                if (prev && prev.complete && prev.naturalWidth > 0) {
                    img = prev;
                    break;
                }
                const next = images[clampedIndex + offset];
                if (next && next.complete && next.naturalWidth > 0) {
                    img = next;
                    break;
                }
            }
        }

        if (img && img.complete && img.naturalWidth > 0) {
            const cw = canvas.width;
            const ch = canvas.height;
            const iw = img.naturalWidth;
            const ih = img.naturalHeight;

            const scale = Math.max(cw / iw, ch / ih);
            const sw = iw * scale;
            const sh = ih * scale;
            const sx = (cw - sw) / 2;
            const sy = (ch - sh) / 2;

            ctx.drawImage(img, sx, sy, sw, sh);
        }
    }

    // Wheel Event Listener (Locked to Viewport, Smooth Scrubbing)
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY;
        const scrollSpeed = 0.0012; // Smooth sensitivity
        targetProgress += delta * scrollSpeed;
        targetProgress = Math.max(0, Math.min(1, targetProgress));
    }, { passive: false });

    // Touch Support for Mobile / Trackpad Gestures
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;
            touchStartY = touchY;
            targetProgress += deltaY * 0.003;
            targetProgress = Math.max(0, Math.min(1, targetProgress));
        }
    }, { passive: true });

    // Keyboard Arrow Up / Down / PageUp / PageDown scrub
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            targetProgress = Math.min(1, targetProgress + 0.04);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            targetProgress = Math.max(0, targetProgress - 0.04);
        }
    });

    // Scrubber Rail Click & Drag
    if (hudRail) {
        function handleRailScrub(e) {
            const rect = hudRail.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            targetProgress = pos;
        }

        hudRail.addEventListener('mousedown', (e) => {
            isDraggingRail = true;
            handleRailScrub(e);
        });

        window.addEventListener('mousemove', (e) => {
            if (isDraggingRail) {
                handleRailScrub(e);
            }
        });

        window.addEventListener('mouseup', () => {
            isDraggingRail = false;
        });

        hudRail.addEventListener('touchstart', (e) => {
            handleRailScrub(e);
        }, { passive: true });

        hudRail.addEventListener('touchmove', (e) => {
            handleRailScrub(e);
        }, { passive: true });
    }

    // High Precision 60FPS Lerp Animation Loop
    function animate() {
        const diff = targetProgress - currentProgress;
        if (Math.abs(diff) > 0.0001) {
            currentProgress += diff * 0.18; // Smooth inertial ease
            
            // Calculate Frame Index (1 to 631)
            const frameFloat = 1 + currentProgress * (TOTAL_FRAMES - 1);
            currentRenderedFrame = Math.round(frameFloat);
            renderFrame(currentRenderedFrame);

            updateHUD(currentProgress, currentRenderedFrame);
        }

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // Update Floating Subtitles & HUD
    const chapters = [
        { start: 0.10, end: 0.38, num: 'CHAPTER 01', title: 'The Path of the Ronin', kanji: '孤高の構え' },
        { start: 0.38, end: 0.68, num: 'CHAPTER 02', title: 'The Eye of Stillness', kanji: '明鏡止水の瞳' },
        { start: 0.68, end: 0.88, num: 'CHAPTER 03', title: 'Clash of Steel', kanji: '一刀両断の刹那' },
        { start: 0.88, end: 1.00, num: 'CHAPTER 04', title: 'Eternal Bushido', kanji: '武士道の極意' }
    ];

    function updateHUD(progress, frame) {
        // Update Frame Count & Scrubber
        if (frameNumDisplay) {
            frameNumDisplay.textContent = String(frame).padStart(3, '0');
        }
        const percent = progress * 100;
        if (hudProgressFill) hudProgressFill.style.width = `${percent}%`;
        if (hudScrubThumb) hudScrubThumb.style.left = `${percent}%`;

        // Watermark subtle translation
        if (kanjiWatermark) {
            const shift = (progress - 0.5) * 80;
            kanjiWatermark.style.transform = `translate(-50%, calc(-50% + ${shift}px))`;
        }

        // Title Overlay (Visible only at the very start 0% - 8%)
        if (titleOverlay) {
            if (progress < 0.08) {
                titleOverlay.classList.remove('hidden');
            } else {
                titleOverlay.classList.add('hidden');
            }
        }

        // Floating Subtitle at Bottom-Left
        const activeChapter = chapters.find(c => progress >= c.start && progress <= c.end);
        if (activeChapter && chapterSubtitle) {
            subChapter.textContent = activeChapter.num;
            subTitle.textContent = activeChapter.title;
            subKanji.textContent = activeChapter.kanji;
            chapterSubtitle.classList.add('active');
        } else if (chapterSubtitle) {
            chapterSubtitle.classList.remove('active');
        }

        // Critical Clash Slash Flash & SFX
        if (progress >= 0.74 && progress <= 0.82) {
            if (!hasTriggeredClash) {
                if (slashFlash) {
                    slashFlash.classList.add('flash');
                    setTimeout(() => slashFlash.classList.remove('flash'), 100);
                }
                soundEngine.playSlash();
                soundEngine.playTaiko();
                hasTriggeredClash = true;
            }
        } else if (progress < 0.68 || progress > 0.88) {
            hasTriggeredClash = false;
        }
    }

    // Procedural Web Audio Sound Engine
    class ProceduralSoundEngine {
        constructor() {
            this.ctx = null;
            this.isMuted = true;
            this.ambientNode = null;
            this.gain = null;
        }

        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
                this.gain = this.ctx.createGain();
                this.gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
                this.gain.connect(this.ctx.destination);
            }
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        toggle() {
            this.init();
            this.isMuted = !this.isMuted;
            const btn = document.getElementById('sound-btn');
            const icon = document.getElementById('sound-icon');
            const label = document.getElementById('sound-label');

            if (!this.isMuted) {
                if (btn) btn.classList.add('active');
                if (icon) {
                    icon.classList.remove('fa-volume-xmark');
                    icon.classList.add('fa-volume-high');
                }
                if (label) label.textContent = 'SOUND ON';
                this.startAmbient();
                this.playTaiko();
            } else {
                if (btn) btn.classList.remove('active');
                if (icon) {
                    icon.classList.add('fa-volume-xmark');
                    icon.classList.remove('fa-volume-high');
                }
                if (label) label.textContent = 'SOUND OFF';
                this.stopAmbient();
            }
        }

        startAmbient() {
            if (!this.ctx || this.isMuted) return;
            try {
                const bufferSize = this.ctx.sampleRate * 2;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                let b0 = 0, b1 = 0, b2 = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    data[i] = (b0 + b1 + b2) * 0.03;
                }

                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(340, this.ctx.currentTime);

                noise.connect(filter);
                filter.connect(this.gain);
                noise.start();
                this.ambientNode = noise;
            } catch(e) {}
        }

        stopAmbient() {
            if (this.ambientNode) {
                try { this.ambientNode.stop(); } catch(e){}
                this.ambientNode = null;
            }
        }

        playSlash() {
            if (!this.ctx || this.isMuted) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(4200, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.18);

                g.gain.setValueAtTime(0.45, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

                osc.connect(g);
                g.connect(this.gain);
                osc.start(now);
                osc.stop(now + 0.23);
            } catch(e) {}
        }

        playTaiko() {
            if (!this.ctx || this.isMuted) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(130, now);
                osc.frequency.exponentialRampToValueAtTime(32, now + 0.5);

                g.gain.setValueAtTime(0.7, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

                osc.connect(g);
                g.connect(this.gain);
                osc.start(now);
                osc.stop(now + 0.56);
            } catch(e) {}
        }
    }

    const soundEngine = new ProceduralSoundEngine();
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
        soundBtn.addEventListener('click', () => soundEngine.toggle());
    }

    // Custom Reticle Cursor
    const cursorDot = document.getElementById('cursor-dot');
    const cursorBlade = document.getElementById('cursor-blade');

    window.addEventListener('mousemove', (e) => {
        if (cursorDot) {
            cursorDot.style.left = `${e.clientX}px`;
            cursorDot.style.top = `${e.clientY}px`;
        }
        if (cursorBlade) {
            cursorBlade.style.left = `${e.clientX}px`;
            cursorBlade.style.top = `${e.clientY}px`;
        }
    });

    // Sakura & Ember Particles Engine
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas) {
        const pCtx = particleCanvas.getContext('2d');
        let particles = [];
        const numParticles = 35;

        const resizeP = () => {
            particleCanvas.width = window.innerWidth;
            particleCanvas.height = window.innerHeight;
        };
        resizeP();
        window.addEventListener('resize', resizeP);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * particleCanvas.width;
                this.y = Math.random() * -particleCanvas.height;
                this.size = Math.random() * 5 + 3;
                this.speedY = Math.random() * 0.9 + 0.4;
                this.speedX = Math.random() * 1.0 - 0.3;
                this.rotation = Math.random() * 360;
                this.rotationSpeed = (Math.random() - 0.5) * 1.2;
                this.opacity = Math.random() * 0.4 + 0.2;
                this.isEmber = Math.random() > 0.65;
            }
            update() {
                this.y += this.speedY;
                this.x += this.speedX + Math.sin(this.y * 0.02) * 0.4;
                this.rotation += this.rotationSpeed;

                if (this.y > particleCanvas.height + 20) {
                    this.reset();
                    this.y = -10;
                }
            }
            draw() {
                pCtx.save();
                pCtx.translate(this.x, this.y);
                pCtx.rotate((this.rotation * Math.PI) / 180);

                if (this.isEmber) {
                    pCtx.beginPath();
                    pCtx.arc(0, 0, this.size * 0.35, 0, Math.PI * 2);
                    pCtx.fillStyle = `rgba(255, 140, 0, ${this.opacity})`;
                    pCtx.shadowColor = '#d91438';
                    pCtx.shadowBlur = 8;
                    pCtx.fill();
                } else {
                    pCtx.beginPath();
                    pCtx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
                    pCtx.fillStyle = `rgba(255, 183, 197, ${this.opacity})`;
                    pCtx.shadowColor = 'rgba(255, 183, 197, 0.4)';
                    pCtx.shadowBlur = 4;
                    pCtx.fill();
                }
                pCtx.restore();
            }
        }

        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }

        function renderParticles() {
            pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(renderParticles);
        }
        requestAnimationFrame(renderParticles);
    }
});
