/* 
   ARCHITECT.OS | Portfolio Logic
   Handles: Splash Animation, Content Reveal, and GitHub Data Fetching
*/

document.addEventListener('DOMContentLoaded', () => {
    // Always start from the top on load/refresh
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Flag to prevent scroll events from interrupting the entrance animation of the SVG line
    let isPathAnimating = true;
    let hasAnimatedMapEntrance = false;

    // 1. Language Sequence Handler
    const greetings = [
        "Hello",
        "مرحبا", 
        "Bonjour", 
        "Привет", 
        "你好",
        "नमस्ते",
        "ⴰⵣⵓⵍ"
    ];
    
    const greetingEl = document.getElementById('greeting');
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    
    let currentGreeting = 0;
    
    // Timing curve: "Hello" lingers, then accelerates
    const getDisplayDuration = (index) => {
        if (index === 0) return 1000;
        if (index === 1) return 350;
        return Math.max(120, Math.round(300 * Math.pow(0.55, index - 2)));
    };
    
    // Fade speed also accelerates
    const getFadeDuration = (index) => {
        if (index === 0) return 250;
        return Math.max(60, Math.round(200 * Math.pow(0.55, index - 1)));
    };
    
    const cycleGreetings = () => {
        if (currentGreeting < greetings.length) {
            // First greeting ("Hello") has a special fade animation
            if (currentGreeting === 0) {
                greetingEl.style.transition = `opacity 250ms ease, transform 250ms ease`;
                greetingEl.textContent = '• ' + greetings[currentGreeting];
                requestAnimationFrame(() => {
                    greetingEl.style.opacity = '1';
                    greetingEl.style.transform = 'scale(1) translateY(0)';
                });
                
                setTimeout(() => {
                    // Instant swap to next greeting (eliminating the fade-out animation)
                    currentGreeting++;
                    cycleGreetings();
                }, 1000);
            } else {
                // Subsequent greetings show "normally" (instantly)
                greetingEl.style.transition = 'none';
                greetingEl.style.transform = 'none';
                greetingEl.style.filter = 'none';
                
                // Refined "speed" style: full opacity for consistent color
                greetingEl.style.opacity = '1';
                greetingEl.style.letterSpacing = 'normal';
                
                greetingEl.textContent = '• ' + greetings[currentGreeting];
                
                // Exponential acceleration curve for the "compound movement" feel
                const baseDelay = 400;
                const accelerationFactor = 0.6;
                const currentDelay = Math.max(40, Math.round(baseDelay * Math.pow(accelerationFactor, currentGreeting - 1)));
                
                setTimeout(() => {
                    currentGreeting++;
                    if (currentGreeting < greetings.length) {
                        cycleGreetings();
                    } else {
                        fadeOutSplash();
                    }
                }, currentDelay); 
            }
        }
    };
    
    const fadeOutSplash = () => {
        // Curtain slide-up reveal (like the reference site)
        splashScreen.style.transition = 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)';
        splashScreen.style.transform = 'translateY(-100%)';
        splashScreen.style.pointerEvents = 'none';
        
        // Show main content underneath immediately
        mainContent.classList.remove('invisible');
        mainContent.classList.add('opacity-100');
        
        setTimeout(() => {
            splashScreen.remove();
            document.body.classList.remove('overflow-hidden');
            
            // Trigger Reveal Animations
            triggerReveals();
            
            // Generate Map Path now that content is visible
            setTimeout(generateMapPath, 100);
            
            // Fetch GitHub Data
            fetchGitHubStats('ilyasstrougouty');
            fetchRepoStats('tikkocampus', 'tikko');
        }, 900);
    };

    // 2. Fetch GitHub Statistics from our Backend
    const fetchGitHubStats = async (username) => {
        const contributionGridEl = document.getElementById('contribution-grid');
        const totalCommitsEl = document.getElementById('total-contributions');
        
        try {
            const response = await fetch(`/api/github-stats/${username}`);
            const data = await response.json();
            
            if (data.error) throw new Error(data.error);

            // Update Stats
            if (totalCommitsEl) totalCommitsEl.textContent = data.totalContributions || 0;

            // Render Contribution Grid (Exact GitHub Style)
            if (contributionGridEl && data.weeks) {
                renderContributionGrid(data.weeks);
            }

        } catch (error) {
            console.error('Fetch error:', error);
            if (totalCommitsEl) totalCommitsEl.textContent = '!';
        }
    };

    // Fetch specific GitHub Repository Statistics (Stars, Forks, Description, Topics)
    const fetchRepoStats = async (repoName, cardId) => {
        try {
            const response = await fetch(`https://api.github.com/repos/ilyasstrougouty/${repoName}`);
            if (!response.ok) return;
            const data = await response.json();
            
            const starsEl = document.getElementById(`${cardId}-stars`);
            const forksEl = document.getElementById(`${cardId}-forks`);
            const descEl = document.getElementById(`${cardId}-desc`);
            const topicsEl = document.getElementById(`${cardId}-topics`);
            
            if (starsEl) starsEl.textContent = data.stargazers_count;
            if (forksEl) forksEl.textContent = data.forks_count;
            
            if (descEl && data.description) {
                descEl.textContent = data.description;
                descEl.removeAttribute('data-i18n'); // Remove translation key to avoid overwrite
            }
            
            if (topicsEl && data.topics && data.topics.length > 0) {
                topicsEl.innerHTML = '';
                data.topics.slice(0, 4).forEach(topic => {
                    const span = document.createElement('span');
                    span.className = 'skill-tag';
                    span.textContent = topic.replace(/-/g, ' '); // simple formatting
                    topicsEl.appendChild(span);
                });
            }
        } catch (error) {
            console.error(`Error fetching stats for ${repoName}:`, error);
        }
    };

    /**
     * Renders the GitHub Contribution Grid (HTML/CSS dynamically generated)
     */
    const renderContributionGrid = (weeks) => {
        const grid = document.getElementById('contribution-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        // GitHub empty square color
        const EMPTY_COLOR = '#161b22';

        weeks.forEach((week) => {
            const weekCol = document.createElement('div');
            weekCol.className = 'flex flex-col gap-[2px] md:gap-[3px] flex-shrink-0';
            
            week.contributionDays.forEach((day) => {
                const daySquare = document.createElement('div');
                // Use smaller squares on mobile, standard 10px on md screens, to fit 53 weeks without scroll
                daySquare.className = 'w-[4px] h-[4px] sm:w-[5px] sm:h-[5px] md:w-[10px] md:h-[10px] rounded-[1px] md:rounded-[2px] transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer flex-shrink-0';
                
                // If count is 0, use our custom dark color, otherwise use GitHub's returned color
                daySquare.style.backgroundColor = day.contributionCount > 0 ? day.color : EMPTY_COLOR;
                
                // Add tooltip-like info
                daySquare.title = `${day.contributionCount} contributions on ${day.date}`;
                
                weekCol.appendChild(daySquare);
            });
            
            grid.appendChild(weekCol);
        });
    };

    // 3. Reveal on Scroll Observer
    const triggerReveals = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal, .reveal-delay').forEach(el => observer.observe(el));
    };

    // 4. Map Path Drawing Logic
    const generateMapPath = () => {
        // Get all sections
        const sections = Array.from(document.querySelectorAll('main section'));
        if (sections.length < 2) return;

        const maskPath = document.getElementById('mask-path');
        const drawPath = document.getElementById('draw-path');
        if (!maskPath || !drawPath) return;

        const points = [];
        let isLeft = true;
        const isMobile = window.innerWidth < 1024;
        const mainRect = document.querySelector('main').getBoundingClientRect();

        sections.forEach((section, index) => {
            // Find the internal content container to calculate safe gutter zones
            const container = section.querySelector('[class*="max-w-"]') || section;
            const containerRect = container.getBoundingClientRect();
            const mainRect = document.querySelector('main').getBoundingClientRect();
            
            // Safe centers for gutters (relative to main)
            const leftSafeX = (containerRect.left - mainRect.left) / 2;
            const rightSafeX = containerRect.right - mainRect.left + (mainRect.right - containerRect.right) / 2;

            if (index === 0) {
                // HERO SECTION: Specialized entrance
                const heroBtn = section.querySelector('a[href^="mailto"]');
                let startY, startX;
                
                if (isMobile && heroBtn) {
                    const btnRect = heroBtn.getBoundingClientRect();
                    startY = btnRect.top + (btnRect.height / 2) - mainRect.top;
                    startX = window.innerWidth * 0.95;
                } else {
                    startX = isMobile ? window.innerWidth * 0.95 : rightSafeX;
                    startY = section.offsetTop + (section.offsetHeight * (isMobile ? 0.2 : 0.35));
                }
                
                points.push({ x: startX, y: startY });
                
                // Exit point for Hero (to set the side for next section)
                points.push({ 
                    x: isMobile ? window.innerWidth * 0.95 : rightSafeX, 
                    y: section.offsetTop + section.offsetHeight - (isMobile ? 10 : 40) 
                });
                
                isLeft = true; // Switch to left for next section (Education)
            } else if (index === sections.length - 1) {
                // LAST SECTION (Contact): Point directly to the core CTA
                const btn = section.querySelector('a[href^="mailto"]');
                if (btn) {
                    const btnRect = btn.getBoundingClientRect();
                    const x = btnRect.left + (btnRect.width / 2) - mainRect.left;
                    const y = btnRect.top + (btnRect.height / 2) - mainRect.top - 10;
                    points.push({ x, y });
                } else {
                    points.push({ x: window.innerWidth / 2, y: section.offsetTop + 50 });
                }
            } else {
                // INTERMEDIATE SECTIONS: Double points (Entry and Exit) to stay in the gutter
                const currentSideX = isLeft ? (isMobile ? window.innerWidth * 0.05 : leftSafeX) : (isMobile ? window.innerWidth * 0.95 : rightSafeX);
                
                // Entry Point (Top of section)
                points.push({ x: currentSideX, y: section.offsetTop + (section.offsetHeight * 0.1) });
                
                // Exit Point (Bottom of section)
                points.push({ x: currentSideX, y: section.offsetTop + (section.offsetHeight * 0.9) });
                
                isLeft = !isLeft;
            }
        });

        // Create SVG Path string with Cubic Beziers for organic curves
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            
            const cp1x = prev.x;
            const cp1y = prev.y + (curr.y - prev.y) / 2;
            const cp2x = curr.x;
            const cp2y = prev.y + (curr.y - prev.y) / 2;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
        }

        maskPath.setAttribute('d', d);
        drawPath.setAttribute('d', d);

        // Initialize array for correct calculations
        const length = maskPath.getTotalLength();
        maskPath.style.strokeDasharray = length;

        if (!hasAnimatedMapEntrance) {
            // Start fully hidden (ensure no transition is active while we set this)
            maskPath.style.transition = 'none';
            maskPath.style.strokeDashoffset = length;
            // Force a browser reflow so the hidden state is immediately applied
            maskPath.getBoundingClientRect();
        }

        // Compute the target position based on current scroll
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const maxScroll = Math.max(1, documentHeight - windowHeight);
        const scrollFraction = Math.max(0, Math.min(1, scrollY / maxScroll));
        
        // Dynamically adjust start percent so line isn't way ahead on mobile
        let startPercent = (windowHeight * 0.3) / documentHeight;
        if (window.innerWidth < 1024) {
            startPercent = 0.01; // barely drawn on initial load on mobile
        }

        const visiblePercent = startPercent + scrollFraction * (1 - startPercent);
        const targetOffset = length - (length * visiblePercent);

        if (!hasAnimatedMapEntrance) {
            // Entrance animation: smoothly draw from 0 after a short delay
            requestAnimationFrame(() => {
                // Apply CSS transition for the entrance animation
                maskPath.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)';
                maskPath.style.strokeDashoffset = targetOffset.toString();

                // After animation finishes, keep a subtle smooth transition for scrolling
                setTimeout(() => {
                    maskPath.style.transition = 'stroke-dashoffset 0.4s ease-out';
                    isPathAnimating = false; // Release the lock
                    hasAnimatedMapEntrance = true;
                }, 1500);
            });
        } else {
            // ALREADY ANIMATED ENTRANCE: use the fluid scroll transition
            maskPath.style.transition = 'stroke-dashoffset 0.4s ease-out';
            maskPath.style.strokeDashoffset = targetOffset.toString();
        }
    };

    const animatePathOnScroll = () => {
        if (isPathAnimating) return; // Prevent scroll events from snapping the line while it's drawing its entrance

        const maskPath = document.getElementById('mask-path');
        if (!maskPath) return;

        const length = maskPath.getTotalLength();
        if (length === 0) return;

        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        const maxScroll = Math.max(1, documentHeight - windowHeight);
        const scrollFraction = Math.max(0, Math.min(1, scrollY / maxScroll));

        // Dynamically adjust start percent so line isn't way ahead on mobile
        let startPercent = (windowHeight * 0.3) / documentHeight;
        if (window.innerWidth < 1024) {
            startPercent = 0.01; // stay close behind user scroll
        }

        const visiblePercent = startPercent + scrollFraction * (1 - startPercent);
        const drawLength = length * visiblePercent;
        
        // ensure transition is active for buttery smooth tracking
        maskPath.style.transition = 'stroke-dashoffset 0.4s ease-out';
        maskPath.style.strokeDashoffset = (length - drawLength).toString();
    };

    // Hook listeners
    window.addEventListener('resize', () => {
        requestAnimationFrame(generateMapPath);
    });
    window.addEventListener('scroll', () => {
        requestAnimationFrame(animatePathOnScroll);
    });

    // 5. Language Switcher
    let currentLang = localStorage.getItem('lang') || 'en';
    
    const updateLanguage = () => {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (window.translations && window.translations[currentLang] && window.translations[currentLang][key]) {
                // If it's the cert toggle button and it's open, keep the 'Show Less' state translated
                if (el.id === 'certs-toggle') {
                    const extra = document.getElementById('extra-certs');
                    if (extra && !extra.classList.contains('hidden')) {
                        el.innerHTML = currentLang === 'fr' ? '− Voir Moins' : '− Show Less';
                        return;
                    }
                }
                el.innerHTML = window.translations[currentLang][key]; 
            }
        });

        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            const spans = langToggle.querySelectorAll('span');
            if (spans.length >= 3) {
                if (currentLang === 'en') {
                    spans[0].className = 'text-white';
                    spans[2].className = 'text-zinc-500 hover:text-white transition-colors cursor-pointer';
                } else {
                    spans[0].className = 'text-zinc-500 hover:text-white transition-colors cursor-pointer';
                    spans[2].className = 'text-white';
                }
            }
        }
        
        document.documentElement.lang = currentLang;
    };

    updateLanguage();

    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'fr' : 'en';
            localStorage.setItem('lang', currentLang);
            updateLanguage();
        });
    }

    // 6. Navigation Highlighting Logic
    const setupNavObserver = () => {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = Array.from(navLinks).map(link => {
            const id = link.getAttribute('href').substring(1);
            return document.getElementById(id);
        }).filter(s => s);

        const observerOptions = {
            root: null,
            rootMargin: '-40% 0px -50% 0px',
            threshold: 0
        };

        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    
                    navLinks.forEach(link => {
                        const href = link.getAttribute('href').substring(1);
                        if (href === id) {
                            link.classList.add('text-white', 'border-white/40');
                            link.classList.remove('text-zinc-500', 'border-transparent', 'font-semibold', 'scale-105');
                        } else {
                            link.classList.remove('text-white', 'border-white/40', 'font-semibold', 'scale-105');
                            link.classList.add('text-zinc-500', 'border-transparent');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => navObserver.observe(section));

        // Special case for Hero (Scroll to top)
        window.addEventListener('scroll', () => {
            if (window.scrollY < 100) {
                navLinks.forEach(link => {
                    link.classList.add('text-white');
                    link.classList.remove('text-zinc-500', 'border-white/40', 'font-semibold', 'scale-105');
                    link.classList.add('border-transparent');
                });
            }
        });
    };

    // 7. Mobile Menu Logic
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuBtn && closeMenuBtn && mobileMenuOverlay) {
        const toggleMenu = (show) => {
            if (show) {
                mobileMenuOverlay.classList.remove('opacity-0', 'pointer-events-none');
                mobileMenuOverlay.classList.add('opacity-100', 'pointer-events-auto');
                document.body.classList.add('overflow-hidden');
            } else {
                mobileMenuOverlay.classList.remove('opacity-100', 'pointer-events-auto');
                mobileMenuOverlay.classList.add('opacity-0', 'pointer-events-none');
                document.body.classList.remove('overflow-hidden');
            }
        };

        mobileMenuBtn.addEventListener('click', () => toggleMenu(true));
        closeMenuBtn.addEventListener('click', () => toggleMenu(false));
        
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Let smooth scroll happen, then close menu
                setTimeout(() => toggleMenu(false), 150);
            });
        });
    }

    // Initialize observers
    setupNavObserver();
    
    // Initialize - Delay slightly to ensure smooth first frame
    setTimeout(cycleGreetings, 300);
});
// Certifications toggle (global so inline onclick works)
function toggleCerts() {
    const extra = document.getElementById('extra-certs');
    const btn = document.getElementById('certs-toggle');
    if (!extra || !btn) return;
    
    const isHidden = extra.classList.contains('hidden');
    const currentLang = document.documentElement.lang || 'en';

    if (isHidden) {
        extra.classList.remove('hidden');
        extra.classList.add('flex');
        btn.innerHTML = currentLang === 'fr' ? '− Voir Moins' : '− Show Less';
    } else {
        extra.classList.add('hidden');
        extra.classList.remove('flex');
        btn.innerHTML = window.translations ? window.translations[currentLang]['certs.more'] : '+ 2 More';
    }
}
