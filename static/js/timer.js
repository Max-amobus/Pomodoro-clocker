const timerDisplay = document.getElementById("timer");
const startPauseBtn = document.getElementById("startPause");
const resetBtn = document.getElementById("reset");
const tabs = document.querySelectorAll(".tab");
const statusPill = document.querySelector(".status-pill");

let timer = null;
let currentTime = 0;
let defaultTime = 0;
let running = false;
let currentSessionType = "pomodoro";

// Управління візуальним статусом
function updateStatus(state) {
    if (!statusPill) return;
    if (state === "ready") {
        statusPill.innerHTML = '<span class="status-dot" style="background: #94a3b8;"></span> Ready';
    } else if (state === "focusing") {
        statusPill.innerHTML = '<span class="status-dot" style="background: #22c55e;"></span> Focusing';
    } else if (state === "paused") {
        statusPill.innerHTML = '<span class="status-dot" style="background: #eab308;"></span> Paused';
    }
}

function updateDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    timer = setInterval(() => {
        currentTime--;
        updateDisplay();

        if (currentTime <= 0) {
            clearInterval(timer);
            running = false;
            startPauseBtn.textContent = "Start";
            updateStatus("ready");

            playSound();

            const durationMinutes = Math.round(defaultTime / 60);
            sendSessionData(currentSessionType, durationMinutes);

            if (AUTO_START) {
                const nextTabIndex = currentSessionType === "pomodoro" ? 1 : 0;

                setTimeout(() => {
                    tabs[nextTabIndex].click();
                    startPauseBtn.click();
                }, 1500);
            }
        }
    }, 1000);
}

startPauseBtn.addEventListener("click", () => {
    if (!running) {
        running = true;
        startPauseBtn.textContent = "Pause";
        updateStatus("focusing");
        startTimer();
    } else {
        running = false;
        clearInterval(timer);
        startPauseBtn.textContent = "Start";
        updateStatus("paused");
    }
});

resetBtn.addEventListener("click", () => {
    clearInterval(timer);
    running = false;
    currentTime = defaultTime;
    startPauseBtn.textContent = "Start";
    updateStatus("ready");
    updateDisplay();
});

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        clearInterval(timer);
        running = false;
        startPauseBtn.textContent = "Start";
        updateStatus("ready");

        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        defaultTime = Number(tab.dataset.time);

        const tabText = tab.textContent.toLowerCase();
        if (tabText.includes("pomodoro")) {
            currentSessionType = "pomodoro";
        } else if (tabText.includes("short")) {
            currentSessionType = "short";
        } else {
            currentSessionType = "long";
        }

        currentTime = defaultTime;
        updateDisplay();
    });
});


function initTimer() {
    const activeTab = document.querySelector(".tab.active");
    if (activeTab) {
        defaultTime = Number(activeTab.dataset.time);

        const tabText = activeTab.textContent.toLowerCase();
        if (tabText.includes("pomodoro")) {
            currentSessionType = "pomodoro";
        } else if (tabText.includes("short")) {
            currentSessionType = "short";
        } else {
            currentSessionType = "long";
        }

        currentTime = defaultTime;
        updateDisplay();
        updateStatus("ready");
    }
}

// Запускає налаштування одразу при відкритті сторінки
initTimer();

// Робочий запит до Django або збереження в LocalStorage для гостя
function sendSessionData(sessionType, durationMinutes) {
    if (typeof IS_GUEST !== 'undefined' && IS_GUEST) {
        // Логіка для гостя (зберігаємо локально)
        let sessions = JSON.parse(localStorage.getItem('guest_sessions')) || [];
        sessions.push({
            session_type: sessionType,
            duration_minutes: durationMinutes,
            created_at: new Date().toISOString()
        });
        localStorage.setItem('guest_sessions', JSON.stringify(sessions));

        // Перезавантажуємо сторінку тільки якщо автозапуск ВИМКНЕНО
        if (!AUTO_START) {
            window.location.reload();
        }
    } else {
        // Логіка для авторизованих користувачів
        fetch("/save-session/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `duration=${durationMinutes}&session_type=${sessionType}`,
        })
        .then(response => response.json())
        .then(data => {
            if (!AUTO_START) {
                window.location.reload();
            }
        })
        .catch(error => console.error("Error saving session:", error));
    }
}


//  ЛОГІКА ВІДОБРАЖЕННЯ ДЛЯ ГОСТЯ
function renderGuestStats() {
    if (typeof IS_GUEST === 'undefined' || !IS_GUEST) return;

    let sessions = JSON.parse(localStorage.getItem('guest_sessions')) || [];
    if (sessions.length === 0) return; // Якщо сесій ще немає, залишаємо нулі від бекенду

    let totalMinutes = 0;
    let completedPomodoros = 0;
    let activeDays = new Set();

    // Беремо останні 4 сесії для списку Recent Sessions
    let recentSessions = sessions.slice().reverse().slice(0, 4);

    sessions.forEach(session => {
        if (session.session_type === 'pomodoro') {
            totalMinutes += session.duration_minutes;
            completedPomodoros++;
        }
        let dateObj = new Date(session.created_at);
        activeDays.add(dateObj.toDateString());
    });

    let hours = Math.floor(totalMinutes / 60);
    let mins = totalMinutes % 60;
    let timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    // Оновлюємо верхні 3 картки статистики
    const statValues = document.querySelectorAll('.stats-grid .stat-value');
    if (statValues.length >= 3) {
        statValues[0].textContent = timeStr;
        statValues[1].textContent = completedPomodoros;
        statValues[2].textContent = `${activeDays.size} days`;
    }

    // Оновлюємо нижній список сесій
    const sessionList = document.querySelector('.sessions-panel .session-list');
    if (sessionList && recentSessions.length > 0) {
        let html = '';
        recentSessions.forEach(session => {
            const dateObj = new Date(session.created_at);
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const isPomodoro = session.session_type === 'pomodoro';
            const emoji = isPomodoro ? '🍅' : '☕';
            const typeName = session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1);
            const emojiClass = isPomodoro ? 'tomato' : 'cup';

            html += `
            <div class="session-row">
                <div class="session-type">
                    <span class="session-emoji ${emojiClass}">${emoji}</span>
                    <strong>${typeName}</strong>
                </div>
                <span>${dateStr}</span>
                <span>${timeStr}</span>
                <strong>${session.duration_minutes} min</strong>
            </div>`;
        });
        sessionList.innerHTML = html;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderGuestStats();
});


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}



// ЛОГІКА ДИНАМІЧНОГО ГРАФІКА

async function loadChartData() {
    const chartContainer = document.getElementById("dynamic-chart-bars");
    const weekSelector = document.getElementById("week-selector");
    if (!chartContainer) return;

    try {
        let data = [];

        if (typeof IS_GUEST !== 'undefined' && IS_GUEST) {
            // ЛОГІКА ДЛЯ ГОСТЯ
            const sessions = JSON.parse(localStorage.getItem('guest_sessions')) || [];
            const dailyData = {};

            sessions.forEach(session => {
                if (session.session_type === 'pomodoro') {
                    const dateObj = new Date(session.created_at);
                    const day = dateObj.toISOString().split('T')[0];
                    dailyData[day] = (dailyData[day] || 0) + session.duration_minutes;
                }
            });

            data = Object.keys(dailyData).map(day => ({
                day: day,
                total_minutes: dailyData[day]
            }));
        } else {
            // ЛОГІКА ДЛЯ АВТОРИЗОВАНОГО
            const response = await fetch("/api/chart-data/");
            if (!response.ok) throw new Error("Failed to fetch chart data");
            data = await response.json();
        }

        // Сортуємо всі дані від найновіших до найстаріших
        data.sort((a, b) => new Date(b.day) - new Date(a.day));

        // малювання 7 стовпців
        function renderBars(dataset) {
            if (dataset.length === 0) {
                chartContainer.innerHTML = '<p style="text-align: center; width: 100%; color: #94a3b8; font-size: 14px;">No sessions for this period</p>';
                return;
            }

            const maxMinutes = 240;
            let barsHtml = "";

            dataset.forEach(item => {
                const dateObj = new Date(item.day);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = dateObj.getDate(); // Додаємо число місяця

                let heightPercent = (item.total_minutes / maxMinutes) * 100;
                if (heightPercent > 100) heightPercent = 100;
                // Мінімальна висота, щоб було видно стовпець, якщо є хоч 1 хвилина
                if (item.total_minutes > 0 && heightPercent < 5) heightPercent = 5;

                barsHtml += `
                    <div class="bar-group" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%;">
                        
                        <!-- Контейнер стовпця. margin-bottom піднімає його над текстом -->
                        <div style="position: relative; height: calc(100% - 35px); margin-bottom: 35px; width: 100%; display: flex; justify-content: center; align-items: flex-end;">
                            
                            <!-- Цифри над стовпцем -->
                            <span style="position: absolute; bottom: calc(${heightPercent}% + 4px); font-size: 12px; color: #64748b; font-weight: 600; line-height: 1; pointer-events: none;">${item.total_minutes}m</span>
                            
                            <!-- Стовпець -->
                            <div class="bar" style="height: ${heightPercent}%; width: 100%; max-width: 35px; background: #ff4d57; border-radius: 6px 6px 0 0;" title="${item.total_minutes} min"></div>
                            
                        </div>
                        
                        <!-- Підпис дня (зафіксований в самому низу) -->
                        <span style="position: absolute; bottom: 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.2; width: 40px;">
                            ${dayName} <br><b style="color:#1e293b">${dayNum}</b>
                        </span>
                    </div>
                `;
            });
            chartContainer.innerHTML = barsHtml;
        }

        // фільтрація по тижнях
        function updateChart() {
            const filter = weekSelector ? weekSelector.value : "this_week";
            let displayData = [];

            if (filter === "this_week") {
                displayData = data.slice(0, 7);
            } else {
                displayData = data.slice(7, 14);
            }

            renderBars(displayData.reverse());
        }

        if (weekSelector) {
            weekSelector.addEventListener("change", updateChart);
        }

        updateChart();

    } catch (error) {
        console.error("Chart error:", error);
        chartContainer.innerHTML = '<p style="text-align: center; width: 100%; color: #ef4444; font-size: 14px;">Failed to load chart</p>';
    }
}


function playSound() {
    if (typeof SOUND_ENABLED === 'undefined' || !SOUND_ENABLED) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    function beep(startTime) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, startTime); // Трохи нижчий, м'якший тон


        gain.gain.setValueAtTime(1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.1);
    }

    const now = ctx.currentTime;
    beep(now);
    beep(now + 0.2);
    beep(now + 0.4);
}



document.addEventListener("DOMContentLoaded", () => {
    loadChartData();
});
