const timerDisplay = document.getElementById("timer");
const startPauseBtn = document.getElementById("startPause");
const resetBtn = document.getElementById("reset");
const tabs = document.querySelectorAll(".tab");

let timer = null;

let currentTime = 1500;
let defaultTime = 1500;

let running = false;

function updateDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    timer = setInterval(() => {
        currentTime--;
        updateDisplay();

        if (currentTime <= 0) {
            clearInterval(timer);
            running = false;
            startPauseBtn.textContent = "Start";
            console.log("Session complete");

            const activeTab = document.querySelector(".tab.active").textContent.trim();
            let sessionType = 'pomodoro';
            if (activeTab === 'Short Break') sessionType = 'short_break';
            else if (activeTab === 'Long Break') sessionType = 'long_break';

            const durationMinutes = defaultTime / 60;

            sendSessionData(sessionType, durationMinutes);
        }
    }, 1000);
}

startPauseBtn.addEventListener("click", () => {
    if (!running) {
        running = true;
        startPauseBtn.textContent = "Pause";
        startTimer();
    } else {
        running = false;
        clearInterval(timer);
        startPauseBtn.textContent = "Start";
    }
});

resetBtn.addEventListener("click", () => {
    clearInterval(timer);
    running = false;
    currentTime = defaultTime;
    startPauseBtn.textContent = "Start";
    updateDisplay();
});

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        clearInterval(timer);
        running = false;
        startPauseBtn.textContent = "Start";
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        defaultTime = Number(tab.dataset.time);
        currentTime = defaultTime;
        updateDisplay();
    });
});

updateDisplay();


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function sendSessionData(sessionType, durationMinutes) {
    // заглушка
    const apiUrl = '/api/save_session/';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            type: sessionType,
            duration: durationMinutes
        })
    })
    .then(response => {
        if (response.ok) {
            console.log(`Сесія ${sessionType} на ${durationMinutes} хв успішно відправлена!`);
        } else {
            console.error("Помилка: сервер відхилив запит (можливо, ендпоінт ще не готовий).");
        }
    })
    .catch(error => console.error("Помилка мережі:", error));
}