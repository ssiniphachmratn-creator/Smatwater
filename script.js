// 1. นำเข้าไลบรารี Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, serverTimestamp, getDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// 3. ฟังก์ชันระบบสมาชิกและแต้ม
async function addStamp() {
    if (!currentUserPhone) return;
    const userRef = doc(db, "members", currentUserPhone);
    await updateDoc(userRef, { stampCount: increment(1) });
}

async function getFinalPrice(amount) {
    if (!currentUserPhone) return amount;
    const userDoc = await getDoc(doc(db, "members", currentUserPhone));
    if (userDoc.exists() && userDoc.data().stampCount >= 3) {
        alert("🌟 ใช้สิทธิ์ส่วนลดสะสมแต้ม 5 บาท!");
        await updateDoc(doc(db, "members", currentUserPhone), { stampCount: 0 });
        return amount - 5;
    }
    return amount;
}

// 4. ฟังก์ชันการทำงานหลัก
async function selectAmount(amount) {
    const finalPrice = await getFinalPrice(amount);
    document.getElementById("selected-price").innerText = finalPrice;
    
    setDoc(doc(db, "machine_control", "status_doc"), { 
        status: "pending", 
        price: finalPrice, 
        updatedAt: serverTimestamp() 
    }, { merge: true }).then(() => changePage("step1", "step2"));
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
        alert("บันทึกเข้าสู่ระบบเรียบร้อยแล้ว");
        currentUserPhone = phoneInput.value;
        nameInput.value = "";
        phoneInput.value = "";
        changePage("registerPage", "step1");
    });
}

// 5. ดักฟังสถานะและควบคุมตู้
onSnapshot(doc(db, "machine_control", "status_doc"), (doc) => {
    if (doc.exists() && document.getElementById("step2").classList.contains("active") && doc.data().status === "paid") {
        triggerPaymentSuccess();
    }
});

function triggerPaymentSuccess() {
    changePage("step2", "stepSuccess");
    setTimeout(() => {
        changePage("stepSuccess", "step3");
        updateDoc(doc(db, "machine_control", "status_doc"), { status: "dispensing" });
        startDispensing();
    }, 2000);
}

function startDispensing() {
    document.getElementById("working-status-title").innerText = "กำลังจ่ายน้ำ...";
    document.getElementById("btn-main-action").innerText = "🛑 กดหยุดจ่ายน้ำชั่วคราว";
}

// จบการจ่ายน้ำ ให้เพิ่มแต้ม
function completeTransaction() {
    addStamp();
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
    document.getElementById("btn-simulate-esp")?.addEventListener("click", () => () => updateDoc(doc(db, "machine_control", "status_doc"), { status: "paid" }));
    document.getElementById("btn-submit-register")?.addEventListener("click", submitRegister);
    document.getElementById("btn-goto-register")?.addEventListener("click", () => changePage("step1", "registerPage"));
    document.getElementById("btn-cancel-register")?.addEventListener("click", () => changePage("registerPage", "step1"));
    // เพิ่มปุ่มจบรายการ (ที่หน้า Step 3 ให้กดเพื่อกลับหน้าแรกและเพิ่มแต้ม)
    document.getElementById("btn-main-action")?.addEventListener("click", completeTransaction);
});
