// ===============================
// Smart Water App
// script.js (Part 1)
// ===============================

let currentWater = "";
let currentPrice = 0;

let countdown = 60;
let timer = null;
let running = false;

let buyCount = Number(localStorage.getItem("buyCount")) || 0;

const screens = document.querySelectorAll(".screen");

function showScreen(id) {
    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");
}

function updateMemberInfo() {
    const count = document.getElementById("buyCount");

    if (count) {
        count.textContent = buyCount;
    }
}

updateMemberInfo();

function registerMember() {

    const name =
        document.getElementById("memberName").value.trim();

    if (name === "") {
        alert("กรุณากรอกชื่อสมาชิก");
        return;
    }

    localStorage.setItem("memberName", name);

    alert("สมัครสมาชิกสำเร็จ");
}

function selectWater(name, price) {

    currentWater = name;
    currentPrice = price;

    let finalPrice = price;

    if (buyCount >= 4) {

        finalPrice = Math.max(price - 2, 0);

    }

    document.getElementById("priceText").innerHTML =
        `ยอดชำระ ${finalPrice} บาท`;

    showScreen("payment");
}

function paymentSuccess() {

    buyCount++;

    if (buyCount > 4) {
        buyCount = 1;
    }

    localStorage.setItem("buyCount", buyCount);

    updateMemberInfo();

    showScreen("dispense");
}
// ===============================
// script.js (Part 2)
// ระบบจ่ายน้ำและนับเวลา
// ===============================

function startDispense() {

    if (running) return;

    running = true;

    countdown = 60;

    document.getElementById("timer").innerHTML = countdown;

    updateProgress();

    timer = setInterval(() => {

        countdown--;

        document.getElementById("timer").innerHTML = countdown;

        updateProgress();

        if (countdown <= 0) {

            clearInterval(timer);

            running = false;

            alert("หมดเวลาการจ่ายน้ำ");

            goHome();

        }

    }, 1000);

}

function stopDispense() {

    if (timer) {

        clearInterval(timer);

    }

    running = false;

    showScreen("success");

}

function updateProgress() {

    const percent = (countdown / 60) * 100;

    document.getElementById("progressBar").style.width =
        percent + "%";

}
// ===============================
// script.js (Part 3)
// ส่วนสุดท้าย
// ===============================

// กลับหน้าหลัก
function goHome() {

    if (timer) {
        clearInterval(timer);
    }

    running = false;
    countdown = 60;

    document.getElementById("timer").innerHTML = "60";
    document.getElementById("progressBar").style.width = "100%";

    showScreen("home");
}

// โหลดข้อมูลเมื่อเปิดแอป
window.onload = function () {

    updateMemberInfo();

    const memberName = localStorage.getItem("memberName");

    if (memberName) {
        document.getElementById("memberName").value = memberName;
    }

    document.getElementById("progressBar").style.width = "100%";
}

// เปิด Mobile Banking
const bankButton = document.querySelector(".green");

if (bankButton) {

    bankButton.addEventListener("click", function () {

        // ตัวอย่าง PromptPay
        // เปลี่ยน URL นี้เป็น Deep Link ของธนาคารที่ต้องการได้
        window.open(
            "https://promptpay.io/",
            "_blank"
        );

    });

}
