// --- ฟังก์ชันหลัก ---

// เปลี่ยนหน้า (ซ่อนอันเก่า, แสดงอันใหม่)
function changePage(hideId, showId) {
    document.getElementById(hideId).classList.remove("active");
    document.getElementById(showId).classList.add("active");
}

// เลือกน้ำดื่ม -> อัปเดต Firestore -> ไปหน้าจ่ายเงิน
function selectAmount(amount) {
    document.getElementById("selected-price").innerText = amount;
    db.collection("machine_control").doc("status_doc").set({
        status: "pending",
        price: amount,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).then(() => changePage("step1", "step2"));
}

// ระบบหยุดน้ำชั่วคราว (Toggle)
function toggleDispenser() {
    const btn = document.getElementById("btn-main-action");
    const statusTitle = document.getElementById("working-status-title");

    if (btn.innerText.includes("หยุด")) {
        // กดหยุด
        db.collection("machine_control").doc("status_doc").update({ status: "paused" });
        statusTitle.innerText = "หยุดจ่ายน้ำชั่วคราว";
        btn.innerText = "▶️ กดจ่ายน้ำต่อ";
    } else {
        // กดจ่ายต่อ
        db.collection("machine_control").doc("status_doc").update({ status: "dispensing" });
        statusTitle.innerText = "กำลังจ่ายน้ำ...";
        btn.innerText = "🛑 กดหยุดจ่ายน้ำชั่วคราว";
    }
}

// สมัครสมาชิก
function submitRegister() {
    const inputs = document.querySelectorAll("#registerPage input");
    const name = inputs[0].value;
    const phone = inputs[1].value;
    
    if(!name || !phone) { alert("กรุณากรอกข้อมูลให้ครบ"); return; }
    
    db.collection("members").doc(phone).set({ 
        name: name, 
        phone: phone, 
        stampCount: 0 
    }).then(() => {
        alert("สมัครสมาชิกสำเร็จ!");
        inputs[0].value = "";
        inputs[1].value = "";
        changePage("registerPage", "step1");
    });
}

// --- ผูกปุ่มทั้งหมดเมื่อโหลดหน้าเว็บ ---
document.addEventListener("DOMContentLoaded", () => {
    // หน้าหลัก
    document.getElementById("btn-water-5").onclick = () => selectAmount(5);
    document.getElementById("btn-water-10").onclick = () => selectAmount(10);
    document.getElementById("btn-goto-register").onclick = () => changePage("step1", "registerPage");

    // หน้าชำระเงิน
    document.getElementById("btn-simulate-esp").onclick = () => changePage("step2", "step3");
    document.getElementById("btn-back-to-home").onclick = () => changePage("step2", "step1");

    // หน้าจ่ายน้ำ
    document.getElementById("btn-main-action").onclick = toggleDispenser;

    // หน้าสมัครสมาชิก
    document.getElementById("btn-submit-register").onclick = submitRegister;
    document.getElementById("btn-cancel-register").onclick = () => changePage("registerPage", "step1");
});
