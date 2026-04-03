/* =============================================
   UJJWAL VARSHNEY - PORTFOLIO SCRIPTS
   ============================================= */

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // DETECT TOUCH DEVICE
    // =========================================
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // =========================================
    // LOADER
    // =========================================
    const loader = document.getElementById('loader');
    let loaderDismissed = false;

    function dismissLoader() {
        if (loaderDismissed) return;
        loaderDismissed = true;
        if (loader) {
            loader.classList.add('hidden');
        }
        // Only set overflow if mobile menu isn't active
        const mobileMenu = document.getElementById('mobile-menu');
        if (!mobileMenu || !mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'auto';
        }
        initAnimations();
    }

    // Primary dismiss after timeout
    setTimeout(dismissLoader, 1800);

    // Safety fallback: dismiss after 5s even if something goes wrong
    setTimeout(dismissLoader, 5000);

    // =========================================
    // CUSTOM CURSOR (skip on touch devices)
    // =========================================
    if (!isTouchDevice) {
        const cursor = document.getElementById('cursor');
        const follower = document.getElementById('cursor-follower');
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;
        let cursorAnimId;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (cursor) {
                cursor.style.left = mouseX - 4 + 'px';
                cursor.style.top = mouseY - 4 + 'px';
            }
        });

        function animateCursor() {
            followerX += (mouseX - followerX) * 0.35;
            followerY += (mouseY - followerY) * 0.35;
            if (follower) {
                follower.style.left = followerX + 'px';
                follower.style.top = followerY + 'px';
            }
            cursorAnimId = requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Cursor hover effect
        const hoverElements = document.querySelectorAll('a, button, .btn, .skill-tag, .project-featured-card, .achievement-card');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => { if (follower) follower.classList.add('hover'); });
            el.addEventListener('mouseleave', () => { if (follower) follower.classList.remove('hover'); });
        });
    }

    // =========================================
    // NAVIGATION
    // =========================================
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    // Unified scroll handler (single listener for performance)
    let lastScroll = 0;
    let scrollTicking = false;
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;

                // Add scrolled class for nav background
                if (scrollY > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }

                // Hide/show nav on scroll direction (with threshold to prevent jank)
                const scrollDelta = scrollY - lastScroll;
                if (scrollDelta > 10 && scrollY > 200) {
                    nav.style.transform = 'translateY(-100%)';
                } else if (scrollDelta < -10) {
                    nav.style.transform = 'translateY(0)';
                }
                lastScroll = scrollY;

                // Active nav link on scroll
                const checkY = scrollY + 200;
                sections.forEach(section => {
                    const top = section.offsetTop;
                    const height = section.offsetHeight;
                    const id = section.getAttribute('id');
                    const link = document.querySelector(`.nav-link[href="#${id}"]`);
                    if (link) {
                        if (checkY >= top && checkY < top + height) {
                            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                            link.classList.add('active');
                        }
                    }
                });

                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // Mobile toggle
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            const isActive = mobileMenu.classList.contains('active');
            navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', !isActive);
            document.body.style.overflow = !isActive ? 'hidden' : 'auto';
        });

        // Close mobile menu on link click
        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
            });
        });

        // Close mobile menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
                navToggle.focus();
            }
        });
    }

    // =========================================
    // PARTICLE CANVAS
    // =========================================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let particles = [];
    let animationId = null;
    let particlesRunning = false;

    // Reduce particles on mobile for performance
    const isMobile = window.innerWidth < 768;

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    if (canvas && ctx) {
        resizeCanvas();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resizeCanvas();
                initParticles();
            }, 250);
        });

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(100, 255, 218, ${this.opacity})`;
                ctx.fill();
            }
        }

        function initParticles() {
            // Fewer particles on mobile for performance
            const maxParticles = isMobile ? 30 : 80;
            const count = Math.min(maxParticles, Math.floor(window.innerWidth / (isMobile ? 25 : 15)));
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function connectParticles() {
            const connectionDist = isMobile ? 100 : 150;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distSq = dx * dx + dy * dy;
                    const maxDistSq = connectionDist * connectionDist;

                    if (distSq < maxDistSq) {
                        const opacity = (1 - Math.sqrt(distSq) / connectionDist) * 0.15;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(100, 255, 218, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            if (!particlesRunning) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connectParticles();
            animationId = requestAnimationFrame(animateParticles);
        }

        function startParticles() {
            if (particlesRunning) return; // Prevent stacking animation frames
            particlesRunning = true;
            animateParticles();
        }

        function stopParticles() {
            particlesRunning = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }

        initParticles();

        // Skip particle animation entirely if user prefers reduced motion
        if (!prefersReducedMotion) {
            startParticles();

            // Pause particles when hero not visible (performance)
            const heroSection = document.getElementById('hero');
            if (heroSection) {
                const particleObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) {
                            stopParticles();
                        } else {
                            startParticles();
                        }
                    });
                }, { threshold: 0.1 });
                particleObserver.observe(heroSection);
            }
        }
    }

    // =========================================
    // TYPING EFFECT
    // =========================================
    const rotateElement = document.getElementById('hero-rotate');
    if (rotateElement && !prefersReducedMotion) {
        const words = [
            'distributed systems.',
            'scalable backends.',
            'AI-powered tools.',
            'event-driven microservices.',
            'full-stack solutions.',
        ];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 80;
        let typingTimeoutId;

        function typeEffect() {
            const current = words[wordIndex];

            if (isDeleting) {
                rotateElement.textContent = current.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 40;
            } else {
                rotateElement.textContent = current.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 80;
            }

            if (!isDeleting && charIndex === current.length) {
                isDeleting = true;
                typingSpeed = 2000; // Pause before deleting
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typingSpeed = 300; // Pause before typing
            }

            typingTimeoutId = setTimeout(typeEffect, typingSpeed);
        }

        typingTimeoutId = setTimeout(typeEffect, 2500);
    } else if (rotateElement) {
        // For reduced motion, just show the first word
        rotateElement.textContent = 'enterprise platforms.';
    }

    // =========================================
    // COUNTER ANIMATION
    // =========================================
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;

        const counters = document.querySelectorAll('.hero-stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            if (isNaN(target)) return;

            if (prefersReducedMotion) {
                counter.textContent = target;
                return;
            }

            const duration = 2000;
            const start = performance.now();

            function updateCounter(timestamp) {
                const progress = Math.min((timestamp - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                counter.textContent = Math.floor(eased * target);

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            }
            requestAnimationFrame(updateCounter);
        });
    }

    // Trigger counter animation when hero stats are visible
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        counterObserver.observe(heroStats);
    }

    // =========================================
    // SCROLL ANIMATIONS
    // =========================================
    function initScrollAnimations() {
        const scrollElements = document.querySelectorAll('[data-scroll]');

        if (prefersReducedMotion) {
            scrollElements.forEach(el => el.classList.add('visible'));
            return;
        }

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        scrollElements.forEach(el => scrollObserver.observe(el));
    }

    // =========================================
    // GSAP ANIMATIONS (if loaded)
    // =========================================
    function initGSAP() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        if (prefersReducedMotion) return;

        gsap.registerPlugin(ScrollTrigger);

        // Skill cards stagger
        gsap.utils.toArray('.skill-category').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    once: true
                },
                y: 40,
                opacity: 0,
                duration: 0.6,
                delay: i * 0.1,
                clearProps: 'transform' // Clear inline styles after animation to prevent conflict
            });
        });

        // Achievement cards stagger
        gsap.utils.toArray('.achievement-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    once: true
                },
                y: 50,
                opacity: 0,
                duration: 0.6,
                delay: i * 0.15,
                clearProps: 'transform'
            });
        });

        // Project cards
        gsap.utils.toArray('.project-featured-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    once: true
                },
                y: 60,
                opacity: 0,
                duration: 0.8,
                delay: 0.2,
                clearProps: 'transform'
            });
        });

        // Experience table rows
        gsap.utils.toArray('.exp-row').forEach((row, i) => {
            gsap.from(row, {
                scrollTrigger: {
                    trigger: row,
                    start: 'top 90%',
                    once: true
                },
                x: -20,
                opacity: 0,
                duration: 0.5,
                delay: i * 0.08,
                clearProps: 'transform'
            });
        });

        // Contact section
        gsap.from('.contact-title', {
            scrollTrigger: {
                trigger: '.contact-title',
                start: 'top 85%',
                once: true
            },
            y: 30,
            opacity: 0,
            duration: 0.8
        });
    }

    // =========================================
    // INIT ALL ANIMATIONS
    // =========================================
    function initAnimations() {
        initScrollAnimations();
        initGSAP();
        // Counter animation is now triggered by IntersectionObserver, not a fixed timeout
    }

    // =========================================
    // SMOOTH SCROLL FOR NAV LINKS
    // =========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Guard against empty hash
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            }
        });
    });

    // =========================================
    // TILT EFFECT ON PROJECT CARDS (desktop only)
    // =========================================
    if (!isTouchDevice) {
        document.querySelectorAll('.project-featured-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 30;
                const rotateY = (centerX - x) / 30;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // =========================================
    // MAGNETIC EFFECT ON BUTTONS (desktop only)
    // =========================================
    if (!isTouchDevice) {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // =========================================
    // SKILL TAG GLOW ON HOVER (desktop only)
    // =========================================
    if (!isTouchDevice) {
        document.querySelectorAll('.skill-tag').forEach(tag => {
            tag.addEventListener('mousemove', (e) => {
                const rect = tag.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                tag.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(100, 255, 218, 0.12), transparent 60%)`;
            });

            tag.addEventListener('mouseleave', () => {
                tag.style.background = '';
            });
        });
    }

});
