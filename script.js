// ========================================
// THE OUTLAST TRIALS - РАНДОМАЙЗЕР
// ПОЛНАЯ ЛОГИКА ТРЁХ РЕЖИМОВ
// ========================================

// ---------- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ----------
let currentMode = 'escalation';
let currentLevel = 1;
let currentVariators = [];
let currentEquipment = [];
let currentAmpules = { offensive: null, defensive: null, utility: null };
let currentMap = '';

// Для карточного режима
let cardModeSelections = []; // { cardId, variator }
let cardModeMaxSelections = 5;
let cardModeCards = []; // массив из 20 карт (каждая: { id, variator, isOpened, isDisabled })
let isCardGameActive = false;

// Для задания дня
let dailyVariators = [];

// DOM элементы
const resultPanel = document.getElementById('resultPanel');
const panelContent = document.getElementById('panelContent');
const panelFooter = document.getElementById('panelFooter');
const drawer = document.getElementById('drawer');
const drawerContent = document.getElementById('drawerContent');
const drawerCount = document.getElementById('drawerCount');
const drawerClear = document.getElementById('drawerClear');
const toast = document.getElementById('toast');

// ---------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ----------
function showToast(message, isError = false) {
    toast.textContent = message;
    toast.style.background = isError ? '#8b1a1a' : '#1a1a2a';
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Обновить шторку
function updateDrawer() {
    if (!drawerContent) return;
    
    if (cardModeSelections.length === 0) {
        drawerContent.innerHTML = '<div class="drawer-empty">💀 Пока ничего. Открой карту.</div>';
        drawerCount.textContent = '0';
        return;
    }
    
    drawerContent.innerHTML = cardModeSelections.map(sel => 
        `<div class="variator-chip">🎴 ${sel.variator}</div>`
    ).join('');
    drawerCount.textContent = cardModeSelections.length;
}

// Открыть шторку
function openDrawer() {
    if (cardModeSelections.length > 0) {
        drawer.classList.add('open');
    }
}

// Закрыть шторку
function closeDrawer() {
    drawer.classList.remove('open');
}

// Очистить шторку
function clearDrawer() {
    cardModeSelections = [];
    updateDrawer();
    closeDrawer();
    showToast('🗑️ Список очищен');
}

// Сохранить результат в текстовый файл
function saveResult() {
    let content = '';
    if (currentMode === 'escalation') {
        content = `【OUTLAST TRIALS】ЭСКАЛАЦИЯ - Уровень ${currentLevel}\n`;
        content += `📍 Карта: ${currentMap}\n\n`;
        content += `⚔️ СНАРЯЖЕНИЕ:\n${currentEquipment.map(e => `  - ${e}`).join('\n')}\n\n`;
        content += `💊 АМФЫ:\n  - Наступательная: ${currentAmpules.offensive}\n  - Оборонительная: ${currentAmpules.defensive}\n  - Вспомогательная: ${currentAmpules.utility}\n\n`;
        content += `⚠️ ВАРИАТОРЫ:\n${currentVariators.map(v => `  - ${v}`).join('\n')}`;
    } else if (currentMode === 'card') {
        content = `【OUTLAST TRIALS】КАРТОЧНЫЙ РЕЖИМ\n\n`;
        content += `📋 ВЫБРАННЫЕ ВАРИАТОРЫ (${cardModeSelections.length}):\n`;
        content += cardModeSelections.map((s, i) => `${i+1}. ${s.variator}`).join('\n');
    } else {
        content = `【OUTLAST TRIALS】ЗАДАНИЕ ДНЯ\n\n`;
        content += `⚠️ ВАРИАТОРЫ:\n${dailyVariators.map(v => `  - ${v}`).join('\n')}`;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `outlast_${currentMode}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📸 Сохранено!');
}

// ---------- РЕЖИМ: ЭСКАЛАЦИЯ ----------
function generateEscalation() {
    // Количество вариаторов в зависимости от уровня
    let variatorCount;
    if (currentLevel === 1) variatorCount = Math.floor(Math.random() * 2) + 1; // 1-2
    else if (currentLevel === 2) variatorCount = 2;
    else if (currentLevel === 3) variatorCount = Math.floor(Math.random() * 2) + 2; // 2-3
    else if (currentLevel === 4) variatorCount = 3;
    else if (currentLevel === 5) variatorCount = Math.floor(Math.random() * 2) + 3; // 3-4
    else if (currentLevel === 6) variatorCount = 4;
    else if (currentLevel === 7) variatorCount = Math.floor(Math.random() * 2) + 4; // 4-5
    else if (currentLevel === 8) variatorCount = 5;
    else if (currentLevel === 9) variatorCount = Math.floor(Math.random() * 2) + 5; // 5-6
    else variatorCount = Math.floor(Math.random() * 3) + 5; // 5-7
    
    currentVariators = getRandomVariators(variatorCount);
    
    // Снаряжение: 3 рандомных
    const shuffledEquip = [...EQUIPMENT];
    for (let i = shuffledEquip.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledEquip[i], shuffledEquip[j]] = [shuffledEquip[j], shuffledEquip[i]];
    }
    currentEquipment = shuffledEquip.slice(0, 3);
    
    // Ампулы: по одной из каждой категории
    currentAmpules = {
        offensive: AMPULES.offensive[Math.floor(Math.random() * AMPULES.offensive.length)],
        defensive: AMPULES.defensive[Math.floor(Math.random() * AMPULES.defensive.length)],
        utility: AMPULES.utility[Math.floor(Math.random() * AMPULES.utility.length)]
    };
    
    // Карта: на 10 уровне генезис, иначе МК
    if (currentLevel === 10) {
        currentMap = GENESIS_MAPS[Math.floor(Math.random() * GENESIS_MAPS.length)];
    } else {
        currentMap = MK_MAPS[Math.floor(Math.random() * MK_MAPS.length)];
    }
    
    renderEscalation();
}

function renderEscalation() {
    panelContent.innerHTML = `
        <div style="text-align: center;">
            <div class="level-badge">🔺 УРОВЕНЬ ${currentLevel} / 10 🔺</div>
            <div class="equipment-grid">
                ${currentEquipment.map(eq => `<div class="equipment-card">⚡ ${eq}</div>`).join('')}
            </div>
            <div style="margin: 20px 0;">
                <h3 style="color: #ff8888;">💊 АМФЫ</h3>
                <div class="equipment-grid">
                    <div class="equipment-card">⚔️ ${currentAmpules.offensive}</div>
                    <div class="equipment-card">🛡️ ${currentAmpules.defensive}</div>
                    <div class="equipment-card">🔧 ${currentAmpules.utility}</div>
                </div>
            </div>
            <div style="margin: 20px 0;">
                <h3 style="color: #ff8888;">🗺️ КАРТА</h3>
                <div class="equipment-card" style="display: inline-block;">📍 ${currentMap}</div>
            </div>
            <div style="margin: 20px 0;">
                <h3 style="color: #ff3a3a;">⚠️ ВАРИАТОРЫ (${currentVariators.length})</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 15px;">
                    ${currentVariators.map(v => `<div class="variator-chip" style="background: rgba(255,50,50,0.3);">⚠️ ${v}</div>`).join('')}
                </div>
            </div>
        </div>
    `;
    
    // Добавляем кнопки управления уровнем
    const levelControls = document.createElement('div');
    levelControls.style.cssText = 'display: flex; justify-content: center; gap: 15px; margin-top: 25px;';
    levelControls.innerHTML = `
        ${currentLevel > 1 ? '<button class="action-btn secondary" id="prevLevelBtn">◀ ПРЕДЫДУЩИЙ УРОВЕНЬ</button>' : ''}
        ${currentLevel < 10 ? '<button class="action-btn" id="nextLevelBtn">СЛЕДУЮЩИЙ УРОВЕНЬ ▶</button>' : '<button class="action-btn" id="resetEscalationBtn">🔄 НАЧАТЬ ЗАНОВО</button>'}
    `;
    panelContent.appendChild(levelControls);
    
    panelFooter.style.display = 'flex';
    
    // Обработчики
    document.getElementById('nextLevelBtn')?.addEventListener('click', () => {
        if (currentLevel < 10) {
            currentLevel++;
            generateEscalation();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    document.getElementById('prevLevelBtn')?.addEventListener('click', () => {
        if (currentLevel > 1) {
            currentLevel--;
            generateEscalation();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    document.getElementById('resetEscalationBtn')?.addEventListener('click', () => {
        currentLevel = 1;
        generateEscalation();
        showToast('🔄 Эскалация сброшена на 1 уровень');
    });
}

// ---------- РЕЖИМ: КАРТОЧНЫЙ ----------
function initCardMode() {
    isCardGameActive = true;
    cardModeSelections = [];
    updateDrawer();
    closeDrawer();
    
    // Создаём 20 карт с пустыми вариаторами
    cardModeCards = [];
    for (let i = 0; i < 20; i++) {
        cardModeCards.push({
            id: i,
            variator: null,
            isOpened: false,
            isDisabled: false
        });
    }
    
    renderCardMode();
}

function renderCardMode() {
    // Запрашиваем количество вариаторов
    panelContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 25px;">
            <h3 style="color: #ff8888;">🎴 КАРТОЧНЫЙ РЕЖИМ</h3>
            <p style="margin: 10px 0;">Выбери количество вариаторов, которые хочешь получить (1-5)</p>
            <div style="display: flex; gap: 12px; justify-content: center; margin: 15px 0;">
                ${[1,2,3,4,5].map(n => `
                    <button class="action-btn ${cardModeMaxSelections === n ? 'active' : 'secondary'}" data-card-count="${n}">${n}</button>
                `).join('')}
            </div>
            <div style="margin: 15px 0;">
                <span class="variator-chip" style="background: #ff3a3a;">🎯 Выбрано вариаторов: ${cardModeSelections.length} / ${cardModeMaxSelections}</span>
            </div>
            <button class="action-btn secondary" id="resetCardGameBtn">🔄 НОВАЯ ИГРА</button>
        </div>
        <div class="cards-grid" id="cardsGrid"></div>
    `;
    
    // Обработчики выбора количества
    document.querySelectorAll('[data-card-count]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const count = parseInt(e.target.dataset.cardCount);
            cardModeMaxSelections = count;
            initCardMode(); // перезапускаем с новым лимитом
        });
    });
    
    document.getElementById('resetCardGameBtn')?.addEventListener('click', () => {
        initCardMode();
        showToast('🃏 Новая игра');
    });
    
    // Рендерим сетку карт
    const grid = document.getElementById('cardsGrid');
    if (!grid) return;
    
    grid.innerHTML = cardModeCards.map(card => `
        <div class="card-item ${card.isOpened ? 'flipped' : ''} ${card.isDisabled ? 'disabled' : ''}" data-card-id="${card.id}">
            ${card.isOpened ? (card.variator || '???') : '?'}
        </div>
    `).join('');
    
    // Обработчики кликов по картам
    document.querySelectorAll('.card-item').forEach(el => {
        el.addEventListener('click', (e) => {
            const cardId = parseInt(el.dataset.cardId);
            const card = cardModeCards[cardId];
            
            if (card.isOpened || card.isDisabled) return;
            if (cardModeSelections.length >= cardModeMaxSelections) {
                showToast(`❌ Ты уже выбрал ${cardModeMaxSelections} вариаторов! Нажми "НОВАЯ ИГРА"`, true);
                return;
            }
            
            // Генерируем случайный вариатор для этой карты
            const newVariator = getRandomSingleVariator();
            card.variator = newVariator;
            card.isOpened = true;
            
            // Добавляем в шторку
            cardModeSelections.push({ cardId, variator: newVariator });
            updateDrawer();
            openDrawer();
            
            // Если собрали нужное количество - блокируем остальные карты
            if (cardModeSelections.length >= cardModeMaxSelections) {
                cardModeCards.forEach(c => {
                    if (!c.isOpened) c.isDisabled = true;
                });
                showToast('✅ Все вариаторы выбраны! Можно сохранить результат.');
            }
            
            renderCardMode(); // перерисовываем
        });
    });
    
    panelFooter.style.display = 'flex';
}

// ---------- РЕЖИМ: ЗАДАНИЕ ДНЯ ----------
function generateDaily() {
    // Фиксированный набор на день (на основе даты, чтобы не менялся при обновлении)
    const today = new Date().toISOString().slice(0, 10);
    const seed = today.split('-').join('');
    const randomCount = 4 + (parseInt(seed.slice(-2)) % 3); // 4-6 вариаторов
    
    dailyVariators = [];
    const tempArray = [...ALL_VARIATORS];
    for (let i = tempArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tempArray[i], tempArray[j]] = [tempArray[j], tempArray[i]];
    }
    dailyVariators = tempArray.slice(0, randomCount);
    
    renderDaily();
}

function renderDaily() {
    panelContent.innerHTML = `
        <div style="text-align: center;">
            <h3 style="color: #ff8888;">📅 ЗАДАНИЕ ДНЯ</h3>
            <p style="margin: 10px 0;">${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <div style="margin: 25px 0;">
                <h3 style="color: #ff3a3a;">⚠️ ВАРИАТОРЫ (${dailyVariators.length})</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 20px;">
                    ${dailyVariators.map(v => `<div class="variator-chip" style="background: rgba(255,50,50,0.3); padding: 10px 20px; font-size: 1rem;">⚠️ ${v}</div>`).join('')}
                </div>
            </div>
            <button class="action-btn secondary" id="rerollDailyBtn">🔄 ПЕРЕБРОСИТЬ ДЕНЬ</button>
        </div>
    `;
    
    document.getElementById('rerollDailyBtn')?.addEventListener('click', () => {
        generateDaily();
        showToast('🎲 Новое задание дня');
    });
    
    panelFooter.style.display = 'flex';
}

// ---------- ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ ----------
function switchMode(mode) {
    currentMode = mode;
    
    // Обновляем активный класс на карточках
    document.querySelectorAll('.mode-card').forEach(card => {
        if (card.dataset.mode === mode) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    
    // Закрываем шторку и очищаем карточный режим
    closeDrawer();
    
    // Запускаем соответствующий режим
    if (mode === 'escalation') {
        currentLevel = 1;
        generateEscalation();
    } else if (mode === 'card') {
        initCardMode();
    } else if (mode === 'daily') {
        generateDaily();
    }
}

// ---------- ИНИЦИАЛИЗАЦИЯ ----------
function init() {
    // Обработчики карточек режимов
    document.querySelectorAll('.mode-card').forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            switchMode(mode);
        });
    });
    
    // Кнопка переброса (рендер)
    document.getElementById('rerollBtn')?.addEventListener('click', () => {
        if (currentMode === 'escalation') {
            generateEscalation();
        } else if (currentMode === 'card') {
            initCardMode();
        } else if (currentMode === 'daily') {
            generateDaily();
        }
        showToast('🎲 Переброшено!');
    });
    
    // Кнопка сохранения
    document.getElementById('saveBtn')?.addEventListener('click', () => {
        saveResult();
    });
    
    // Шторка: очистка
    drawerClear?.addEventListener('click', () => {
        clearDrawer();
        if (currentMode === 'card') {
            initCardMode();
        }
    });
    
    // Клик по хэндлу шторки
    const drawerHandle = document.querySelector('.drawer-handle');
    drawerHandle?.addEventListener('click', () => {
        if (drawer.classList.contains('open')) {
            closeDrawer();
        } else if (cardModeSelections.length > 0) {
            openDrawer();
        }
    });
    
    // Запускаем эскалацию по умолчанию
    switchMode('escalation');
}

// Запуск после загрузки страницы
document.addEventListener('DOMContentLoaded', init);
