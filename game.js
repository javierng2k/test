/**
 * Game Mechanics & UI Control Engine
 */

// 1. STATE MANAGEMENT
const state = {
    day: 27,
    monthIndex: 0,
    months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    daysInMonth: 31,
    energy: 100,
    maxEnergy: 100,
    stats: { STR: 62, DEX: 43, CON: 21, INT: 4, LUK: 31, AP: 0 },
    training: {
        STR: { level: 1, progress: 0 },
        DEX: { level: 1, progress: 0 },
        CON: { level: 1, progress: 0 },
        INT: { level: 1, progress: 0 },
        LUK: { level: 1, progress: 0 }
    },
    isDesktop: true,
    userOverride: null
};

// Key bindings configuration
const KEY_MAP = {
    '1': 'STR',
    '2': 'DEX',
    '3': 'CON',
    '4': 'INT',
    '5': 'LUK'
};

// Pointer State Tracking
let isPointerDown = false;
let currentTargetButton = null;
let currentActiveKey = null;
let activeActionButton = null;

// 2. DOM ELEMENT CACHE
const DOM = {
    calMonth: document.getElementById('cal-month'),
    calDay: document.getElementById('cal-day'),
    energyBar: document.getElementById('energy-bar'),
    energyText: document.getElementById('energy-text'),
    eventLogMobile: document.getElementById('event-log-mobile'),
    eventLogDesktop: document.getElementById('event-log-desktop'),
    charAvatar: document.getElementById('character-avatar'),
    charEmoji: document.getElementById('char-status-emoji'),
    charStatusText: document.getElementById('char-status-text'),
    deviceBadgeText: document.getElementById('device-text'),
    deviceIcon: document.getElementById('device-icon'),
    btnToggleDevice: document.getElementById('btn-toggle-device'),
    menuModal: document.getElementById('menu-modal'),
    btnMenu: document.getElementById('btn-menu'),
    btnCloseMenu: document.getElementById('btn-close-menu'),
    btnResetGame: document.getElementById('btn-reset-game'),
    btnAddAp: document.getElementById('btn-add-ap'),
    statButtons: document.querySelectorAll('.stat-btn'),
    actionButtons: document.querySelectorAll('.action-btn')
};

// 3. CORE UTILITIES & LOGGING
function detectDeviceMode() {
    if (state.userOverride) {
        state.isDesktop = state.userOverride === 'desktop';
    } else {
        const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
        const isWideScreen = window.innerWidth >= 1024;
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        
        state.isDesktop = hasFinePointer && isWideScreen && !isTouch;
    }

    if (state.isDesktop) {
        DOM.deviceIcon.textContent = '💻';
        DOM.deviceBadgeText.textContent = 'Desktop Mode';
        document.querySelectorAll('.desktop-only-text').forEach(el => el.classList.remove('hidden'));
    } else {
        DOM.deviceIcon.textContent = '📱';
        DOM.deviceBadgeText.textContent = 'Mobile/Tablet Mode';
        document.querySelectorAll('.desktop-only-text').forEach(el => el.classList.add('hidden'));
    }
}

function toggleDeviceModeOverride() {
    state.userOverride = state.isDesktop ? 'mobile' : 'desktop';
    detectDeviceMode();
    log(`Manually toggled view mode to <b>${state.isDesktop ? 'Desktop' : 'Mobile/Tablet'}</b>.`, 'text-blue-500');
}

function getCalculatedGain(stat, baseGain) {
    const lvl = state.training[stat].level;
    return baseGain * lvl;
}

function log(msg, colorClass = "text-slate-700") {
    const timeTag = `<span class="text-slate-400">[Day ${state.day} ${state.months[state.monthIndex]}]</span> `;
    
    [DOM.eventLogMobile, DOM.eventLogDesktop].forEach(logContainer => {
        if (logContainer) {
            const entry = document.createElement('div');
            entry.className = `py-0.5 ${colorClass}`;
            entry.innerHTML = `${timeTag}${msg}`;
            logContainer.prepend(entry);
        }
    });
}

function advanceDays(days = 1) {
    state.day += days;
    if (state.day > state.daysInMonth) {
        state.day = 1;
        state.monthIndex = (state.monthIndex + 1) % 12;
    }
    updateUI();
}

// 4. ANIMATION EFFECTS
function triggerFloatingText(text, isPositive = true) {
    const container = document.getElementById('floating-popups');
    const el = document.createElement('div');
    el.className = `absolute font-black text-xl sm:text-2xl header-font transition-all duration-700 pointer-events-none drop-shadow-md ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`;
    el.textContent = text;
    el.style.transform = 'translateY(0px)';
    el.style.opacity = '1';

    container.appendChild(el);

    requestAnimationFrame(() => {
        el.style.transform = 'translateY(-45px)';
        el.style.opacity = '0';
    });

    setTimeout(() => el.remove(), 750);
}

function triggerCharAnimation(type = 'bounce') {
    if (type === 'bounce') {
        DOM.charAvatar.style.transform = 'scale(1.15) translateY(-6px)';
        setTimeout(() => DOM.charAvatar.style.transform = 'scale(1) translateY(0)', 200);
    } else if (type === 'shake') {
        DOM.charAvatar.style.transform = 'translateX(-8px)';
        setTimeout(() => DOM.charAvatar.style.transform = 'translateX(8px)', 80);
        setTimeout(() => DOM.charAvatar.style.transform = 'translateX(-5px)', 160);
        setTimeout(() => DOM.charAvatar.style.transform = 'translateX(0)', 240);
    }
}

// 5. UI RENDER ENGINE
function updateUI() {
    // Update Stats
    for (const [stat, val] of Object.entries(state.stats)) {
        const el = document.getElementById(`val-${stat}`);
        if (el) el.textContent = val;
    }

    // Update Training Buttons
    for (const [stat, data] of Object.entries(state.training)) {
        const lvlEl = document.getElementById(`level-${stat}`);
        if (lvlEl) lvlEl.textContent = `Lv. ${data.level}`;

        const dotsContainer = document.getElementById(`dots-${stat}`);
        if (dotsContainer) {
            const dots = dotsContainer.children;
            for (let i = 0; i < 3; i++) {
                dots[i].className = i < data.progress 
                    ? "w-1.5 h-1.5 rounded-full bg-blue-700 shadow-sm transition-all duration-200" 
                    : "w-1.5 h-1.5 rounded-full bg-slate-400 transition-all duration-200";
            }
        }
    }

    DOM.calMonth.textContent = state.months[state.monthIndex];
    DOM.calDay.textContent = state.day;

    const pct = Math.max(0, Math.min(100, (state.energy / state.maxEnergy) * 100));
    DOM.energyBar.style.width = `${pct}%`;
    DOM.energyText.textContent = `${state.energy} / ${state.maxEnergy}`;

    if (pct < 25) {
        DOM.energyBar.style.background = 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)';
    } else if (pct < 50) {
        DOM.energyBar.style.background = 'linear-gradient(180deg, #eab308 0%, #ca8a04 100%)';
    } else {
        DOM.energyBar.style.background = 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)';
    }
}

// 6. STAT PREVIEW & COMMIT MECHANICS
function clearAllPreviews() {
    DOM.statButtons.forEach(btn => btn.classList.remove('pressing'));
    document.querySelectorAll('[id^="cell-"]').forEach(c => c.classList.remove('stat-preview-active'));
    document.querySelectorAll('[id^="prev-"]').forEach(p => p.classList.add('hidden'));
    DOM.charEmoji.textContent = '😊';
    DOM.charStatusText.textContent = 'Ready for daily activities';
}

function setActivePreview(btn) {
    if (currentTargetButton === btn) return;

    clearAllPreviews();

    currentTargetButton = btn;
    if (!btn) return;

    btn.classList.add('pressing');
    const stat = btn.dataset.stat;
    const baseGain = parseInt(btn.dataset.base);
    const calculatedGain = getCalculatedGain(stat, baseGain);
    const currentLevel = state.training[stat].level;
    const currentProg = state.training[stat].progress;

    const cell = document.getElementById(`cell-${stat}`);
    const prevEl = document.getElementById(`prev-${stat}`);
    if (cell && prevEl) {
        cell.classList.add('stat-preview-active');
        prevEl.textContent = `+${calculatedGain}`;
        prevEl.classList.remove('hidden');
    }

    DOM.charEmoji.textContent = '🏋️';
    DOM.charStatusText.textContent = `Previewing +${calculatedGain} ${stat} (${stat} Lv.${currentLevel}, ${currentProg}/3)`;
}

function commitStatTrain(btn) {
    if (!btn) return;

    const stat = btn.dataset.stat;
    const baseGain = parseInt(btn.dataset.base);
    const staminaCost = parseInt(btn.dataset.stamina);
    const calculatedGain = getCalculatedGain(stat, baseGain);

    if (state.energy < staminaCost) {
        log(`Not enough stamina to train ${stat}! (Needs ${staminaCost})`, 'text-red-500 font-bold');
        triggerCharAnimation('shake');
        DOM.charEmoji.textContent = '😫';
        return;
    }

    state.stats[stat] += calculatedGain;
    state.energy = Math.max(0, state.energy - staminaCost);
    
    state.training[stat].progress += 1;
    let leveledUp = false;

    if (state.training[stat].progress >= 3) {
        state.training[stat].progress = 0;
        state.training[stat].level += 1;
        leveledUp = true;
    }

    advanceDays(1);
    triggerFloatingText(`+${calculatedGain} ${stat}!`);
    triggerCharAnimation('bounce');

    if (leveledUp) {
        btn.classList.add('level-up-anim');
        setTimeout(() => btn.classList.remove('level-up-anim'), 650);
        triggerFloatingText(`🎉 ${stat} LVL UP! (Lv. ${state.training[stat].level})`, true);
        log(`⚡ <b>${stat} Training Leveled Up to Lv. ${state.training[stat].level}!</b> Stat gain increased!`, 'text-blue-600 font-extrabold');
        DOM.charEmoji.textContent = '🌟';
        DOM.charStatusText.textContent = `${stat} Training Leveled Up!`;
    } else {
        log(`Trained hard! Improved <b class="text-blue-600">${stat}</b> by +${calculatedGain} (${stat} Lv.${state.training[stat].level}, ${state.training[stat].progress}/3).`);
        DOM.charEmoji.textContent = '🔥';
        DOM.charStatusText.textContent = `Boosted ${stat}!`;
    }
}

// 7. INPUT LISTENERS
function getStatBtnAtPoint(x, y) {
    const hitEl = document.elementFromPoint(x, y);
    if (!hitEl) return null;
    return hitEl.closest('.stat-btn');
}

// Pointer Events
window.addEventListener('pointerdown', (e) => {
    const btn = getStatBtnAtPoint(e.clientX, e.clientY);
    if (btn) {
        isPointerDown = true;
        setActivePreview(btn);
    }
});

window.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    const btn = getStatBtnAtPoint(e.clientX, e.clientY);
    setActivePreview(btn);
});

function handlePointerUp() {
    if (!isPointerDown) return;
    isPointerDown = false;

    const btn = currentTargetButton;
    clearAllPreviews();
    currentTargetButton = null;

    if (btn) {
        commitStatTrain(btn);
    }
}

window.addEventListener('pointerup', handlePointerUp);
window.addEventListener('pointercancel', () => {
    isPointerDown = false;
    clearAllPreviews();
    currentTargetButton = null;
});

// Keyboard Controls
window.addEventListener('keydown', (e) => {
    if (e.repeat) return;

    const stat = KEY_MAP[e.key];
    if (stat) {
        const btn = document.querySelector(`[data-stat="${stat}"]`);
        if (btn) {
            currentActiveKey = e.key;
            setActivePreview(btn);
        }
    } else if (e.key.toLowerCase() === 'r') {
        document.getElementById('btn-rest').click();
    } else if (e.key.toLowerCase() === 'c') {
        document.getElementById('btn-recreation').click();
    } else if (e.key.toLowerCase() === 'q') {
        document.getElementById('btn-quest').click();
    } else if (e.code === 'Space' && currentTargetButton) {
        e.preventDefault();
        const btn = currentTargetButton;
        clearAllPreviews();
        currentTargetButton = null;
        commitStatTrain(btn);
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === currentActiveKey && currentTargetButton) {
        const btn = currentTargetButton;
        clearAllPreviews();
        currentTargetButton = null;
        currentActiveKey = null;
        commitStatTrain(btn);
    }
});

// Bottom Action Handlers
DOM.actionButtons.forEach(btn => {
    const action = btn.dataset.action;

    const handleStart = (e) => {
        e.preventDefault();
        activeActionButton = btn;
        btn.classList.add('pressing');

        if (action === 'rest') {
            DOM.charEmoji.textContent = '😴';
            DOM.charStatusText.textContent = 'Previewing: Full Stamina Restore (+1 Day)';
        } else if (action === 'recreation') {
            DOM.charEmoji.textContent = '🎮';
            DOM.charStatusText.textContent = 'Previewing: +1 Ability Point, +20 Stamina';
        } else if (action === 'quest') {
            DOM.charEmoji.textContent = '⚔️';
            DOM.charStatusText.textContent = 'Previewing: Quest Battle (-30 Stamina)';
        }
    };

    const handleCancel = () => {
        if (activeActionButton === btn) {
            activeActionButton = null;
        }
        btn.classList.remove('pressing');
        DOM.charEmoji.textContent = '😊';
        DOM.charStatusText.textContent = 'Ready for daily activities';
    };

    const handleCommit = () => {
        if (activeActionButton !== btn) return;
        handleCancel();

        if (action === 'rest') {
            state.energy = state.maxEnergy;
            advanceDays(1);
            triggerFloatingText(`Stamina Restored!`, true);
            log(`Took a full day rest. Stamina fully restored to 100!`, 'text-emerald-600 font-semibold');
            DOM.charEmoji.textContent = '😌';
        } else if (action === 'recreation') {
            state.energy = Math.min(state.maxEnergy, state.energy + 20);
            state.stats.AP += 1;
            advanceDays(1);
            triggerFloatingText(`+1 AP!`, true);
            log(`Enjoyed leisure time! Gained <b class="text-purple-600">+1 AP</b> and restored 20 Stamina.`, 'text-amber-600 font-semibold');
            DOM.charEmoji.textContent = '🥳';
        } else if (action === 'quest') {
            if (state.energy < 30) {
                log(`Too tired for a quest! Rest first.`, 'text-red-500 font-bold');
                triggerCharAnimation('shake');
                DOM.charEmoji.textContent = '😵';
                return;
            }
            state.energy -= 30;
            advanceDays(2);
            
            const goldGain = Math.floor(Math.random() * 3) + 1;
            const randomStat = ['STR', 'DEX', 'CON', 'INT', 'LUK'][Math.floor(Math.random() * 5)];
            state.stats[randomStat] += goldGain;

            triggerFloatingText(`Quest Victory! +${goldGain} ${randomStat}`, true);
            triggerCharAnimation('bounce');
            log(`Completed a Quest! Earned <b class="text-indigo-600">+${goldGain} ${randomStat}</b>! (-30 Stamina, 2 Days passed)`, 'text-indigo-600 font-semibold');
            DOM.charEmoji.textContent = '🏆';
        }

        updateUI();
    };

    btn.addEventListener('pointerdown', handleStart);
    btn.addEventListener('pointerup', handleCommit);
    btn.addEventListener('pointerleave', handleCancel);
});

// Menu Modal Controls
function toggleMenu() {
    DOM.menuModal.classList.toggle('hidden');
}

function resetGame() {
    state.day = 27;
    state.monthIndex = 0;
    state.energy = 100;
    state.stats = { STR: 62, DEX: 43, CON: 21, INT: 4, LUK: 31, AP: 0 };
    state.training = {
        STR: { level: 1, progress: 0 },
        DEX: { level: 1, progress: 0 },
        CON: { level: 1, progress: 0 },
        INT: { level: 1, progress: 0 },
        LUK: { level: 1, progress: 0 }
    };
    updateUI();
    log('Game reset to initial mockup values.', 'text-slate-500 font-bold');
    toggleMenu();
}

function addAP() {
    state.stats.AP += 5;
    updateUI();
    log('Added +5 Ability Points via options.', 'text-purple-600 font-bold');
    toggleMenu();
}

// Function to open the registration modal from anywhere (like options menu)
function openRegisterModal() {
    // If you have a menu modal open, close it first
    const menuModal = document.getElementById('menu-modal');
    if (menuModal) menuModal.classList.add('hidden');

    // Open the registration modal using the function from ui-auth.js
    if (typeof toggleAuthModal === 'function') {
        toggleAuthModal(true);
    }
}

// 8. EVENT ATTACHMENTS & INITIALIZATION
DOM.btnToggleDevice.addEventListener('click', toggleDeviceModeOverride);
DOM.btnMenu.addEventListener('click', toggleMenu);
DOM.btnCloseMenu.addEventListener('click', toggleMenu);
DOM.btnResetGame.addEventListener('click', resetGame);
DOM.btnAddAp.addEventListener('click', addAP);

window.addEventListener('resize', detectDeviceMode);

// Initialize Engine
detectDeviceMode();
updateUI();