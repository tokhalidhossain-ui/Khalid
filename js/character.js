/**
 * 3D Procedural Human Figure Engine
 * Powered by Three.js & GSAP ScrollTrigger
 * 
 * Features:
 * - Fully rigged procedural 3D cyber-humanoid (head, torso, arms, legs, jetpack)
 * - Dynamic scroll-driven locomotion (walk, run, hover, transitions)
 * - Cursor tracking (head and upper torso gaze towards pointer)
 * - Section-based choreography linked to page scroll
 * - Interactive stunts: Backflip, Wave, Zero-G Float, Dance
 * - Dynamic customizable suit colors & particle engine
 */

class HumanFigureEngine {
    constructor() {
        this.container = document.getElementById('character-canvas-container');
        if (!this.container) return;

        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // Rigged model parts
        this.characterGroup = null;
        this.rig = {};
        this.particles = null;
        this.thrusterFlames = [];

        // Interaction state
        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.scrollVelocity = 0;
        this.lastScrollY = window.scrollY;
        this.walkCycle = 0;
        this.isStuntActive = false;
        this.currentStunt = null;

        // Color palettes
        this.palettes = {
            cyan: {
                neon: 0x00f2fe,
                neonSecondary: 0x4facfe,
                suit: 0x121726,
                suitTrim: 0x1f293d,
                metal: 0x8892b0,
                glowHex: '#00f2fe'
            },
            magenta: {
                neon: 0xff007f,
                neonSecondary: 0x7928ca,
                suit: 0x181224,
                suitTrim: 0x2b1b3d,
                metal: 0xa899b8,
                glowHex: '#ff007f'
            },
            emerald: {
                neon: 0x00ff88,
                neonSecondary: 0x00b4d8,
                suit: 0x0f1c19,
                suitTrim: 0x16332c,
                metal: 0x88b0a2,
                glowHex: '#00ff88'
            },
            gold: {
                neon: 0xffb703,
                neonSecondary: 0xfb8500,
                suit: 0x242017,
                suitTrim: 0x3d3522,
                metal: 0xd4af37,
                glowHex: '#ffb703'
            }
        };
        this.currentTheme = 'cyan';

        this.init();
    }

    init() {
        // Setup Three.js Scene
        this.scene = new THREE.Scene();

        // Setup Camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        this.camera.position.set(0, 0, 7.5);

        // Setup Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Lights
        this.setupLights();

        // Build 3D Human Figure
        this.buildHumanFigure();

        // Build Environment Particles (Space Dust & Jetpack Sparks)
        this.buildParticles();

        // Build Platform Shadow
        this.buildShadow();

        // Event Listeners
        this.setupEventListeners();

        // Start Animation Loop
        this.animate();

        // Initial Pose Setup
        this.updateDimensions();
    }

    setupLights() {
        // Ambient soft light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        // Key Light
        this.keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        this.keyLight.position.set(5, 8, 5);
        this.keyLight.castShadow = true;
        this.keyLight.shadow.mapSize.width = 1024;
        this.keyLight.shadow.mapSize.height = 1024;
        this.scene.add(this.keyLight);

        // Neon Rim Light (Left)
        this.rimLightCyan = new THREE.PointLight(this.palettes[this.currentTheme].neon, 2.5, 10);
        this.rimLightCyan.position.set(-4, 3, 2);
        this.scene.add(this.rimLightCyan);

        // Neon Rim Light (Right)
        this.rimLightMagenta = new THREE.PointLight(this.palettes[this.currentTheme].neonSecondary, 2.0, 10);
        this.rimLightMagenta.position.set(4, -2, 2);
        this.scene.add(this.rimLightMagenta);

        // Chest Core Light (attached to chest later)
        this.coreLight = new THREE.PointLight(this.palettes[this.currentTheme].neon, 1.8, 4);
    }

    buildHumanFigure() {
        this.characterGroup = new THREE.Group();
        this.characterGroup.position.set(2.2, -0.3, 0); // Default Hero position
        this.characterGroup.rotation.y = -0.35; // Slight angle towards user

        const p = this.palettes[this.currentTheme];

        // Shared Materials
        this.materials = {
            suit: new THREE.MeshStandardMaterial({
                color: p.suit,
                roughness: 0.4,
                metalness: 0.3
            }),
            suitTrim: new THREE.MeshStandardMaterial({
                color: p.suitTrim,
                roughness: 0.3,
                metalness: 0.6
            }),
            metal: new THREE.MeshStandardMaterial({
                color: p.metal,
                roughness: 0.25,
                metalness: 0.85
            }),
            neon: new THREE.MeshStandardMaterial({
                color: p.neon,
                emissive: p.neon,
                emissiveIntensity: 1.6,
                roughness: 0.2
            }),
            visor: new THREE.MeshPhysicalMaterial({
                color: p.neon,
                emissive: p.neon,
                emissiveIntensity: 1.8,
                roughness: 0.1,
                metalness: 0.9,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1
            }),
            thruster: new THREE.MeshBasicMaterial({
                color: p.neon,
                transparent: true,
                opacity: 0.85
            })
        };

        // --- ROOT PELVIS / HIPS ---
        const pelvisGroup = new THREE.Group();
        pelvisGroup.position.y = 1.35;

        // Pelvis geometry
        const pelvisGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.22, 12);
        const pelvisMesh = new THREE.Mesh(pelvisGeo, this.materials.suitTrim);
        pelvisMesh.castShadow = true;
        pelvisGroup.add(pelvisMesh);

        // Glowing Belt Ring
        const beltGeo = new THREE.TorusGeometry(0.25, 0.025, 8, 24);
        beltGeo.rotateX(Math.PI / 2);
        const beltMesh = new THREE.Mesh(beltGeo, this.materials.neon);
        pelvisGroup.add(beltMesh);

        // --- TORSO & CHEST ---
        const torsoGroup = new THREE.Group();
        torsoGroup.position.y = 0.18;

        // Lower spine / abdomen
        const abdomenGeo = new THREE.CylinderGeometry(0.26, 0.23, 0.25, 12);
        const abdomenMesh = new THREE.Mesh(abdomenGeo, this.materials.suit);
        abdomenMesh.position.y = 0.12;
        abdomenMesh.castShadow = true;
        torsoGroup.add(abdomenMesh);

        // Upper Chest
        const chestGeo = new THREE.CylinderGeometry(0.35, 0.27, 0.42, 12);
        const chestMesh = new THREE.Mesh(chestGeo, this.materials.suitTrim);
        chestMesh.position.y = 0.42;
        chestMesh.castShadow = true;
        torsoGroup.add(chestMesh);

        // Glowing Core Reactor on chest
        const coreGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16);
        coreGeo.rotateX(Math.PI / 2);
        const coreMesh = new THREE.Mesh(coreGeo, this.materials.neon);
        coreMesh.position.set(0, 0.45, 0.3);
        torsoGroup.add(coreMesh);

        this.coreLight.position.set(0, 0.45, 0.4);
        torsoGroup.add(this.coreLight);

        // Jetpack on the back
        const jetpackGroup = new THREE.Group();
        jetpackGroup.position.set(0, 0.4, -0.32);

        const jetpackBodyGeo = new THREE.BoxGeometry(0.36, 0.46, 0.18);
        const jetpackBodyMesh = new THREE.Mesh(jetpackBodyGeo, this.materials.metal);
        jetpackBodyMesh.castShadow = true;
        jetpackGroup.add(jetpackBodyMesh);

        // Dual Thruster Nozzles
        [-0.12, 0.12].forEach((xPos) => {
            const nozzleGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.14, 12);
            const nozzleMesh = new THREE.Mesh(nozzleGeo, this.materials.suitTrim);
            nozzleMesh.position.set(xPos, -0.26, 0);
            jetpackGroup.add(nozzleMesh);

            // Flame cone
            const flameGeo = new THREE.ConeGeometry(0.065, 0.28, 12);
            flameGeo.rotateX(Math.PI);
            const flameMesh = new THREE.Mesh(flameGeo, this.materials.thruster);
            flameMesh.position.set(xPos, -0.42, 0);
            jetpackGroup.add(flameMesh);
            this.thrusterFlames.push(flameMesh);
        });
        torsoGroup.add(jetpackGroup);

        // --- NECK & HEAD ---
        const neckGroup = new THREE.Group();
        neckGroup.position.set(0, 0.65, 0);

        const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.12, 10);
        const neckMesh = new THREE.Mesh(neckGeo, this.materials.metal);
        neckGroup.add(neckMesh);

        // Head Group (for independent rotation)
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.18;

        // Helmet / Head Sphere
        const helmetGeo = new THREE.SphereGeometry(0.24, 20, 20);
        const helmetMesh = new THREE.Mesh(helmetGeo, this.materials.suit);
        helmetMesh.castShadow = true;
        headGroup.add(helmetMesh);

        // Cyber Visor (Curved glass front)
        const visorGeo = new THREE.SphereGeometry(0.23, 16, 16, -Math.PI / 2.5, Math.PI / 1.25, Math.PI / 3.5, Math.PI / 2.5);
        const visorMesh = new THREE.Mesh(visorGeo, this.materials.visor);
        visorMesh.position.set(0, 0.02, 0.03);
        headGroup.add(visorMesh);

        // Headphone earpieces
        [-0.23, 0.23].forEach((xPos) => {
            const earGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16);
            earGeo.rotateZ(Math.PI / 2);
            const earMesh = new THREE.Mesh(earGeo, this.materials.metal);
            earMesh.position.set(xPos, 0, 0);
            headGroup.add(earMesh);

            const earRingGeo = new THREE.TorusGeometry(0.08, 0.015, 8, 16);
            earRingGeo.rotateY(Math.PI / 2);
            const earRingMesh = new THREE.Mesh(earRingGeo, this.materials.neon);
            earRingMesh.position.set(xPos > 0 ? xPos + 0.03 : xPos - 0.03, 0, 0);
            headGroup.add(earRingMesh);
        });

        // Floating Sci-Fi Halo Ring
        const haloGeo = new THREE.TorusGeometry(0.3, 0.012, 8, 32);
        haloGeo.rotateX(Math.PI / 2);
        const haloMesh = new THREE.Mesh(haloGeo, this.materials.neon);
        haloMesh.position.set(0, 0.32, 0);
        headGroup.add(haloMesh);
        this.haloMesh = haloMesh;

        neckGroup.add(headGroup);
        torsoGroup.add(neckGroup);

        // --- ARMS (LEFT & RIGHT) ---
        const buildArm = (isLeft) => {
            const side = isLeft ? 1 : -1;
            const shoulderGroup = new THREE.Group();
            shoulderGroup.position.set(side * 0.44, 0.52, 0);

            // Shoulder pad / joint
            const shoulderJointGeo = new THREE.SphereGeometry(0.11, 12, 12);
            const shoulderJointMesh = new THREE.Mesh(shoulderJointGeo, this.materials.metal);
            shoulderGroup.add(shoulderJointMesh);

            // Upper arm
            const upperArmGroup = new THREE.Group();
            const upperArmGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.34, 10);
            upperArmGeo.translate(0, -0.17, 0);
            const upperArmMesh = new THREE.Mesh(upperArmGeo, this.materials.suit);
            upperArmMesh.castShadow = true;
            upperArmGroup.add(upperArmMesh);

            // Elbow joint
            const elbowGroup = new THREE.Group();
            elbowGroup.position.y = -0.34;

            const elbowJointGeo = new THREE.SphereGeometry(0.07, 10, 10);
            const elbowJointMesh = new THREE.Mesh(elbowJointGeo, this.materials.metal);
            elbowGroup.add(elbowJointMesh);

            // Forearm
            const forearmGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.32, 10);
            forearmGeo.translate(0, -0.16, 0);
            const forearmMesh = new THREE.Mesh(forearmGeo, this.materials.suitTrim);
            forearmMesh.castShadow = true;
            elbowGroup.add(forearmMesh);

            // Glowing forearm ring
            const armRingGeo = new THREE.TorusGeometry(0.075, 0.012, 8, 16);
            armRingGeo.rotateX(Math.PI / 2);
            armRingGeo.translate(0, -0.12, 0);
            const armRingMesh = new THREE.Mesh(armRingGeo, this.materials.neon);
            elbowGroup.add(armRingMesh);

            // Hand
            const handGroup = new THREE.Group();
            handGroup.position.y = -0.32;
            const handGeo = new THREE.BoxGeometry(0.08, 0.12, 0.05);
            handGeo.translate(0, -0.06, 0);
            const handMesh = new THREE.Mesh(handGeo, this.materials.metal);
            handMesh.castShadow = true;
            handGroup.add(handMesh);
            elbowGroup.add(handGroup);

            upperArmGroup.add(elbowGroup);
            shoulderGroup.add(upperArmGroup);
            torsoGroup.add(shoulderGroup);

            return {
                shoulder: shoulderGroup,
                upperArm: upperArmGroup,
                elbow: elbowGroup,
                hand: handGroup
            };
        };

        const leftArm = buildArm(true);
        const rightArm = buildArm(false);

        pelvisGroup.add(torsoGroup);

        // --- LEGS (LEFT & RIGHT) ---
        const buildLeg = (isLeft) => {
            const side = isLeft ? 1 : -1;
            const hipGroup = new THREE.Group();
            hipGroup.position.set(side * 0.18, -0.08, 0);

            // Hip joint
            const hipJointGeo = new THREE.SphereGeometry(0.1, 10, 10);
            const hipJointMesh = new THREE.Mesh(hipJointGeo, this.materials.metal);
            hipGroup.add(hipJointMesh);

            // Thigh
            const thighGroup = new THREE.Group();
            const thighGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.44, 10);
            thighGeo.translate(0, -0.22, 0);
            const thighMesh = new THREE.Mesh(thighGeo, this.materials.suit);
            thighMesh.castShadow = true;
            thighGroup.add(thighMesh);

            // Knee joint
            const kneeGroup = new THREE.Group();
            kneeGroup.position.y = -0.44;

            const kneeJointGeo = new THREE.SphereGeometry(0.08, 10, 10);
            const kneeJointMesh = new THREE.Mesh(kneeJointGeo, this.materials.metal);
            kneeGroup.add(kneeJointMesh);

            // Calf / Shin
            const calfGeo = new THREE.CylinderGeometry(0.08, 0.065, 0.44, 10);
            calfGeo.translate(0, -0.22, 0);
            const calfMesh = new THREE.Mesh(calfGeo, this.materials.suitTrim);
            calfMesh.castShadow = true;
            kneeGroup.add(calfMesh);

            // Cyber Boot / Sneaker
            const bootGroup = new THREE.Group();
            bootGroup.position.set(0, -0.44, 0.06);

            const bootGeo = new THREE.BoxGeometry(0.12, 0.12, 0.26);
            const bootMesh = new THREE.Mesh(bootGeo, this.materials.suit);
            bootMesh.castShadow = true;
            bootGroup.add(bootMesh);

            // Glowing Sole
            const soleGeo = new THREE.BoxGeometry(0.125, 0.02, 0.27);
            soleGeo.translate(0, -0.06, 0);
            const soleMesh = new THREE.Mesh(soleGeo, this.materials.neon);
            bootGroup.add(soleMesh);

            kneeGroup.add(bootGroup);
            thighGroup.add(kneeGroup);
            hipGroup.add(thighGroup);
            pelvisGroup.add(hipGroup);

            return {
                hip: hipGroup,
                thigh: thighGroup,
                knee: kneeGroup,
                boot: bootGroup
            };
        };

        const leftLeg = buildLeg(true);
        const rightLeg = buildLeg(false);

        this.characterGroup.add(pelvisGroup);
        this.scene.add(this.characterGroup);

        // Store Rig Handles
        this.rig = {
            root: this.characterGroup,
            pelvis: pelvisGroup,
            torso: torsoGroup,
            neck: neckGroup,
            head: headGroup,
            leftArm: leftArm,
            rightArm: rightArm,
            leftLeg: leftLeg,
            rightLeg: rightLeg
        };
    }

    buildParticles() {
        // Floating ambient dust / holographic stars
        const particleCount = 180;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color(this.palettes[this.currentTheme].neon);
        const color2 = new THREE.Color(this.palettes[this.currentTheme].neonSecondary);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 16;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

            const mixedColor = color1.clone().lerp(color2, Math.random());
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.055,
            vertexColors: true,
            transparent: true,
            opacity: 0.75
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    buildShadow() {
        // Dynamic soft ground shadow under the character
        const shadowGeo = new THREE.CircleGeometry(0.8, 32);
        shadowGeo.rotateX(-Math.PI / 2);

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(0, 242, 254, 0.45)');
        gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.6)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);

        const shadowTexture = new THREE.CanvasTexture(canvas);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            opacity: 0.8,
            depthWrite: false
        });

        this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        this.shadowMesh.position.set(2.2, -1.8, 0);
        this.scene.add(this.shadowMesh);
    }

    setupEventListeners() {
        // Window Resize
        window.addEventListener('resize', () => this.updateDimensions());

        // Mouse Tracking
        window.addEventListener('mousemove', (e) => {
            this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Touch Tracking for mobile devices
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.mouse.targetY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        });

        // Scroll Velocity Tracker
        window.addEventListener('scroll', () => {
            const currentY = window.scrollY;
            const delta = currentY - this.lastScrollY;
            this.scrollVelocity = THREE.MathUtils.clamp(delta * 0.08, -3.5, 3.5);
            this.lastScrollY = currentY;
        }, { passive: true });
    }

    updateDimensions() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);

        // Adjust character scale and camera position based on screen width
        if (width < 768) {
            // Mobile: scale character down slightly and center/offset nicely
            this.characterGroup.scale.set(0.72, 0.72, 0.72);
            this.camera.position.z = 8.8;
        } else if (width < 1024) {
            // Tablet
            this.characterGroup.scale.set(0.85, 0.85, 0.85);
            this.camera.position.z = 8.0;
        } else {
            // Desktop
            this.characterGroup.scale.set(1.0, 1.0, 1.0);
            this.camera.position.z = 7.5;
        }
    }

    setTheme(themeName) {
        if (!this.palettes[themeName]) return;
        this.currentTheme = themeName;
        const p = this.palettes[themeName];

        // Update Materials
        this.materials.suit.color.setHex(p.suit);
        this.materials.suitTrim.color.setHex(p.suitTrim);
        this.materials.metal.color.setHex(p.metal);
        this.materials.neon.color.setHex(p.neon);
        this.materials.neon.emissive.setHex(p.neon);
        this.materials.visor.color.setHex(p.neon);
        this.materials.visor.emissive.setHex(p.neon);
        this.materials.thruster.color.setHex(p.neon);

        // Update Lights
        this.rimLightCyan.color.setHex(p.neon);
        this.rimLightMagenta.color.setHex(p.neonSecondary);
        this.coreLight.color.setHex(p.neon);

        // Update Document CSS Accent Variables dynamically
        document.documentElement.style.setProperty('--primary-cyan', p.glowHex);

        if (window.soundEffects) {
            window.soundEffects.playAction();
        }
    }

    // --- INTERACTIVE STUNTS ---
    triggerStunt(stuntName) {
        if (this.isStuntActive) return;
        this.isStuntActive = true;
        this.currentStunt = stuntName;

        if (window.soundEffects) {
            window.soundEffects.playAction();
        }

        switch (stuntName) {
            case 'backflip':
                this.performBackflip();
                break;
            case 'wave':
                this.performWave();
                break;
            case 'float':
                this.performZeroGFloat();
                break;
            case 'dance':
                this.performDance();
                break;
            default:
                this.isStuntActive = false;
        }
    }

    performBackflip() {
        const root = this.rig.root;
        const initialY = root.position.y;
        const initialRotX = root.rotation.x;

        gsap.timeline({
            onComplete: () => {
                this.isStuntActive = false;
                root.position.y = initialY;
                root.rotation.x = initialRotX;
            }
        })
        .to(root.position, { y: initialY + 1.2, duration: 0.45, ease: 'power2.out' })
        .to(root.rotation, { x: initialRotX + Math.PI * 2, duration: 0.65, ease: 'power1.inOut' }, 0.1)
        .to(root.position, { y: initialY, duration: 0.45, ease: 'bounce.out' }, 0.55);
    }

    performWave() {
        const rArm = this.rig.rightArm;
        const initialShoulderZ = rArm.shoulder.rotation.z;
        const initialElbowZ = rArm.elbow.rotation.z;

        gsap.timeline({
            onComplete: () => {
                this.isStuntActive = false;
                gsap.to(rArm.shoulder.rotation, { z: initialShoulderZ, x: 0, duration: 0.4 });
                gsap.to(rArm.elbow.rotation, { z: initialElbowZ, duration: 0.4 });
            }
        })
        .to(rArm.shoulder.rotation, { z: -1.8, x: -0.4, duration: 0.35, ease: 'back.out(1.5)' })
        .to(rArm.elbow.rotation, { z: -0.8, duration: 0.3 })
        .to(rArm.elbow.rotation, { z: -0.2, duration: 0.18, yoyo: true, repeat: 4 })
        .to(rArm.shoulder.rotation, { z: initialShoulderZ, x: 0, duration: 0.4 });
    }

    performZeroGFloat() {
        const root = this.rig.root;
        const initialY = root.position.y;

        gsap.timeline({
            onComplete: () => {
                this.isStuntActive = false;
            }
        })
        .to(root.position, { y: initialY + 0.8, duration: 0.8, ease: 'power2.out' })
        .to(this.rig.leftArm.shoulder.rotation, { z: 1.2, duration: 0.8 }, 0)
        .to(this.rig.rightArm.shoulder.rotation, { z: -1.2, duration: 0.8 }, 0)
        .to(this.rig.leftLeg.hip.rotation, { x: 0.4, z: 0.3, duration: 0.8 }, 0)
        .to(this.rig.rightLeg.hip.rotation, { x: -0.3, z: -0.3, duration: 0.8 }, 0)
        .to(root.position, { y: initialY, duration: 1.0, ease: 'power2.inOut', delay: 1.2 })
        .to(this.rig.leftArm.shoulder.rotation, { z: 0, duration: 0.8 }, 1.8)
        .to(this.rig.rightArm.shoulder.rotation, { z: 0, duration: 0.8 }, 1.8)
        .to(this.rig.leftLeg.hip.rotation, { x: 0, z: 0, duration: 0.8 }, 1.8)
        .to(this.rig.rightLeg.hip.rotation, { x: 0, z: 0, duration: 0.8 }, 1.8);
    }

    performDance() {
        const root = this.rig.root;
        const initialRotY = root.rotation.y;

        gsap.timeline({
            onComplete: () => {
                this.isStuntActive = false;
                root.rotation.y = initialRotY;
            }
        })
        .to(root.rotation, { y: initialRotY + 0.4, duration: 0.25, yoyo: true, repeat: 5, ease: 'sine.inOut' })
        .to(this.rig.leftArm.elbow.rotation, { x: -1.2, duration: 0.25, yoyo: true, repeat: 5 }, 0)
        .to(this.rig.rightArm.elbow.rotation, { x: 1.2, duration: 0.25, yoyo: true, repeat: 5 }, 0);
    }

    // --- ANIMATION LOOP ---
    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // 1. Smooth Mouse Gaze Interpolation
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

        if (this.rig.head) {
            this.rig.head.rotation.y = this.mouse.x * 0.55;
            this.rig.head.rotation.x = -this.mouse.y * 0.35;
        }

        // 2. Halo Floating Rotation
        if (this.haloMesh) {
            this.haloMesh.rotation.z = time * 1.2;
            this.haloMesh.position.y = 0.32 + Math.sin(time * 3) * 0.02;
        }

        // 3. Core Light Pulse
        if (this.coreLight) {
            this.coreLight.intensity = 1.6 + Math.sin(time * 4) * 0.5;
        }

        // 4. Ambient Particle Swirl
        if (this.particles) {
            this.particles.rotation.y = time * 0.03;
            this.particles.rotation.x = Math.sin(time * 0.02) * 0.1;
        }

        // 5. Scroll Locomotion & Stride Engine
        // Smoothly decay scroll velocity towards zero
        this.scrollVelocity *= 0.88;

        const isMoving = Math.abs(this.scrollVelocity) > 0.05;

        if (isMoving && !this.isStuntActive) {
            // Progress walk cycle based on scroll speed
            this.walkCycle += Math.abs(this.scrollVelocity) * 0.18;

            const stride = Math.sin(this.walkCycle);
            const counterStride = -stride;

            // Hip & Leg swings
            this.rig.leftLeg.hip.rotation.x = stride * 0.65;
            this.rig.rightLeg.hip.rotation.x = counterStride * 0.65;

            // Knee flexing
            this.rig.leftLeg.knee.rotation.x = Math.max(0, -stride) * 0.85;
            this.rig.rightLeg.knee.rotation.x = Math.max(0, stride) * 0.85;

            // Arms natural counter-balance swing
            this.rig.leftArm.shoulder.rotation.x = counterStride * 0.55;
            this.rig.rightArm.shoulder.rotation.x = stride * 0.55;

            // Torso cadence bounce
            this.rig.pelvis.position.y = 1.35 + Math.abs(Math.sin(this.walkCycle)) * 0.06;

            // Thruster fire flare
            this.thrusterFlames.forEach((flame) => {
                flame.scale.set(1.4, 1.8, 1.4);
                flame.material.opacity = 0.95;
            });
        } else if (!this.isStuntActive) {
            // Idle Breathing & Hovering Levitation
            const idleBob = Math.sin(time * 1.8) * 0.04;
            const idleBreathe = Math.sin(time * 1.5) * 0.02;

            this.rig.pelvis.position.y = THREE.MathUtils.lerp(this.rig.pelvis.position.y, 1.35 + idleBob, 0.08);

            // Ease limbs to natural relaxed stance
            this.rig.leftLeg.hip.rotation.x = THREE.MathUtils.lerp(this.rig.leftLeg.hip.rotation.x, 0, 0.08);
            this.rig.rightLeg.hip.rotation.x = THREE.MathUtils.lerp(this.rig.rightLeg.hip.rotation.x, 0, 0.08);
            this.rig.leftLeg.knee.rotation.x = THREE.MathUtils.lerp(this.rig.leftLeg.knee.rotation.x, 0, 0.08);
            this.rig.rightLeg.knee.rotation.x = THREE.MathUtils.lerp(this.rig.rightLeg.knee.rotation.x, 0, 0.08);

            this.rig.leftArm.shoulder.rotation.x = THREE.MathUtils.lerp(this.rig.leftArm.shoulder.rotation.x, idleBreathe, 0.08);
            this.rig.rightArm.shoulder.rotation.x = THREE.MathUtils.lerp(this.rig.rightArm.shoulder.rotation.x, -idleBreathe, 0.08);

            // Subtle idle thruster flicker
            this.thrusterFlames.forEach((flame) => {
                flame.scale.set(1.0, 1.0 + Math.sin(time * 8) * 0.2, 1.0);
                flame.material.opacity = 0.65;
            });
        }

        // 6. Ground Shadow Follows Character Position
        if (this.shadowMesh && this.characterGroup) {
            this.shadowMesh.position.x = this.characterGroup.position.x;
            this.shadowMesh.position.z = this.characterGroup.position.z;
            const distFromGround = this.characterGroup.position.y + 1.8;
            this.shadowMesh.scale.setScalar(Math.max(0.5, 1 - distFromGround * 0.25));
        }

        // Render Scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Global handle for character engine
window.HumanFigureEngine = HumanFigureEngine;
