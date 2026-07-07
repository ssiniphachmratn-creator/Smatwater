import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, serverTimestamp, getDoc, increment, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let currentUserPhone = null;
let countdownInterval;

// ฟังก์ชันเปลี่ยนหน้า (ใช้บ่อย)
function changePage(hideId, showId) {
    document.getElementById(hideId)?.classList.remove("active");
    document.getElementById(showId)?.classList.add("active");
}

// ฟังก์ชันสมัครสมาชิก
window.submitRegister = async function() {
    const nameInput = document.querySelector("#registerPage input[type='text']");
    const phoneInput = document.querySelector("#registerPage input[type='tel']");
    
    if (!nameInput.value || !phoneInput.value) {
        alert("กรุณากรอกข้อมูลให้ครบ");
        return;
    }

    try {
        await setDoc(doc(db, "members", phoneInput.value), {
            name: nameInput.value,
            phone: phoneInput.value,
            registeredAt: serverTimestamp(),
            stampCount: 0
        });
        
        alert("บันทึกเข้าสู่ระบบเรียบร้อยแล้ว");
        currentUserPhone = phoneInput.value;
        nameInput.value = "";
        phoneInput.value = "";
        changePage("registerPage", "step1");
    } catch (e) {
        alert("เกิดข้อผิดพลาด: " + e.message);
    }
};

// ฟังก์ชันเลือกจำนวนเงินและส่วนลด
window.selectAmount = async function(amount) {
    let finalPrice = amount;
    
    if (currentUserPhone) {
        const userDoc = await getDoc(doc(db, "members", currentUserPhone));
        if (userDoc.exists() && userDoc.data().stampCount >= 5) {
            alert("🌟 ใช้สิทธิ์ส่วนลดสะสมแต้ม 2 บาท!");
            await updateDoc(doc(db, "members", currentUserPhone), { stampCount: 0 });
            finalPrice = Math.max(0, amount - 2);
        }
    }

    document.getElementById("selected-price").innerText = finalPrice;
    await setDoc(doc(db, "machine_control", "status_doc"), { 
        status: "pending", 
        price: finalPrice, 
        updatedAt: serverTimestamp() 
    }, { merge: true });
    
    changePage("step1", "step2");
};

// ฟังสถานะจากบอร์ด
onSnapshot(doc(db, "machine_control", "status_doc"), (doc) => {
    if (doc.exists() && document.getElementById("step2").classList.contains("active") && doc.data().status === "paid") {
        changePage("step2", "stepSuccess");
        setTimeout(() => {
            changePage("stepSuccess", "step3");
            updateDoc(doc(db, "machine_control", "status_doc"), { status: "dispensing" });
            document.getElementById("working-status-title").innerText = "กำลังจ่ายน้ำ...";
            document.getElementById("btn-main-action").innerText = "🛑 กดหยุดจ่ายน้ำ";
        }, 2000);
    }
});

// ฟังก์ชันหยุดน้ำ
window.pauseDispenser = function() {
    updateDoc(doc(db, "machine_control", "status_doc"), { status: "paused" });
    document.getElementById("working-status-title").innerText = "หยุดจ่ายน้ำชั่วคราว";
    
    let time = 60;
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        time--;
        if (time <= 0) {
            clearInterval(countdownInterval);
            alert("หมดเวลา! ระบบตัดน้ำ");
            updateDoc(doc(db, "machine_control", "status_doc"), { status: "completed" });
            changePage("step3", "step1");
        }
    }, 1000);
};

// เชื่อมปุ่ม (ใช้ Event Listener ใน DOMContentLoaded)
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-water-5")?.onclick = () => window.selectAmount(5);
    document.getElementById("btn-water-10")?.onclick = () => window.selectAmount(10);
    document.getElementById("btn-submit-register")?.onclick = window.submitRegister;
    document.getElementById("btn-goto-register")?.onclick = () => changePage("step1", "registerPage");
    document.getElementById("btn-cancel-register")?.onclick = () => changePage("registerPage", "step1");
    document.getElementById("btn-main-action")?.onclick = () => {
        const text = document.getElementById("btn-main-action").innerText;
        text.includes("หยุด") ? window.pauseDispenser() : changePage("step3", "step1");
    };
});
