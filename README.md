# ⛩️ SAMURAI (侍) — The Way of the Blade
### *An Ultra-Smooth 60FPS Parallax Storytelling Web Experience*

[![GitHub license](https://img.shields.io/badge/license-MIT-red.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Canvas](https://img.shields.io/badge/Canvas_API-60FPS-gold.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

> *"The sword has no malice; it only reflects the soul of him who draws it."*

**SAMURAI** is an immersive, high-performance interactive web experience crafted with pure HTML5 Canvas, Vanilla CSS, and JavaScript. It features an uninterrupted, wheel-and-touch-driven 60FPS frame scrubbing parallax engine that brings feudal Japanese sword duels to life with zero latency and cinematic elegance.

---

## 🌟 Key Highlights & Features

- **🎬 60FPS Hardware Canvas Parallax Engine**:
  - 631 high-definition interpolated frames rendered directly onto an HTML5 `<canvas>` via `requestAnimationFrame`.
  - Zero-latency frame scrubbing with nearest-frame fallback so the video never stutters, lags, or goes black.
  - Sub-pixel inertial easing (`lerp`) for a buttery-smooth feel across all scroll speeds.

- **🔒 Fixed Viewport Pure Storytelling**:
  - The viewport is pinned in place without disruptive page jumps or premature sliding.
  - Interactive mouse wheel, touchpad swipe, touch gestures, keyboard arrows (`↑`/`↓`), and draggable timeline scrubber directly control frame progression.

- **📜 Minimalist Floating Typography**:
  - Dynamic Japanese calligraphy watermarks (*侍*, *武士道*) and subtle chapter markers that evolve seamlessly:
    - **Chapter 01: The Path of the Ronin (孤高の構え)** — *The Stance on the Bridge*
    - **Chapter 02: The Eye of Stillness (明鏡止水の瞳)** — *Mushin & Mental Clarity*
    - **Chapter 03: Clash of Steel (一刀両断の刹那)** — *The Strike & Critical Flash*
    - **Chapter 04: Eternal Bushidō (武士道の極意)** — *Honor Endures*

- **🌸 Atmospheric FX & Procedural Audio Engine**:
  - **Sakura & Ember Particles**: Dynamic canvas physics simulating floating cherry blossom petals and glowing embers reacting to mouse wind currents.
  - **Web Audio API Soundscape**: Synthesized bamboo wind atmosphere, metallic katana blade slashes (`shiiing`), and resonant Taiko drum impact beats on key milestones.

---

## 📂 Project Architecture

```
samurai/
├── frames/                 # 631 high-resolution 60FPS sequence frames
│   ├── smooth_0001.jpg
│   ├── ...
│   └── smooth_0631.jpg
├── index.html              # Core semantic structure & canvas viewport
├── style.css               # Cinematic dark styling, typography & HUD
├── script.js               # Canvas frame renderer, inertial controller & SFX
├── server.js               # Node.js HTTP server with byte-range streaming
├── upscaled-video.mp4      # Original source video
└── README.md               # Project documentation
```

---

## 🚀 Quick Start & Installation

### Option 1: Run with Node.js
```bash
# Clone the repository
git clone https://github.com/SamarthDhage07/Samurai-.git

# Navigate into the project directory
cd Samurai-

# Start the local development server
node server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option 2: Run with any static server / Live Server
You can open `index.html` with VS Code Live Server or Python:
```bash
python -m http.server 3000
```

---

## 🎮 Controls

| Input | Action |
| :--- | :--- |
| **Mouse Wheel / Trackpad** | Scrub through 60FPS duel frames forward / backward |
| **Touch / Mobile Swipe** | Smooth vertical swipe scrubbing |
| **Arrow Down / Up / Space** | Step through the timeline |
| **Bottom Scrubber Rail** | Click or drag thumb to jump directly to any frame |
| **Sound Button (Top Right)** | Toggle ambient wind soundscape & strike SFX |

---

## 🛠️ Built With

- **HTML5 & CSS3** (Vanilla, CSS Variables, Glassmorphism, Responsive Flex/Grid)
- **JavaScript (ES6+)** (Canvas 2D Context, Web Audio API, RequestAnimationFrame)
- **Google Fonts** (*Cinzel Decorative*, *Cinzel*, *Shippori Mincho*, *Outfit*)
- **FontAwesome 6** (Minimalist HUD Icons)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
