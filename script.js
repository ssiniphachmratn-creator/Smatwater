let countdownInterval; // ตัวแปรสำหรับจับเวลา
let timeLeft = 30;     // เวลาเริ่มต้น 30 วินาที

// ฟังก์ชันเมื่อกดเลือกรายการน้ำดื่ม (5 หรือ 10 บาท)
function selectAmount(amount) {
    // 1. แสดงราคาน้ำในหน้าชำระเงิน
    document.getElementById("selected-price").innerText = amount;
    
    // 2. สั่งเปลี่ยนจากหน้าสเต็ป 1 ไป หน้าสเต็ป 2 (หน้าชำระเงิน)
    changePage("step1", "step2");
}

// ฟังก์ชันจำลองเมื่อบอร์ด ESP ส่งสัญญาณกลับมาว่า "ได้รับเงินเรียบร้อยแล้ว"
function simulateEspSignal() {
    // เปลี่ยนหน้าไปสเต็ป 3 (หน้าจ่ายน้ำ)
    changePage("step2", "step3");
    // เริ่มต้นนับเวลาถอยหลัง 30 วินาที
    startCountdown();
}

// ฟังก์ชันเริ่มต้นนับเวลาถอยหลัง
function startCountdown() {
    timeLeft = 30; // รีเซ็ตเวลาเป็น 30
    document.getElementById("countdown-timer").innerText = timeLeft;
    
    // ล้าง Interval เก่าออกก่อนป้องกันการทำงานซ้อนกัน
    clearInterval(countdownInterval);
    
    countdownInterval = setInterval(function() {
        timeLeft--;
        document.getElementById("countdown-timer").innerText = timeLeft;
        
        // ถ้าครบ 30 วินาที ให้ระบบตัดการทำงานทันที
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            alert("หมดเวลา 30 วินาที! ระบบตัดการจ่ายน้ำเรียบร้อยแล้วครับ");
            resetToHome();
        }
    }, 1000); // ทำงานทุกๆ 1 วินาที
}

// ฟังก์ชันเมื่อกดปุ่ม "หยุดจ่ายน้ำทันที"
function stopDispenser() {
    clearInterval(countdownInterval); // หยุดนับเวลา
    alert("คุณได้กดหยุดจ่ายน้ำแล้ว ระบบตัดการทำงานทันทีครับ");
    resetToHome();
}

// ฟังก์ชันช่วยเปลี่ยนหน้าจอ
function changePage(hideId, showId) {
    document.getElementById(hideId).classList.remove("active");
    document.getElementById(showId).classList.add("active");
}

// ฟังก์ชันรีเซ็ตระบบกลับไปหน้าแรกสุด
function resetToHome() {
    changePage("step3", "step1");
    changePage("step2", "step1");
}

// ==========================================
// ฟังก์ชันจัดการหน้าสมัครสมาชิกแบบเต็มหน้าจอ
// ==========================================

// ฟังก์ชันเปิดหน้าสมัครสมาชิก (สลับหน้า)
function openRegisterModal() {
    changePage("step1", "registerPage");
}

// ฟังก์ชันยกเลิกสมัครสมาชิก กลับหน้าแรก
function closeRegisterPage() {
    changePage("registerPage", "step1");
}

// ฟังก์ชันยืนยันการสมัครสมาชิก
function submitRegister() {
    alert("สมัครสมาชิกสำเร็จ! ระบบได้บันทึกข้อมูลเรียบร้อยแล้วครับ");
    changePage("registerPage", "step1"); // สลับกลับหน้าแรก
}
