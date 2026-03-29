/**
 * decorations.js
 * Adds hand-drawn "sketchy" decorative elements to the portfolio.
 */

const DECORATIONS = {
    mountain: `<svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 50 L40 20 L70 45 L110 10 L150 40 L180 30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="sketch-path" />
        <path d="M35 25 L45 35 M105 15 L115 25" stroke="currentColor" stroke-width="1" stroke-opacity="0.5" stroke-linecap="round" />
    </svg>`,
    circle: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10 C 20 10, 10 40, 10 50 C 10 70, 40 90, 50 90 C 70 90, 90 70, 90 50 C 90 30, 70 10, 50 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="sketch-path" />
    </svg>`,
    bird: `<svg viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 10 Q 15 5, 20 10 Q 25 5, 35 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="sketch-path" />
    </svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>`
};

function createDecoration(type, className, styles = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = `decoration-item absolute ${className}`;
    wrapper.innerHTML = DECORATIONS[type];
    Object.assign(wrapper.style, styles);
    return wrapper;
}

function initDecorations() {
    const layer = document.getElementById('decorations-layer');
    if (!layer) return;

    // 1. Sketchy Mountain in Hero
    const heroMountain = createDecoration('mountain', 'text-zinc-600 w-48 opacity-20', {
        top: '25%',
        right: '10%',
        transform: 'rotate(-5deg)'
    });
    layer.appendChild(heroMountain);

    // 2. Sketchy Birds in Hero/Projects
    const birds = createDecoration('bird', 'text-zinc-500 w-12 opacity-30', {
        top: '15%',
        left: '15%',
        transform: 'rotate(10deg)'
    });
    layer.appendChild(birds);

    // 3. THE CIRCLE ABOVE ENIADB LOGO
    const eniadCircle = createDecoration('circle', 'text-purple-500/40 w-24 h-24 transition-all duration-500', {
        zIndex: '5'
    });
    eniadCircle.id = 'decoration-eniad-circle';
    layer.appendChild(eniadCircle);

    // 4. Another mountain near bottom
    const bottomMountain = createDecoration('mountain', 'text-zinc-700 w-64 opacity-10', {
        bottom: '15%',
        left: '5%',
        transform: 'scaleX(-1) rotate(3deg)'
    });
    layer.appendChild(bottomMountain);

    // Initial position update with a small delay for layout settling
    setTimeout(updateDecorationPositions, 500);
    
    // Update on resize
    window.addEventListener('resize', updateDecorationPositions);
    
    // Add draw-on animation style
    const style = document.createElement('style');
    style.textContent = `
        .sketch-path {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: draw 2s ease-out forwards;
        }
        @keyframes draw {
            to { stroke-dashoffset: 0; }
        }
        .decoration-item {
            will-change: transform, top, left;
        }
    `;
    document.head.appendChild(style);
}

function updateDecorationPositions() {
    const eniadLogo = document.getElementById('eniad-logo-container');
    const eniadCircle = document.getElementById('decoration-eniad-circle');
    
    if (eniadLogo && eniadCircle) {
        const rect = eniadLogo.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        
        // Position circle exactly above the logo (centered horizontally)
        // eniadLogo is w-12 (48px), eniadCircle is w-24 (96px)
        const centerX = rect.left + scrollX + (rect.width / 2);
        const centerY = rect.top + scrollY + (rect.height / 2);
        
        eniadCircle.style.top = `${centerY - 72}px`; // Shifted up
        eniadCircle.style.left = `${centerX - 48}px`; // Centered
    }
}

// Start once DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDecorations);
} else {
    initDecorations();
}
