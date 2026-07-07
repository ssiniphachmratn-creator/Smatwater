const firebaseConfig = { /* ใส่ Config ของแกที่นี่ */ };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let countdown;
let timeLeft = 60;

function changePage(hideId, showId) {
    document.querySelectorAll('.step-page').forEach(p => p.classList.remove('active'));
    document.getElementById(showId).classList.add('active');
}

function selectAmount(price, ml) {
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
            changePage("step3", "step1"); // กลับหน้าหลักเมื่อหมดเวลา
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

// ระบบสมาชิก (เช็คครบ 4 ครั้งลด 2 บาท)
async function checkStamp(phone) {
    const doc = await db.collection("members").doc(phone).get();
    if(doc.exists && doc.data().stampCount >= 4) {
        alert("คุณได้รับส่วนลด 2 บาท!");
        // โค้ดลดราคา...
    }
}
