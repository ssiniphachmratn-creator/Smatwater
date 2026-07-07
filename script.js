let countdown;
let timeLeft = 60;

function changePage(hideId, showId) {
    document.querySelectorAll('.step-page').forEach(p => p.classList.remove('active'));
    document.getElementById(showId).classList.add('active');
}

function selectAmount(price) {
    document.getElementById("selected-price").innerText = price + " ฿";
    changePage("step1", "step2");
}

window.simulatePayment = function() {
    changePage("step2", "step3");
    startDispensing();
};

function startDispensing() {
    timeLeft = 60;
    document.getElementById("status-text").innerText = "💧 กำลังจ่ายน้ำ...";
    clearInterval(countdown);
    countdown = setInterval(() => {
        timeLeft--;
        document.getElementById("countdown-timer").innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            changePage("step3", "step4");
        }
    }, 1000);
}

function toggleDispenser() {
    const btn = document.getElementById("btn-main-action");
    if (btn.innerText.includes("หยุด")) {
        clearInterval(countdown);
        btn.innerText = "▶️ จ่ายน้ำต่อ";
        document.getElementById("status-text").innerText = "⏸️ หยุดชั่วคราว";
    } else {
        startDispensing();
    }
}
