/**
 * Notre Dame Biotech Group - Main JavaScript
 * Senior Frontend Engineer Implementation
 * Features: Accessible navigation, smooth animations, performance optimized
 */

(function() {
    'use strict';

    // ==========================================
    // DOM Elements
    // ==========================================
    const DOM = {
        header: document.getElementById('header'),
        nav: document.getElementById('nav'),
        menuBtn: document.getElementById('menu-btn'),
        dropdownBtns: document.querySelectorAll('.nav__item--dropdown > .nav__link'),
        statsNumbers: document.querySelectorAll('.stats__number[data-count]'),
        animatedElements: document.querySelectorAll('.feature, .stats__card, .advisor, .partner, .sponsor')
    };

    // ==========================================
    // Utility Functions
    // ==========================================
    
    /**
     * Debounce function for performance optimization
     */
    function debounce(func, wait = 100) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * Throttle function for scroll events
     */
    function throttle(func, limit = 100) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ==========================================
    // Header Scroll Effect
    // ==========================================
    function initHeaderScroll() {
        const handleScroll = throttle(() => {
            if (window.scrollY > 50) {
                DOM.header.classList.add('header--scrolled');
            } else {
                DOM.header.classList.remove('header--scrolled');
            }
        }, 50);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // ==========================================
    // Mobile Navigation
    // ==========================================
    function initMobileNav() {
        if (!DOM.menuBtn || !DOM.nav) return;

        DOM.menuBtn.addEventListener('click', () => {
            const isExpanded = DOM.menuBtn.getAttribute('aria-expanded') === 'true';
            
            DOM.menuBtn.setAttribute('aria-expanded', !isExpanded);
            DOM.nav.classList.toggle('is-open');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = !isExpanded ? 'hidden' : '';
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && DOM.nav.classList.contains('is-open')) {
                DOM.menuBtn.setAttribute('aria-expanded', 'false');
                DOM.nav.classList.remove('is-open');
                document.body.style.overflow = '';
                DOM.menuBtn.focus();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (DOM.nav.classList.contains('is-open') && 
                !DOM.nav.contains(e.target) && 
                !DOM.menuBtn.contains(e.target)) {
                DOM.menuBtn.setAttribute('aria-expanded', 'false');
                DOM.nav.classList.remove('is-open');
                document.body.style.overflow = '';
            }
        });
    }

    // ==========================================
    // Dropdown Navigation
    // ==========================================
    function initDropdowns() {
        DOM.dropdownBtns.forEach(btn => {
            const dropdown = btn.nextElementSibling;
            
            // Toggle dropdown on click (for mobile)
            btn.addEventListener('click', (e) => {
                if (window.innerWidth <= 900) {
                    e.preventDefault();
                    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
                    
                    // Close other dropdowns
                    DOM.dropdownBtns.forEach(otherBtn => {
                        if (otherBtn !== btn) {
                            otherBtn.setAttribute('aria-expanded', 'false');
                            otherBtn.nextElementSibling?.classList.remove('is-open');
                        }
                    });
                    
                    btn.setAttribute('aria-expanded', !isExpanded);
                    dropdown?.classList.toggle('is-open');
                }
            });

            // Keyboard navigation
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
                
                if (e.key === 'ArrowDown' && dropdown) {
                    e.preventDefault();
                    const firstLink = dropdown.querySelector('a');
                    firstLink?.focus();
                }
            });

            // Arrow key navigation within dropdown
            if (dropdown) {
                const links = dropdown.querySelectorAll('a');
                links.forEach((link, index) => {
                    link.addEventListener('keydown', (e) => {
                        if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            links[index + 1]?.focus();
                        }
                        if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (index === 0) {
                                btn.focus();
                            } else {
                                links[index - 1]?.focus();
                            }
                        }
                        if (e.key === 'Escape') {
                            btn.setAttribute('aria-expanded', 'false');
                            dropdown.classList.remove('is-open');
                            btn.focus();
                        }
                    });
                });
            }
        });

        // Reset dropdowns on resize
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > 900) {
                DOM.dropdownBtns.forEach(btn => {
                    btn.setAttribute('aria-expanded', 'false');
                    btn.nextElementSibling?.classList.remove('is-open');
                });
                DOM.nav?.classList.remove('is-open');
                document.body.style.overflow = '';
            }
        }, 150));
    }

    // ==========================================
    // Animated Counter
    // ==========================================
    function initCounters() {
        if (!DOM.statsNumbers.length) return;

        const animateCounter = (element) => {
            const target = parseInt(element.dataset.count, 10);
            const duration = 2000;
            const startTime = performance.now();
            
            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out-cubic)
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(easeOut * target);
                
                element.textContent = current;
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            };
            
            requestAnimationFrame(updateCounter);
        };

        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        DOM.statsNumbers.forEach(stat => observer.observe(stat));
    }

    // ==========================================
    // Scroll Animations
    // ==========================================
    function initScrollAnimations() {
        if (!DOM.animatedElements.length) return;

        // Add animation class
        DOM.animatedElements.forEach(el => {
            el.classList.add('animate-fade-up');
        });

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger animations
                    const delay = index * 100;
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        DOM.animatedElements.forEach(el => observer.observe(el));
    }

    // ==========================================
    // Smooth Scroll for Anchor Links
    // ==========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    e.preventDefault();
                    const headerHeight = DOM.header?.offsetHeight || 72;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without scrolling
                    history.pushState(null, null, targetId);
                    
                    // Focus management for accessibility
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                }
            });
        });
    }

    // ==========================================
    // Prefers Reduced Motion
    // ==========================================
    function respectMotionPreference() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (mediaQuery.matches) {
            // Disable animations
            document.documentElement.style.setProperty('--transition-fast', '0ms');
            document.documentElement.style.setProperty('--transition-base', '0ms');
            document.documentElement.style.setProperty('--transition-slow', '0ms');
            
            // Remove animation classes
            DOM.animatedElements.forEach(el => {
                el.classList.remove('animate-fade-up');
                el.classList.add('is-visible');
            });
        }
    }

    // ==========================================
    // Focus Management
    // ==========================================
    function initFocusManagement() {
        // Show focus outline only for keyboard navigation
        document.body.addEventListener('mousedown', () => {
            document.body.classList.add('using-mouse');
        });
        
        document.body.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.remove('using-mouse');
            }
        });
    }

    // ==========================================
    // Initialize
    // ==========================================
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAll);
        } else {
            initAll();
        }
    }

    function initAll() {
        initHeaderScroll();
        initMobileNav();
        initDropdowns();
        initCounters();
        initScrollAnimations();
        initSmoothScroll();
        respectMotionPreference();
        initFocusManagement();
        
        // Log initialization
        console.log('ND Biotech Group website initialized');
    }

    // Start
    init();

})();
