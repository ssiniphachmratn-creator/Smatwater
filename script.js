import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, serverTimestamp, getDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ... (Firebase Config คงเดิม) ...

// เพิ่มตัวแปรเก็บเบอร์โทรศัพท์ที่ล็อกอินไว้
let currentUserPhone = null;

// ฟังก์ชันเพิ่มแต้มอัตโนมัติ (เรียกใช้ตอนจ่ายน้ำเสร็จ)
async function addStamp(phone) {
    if (!phone) return;
    const userRef = doc(db, "members", phone);
    await updateDoc(userRef, {
        stampCount: increment(1) // เพิ่มแต้มครั้งละ 1
    });
    console.log("เพิ่มแต้มสำเร็จ!");
}

// ฟังก์ชันดึงชื่อมาโชว์
async function showMemberName(phone) {
    const userDoc = await getDoc(doc(db, "members", phone));
    if (userDoc.exists()) {
        const userName = userDoc.data().name;
        alert("ยินดีต้อนรับคุณ " + userName + " ครับ!");
        currentUserPhone = phone; // เก็บเบอร์ไว้ใช้ตอนคิดแต้ม
    }
}

// แก้ไขฟังก์ชัน submitRegister เดิมเล็กน้อย
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
        currentUserPhone = phoneInput.value; // จำเบอร์ไว้
        nameInput.value = "";
        phoneInput.value = "";
        changePage("registerPage", "step1");
    });
}

// เรียกใช้ addStamp ตอนจบกระบวนการ (ในฟังก์ชันที่จ่ายน้ำเสร็จ)
// ตรงส่วน resetToHome หรือตอนที่ระบบเปลี่ยนสถานะเป็น completed
function finishTransaction() {
    if (currentUserPhone) {
        addStamp(currentUserPhone);
    }
    resetToHome();
}
