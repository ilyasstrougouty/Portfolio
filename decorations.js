/**
 * decorations.js
 * Transforms the portfolio into a hand-drawn map with mountains, clouds, and rivers.
 */

const DECORATIONS = {
    mountain: `<svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Sketchy Mountain Peaks -->
        <path d="M10 70 L50 30 L80 60 L120 15 L160 55 L190 40" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="sketch-path" />
        <path d="M15 72 Q 45 35, 55 40 M75 62 Q 115 20, 125 25 M155 58 Q 185 45, 195 50" stroke="currentColor" stroke-width="1" stroke-opacity="0.6" stroke-linecap="round" />
        <path d="M45 40 L55 50 M115 25 L125 35 M155 50 L165 55" stroke="currentColor" stroke-width="0.8" stroke-opacity="0.4" stroke-linecap="round" />
    </svg>`,
    cloud: `<svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 30 C 10 30, 10 20, 25 20 C 30 10, 50 10, 60 20 C 75 20, 75 30, 65 35" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" class="sketch-path" />
        <path d="M25 25 Q 45 15, 65 25" stroke="currentColor" stroke-width="0.8" stroke-opacity="0.4" stroke-linecap="round" />
    </svg>`,
    river: `<svg viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 50 Q 50 20, 100 50 T 200 50 T 300 50" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="sketch-path" />
        <path d="M10 55 Q 60 25, 110 55 T 210 55" stroke="currentColor" stroke-width="0.8" stroke-opacity="0.3" stroke-linecap="round" />
    </svg>`,
    circle: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10 C 20 10, 10 40, 10 50 C 10 70, 40 90, 50 90 C 70 90, 90 70, 90 50 C 90 30, 70 10, 50 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="sketch-path" />
        <path d="M48 15 C 25 15, 15 45, 15 52" stroke="currentColor" stroke-width="1" stroke-opacity="0.5" stroke-linecap="round" />
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

    // --- LANDMARKS ---
    
    // 1. HERO Landmark
    layer.appendChild(createDecoration('pin', 'text-purple-500 w-8', { top: '60px', left: '50%', transform: 'translateX(-50%)' }));
    layer.appendChild(createDecoration('mountain', 'text-zinc-400 w-96 opacity-40', { top: '450px', right: '5%', transform: 'rotate(-2deg)' }));
    layer.appendChild(createDecoration('cloud', 'text-zinc-400 w-32 opacity-20', { top: '150px', left: '10%', transform: 'rotate(5deg)' }));

    // 2. EDUCATION Landmark
    const eduPin = createDecoration('pin', 'text-purple-500 w-8', { top: '1500px', left: '10%' });
    eduPin.id = 'decoration-edu-pin';
    layer.appendChild(eduPin);
    
    layer.appendChild(createDecoration('river', 'text-purple-500/20 w-[40rem] opacity-30', { top: '1600px', left: '-5%', transform: 'rotate(-5deg)' }));
    
    // The ENIADB Circle
    const eniadCircle = createDecoration('circle', 'text-purple-500/50 w-24 h-24', {});
    eniadCircle.id = 'decoration-eniad-circle';
    layer.appendChild(eniadCircle);

    // 3. PROJECTS Landmark
    const projPin = createDecoration('pin', 'text-purple-400 w-8', { top: '3000px', right: '10%' });
    projPin.id = 'decoration-proj-pin';
    layer.appendChild(projPin);
    
    layer.appendChild(createDecoration('cloud', 'text-zinc-600 w-48 opacity-30', { top: '3200px', right: '5%', transform: 'rotate(-5deg)' }));
    layer.appendChild(createDecoration('bird', 'text-zinc-600 w-16 opacity-40', { top: '3500px', left: '15%', transform: 'rotate(10deg)' }));

    // 4. FOOTER Landmark
    layer.appendChild(createDecoration('mountain', 'text-zinc-500 w-[40rem] opacity-30', { bottom: '150px', left: '5%', transform: 'scaleX(-1) rotate(4deg)' }));
    layer.appendChild(createDecoration('cloud', 'text-zinc-700 w-48 opacity-20', { bottom: '400px', right: '10%' }));

    // Initial position update
    setTimeout(updateDecorationPositions, 500);
    window.addEventListener('resize', updateDecorationPositions);
    
    // Add draw-on animation style
    const style = document.createElement('style');
    style.textContent = `
        .sketch-path {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: draw 2.5s ease-out forwards;
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

    // Circle on ENIADB
    const eniadLogo = document.getElementById('eniad-logo-container');
    const eniadCircle = document.getElementById('decoration-eniad-circle');
    if (eniadLogo && eniadCircle) {
        const rect = eniadLogo.getBoundingClientRect();
        eniadCircle.style.top = `${rect.top + scrollY + (rect.height / 2) - 72}px`;
        eniadCircle.style.left = `${rect.left + scrollX + (rect.width / 2) - 48}px`;
    }

    // Pins on Headers
    const eduHeader = document.querySelector('#education h3');
    const eduPin = document.getElementById('decoration-edu-pin');
    if (eduHeader && eduPin) {
        const hRect = eduHeader.getBoundingClientRect();
        eduPin.style.top = `${hRect.top + scrollY - 65}px`;
        eduPin.style.left = `${hRect.left + scrollX - 45}px`;
    }

    const projHeader = document.querySelector('#projects h3');
    const projPin = document.getElementById('decoration-proj-pin');
    if (projHeader && projPin) {
        const pRect = projHeader.getBoundingClientRect();
        projPin.style.top = `${pRect.top + scrollY - 65}px`;
        projPin.style.left = `${pRect.right + scrollX + 15}px`;
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDecorations);
} else {
    initDecorations();
}
