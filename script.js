let countdownInterval;  // ตัวแปรสำหรับจับเวลา
let timeLeft = 30;      // เวลาถอยหลังเมื่อกดหยุดน้ำ (30 วินาที)
let isDispensing = false; // สถานะการจ่ายน้ำ (true = กำลังไหล, false = หยุดชั่วคราว)

// ฟังก์ชันเมื่อกดเลือกรายการน้ำดื่ม (5 หรือ 10 บาท)
function selectAmount(amount) {
    document.getElementById("selected-price").innerText = amount;
    changePage("step1", "step2");
}

// ฟังก์ชันเมื่อบอร์ด ESP ส่งสัญญาณกลับมาว่า "ได้รับเงินเรียบร้อยแล้ว"
function simulateEspSignal() {
    // 1. เปลี่ยนไปหน้า "ชำระเงินสำเร็จ" โชว์ติ๊กถูกเขียวๆ ก่อน
    changePage("step2", "stepSuccess");
    
    // 2. หน่วงเวลาไว้ 2 วินาทีให้ดูพรีเมียม แล้วค่อยเด้งเข้าหน้าสเต็ปจ่ายน้ำ
    setTimeout(function() {
        changePage("stepSuccess", "step3");
        startDispensing(); // เริ่มต้นปล่อยน้ำทันที
    }, 2000);
}

// ฟังก์ชันสั่งให้ "จ่ายน้ำ" (โหมดปกติ น้ำไหล)
function startDispensing() {
    isDispensing = true;
    clearInterval(countdownInterval); // สั่งหยุดนับถอยหลัง 30 วิ ทันทีเพราะน้ำกำลังไหล
    
    // อัปเดต UI หน้าจอให้เข้าสู่โหมดจ่ายน้ำ
    document.getElementById("countdown-timer").innerText = "💧";
    document.getElementById("timer-unit").innerText = "กำลังจ่ายน้ำ...";
    document.getElementById("working-status-title").innerText = "กำลังจ่ายน้ำ...";
    document.querySelector(".water-drop-animation").style.animation = "pulse 1.5s infinite";
    
    // รีเซ็ตสไตล์ปุ่มเป็น "🛑 กดหยุดจ่ายน้ำชั่วคราว"
    let actionBtn = document.querySelector(".btn-stop");
    actionBtn.innerText = "🛑 กดหยุดจ่ายน้ำชั่วคราว";
    actionBtn.setAttribute("onclick", "pauseDispenser()");
    actionBtn.style.backgroundColor = "#dc3545"; // สีแดงปุ่มหยุดชั่วคราว
    actionBtn.style.color = "white";
}

// ฟังก์ชันสั่งให้ "หยุดจ่ายน้ำชั่วคราว" (น้ำหยุด และเริ่มจับเวลา 30 วิ ทันที!)
function pauseDispenser() {
    isDispensing = false;
    document.getElementById("working-status-title").innerText = "หยุดจ่ายน้ำชั่วคราว";
    document.getElementById("timer-unit").innerText = "วินาทีก่อนระบบตัด";
    document.querySelector(".water-drop-animation").style.animation = "none"; // หยุดอนิเมชันหยดน้ำสั่น
    
    // เปลี่ยนปุ่มเป็น "▶️ กดจ่ายน้ำต่อ" เพื่อให้สลับกดใช้งานได้
    let actionBtn = document.querySelector(".btn-stop");
    actionBtn.innerText = "▶️ กดจ่ายน้ำต่อ";
    actionBtn.setAttribute("onclick", "startDispensing()");
    actionBtn.style.backgroundColor = "#22c55e"; // เปลี่ยนเป็นสีเขียว
    actionBtn.style.color = "white";
    
    // โหลดตัวจับเวลานับถอยหลัง 30 วินาทีตามใจสั่ง!
    timeLeft = 30;
    document.getElementById("countdown-timer").innerText = timeLeft;
    
    countdownInterval = setInterval(function() {
        timeLeft--;
        document.getElementById("countdown-timer").innerText = timeLeft;
        
        // หากครบ 30 วินาทีแล้วไม่มีการกดจ่ายน้ำต่อ ระบบจะตัดและเด้งกลับหน้าแรกอัตโนมัติ
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            alert("คุณหยุดน้ำค้างไว้นานเกิน 30 วินาที ระบบตัดการทำงานอัตโนมัติครับ");
            resetToHome();
        }
    }, 1000);
}

// ฟังก์ชันช่วยเปลี่ยนหน้าจอแสดงผล
function changePage(hideId, showId) {
    document.getElementById(hideId).classList.remove("active");
    document.getElementById(showId).classList.add("active");
}

// ฟังก์ชันรีเซ็ตระบบทั้งหมดกลับไปหน้าแรกสุด (หน้าหลัก)
function resetToHome() {
    clearInterval(countdownInterval);
    isDispensing = false;
    changePage("step3", "step1");
    changePage("step2", "step1");
    changePage("stepSuccess", "step1");
    changePage("registerPage", "step1");
}

// ==========================================
// ฟังก์ชันจัดการหน้าสมัครสมาชิกแบบเต็มหน้าจอ
// ==========================================
function openRegisterModal() { 
    changePage("step1", "registerPage"); 
}

function closeRegisterPage() { 
    changePage("registerPage", "step1"); 
}

function submitRegister() {
    alert("สมัครสมาชิกสำเร็จ! ระบบได้บันทึกข้อมูลเรียบร้อยแล้วครับ");
    changePage("registerPage", "step1");
}
