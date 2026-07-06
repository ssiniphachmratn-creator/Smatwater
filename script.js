let countdownTimer;
let timeLeft = 30;

function navigateTo(stepId) {
    document.querySelectorAll('.step-page').forEach(page => page.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
}

function selectAmount(amount) {
    document.getElementById('selectedPrice').textContent = amount;
    navigateTo('step2');
}

function mockPaymentSuccess() {
    navigateTo('step3');
    startWater();
}

function startWater() {
    clearInterval(countdownTimer);
    document.getElementById('statusDisplay').textContent = "กำลังจ่ายน้ำ...";
    document.getElementById('statusDisplay').className = "status-box status-working";
    document.getElementById('timerCountdown').style.display = "none";
    document.getElementById('btnStart').style.display = "none";
    document.getElementById('btnPause').style.display = "block";
}

function pauseWater() {
    document.getElementById('statusDisplay').textContent = "หยุดจ่ายน้ำชั่วคราว";
    document.getElementById('statusDisplay').className = "status-box status-paused";
    document.getElementById('btnPause').style.display = "none";
    document.getElementById('btnStart').style.display = "block";
    
    timeLeft = 30;
    const timerDisplay = document.getElementById('timerCountdown');
    timerDisplay.textContent = timeLeft;
    timerDisplay.style.display = "block";

    countdownTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            cutOffMachine();
        }
    }, 1000);
}

function cutOffMachine() {
    clearInterval(countdownTimer);
    document.getElementById('statusDisplay').textContent = "หมดเวลา! เครื่องตัดการทำงาน";
    document.getElementById('statusDisplay').className = "status-box status-off";
    document.getElementById('timerCountdown').style.display = "none";
    document.getElementById('btnStart').style.display = "none";
    document.getElementById('btnPause').style.display = "none";
    
    setTimeout(() => {
        navigateTo('step1');
        document.getElementById('btnStart').style.display = "none";
        document.getElementById('btnPause').style.display = "block";
    }, 3000);
}
// ฟังก์ชันเปิด Popup สมัครสมาชิก
function openRegisterModal() {
    document.getElementById("registerModal").style.display = "flex";
}

// ฟังก์ชันปิด Popup สมัครสมาชิก
function closeRegisterModal() {
    document.getElementById("registerModal").style.display = "none";
}

// ฟังก์ชันเมื่อกดปุ่มยืนยันการสมัคร
function submitRegister() {
    alert("สมัครสมาชิกสำเร็จ! คุณได้รับส่วนลดเรียบร้อยแล้วครับ");
    closeRegisterModal();
}
