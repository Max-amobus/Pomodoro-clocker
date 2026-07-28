const timerDisplay = document.getElementById("timer");
const startPauseBtn = document.getElementById("startPause");
const resetBtn = document.getElementById("reset");
const tabs = document.querySelectorAll(".tab");

console.log("NEW TIMER.JS");

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

            console.log("Before fetch");

            fetch("/save-session/", {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCookie("csrftoken"),
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `duration=${Math.round(defaultTime / 60)}`,
            })
            .then(response=> response.json())
            .then(data => {
                console.log(data);
            });

            console.log("After fetch");
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

    if (document.cookie && document.cookie !== "") {

        const cookies = document.cookie.split(";")

        for (let cookie of cookies) {

            cookie = cookie.trim();

            if (cookie.startsWith(name + "=")) {

                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1)
                );

                break;
            }
        }
    }

    return cookieValue;

}