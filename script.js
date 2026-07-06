// ==========================================
// 1. ส่วนตั้งค่า FIREBASE (Config) แบบดั้งเดิม
// ==========================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// ตรวจสอบและเชื่อมต่อ Firebase
let db = null;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
} catch (e) {
    console.log("Firebase ยังไม่ได้ใส่คีย์ที่ถูกต้อง หรือทำงานโหมดออฟไลน์เดโม");
}

// ตัวแปรระบบควบคุม
let countdownInterval;  
let timeLeft = 30;      
let isDispensing = false; 

// ถ้าระบบผูกฐานข้อมูลสำเร็จ ให้รอรับสเตตัสจาก ESP32
if (db) {
    db.ref('dispenser').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // ถ้าระบบอยู่ในหน้าชำระเงิน (step2) แล้วสถานะเปลี่ยนเป็น "paid"
        if (document.getElementById("step2").classList.contains("active") && data.status === "paid") {
            triggerPaymentSuccess();
        }
    });
}

// ==========================================
// 2. ฟังก์ชันการทำงานหลัก (Logic)
// ==========================================

// ฟังก์ชันเมื่อกดเลือกรายการน้ำดื่ม
function selectAmount(amount) {
    document.getElementById("selected-price").innerText = amount;
    
    if (db) {
        db.ref('dispenser').update({
            status: "pending",
            price: amount
        }).then(() => {
            changePage("step1", "step2");
        }).catch(() => {
            changePage("step1", "step2");
        });
    } else {
        changePage("step1", "step2"); // โหมดออฟไลน์เดโม
    }
}

// ฟังก์ชันจำลองเมื่อบอร์ด ESP ส่งสัญญาณกลับมาว่าจ่ายเงินสำเร็จ
function simulateEspSignal() {
    if (db) {
        db.ref('dispenser').update({ status: "paid" });
    } else {
        triggerPaymentSuccess(); // โหมดออฟไลน์เดโม
    }
}

// ฟังก์ชันเมื่อชำระเงินสำเร็จ
function triggerPaymentSuccess() {
    changePage("step2", "stepSuccess");
    
    setTimeout(function() {
        changePage("stepSuccess", "step3");
        if (db) db.ref('dispenser').update({ status: "dispensing" });
        startDispensing(); 
    }, 2000);
}

// ฟังก์ชันสั่งให้ "จ่ายน้ำ" (น้ำไหล)
function startDispensing() {
    isDispensing = true;
    clearInterval(countdownInterval); 
    
    if (db) db.ref('dispenser').update({ status: "dispensing" });

    document.getElementById("countdown-timer").innerText = "💧";
    document.getElementById("timer-unit").innerText = "กำลังจ่ายน้ำ...";
    document.getElementById("working-status-title").innerText = "กำลังจ่ายน้ำ...";
    document.querySelector(".water-drop-animation").style.animation = "pulse 1.5s infinite";
    
    let actionBtn = document.getElementById("btn-main-action");
    if (actionBtn) {
        actionBtn.innerText = "🛑 กดหยุดจ่ายน้ำชั่วคราว";
        actionBtn.style.backgroundColor = "#dc3545"; 
        actionBtn.style.color = "white";
    }
}

// ฟังก์ชันสั่งให้ "หยุดจ่ายน้ำชั่วคราว"
function pauseDispenser() {
    isDispensing = false;
    
    if (db) db.ref('dispenser').update({ status: "paused" });

    document.getElementById("working-status-title").innerText = "หยุดจ่ายน้ำชั่วคราว";
    document.getElementById("timer-unit").innerText = "วินาทีก่อนระบบตัด";
    document.querySelector(".water-drop-animation").style.animation = "none"; 
    
    let actionBtn = document.getElementById("btn-main-action");
    if (actionBtn) {
        actionBtn.innerText = "▶️ กดจ่ายน้ำต่อ";
        actionBtn.style.backgroundColor = "#22c55e"; 
        actionBtn.style.color = "white";
    }
    
    timeLeft = 30;
    document.getElementById("countdown-timer").innerText = timeLeft;
    
    countdownInterval = setInterval(function() {
        timeLeft--;
        document.getElementById("countdown-timer").innerText = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            alert("คุณหยุดน้ำค้างไว้นานเกิน 30 วินาที ระบบตัดการทำงานอัตโนมัติครับ");
            if (db) db.ref('dispenser').update({ status: "completed" });
            resetToHome();
        }
    }, 1000);
}

// ฟังก์ชันเปิดหน้าสมัครสมาชิก
function openRegisterModal() { changePage("step1", "registerPage"); }
// ฟังก์ชันปิดหน้าสมัครสมาชิก
function closeRegisterPage() { changePage("registerPage", "step1"); }
// ฟังก์ชันยืนยันการสมัครสมาชิก
function submitRegister() {
    alert("สมัครสมาชิกสำเร็จ! ระบบได้บันทึกข้อมูลเรียบร้อยแล้วครับ");
    changePage("registerPage", "step1");
}

// ฟังก์ชันช่วยเปลี่ยนหน้าจอ
function changePage(hideId, showId) {
    document.getElementById(hideId).classList.remove("active");
    document.getElementById(showId).classList.add("active");
}

// ฟังก์ชันรีเซ็ตระบบกลับหน้าแรก
function resetToHome() {
    clearInterval(countdownInterval);
    isDispensing = false;
    changePage("step3", "step1");
    changePage("step2", "step1");
    changePage("stepSuccess", "step1");
    changePage("registerPage", "step1");
}

// ==========================================
// 3. ผูกปุ่มการทำงานเมื่อหน้าจอพร้อม (Event Listeners)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-water-5")?.addEventListener("click", () => selectAmount(5));
    document.getElementById("btn-water-10")?.addEventListener("click", () => selectAmount(10));
    document.getElementById("btn-simulate-esp")?.addEventListener("click", () => simulateEspSignal());

    document.getElementById("btn-main-action")?.addEventListener("click", () => {
        if (isDispensing) {
            pauseDispenser();
        } else {
            startDispensing();
        }
    });

    document.getElementById("btn-goto-register")?.addEventListener("click", () => openRegisterModal());
    document.getElementById("btn-cancel-register")?.addEventListener("click", () => closeRegisterPage());
    document.getElementById("btn-submit-register")?.addEventListener("click", () => submitRegister());
});
