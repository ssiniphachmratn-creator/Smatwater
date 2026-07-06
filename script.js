// 1. นำเข้าไลบรารี
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, serverTimestamp, getDoc, increment, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. ตั้งค่า Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA9hWjeFmorWdQn5dGu1ut0BMlvaOLK-zY",
  authDomain: "smartwater1-5e117.firebaseapp.com",
  projectId: "smartwater1-5e117",
  storageBucket: "smartwater1-5e117.firebasestorage.app",
  messagingSenderId: "660889405048",
  appId: "1:660889405048:web:db72a16ca75577c8184f8d",
  measurementId: "G-EQMM2X3KSC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ตัวแปรระบบ
let currentUserPhone = null;
let countdownInterval;

// 3. ฟังก์ชันระบบสมาชิกและแต้ม
async function addStamp() {
    if (!currentUserPhone) return;
    const userRef = doc(db, "members", currentUserPhone);
    await updateDoc(userRef, { stampCount: increment(1) });
}

async function getFinalPrice(amount) {
    if (!currentUserPhone) return amount;
    const userDoc = await getDoc(doc(db, "members", currentUserPhone));
    if (userDoc.exists() && userDoc.data().stampCount >= 5) {
        alert("🌟 ใช้สิทธิ์ส่วนลดสะสมแต้ม 2 บาท!");
        await updateDoc(doc(db, "members", currentUserPhone), { stampCount: 0 });
        return Math.max(0, amount - 2);
    }
    return amount;
}

// 4. ฟังก์ชันการทำงานหลัก
async function selectAmount(amount) {
    const finalPrice = await getFinalPrice(amount);
    document.getElementById("selected-price").innerText = finalPrice;
    setDoc(doc(db, "machine_control", "status_doc"), { status: "pending", price: finalPrice, updatedAt: serverTimestamp() }, { merge: true })
    .then(() => changePage("step1", "step2"));
}

function submitRegister() {
    const nameInput = document.querySelector("#registerPage input[type='text']");
    const phoneInput = document.querySelector("#registerPage input[type='tel']");
    if (!nameInput.value || !phoneInput.value) { alert("กรุณากรอกข้อมูลให้ครบ"); return; }

    setDoc(doc(db, "members", phoneInput.value), {
        name: nameInput.value, phone: phoneInput.value, registeredAt: serverTimestamp(), stampCount: 0
    }).then(() => {
        alert("บันทึกเข้าสู่ระบบเรียบร้อยแล้ว");
        currentUserPhone = phoneInput.value;
        nameInput.value = ""; phoneInput.value = "";
        changePage("registerPage", "step1");
    });
}

// 5. ระบบควบคุมตู้และ Timer
function pauseDispenser() {
    updateDoc(doc(db, "machine_control", "status_doc"), { status: "paused" });
    document.getElementById("working-status-title").innerText = "หยุดจ่ายน้ำชั่วคราว";
    
    let pauseTimeLeft = 60; 
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        pauseTimeLeft--;
        if (pauseTimeLeft <= 0) {
            clearInterval(countdownInterval);
            alert("หมดเวลา! ระบบตัดการจ่ายน้ำอัตโนมัติ");
            updateDoc(doc(db, "machine_control", "status_doc"), { status: "completed" });
            changePage("step3", "step1");
        }
    }, 1000);
}

function completeTransaction() {
    const price = document.getElementById("selected-price").innerText;
    if (currentUserPhone) {
        addDoc(collection(db, "transactions"), { phone: currentUserPhone, price: price, timestamp: serverTimestamp() });
        addStamp();
    }
    changePage("step3", "step1");
}

function changePage(hideId, showId) {
    document.getElementById(hideId).classList.remove("active");
    document.getElementById(showId).classList.add("active");
}

// ผูกปุ่ม
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-water-5")?.addEventListener("click", () => selectAmount(5));
    document.getElementById("btn-water-10")?.addEventListener("click", () => selectAmount(10));
    document.getElementById("btn-submit-register")?.addEventListener("click", submitRegister);
    document.getElementById("btn-main-action")?.addEventListener("click", () => {
        const status = document.getElementById("working-status-title").innerText;
        status.includes("จ่ายน้ำ") ? pauseDispenser() : completeTransaction();
    });
});
