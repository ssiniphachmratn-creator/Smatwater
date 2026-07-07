const firebaseConfig = { /* ใส่ Config ของแกที่นี่ */ };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let countdown;
let timeLeft = 60;

function changePage(hideId, showId) {
    document.querySelectorAll('.step-page').forEach(p => p.classList.remove('active'));
    document.getElementById(showId).classList.add('active');
}

function selectAmount(price) {
    document.getElementById("selected-price").innerText = price + " ฿";
    db.collection("machine_control").doc("status_doc").set({ status: "pending", price: price }, { merge: true });
    changePage("step1", "step2");
}

window.simulatePayment = function() {
    changePage("step2", "step3");
    startDispensing();
};

function startDispensing() {
    timeLeft = 60;
    document.getElementById("status-text").innerText = "💧 กำลังจ่ายน้ำ...";
    document.getElementById("btn-main-action").innerText = "🛑 หยุดจ่ายน้ำชั่วคราว";
    
    clearInterval(countdown);
    countdown = setInterval(() => {
        timeLeft--;
        document.getElementById("countdown-timer").innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            db.collection("machine_control").doc("status_doc").update({ status: "completed" });
            changePage("step3", "step4"); // เด้งไปหน้าเสร็จสิ้น
        }
    }, 1000);
}

function toggleDispenser() {
    const btn = document.getElementById("btn-main-action");
    if (btn.innerText.includes("หยุด")) {
        clearInterval(countdown); // หยุดเวลาไว้
        btn.innerText = "▶️ จ่ายน้ำต่อ";
        document.getElementById("status-text").innerText = "⏸️ หยุดชั่วคราว";
    } else {
        startDispensing(); // เริ่มนับต่อ
    }
}
