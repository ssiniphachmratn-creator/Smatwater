let currentUserPhone = null;
let countdown;
let timeLeft = 60;

function changePage(hideId, showId) {
    document.querySelectorAll('.step-page').forEach(p => p.classList.remove('active'));
    document.getElementById(showId).classList.add('active');
}

async function selectAmount(amount) {
    let finalPrice = amount;
    if (currentUserPhone) {
        const doc = await db.collection("members").doc(currentUserPhone).get();
        if (doc.exists && doc.data().stampCount >= 4) {
            finalPrice = Math.max(0, amount - 2);
            alert("ใช้ส่วนลด 2 บาท!");
            db.collection("members").doc(currentUserPhone).update({ stampCount: 0 });
        }
    }
    document.getElementById("selected-price").innerText = finalPrice + " ฿";
    db.collection("machine_control").doc("status_doc").set({ status: "pending", price: finalPrice }, { merge: true });
    changePage("step1", "step2");
}

function saveMember() {
    const phone = document.getElementById("user-phone").value;
    db.collection("members").doc(phone).set({ stampCount: 0 }).then(() => {
        currentUserPhone = phone;
        alert("สมัครเรียบร้อย! สะสมครบ 4 ครั้งลดทันที 2 บาท");
        changePage('registerPage', 'step1');
    });
}

function startDispensing() {
    timeLeft = 60;
    clearInterval(countdown);
    countdown = setInterval(() => {
        timeLeft--;
        document.getElementById("countdown-timer").innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            db.collection("machine_control").doc("status_doc").update({ status: "completed" });
            changePage("step3", "step4");
        }
    }, 1000);
}

window.simulatePayment = function() {
    changePage("step2", "step3");
    
    // อัปเดตแต้มสมาชิกเพิ่ม
    if (currentUserPhone) {
        db.collection("members").doc(currentUserPhone).update({
            stampCount: firebase.firestore.FieldValue.increment(1)
        });
    }
    startDispensing();
};

function toggleDispenser() {
    const btn = document.getElementById("btn-main-action");
    if (btn.innerText.includes("หยุด")) {
        clearInterval(countdown);
        btn.innerText = "▶️ จ่ายน้ำต่อ";
    } else {
        startDispensing();
    }
}
