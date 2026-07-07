let currentUserPhone = null;
let countdownInterval;

// ระบบสมัครสมาชิก
function submitRegister() {
    const nameInput = document.querySelector("#registerPage input[type='text']");
    const phoneInput = document.querySelector("#registerPage input[type='tel']");
    
    if (!nameInput.value || !phoneInput.value) {
        alert("กรุณากรอกข้อมูลให้ครบ");
        return;
    }

    db.collection("members").doc(phoneInput.value).set({
        name: nameInput.value,
        phone: phoneInput.value,
        registeredAt: firebase.firestore.FieldValue.serverTimestamp(),
        stampCount: 0
    }).then(() => {
        alert("บันทึกเข้าสู่ระบบเรียบร้อยแล้ว");
        currentUserPhone = phoneInput.value;
        nameInput.value = "";
        phoneInput.value = "";
        changePage("registerPage", "step1");
    });
}

// ระบบกดน้ำ + ส่วนลด (ครบ 5 ครั้ง ลด 2 บาท)
async function selectAmount(amount) {
    let finalPrice = amount;
    if (currentUserPhone) {
        const userDoc = await db.collection("members").doc(currentUserPhone).get();
        if (userDoc.exists && userDoc.data().stampCount >= 5) {
            alert("🌟 ใช้สิทธิ์ส่วนลดสะสมแต้ม 2 บาท!");
            db.collection("members").doc(currentUserPhone).update({ stampCount: 0 });
            finalPrice = Math.max(0, amount - 2);
        }
    }

    document.getElementById("selected-price").innerText = finalPrice;
    db.collection("machine_control").doc("status_doc").set({ 
        status: "pending", 
        price: finalPrice, 
        updatedAt: firebase.firestore.FieldValue.serverTimestamp() 
    }, { merge: true }).then(() => changePage("step1", "step2"));
}

// ระบบหยุดน้ำ 1 นาที
function pauseDispenser() {
    db.collection("machine_control").doc("status_doc").update({ status: "paused" });
    document.getElementById("working-status-title").innerText = "หยุดจ่ายน้ำชั่วคราว";
    
    let time = 60;
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        time--;
        if (time <= 0) {
            clearInterval(countdownInterval);
            alert("หมดเวลา! ระบบตัดน้ำ");
            db.collection("machine_control").doc("status_doc").update({ status: "completed" });
            changePage("step3", "step1");
        }
    }, 1000);
}

// ระบบบันทึก Transaction หลังบ้าน
function completeTransaction() {
    const price = document.getElementById("selected-price").innerText;
    if (currentUserPhone) {
        db.collection("transactions").add({
            phone: currentUserPhone,
            price: price,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        db.collection("members").doc(currentUserPhone).update({ 
            stampCount: firebase.firestore.FieldValue.increment(1) 
        });
    }
    changePage("step3", "step1");
}

function changePage(hideId, showId) {
    document.getElementById(hideId).classList.remove("active");
    document.getElementById(showId).classList.add("active");
}

// ผูกปุ่มทั้งหมด
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-water-5").onclick = () => selectAmount(5);
    document.getElementById("btn-water-10").onclick = () => selectAmount(10);
    document.getElementById("btn-submit-register").onclick = submitRegister;
    document.getElementById("btn-goto-register").onclick = () => changePage("step1", "registerPage");
    document.getElementById("btn-cancel-register").onclick = () => changePage("registerPage", "step1");
    document.getElementById("btn-main-action").onclick = () => {
        const text = document.getElementById("btn-main-action").innerText;
        text.includes("หยุด") ? pauseDispenser() : completeTransaction();
    };
});
