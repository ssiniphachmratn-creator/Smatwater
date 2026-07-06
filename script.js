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
    changePage("step2", "step3");
    startDispensing(); // เริ่มต้นด้วยการจ่ายน้ำทันที
}

// ฟังก์ชันสั่งให้ "จ่ายน้ำ" (น้ำไหล)
function startDispensing() {
    isDispensing = true;
    clearInterval(countdownInterval); // ถ้ากำลังจ่ายน้ำ ให้หยุดนับเวลาถอยหลัง 30 วิ
    
    // อัปเดตหน้าจอแสดงผล
    document.getElementById("countdown-timer").innerText = "💧";
    document.querySelector("#step3 h2").innerText = "กำลังจ่ายน้ำ...";
    
    // เปลี่ยนปุ่มให้แสดงคำว่า "🛑 กดหยุดจ่ายน้ำชั่วคราว"
    let actionBtn = document.querySelector(".btn-stop");
    actionBtn.innerText = "🛑 กดหยุดจ่ายน้ำชั่วคราว";
    actionBtn.setAttribute("onclick", "pauseDispenser()");
    actionBtn.style.backgroundColor = "#dc3545"; // สีแดง
    actionBtn.style.color = "white";
}

// ฟังก์ชันสั่งให้ "หยุดจ่ายน้ำชั่วคราว" (น้ำหยุด และเริ่มนับถอยหลัง 30 วิ)
function pauseDispenser() {
    isDispensing = false;
    document.querySelector("#step3 h2").innerText = "หยุดจ่ายน้ำชั่วคราว";
    
    // เปลี่ยนปุ่มให้แสดงคำว่า "▶️ กดจ่ายน้ำต่อ"
    let actionBtn = document.querySelector(".btn-stop");
    actionBtn.innerText = "▶️ กดจ่ายน้ำต่อ";
    actionBtn.setAttribute("onclick", "startDispensing()");
    actionBtn.style.backgroundColor = "#22c55e"; // สีเขียว
    actionBtn.style.color = "white";
    
    // เริ่มจับเวลาถอยหลัง 30 วินาทีทันที!
    timeLeft = 30;
    document.getElementById("countdown-timer").innerText = timeLeft;
    
    countdownInterval = setInterval(function() {
        timeLeft--;
        document.getElementById("countdown-timer").innerText = timeLeft;
        
        // หากหยุดน้ำค้างไว้นานจนครบ 30 วินาที ระบบจะตัดการทำงานทันที
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            alert("คุณหยุดน้ำค้างไว้นานเกิน 30 วินาที ระบบตัดการทำงานอัตโนมัติครับ");
            resetToHome();
        }
    }, 1000);
}

// ฟังก์ชันช่วยเปลี่ยนหน้าจอ
function changePage(hideId, showId) {
    document.getElementById(hideId).classList.remove("active");
    document.getElementById(showId).classList.add("active");
}

// ฟังก์ชันรีเซ็ตระบบกลับไปหน้าแรกสุด
function resetToHome() {
    clearInterval(countdownInterval);
    isDispensing = false;
    changePage("step3", "step1");
    changePage("step2", "step1");
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
