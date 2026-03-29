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
    pin: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5s-7-7-7-12.5a7 7 0 1114 0c0 5.5-7 12.5-7 12.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="sketch-path" />
        <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5" />
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

    // 1. TOP PURPLE PIN (Beginning of trajectory)
    const topPin = createDecoration('pin', 'text-purple-500 w-8', {
        top: '50px',
        left: '50%',
        transform: 'translateX(-50%)'
    });
    layer.appendChild(topPin);

    // 2. HERO MOUNTAIN (Below the name)
    const heroMountain = createDecoration('mountain', 'text-zinc-400 w-64 md:w-96 opacity-30', {
        top: '400px',
        right: '5%',
        transform: 'rotate(-2deg)'
    });
    layer.appendChild(heroMountain);

    // 3. MIDDLE PINS (Anchored to section transitions)
    const eduPin = createDecoration('pin', 'text-purple-500 w-8', {
        top: '1200px', // Aproximately education section start
        left: '10%'
    });
    eduPin.id = 'decoration-edu-pin';
    layer.appendChild(eduPin);

    const projPin = createDecoration('pin', 'text-purple-400 w-8', {
        top: '2200px', // Approximately projects section start
        right: '10%'
    });
    projPin.id = 'decoration-proj-pin';
    layer.appendChild(projPin);

    // 4. THE SKETCHY CIRCLE ABOVE ENIADB
    const eniadCircle = createDecoration('circle', 'text-purple-500/50 w-24 h-24', {
        zIndex: '5'
    });
    eniadCircle.id = 'decoration-eniad-circle';
    layer.appendChild(eniadCircle);

    // 5. BIRDS (Clustered)
    const birdGroup = createDecoration('bird', 'text-zinc-600 w-16 opacity-40', {
        top: '2800px',
        left: '60%',
        transform: 'rotate(-10deg)'
    });
    layer.appendChild(birdGroup);

    // 6. BOTTOM MOUNTAIN
    const bottomMountain = createDecoration('mountain', 'text-zinc-500 w-72 md:w-[32rem] opacity-20', {
        bottom: '100px',
        left: '10%',
        transform: 'scaleX(-1) rotate(5deg)'
    });
    layer.appendChild(bottomMountain);

    // Initial position update
    setTimeout(updateDecorationPositions, 500);
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
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // A. POSITION CIRCLE ON ENIADB
    const eniadLogo = document.getElementById('eniad-logo-container');
    const eniadCircle = document.getElementById('decoration-eniad-circle');
    
    if (eniadLogo && eniadCircle) {
        const rect = eniadLogo.getBoundingClientRect();
        const centerX = rect.left + scrollX + (rect.width / 2);
        const centerY = rect.top + scrollY + (rect.height / 2);
        eniadCircle.style.top = `${centerY - 72}px`;
        eniadCircle.style.left = `${centerX - 48}px`;
    }

    // B. POSITION PINS ON SECTION HEADERS
    const eduHeader = document.querySelector('#education h3');
    const eduPin = document.getElementById('decoration-edu-pin');
    if (eduHeader && eduPin) {
        const hRect = eduHeader.getBoundingClientRect();
        eduPin.style.top = `${hRect.top + scrollY - 60}px`;
        eduPin.style.left = `${hRect.left + scrollX - 40}px`;
    }

    const projHeader = document.querySelector('#projects h3');
    const projPin = document.getElementById('decoration-proj-pin');
    if (projHeader && projPin) {
        const pRect = projHeader.getBoundingClientRect();
        projPin.style.top = `${pRect.top + scrollY - 60}px`;
        projPin.style.left = `${pRect.right + scrollX + 20}px`;
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDecorations);
} else {
    initDecorations();
}
