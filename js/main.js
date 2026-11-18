/**
 * Main Application Orchestrator
 * Links GSAP ScrollTrigger, 3D Character Rig, UI Interactions, Audio & Dynamic Features
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize 3D Human Figure Engine
    let characterEngine = null;
    try {
        if (typeof THREE !== 'undefined' && typeof HumanFigureEngine !== 'undefined') {
            characterEngine = new HumanFigureEngine();
            window.activeCharacter = characterEngine;
        }
    } catch (e) {
        console.warn('3D Engine failed to initialize, activating SVG fallback', e);
        activateSvgFallback();
    }

    // 2. Fallback check
    if (!characterEngine) {
        activateSvgFallback();
    }

    // 3. Initialize GSAP & ScrollTrigger
    initScrollAnimations(characterEngine);

    // 4. Initialize UI Features
    initHeaderAndNav();
    initSoundEffects();
    initThemeSwitcher(characterEngine);
    initInteractiveDock(characterEngine);
    initTypingEffect();
    initProjectCards();
    initContactForm(characterEngine);
    initCustomCursor();
    initStatsCounter();

    // Initialize Lucide icons if available
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

/**
 * GSAP ScrollTrigger choreography for the 3D Human Figure
 */
function initScrollAnimations(engine) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Fade-in reveal for general content sections
    gsap.utils.toArray('.reveal-up').forEach((elem) => {
        gsap.fromTo(elem, 
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.85,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: elem,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    if (!engine || !engine.characterGroup) return;

    const charRoot = engine.characterGroup;
    const isMobile = window.innerWidth < 768;

    // Responsive position offsets
    const positions = {
        hero: {
            x: isMobile ? 0 : 2.2,
            y: isMobile ? 1.0 : -0.3,
            z: isMobile ? -1.0 : 0,
            rotY: -0.35
        },
        about: {
            x: isMobile ? 0 : -2.1,
            y: isMobile ? 1.2 : -0.3,
            z: isMobile ? -1.0 : 0.4,
            rotY: 0.55
        },
        skills: {
            x: 0,
            y: isMobile ? 0.8 : 0.1,
            z: isMobile ? -0.8 : 1.1,
            rotY: Math.PI * 2
        },
        projects: {
            x: isMobile ? 0 : 2.1,
            y: isMobile ? 1.0 : -0.2,
            z: isMobile ? -1.0 : 0.3,
            rotY: -0.45
        },
        timeline: {
            x: isMobile ? 0 : -1.9,
            y: isMobile ? 0.9 : -0.4,
            z: isMobile ? -1.0 : 0.2,
            rotY: 0.45
        },
        contact: {
            x: isMobile ? 0 : 1.6,
            y: isMobile ? 0.8 : -0.2,
            z: isMobile ? -0.8 : 0.7,
            rotY: -0.15
        }
    };

    // Transition 1: Hero -> About
    gsap.timeline({
        scrollTrigger: {
            trigger: '#about',
            start: 'top bottom',
            end: 'top center',
            scrub: 1.2,
            onEnter: () => window.soundEffects && window.soundEffects.playWhoosh(),
            onEnterBack: () => window.soundEffects && window.soundEffects.playWhoosh()
        }
    })
    .to(charRoot.position, {
        x: positions.about.x,
        y: positions.about.y,
        z: positions.about.z,
        ease: 'power1.inOut'
    })
    .to(charRoot.rotation, {
        y: positions.about.rotY,
        ease: 'power1.inOut'
    }, 0);

    // Transition 2: About -> Skills (Zero-G levitation to center)
    gsap.timeline({
        scrollTrigger: {
            trigger: '#skills',
            start: 'top bottom',
            end: 'top center',
            scrub: 1.2,
            onEnter: () => window.soundEffects && window.soundEffects.playWhoosh()
        }
    })
    .to(charRoot.position, {
        x: positions.skills.x,
        y: positions.skills.y,
        z: positions.skills.z,
        ease: 'power2.inOut'
    })
    .to(charRoot.rotation, {
        y: positions.skills.rotY,
        ease: 'none'
    }, 0);

    // Transition 3: Skills -> Projects
    gsap.timeline({
        scrollTrigger: {
            trigger: '#projects',
            start: 'top bottom',
            end: 'top center',
            scrub: 1.2,
            onEnter: () => window.soundEffects && window.soundEffects.playWhoosh()
        }
    })
    .to(charRoot.position, {
        x: positions.projects.x,
        y: positions.projects.y,
        z: positions.projects.z,
        ease: 'power1.inOut'
    })
    .to(charRoot.rotation, {
        y: positions.projects.rotY,
        ease: 'power1.inOut'
    }, 0);

    // Transition 4: Projects -> Timeline
    gsap.timeline({
        scrollTrigger: {
            trigger: '#timeline',
            start: 'top bottom',
            end: 'top center',
            scrub: 1.2,
            onEnter: () => window.soundEffects && window.soundEffects.playWhoosh()
        }
    })
    .to(charRoot.position, {
        x: positions.timeline.x,
        y: positions.timeline.y,
        z: positions.timeline.z,
        ease: 'power1.inOut'
    })
    .to(charRoot.rotation, {
        y: positions.timeline.rotY,
        ease: 'power1.inOut'
    }, 0);

    // Transition 5: Timeline -> Contact (Arrival & Friendly Wave)
    gsap.timeline({
        scrollTrigger: {
            trigger: '#contact',
            start: 'top 80%',
            end: 'top 30%',
            scrub: 1.2,
            onEnter: () => {
                if (window.soundEffects) window.soundEffects.playWhoosh();
                // Trigger welcoming wave when landing on contact
                setTimeout(() => engine.triggerStunt('wave'), 600);
            }
        }
    })
    .to(charRoot.position, {
        x: positions.contact.x,
        y: positions.contact.y,
        z: positions.contact.z,
        ease: 'power2.out'
    })
    .to(charRoot.rotation, {
        y: positions.contact.rotY,
        ease: 'power2.out'
    }, 0);
}

/**
 * Navigation Bar and Scrollspy
 */
function initHeaderAndNav() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-links');

    // Sticky glass navbar effect on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link highlighting based on section in view
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset + 200;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop;
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { passive: true });

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElem = document.querySelector(targetId);
            if (targetElem) {
                targetElem.scrollIntoView({ behavior: 'smooth' });
                if (navMenu.classList.contains('open')) {
                    navMenu.classList.remove('open');
                }
            }
        });
    });

    // Mobile menu toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }
}

/**
 * Web Audio FX Controls
 */
function initSoundEffects() {
    const audioToggleBtn = document.getElementById('audio-toggle-btn');
    if (!audioToggleBtn) return;

    audioToggleBtn.addEventListener('click', () => {
        if (!window.soundEffects) return;
        const isMuted = window.soundEffects.toggleMute();

        const icon = audioToggleBtn.querySelector('i');
        const text = audioToggleBtn.querySelector('.audio-status');

        if (isMuted) {
            audioToggleBtn.classList.remove('active');
            if (text) text.textContent = 'Muted';
            if (icon) icon.setAttribute('data-lucide', 'volume-x');
        } else {
            audioToggleBtn.classList.add('active');
            if (text) text.textContent = 'Sound ON';
            if (icon) icon.setAttribute('data-lucide', 'volume-2');
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    // Add audio hover triggers to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .skill-card, .project-card, .interactive-btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (window.soundEffects) window.soundEffects.playHover();
        });
        el.addEventListener('click', () => {
            if (window.soundEffects) window.soundEffects.playClick();
        });
    });
}

/**
 * Theme & Suit Color Customizer
 */
function initThemeSwitcher(engine) {
    const themeButtons = document.querySelectorAll('.theme-btn');

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const theme = btn.getAttribute('data-theme');
            if (engine) {
                engine.setTheme(theme);
            }
        });
    });
}

/**
 * Character Interactive Dock (Wave, Flip, Float, Dance)
 */
function initInteractiveDock(engine) {
    const stuntButtons = document.querySelectorAll('.stunt-btn');

    stuntButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const stunt = btn.getAttribute('data-stunt');
            if (engine) {
                engine.triggerStunt(stunt);
            }

            // Visual button pop
            btn.classList.add('animating');
            setTimeout(() => btn.classList.remove('animating'), 500);
        });
    });
}

/**
 * Hero Typing Effect
 */
function initTypingEffect() {
    const textElem = document.getElementById('typing-text');
    if (!textElem) return;

    const phrases = [
        'Creative Frontend Architect',
        '3D & WebGL Developer',
        'UI/UX Motion Designer',
        'Interactive Experience Builder'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            textElem.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            textElem.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            // Pause before deleting
            isDeleting = true;
            typingSpeed = 1800;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 400;
        }

        setTimeout(type, typingSpeed);
    }

    type();
}

/**
 * Project Filtering & Modal Previews
 */
function initProjectCards() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close-btn');

    // Filter functionality
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category.includes(filter)) {
                    card.style.display = 'flex';
                    gsap.fromTo(card, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4 });
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Project Detail Modal
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalDescription = document.getElementById('modal-description');
    const modalTags = document.getElementById('modal-tags');
    const modalLive = document.getElementById('modal-live-btn');
    const modalGithub = document.getElementById('modal-github-btn');

    document.querySelectorAll('.view-project-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            if (!card || !modal) return;

            const title = card.querySelector('.project-title').textContent;
            const category = card.querySelector('.project-category').textContent;
            const desc = card.querySelector('.project-summary').textContent;
            const tags = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent);

            if (modalTitle) modalTitle.textContent = title;
            if (modalCategory) modalCategory.textContent = category;
            if (modalDescription) modalDescription.textContent = desc;

            if (modalTags) {
                modalTags.innerHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            }

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (window.soundEffects) window.soundEffects.playClick();
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

/**
 * Contact Form with Validation & Feedback
 */
function initContactForm(engine) {
    const form = document.getElementById('contact-form');
    const statusMsg = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();

        if (!name || !email || !message) {
            statusMsg.textContent = 'অনুগ্রহ করে সব তথ্য পূরণ করুন (Please fill out all fields).';
            statusMsg.className = 'form-status error';
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span>Sending Transmission...</span>`;

        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            form.reset();

            statusMsg.textContent = '✨ বার্তা সফলভাবে পাঠানো হয়েছে! আপনাকে ধন্যবাদ (Transmission received! Thank you).';
            statusMsg.className = 'form-status success';

            // Confetti explosion
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }

            // Audio celebration
            if (window.soundEffects) {
                window.soundEffects.playSuccess();
            }

            // Character celebration stunt
            if (engine) {
                engine.triggerStunt('wave');
            }
        }, 1000);
    });

    // Copy Email to Clipboard shortcut
    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const email = copyEmailBtn.getAttribute('data-email') || 'hello@khalid.dev';
            navigator.clipboard.writeText(email).then(() => {
                const originalText = copyEmailBtn.innerHTML;
                copyEmailBtn.innerHTML = `<span>Copied! ✓</span>`;
                setTimeout(() => copyEmailBtn.innerHTML = originalText, 2000);
                if (window.soundEffects) window.soundEffects.playAction();
            });
        });
    }
}

/**
 * Animated Stats Counter
 */
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    let hasCounted = false;

    window.addEventListener('scroll', () => {
        const statsSection = document.querySelector('.about-stats');
        if (!statsSection || hasCounted) return;

        const rect = statsSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.8) {
            hasCounted = true;
            stats.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'), 10);
                let current = 0;
                const increment = Math.ceil(target / 40);
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        stat.textContent = target + (stat.getAttribute('data-suffix') || '');
                        clearInterval(timer);
                    } else {
                        stat.textContent = current + (stat.getAttribute('data-suffix') || '');
                    }
                }, 30);
            });
        }
    }, { passive: true });
}

/**
 * Custom Glowing Cursor
 */
function initCustomCursor() {
    // Only enable custom cursor for devices with mouse pointer
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (!cursorDot || !cursorOutline) return;

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function animateCursor() {
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover scale effect
    const hoverTargets = document.querySelectorAll('a, button, .project-card, .skill-card, input, textarea');
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => cursorOutline.classList.add('cursor-hover'));
        target.addEventListener('mouseleave', () => cursorOutline.classList.remove('cursor-hover'));
    });
}

/**
 * High-performance SVG Fallback Human Figure (if WebGL is disabled)
 */
function activateSvgFallback() {
    const container = document.getElementById('character-canvas-container');
    if (!container) return;

    container.innerHTML = `
        <div class="svg-fallback-character">
            <svg viewBox="0 0 200 320" class="rigged-human-svg" width="220" height="350">
                <!-- Head & Visor -->
                <g class="svg-head">
                    <circle cx="100" cy="50" r="30" fill="#121726" stroke="#00f2fe" stroke-width="3" />
                    <rect x="80" y="42" width="40" height="16" rx="8" fill="#00f2fe" />
                    <circle cx="68" cy="50" r="8" fill="#1f293d" />
                    <circle cx="132" cy="50" r="8" fill="#1f293d" />
                </g>
                <!-- Torso -->
                <g class="svg-torso">
                    <path d="M 75 80 L 125 80 L 115 170 L 85 170 Z" fill="#161e31" stroke="#00f2fe" stroke-width="2" />
                    <circle cx="100" cy="115" r="12" fill="#00f2fe" />
                </g>
                <!-- Arms -->
                <line x1="72" y1="85" x2="48" y2="150" stroke="#00f2fe" stroke-width="10" stroke-linecap="round" />
                <line x1="128" y1="85" x2="152" y2="150" stroke="#00f2fe" stroke-width="10" stroke-linecap="round" />
                <!-- Legs -->
                <line x1="88" y1="170" x2="80" y2="270" stroke="#1f293d" stroke-width="12" stroke-linecap="round" />
                <line x1="112" y1="170" x2="120" y2="270" stroke="#1f293d" stroke-width="12" stroke-linecap="round" />
                <!-- Boots -->
                <rect x="68" y="270" width="24" height="12" rx="4" fill="#00f2fe" />
                <rect x="110" y="270" width="24" height="12" rx="4" fill="#00f2fe" />
            </svg>
        </div>
    `;

    // Apply scroll parallax to fallback
    window.addEventListener('scroll', () => {
        const fallback = document.querySelector('.svg-fallback-character');
        if (fallback) {
            const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
            const moveX = Math.sin(scrollPercent * Math.PI * 2) * 200;
            const moveY = window.scrollY * 0.15;
            fallback.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    });
}
