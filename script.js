let countdown;
let timeLeft = 60;

function changePage(hideId, showId) {
    document.querySelectorAll('.step-page').forEach(p => p.classList.remove('active'));
    document.getElementById(showId).classList.add('active');
}

// ระบบจ่ายน้ำและนับเวลา 1 นาที
function startDispensing() {
    timeLeft = 60;
    document.getElementById("status-text").innerText = "💧 กำลังจ่ายน้ำ...";
    clearInterval(countdown);
    
    countdown = setInterval(() => {
        timeLeft--;
        document.getElementById("countdown-timer").innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            // เมื่อครบ 1 นาที ให้ตัดน้ำและไปหน้าเสร็จสิ้น
            db.collection("machine_control").doc("status_doc").update({ status: "completed" });
            changePage("step3", "step4");
        }
    }, 1000);
}

// ระบบ Toggle หยุด/จ่ายต่อ
function toggleDispenser() {
    const btn = document.getElementById("btn-main-action");
    if (btn.innerText.includes("หยุด")) {
        clearInterval(countdown); // หยุดนับเวลา
        btn.innerText = "▶️ จ่ายน้ำต่อ";
        document.getElementById("status-text").innerText = "⏸️ หยุดชั่วคราว";
    } else {
        startDispensing(); // นับต่อ
    }
}

// ฟังก์ชันเดโมชำระเงิน
window.simulatePayment = function() {
    changePage("step2", "step3");
    startDispensing();
};
