let currentUserPhone = null;
let countdownInterval;

function changePage(hideId, showId) {
    document.getElementById(hideId).classList.remove("active");
    document.getElementById(showId).classList.add("active");
}

function selectAmount(amount) {
    document.getElementById("selected-price").innerText = amount;
    db.collection("machine_control").doc("status_doc").set({
        status: "pending",
        price: amount,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).then(() => changePage("step1", "step2"));
}

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

function submitRegister() {
    const name = document.querySelector("#registerPage input[type='text']").value;
    const phone = document.querySelector("#registerPage input[type='tel']").value;
    db.collection("members").doc(phone).set({ name, phone, stampCount: 0 }).then(() => {
        alert("สมัครสมาชิกสำเร็จ!");
        currentUserPhone = phone;
        changePage("registerPage", "step1");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-water-5").onclick = () => selectAmount(5);
    document.getElementById("btn-water-10").onclick = () => selectAmount(10);
    document.getElementById("btn-submit-register").onclick = submitRegister;
    document.getElementById("btn-goto-register").onclick = () => changePage("step1", "registerPage");
    document.getElementById("btn-cancel-register").onclick = () => changePage("registerPage", "step1");
    document.getElementById("btn-back-to-home").onclick = () => changePage("step2", "step1");
    document.getElementById("btn-main-action").onclick = pauseDispenser;
});
