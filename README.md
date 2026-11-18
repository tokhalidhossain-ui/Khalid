# ⚡ Khalid — Interactive 3D Animated One-Pager Portfolio

A futuristic, high-performance one-pager portfolio website featuring a **rigged 3D procedural cyber-humanoid avatar** that moves dynamically as you scroll down the page.

Built **strictly with pure Frontend technologies**:
- **HTML5 (Semantic)**
- **CSS3 (Custom Glassmorphic Dark Architecture & Grid)**
- **JavaScript ESNext (Vanilla, No React, No Build Tools)**
- **Three.js** (Procedural WebGL 3D character engine & particle system)
- **GSAP & ScrollTrigger** (Smooth scroll choreography and section synchronization)
- **Web Audio API** (100% synthesized procedural micro-sounds with zero external audio assets)

---

## 🌟 Key Features

### 1. 🤖 Scroll-Driven 3D Human Figure
- **Procedural 3D Rig**: Built entirely with Three.js geometry (Head with reflective glass cyber-visor, floating halo, illuminated Arc-Reactor core, dual-thruster jetpack, articulated arms, elbows, hips, knees, and boots).
- **Dynamic Locomotion (Walk / Stride Cycle)**: Calculates real-time scroll velocity (`scrollVelocity`). Scrolling advances walking/running strides with knee flexion and arm counter-balancing.
- **Natural Idle & Breathing**: When the user pauses scrolling, the character seamlessly returns to an idle hovering state with gentle chest expansion and levitation bobbing.
- **Cursor Tracking**: Character's head and neck smoothly tilt and look towards the user's mouse position across the screen.
- **Section-by-Section Choreography (GSAP ScrollTrigger)**:
  - **Hero**: Stands on the launchpad on the right, looking at the user.
  - **About Me**: Traverses across to the left, inspecting the about terminal.
  - **Skills & Arsenal**: Levitates to the center in a zero-gravity pose, slowly rotating 360° as glowing holographic particles orbit.
  - **Featured Projects**: Glides to the right alongside interactive project cards.
  - **Timeline Journey**: Steps downward through career milestones.
  - **Contact**: Moves forward and triggers a friendly waving greeting!

### 2. 🎮 Interactive Avatar Controls (Bottom Dock)
Visitors can also interact directly with the character:
- **Wave 👋**: Plays a friendly hand-waving animation.
- **Flip ⚡**: Executes a full 360-degree backflip with particle burst.
- **Zero-G 🌌**: Enters an extended anti-gravity floating state.
- **Dance 🕺**: Fun torso and arm groove routine.
- **Suit Color Customizer**: Switch between 4 suit themes:
  - 💎 **Cyan Cyber**
  - 🌸 **Neon Rose**
  - 🌿 **Matrix Emerald**
  - 👑 **Solar Gold**

### 3. 🔊 Synthesized Web Audio API FX
- No heavy `.mp3` or `.wav` files to download.
- Synthesizes sci-fi hover clicks, transition whooshes, stunt chimes, and form-submission melodies directly in code using oscillators and gain envelopes.
- Includes a 1-click Mute/Unmute toggle in the navbar.

### 4. 💼 Rich Portfolio Sections
- **Hero**: Typing animation, available status badge, CTA buttons, scroll wheel indicator.
- **About Me**: Cyber terminal aesthetic with live counting statistics.
- **Skills**: Interactive categories with animated proficiency meters.
- **Projects**: Category filter (All, 3D WebGL, Interactive, Creative), 3D preview cards, and full interactive detail modal.
- **Timeline**: Milestone track with glowing nodes.
- **Contact Form**: Client-side validation, confetti celebration burst, audio chime, and copy-email shortcut.

---

## 🚀 How to Run the Website

### Option 1: Double-Click to Open
Simply double-click `index.html` in your file explorer (Finder on macOS) to open it in Chrome, Safari, Edge, or Brave.

### Option 2: Run a Local Dev Server (Recommended)
You can serve it with Python, Node, or any local static server:
```bash
# Using Python 3:
python3 -m http.server 8080

# Then open in your browser:
# http://localhost:8080
```

---

## 📁 File Structure
```
├── index.html          # Semantic HTML5 structure & content
├── css/
│   └── style.css       # Glassmorphism, animations, responsive layout
├── js/
│   ├── audio.js        # Web Audio API procedural synthesizer
│   ├── character.js    # 3D procedural humanoid rig & animation engine
│   └── main.js         # GSAP ScrollTrigger, modals, form & interactions
└── README.md           # Documentation
```
