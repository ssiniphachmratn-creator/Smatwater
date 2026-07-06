// ==========================================
// 1. ส่วนตั้งค่า FIREBASE (Config)
// ** แกอย่าลืมเอาค่าจาก Firebase Console ของแกมาเปลี่ยนตรงนี้นะครับ **
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// เริ่มต้นทำงาน Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// 2. ตัวแปรสำหรับระบบควบคุม
// ==========================================
let countdownInterval;  
let timeLeft = 30;      
let isDispensing = false; 

// ดึง Elements มารอไว้ใช้งาน (แก้ปัญหา Scope จากการใช้ Type="module")
window.selectAmount = selectAmount;
window.simulateEspSignal = simulateEspSignal;
window.pauseDispenser = pauseDispenser;
window.startDispensing = startDispensing;
window.openRegisterModal = openRegisterModal;
window.closeRegisterPage = closeRegisterPage;
window.submitRegister = submitRegister;

// ดักฟังสถานะจาก Firebase Realtime (คุยกับ ESP32)
// โครงสร้าง Database ที่ใช้อ้างอิง: /dispenser/status และ /dispenser/price
onValue(ref(db, 'dispenser'), (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // ถ้าระบบอยู่ในหน้าชำระเงิน (step2) แล้วสถานะใน Firebase เปลี่ยนเป็น "paid" (จ่ายเงินแล้ว)
    if (document.getElementById("step2").classList.contains("active") && data.status === "paid") {
        triggerPaymentSuccess();
    }
});

// ==========================================
// 3. ฟังก์ชันการทำงานหลัก (Logic)
// ==========================================

// ฟังก์ชันเมื่อกดเลือกรายการน้ำดื่ม (5 หรือ 10 บาท)
function selectAmount(amount) {
    document.getElementById("selected-price").innerText = amount;
    
    // อัปเดตข้อมูลลง Firebase เพื่อบอกให้ ESP32 รู้ว่าลูกค้าเลือกราคานี้ และเปลี่ยนสถานะเป็นรอจ่ายเงิน (pending)
    update(ref(db, 'dispenser'), {
        status: "pending",
        price: amount
    }).then(() => {
        changePage("step1", "step2");
    });
}

// ฟังก์ชันจำลอง (สำหรับกดทดสอบบนมือถือตอนบอร์ดจริงยังไม่ส่งค่ามา)
function simulateEspSignal() {
    // จำลองสั่งอัปเดตลงฐานข้อมูลว่าจ่ายเงินสำเร็จแล้ว
    update(ref(db, 'dispenser'), {
        status: "paid"
    });
}

// ฟังก์ชันเมื่อชำระเงินสำเร็จ (ทำงานเมื่อได้รับสถานะ paid จาก Firebase)
function triggerPaymentSuccess() {
    changePage("step2", "stepSuccess");
    
    setTimeout(function() {
        changePage("stepSuccess", "step3");
        // อัปเดตสถานะในคลาวด์ว่าตู้กำลังจ่ายน้ำ (dispensing)
        update(ref(db, 'dispenser'), { status: "dispensing" });
        startDispensing(); 
    }, 2000);
}

// ฟังก์ชันสั่งให้ "จ่ายน้ำ" (โหมดปกติ น้ำไหล)
function startDispensing() {
    isDispensing = true;
    clearInterval(countdownInterval); 
    
    // อัปเดตสเตตัสใน Firebase บอกบอร์ด ESP ให้เปิดวาล์วน้ำไหลต่อ
    update(ref(db, 'dispenser'), { status: "dispensing" });

    document.getElementById("countdown-timer").innerText = "💧";
    document.getElementById("timer-unit").innerText = "กำลังจ่ายน้ำ...";
    document.getElementById("working-status-title").innerText = "กำลังจ่ายน้ำ...";
    document.querySelector(".water-drop-animation").style.animation = "pulse 1.5s infinite";
    
    let actionBtn = document.querySelector(".btn-stop");
    actionBtn.innerText = "🛑 กดหยุดจ่ายน้ำชั่วคราว";
    actionBtn.setAttribute("onclick", "pauseDispenser()");
    actionBtn.style.backgroundColor = "#dc3545"; 
    actionBtn.style.color = "white";
}

// ฟังก์ชันสั่งให้ "หยุดจ่ายน้ำชั่วคราว" (น้ำหยุด และเริ่มนับถอยหลัง 30 วิ)
function pauseDispenser() {
    isDispensing = false;
    
    // อัปเดตสเตตัสใน Firebase บอกบอร์ด ESP ให้สั่งปิดวาล์วน้ำหยุดชั่วคราว (paused)
    update(ref(db, 'dispenser'), { status: "paused" });

    document.getElementById("working-status-title").innerText = "หยุดจ่ายน้ำชั่วคราว";
    document.getElementById("timer-unit").innerText = "วินาทีก่อนระบบตัด";
    document.querySelector(".water-drop-animation").style.animation = "none"; 
    
    let actionBtn = document.querySelector(".btn-stop");
    actionBtn.innerText = "▶️ กดจ่ายน้ำต่อ";
    actionBtn.setAttribute("onclick", "startDispensing()");
    actionBtn.style.backgroundColor = "#22c55e"; 
    actionBtn.style.color = "white";
    
    timeLeft = 30;
    document.getElementById("countdown-timer").innerText = timeLeft;
    
    countdownInterval = setInterval(function() {
        timeLeft--;
        document.getElementById("countdown-timer").innerText = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            alert("คุณหยุดน้ำค้างไว้นานเกิน 30 วินาที ระบบตัดการทำงานอัตโนมัติครับ");
            // สั่ง Firebase อัปเดตสถานะเป็นสิ้นสุดเซสชัน (completed) เพื่อให้บอร์ด ESP เคลียร์สถานะปิดวาล์วถาวร
            update(ref(db, 'dispenser'), { status: "completed" });
            resetToHome();
        }
    }, 1000);
}

function changePage(hideId, showId) {
    document.getElementById(hideId).classList.remove("active");
    document.getElementById(showId).classList.add("active");
}

function resetToHome() {
    clearInterval(countdownInterval);
    isDispensing = false;
    changePage("step3", "step1");
    changePage("step2", "step1");
    changePage("stepSuccess", "step1");
    changePage("registerPage", "step1");
}

// ==========================================
// 4. ฟังก์ชันจัดการหน้าสมัครสมาชิก
// ==========================================
function openRegisterModal() { changePage("step1", "registerPage"); }
function closeRegisterPage() { changePage("registerPage", "step1"); }
function submitRegister() {
    alert("สมัครสมาชิกสำเร็จ! ระบบได้บันทึกข้อมูลเรียบร้อยแล้วครับ");
    changePage("registerPage", "step1");
}
// ==========================================
// 5. ผูกปุ่มจากหน้าเว็บ (DOM Event Listeners) 
// เพื่อแก้ปัญหาเวลากดเลือกน้ำและสมัครสมาชิกไม่ได้เมื่อใช้ Module
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // ปุ่มเลือกน้ำ 5 บาท และ 10 บาท
    document.getElementById("btn-water-5")?.addEventListener("click", () => selectAmount(5));
    document.getElementById("btn-water-10")?.addEventListener("click", () => selectAmount(10));
    
    // ปุ่มจำลองเงินเข้าสำหรับเดโม
    document.getElementById("btn-simulate-esp")?.addEventListener("click", () => simulateEspSignal());

    // ปุ่มเปิด-ปิด หน้าสมัครสมาชิก
    document.getElementById("btn-goto-register")?.addEventListener("click", () => openRegisterModal());
    document.getElementById("btn-cancel-register")?.addEventListener("click", () => closeRegisterPage());
    document.getElementById("btn-submit-register")?.addEventListener("click", () => submitRegister());
});
