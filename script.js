// 1. นำเข้าไลบรารีที่จำเป็น (เปลี่ยนจาก Analytics เป็น Firestore)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. ตั้งค่า Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9hWjeFmorWdQn5dGu1ut0BMlvaOLK-zY",
  authDomain: "smartwater1-5e117.firebaseapp.com",
  projectId: "smartwater1-5e117",
  storageBucket: "smartwater1-5e117.firebasestorage.app",
  messagingSenderId: "660889405048",
  appId: "1:660889405048:web:db72a16ca75577c8184f8d",
  measurementId: "G-EQMM2X3KSC"
};

// 3. เริ่มต้นใช้งาน Firebase และ Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // ตัวแปร db นี้แหละที่เราจะใช้ยิงข้อมูลเข้า members
// ==========================================
// 1. ส่วนตั้งค่า FIREBASE (Config) และเชื่อมต่อ FIRESTORE
// ==========================================
// ==========================================
// 1. ส่วนตั้งค่า FIREBASE (Config) และเชื่อมต่อ FIRESTORE
// อัปเดตข้อมูลให้ตรงกับโปรเจกต์ smartwater1-5e117 แล้วครับ
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAxXXXXXXXXXXXX_YOUR_ACTUAL_API_KEY", // แกเอาคีย์จริงจากหน้าตั้งค่ามาใส่ตรงนี้นะ
    authDomain: "smartwater1-5e117.firebaseapp.com",
    projectId: "smartwater1-5e117",
    storageBucket: "smartwater1-5e117.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // เอาเลขจากหน้าคอนโซลมาใส่
    appId: "YOUR_APP_ID"                           // เอา App ID จากหน้าคอนโซลมาใส่
};

let db = null;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore(); // เปิดใช้งาน Cloud Firestore
} catch (e) {
    console.log("Firebase ยังไม่ได้ใส่คีย์ หรือรันโหมดออฟไลน์เดโม");
}

// ตัวแปรระบบควบคุม
let countdownInterval;  
let timeLeft = 30;      
let isDispensing = false; 

// ดักฟังสถานะจาก Cloud Firestore (ตรวจจับเมื่อ ESP32 อัปเดตการชำระเงิน)
if (db) {
    db.collection('machine_control').doc('status_doc')
    .onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            // ถ้าระบบอยู่ในหน้าชำระเงิน (step2) แล้วสถานะใน Firestore เปลี่ยนเป็น "paid"
            if (document.getElementById("step2").classList.contains("active") && data.status === "paid") {
                triggerPaymentSuccess();
            }
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
        db.collection('machine_control').doc('status_doc').set({
            status: "pending",
            price: amount,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).then(() => {
            changePage("step1", "step2");
        }).catch(() => {
            changePage("step1", "step2");
        });
    } else {
        changePage("step1", "step2");
    }
}

// ฟังก์ชันจำลองสัญญาณเงินเข้า (สำหรับกดทดสอบบนมือถือ)
function simulateEspSignal() {
    if (db) {
        db.collection('machine_control').doc('status_doc').update({
            status: "paid"
        });
    } else {
        triggerPaymentSuccess();
    }
}

// ฟังก์ชันเมื่อชำระเงินสำเร็จ
function triggerPaymentSuccess() {
    changePage("step2", "stepSuccess");
    
    setTimeout(function() {
        changePage("stepSuccess", "step3");
        if (db) {
            db.collection('machine_control').doc('status_doc').update({ status: "dispensing" });
        }
        startDispensing(); 
    }, 2000);
}

// ฟังก์ชันสั่งให้ "จ่ายน้ำ" (น้ำไหล)
function startDispensing() {
    isDispensing = true;
    clearInterval(countdownInterval); 
    
    if (db) {
        db.collection('machine_control').doc('status_doc').update({ status: "dispensing" });
    }

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
    
    if (db) {
        db.collection('machine_control').doc('status_doc').update({ status: "paused" });
    }

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
            if (db) {
                db.collection('machine_control').doc('status_doc').update({ status: "completed" });
            }
            resetToHome();
        }
    }, 1000);
}

// ฟังก์ชันสมัครสมาชิกและบันทึกเข้าคอลเลกชัน "members" ยิงตรงเข้า Firestore
function submitRegister() {
    const nameInput = document.querySelector("#registerPage input[type='text']");
    const phoneInput = document.querySelector("#registerPage input[type='tel']");
    
    const fullName = nameInput ? nameInput.value.trim() : "";
    const phoneNumber = phoneInput ? phoneInput.value.trim() : "";

    if (fullName === "" || phoneNumber === "") {
        alert("❌ กรุณากรอกข้อมูลให้ครบถ้วนทั้งชื่อและเบอร์โทรศัพท์ครับ");
        return;
    }

    if (phoneNumber.length < 9 || isNaN(phoneNumber)) {
        alert("❌ กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้องครับ");
        return;
    }

    if (db) {
        // บันทึกข้อมูลลงคอลเลกชัน 'members' โดยใช้เบอร์โทรเป็น ID ของเอกสาร
        db.collection('members').doc(phoneNumber).set({
            name: fullName,
            phone: phoneNumber,
            registeredAt: firebase.firestore.FieldValue.serverTimestamp(),
            stampCount: 0
        }).then(() => {
            alert("🌟 สมัครสมาชิกสำเร็จ! ข้อมูลถูกบันทึกใน Firestore เรียบร้อยแล้วครับ");
            if (nameInput) nameInput.value = "";
            if (phoneInput) phoneInput.value = "";
            changePage("registerPage", "step1");
        }).catch((error) => {
            console.error("Firestore Save Error:", error);
            alert("❌ เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลได้ครับ");
        });
    } else {
        alert("📱 [เดโม] สมัครสมาชิกสำเร็จ (โหมดจำลองออฟไลน์)");
        if (nameInput) nameInput.value = "";
        if (phoneInput) phoneInput.value = "";
        changePage("registerPage", "step1");
    }
}

function openRegisterModal() { changePage("step1", "registerPage"); }
function closeRegisterPage() { changePage("registerPage", "step1"); }

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
