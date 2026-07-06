// 1. นำเข้าไลบรารีที่จำเป็น (Firestore)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

// ตัวแปรระบบ
let countdownInterval;
let timeLeft = 30;
let isDispensing = false;

// 4. ดักฟังสถานะ (Realtime listener)
onSnapshot(doc(db, "machine_control", "status_doc"), (doc) => {
    if (doc.exists()) {
        const data = doc.data();
        if (document.getElementById("step2").classList.contains("active") && data.status === "paid") {
            triggerPaymentSuccess();
        }
    }
});

// 5. ฟังก์ชันการทำงาน
function selectAmount(amount) {
    document.getElementById("selected-price").innerText = amount;
    setDoc(doc(db, "machine_control", "status_doc"), { status: "pending", price: amount, updatedAt: serverTimestamp() }, { merge: true })
    .then(() => changePage("step1", "step2"));
}

function simulateEspSignal() {
    updateDoc(doc(db, "machine_control", "status_doc"), { status: "paid" });
}

function triggerPaymentSuccess() {
    changePage("step2", "stepSuccess");
    setTimeout(() => {
        changePage("stepSuccess", "step3");
        updateDoc(doc(db, "machine_control", "status_doc"), { status: "dispensing" });
        startDispensing();
    }, 2000);
}

function startDispensing() {
    isDispensing = true;
    updateDoc(doc(db, "machine_control", "status_doc"), { status: "dispensing" });
    document.getElementById("working-status-title").innerText = "กำลังจ่ายน้ำ...";
    document.getElementById("btn-main-action").innerText = "🛑 กดหยุดจ่ายน้ำชั่วคราว";
}

function submitRegister() {
    const nameInput = document.querySelector("#registerPage input[type='text']");
    const phoneInput = document.querySelector("#registerPage input[type='tel']");
    
    if (!nameInput.value || !phoneInput.value) {
        alert("กรุณากรอกข้อมูลให้ครบ");
        return;
    }

    setDoc(doc(db, "members", phoneInput.value), {
        name: nameInput.value,
        phone: phoneInput.value,
        registeredAt: serverTimestamp(),
        stampCount: 0
    }).then(() => {
        // ข้อความเหลือแค่คำนี้ตามที่แกต้องการครับ
        alert("บันทึกเข้าสู่ระบบเรียบร้อยแล้ว");
        
        nameInput.value = "";
        phoneInput.value = "";
        changePage("registerPage", "step1");
    });
}

function changePage(hideId, showId) {
    document.getElementById(hideId).classList.remove("active");
    document.getElementById(showId).classList.add("active");
}

// ผูกปุ่ม Event Listener
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-water-5")?.addEventListener("click", () => selectAmount(5));
    document.getElementById("btn-water-10")?.addEventListener("click", () => selectAmount(10));
    document.getElementById("btn-simulate-esp")?.addEventListener("click", () => simulateEspSignal());
    document.getElementById("btn-submit-register")?.addEventListener("click", () => submitRegister());
    document.getElementById("btn-goto-register")?.addEventListener("click", () => changePage("step1", "registerPage"));
    document.getElementById("btn-cancel-register")?.addEventListener("click", () => changePage("registerPage", "step1"));
});
