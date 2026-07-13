// =======================================
// SMART WATER APP
// PART 1
// =======================================

// ---------- ตัวแปร ----------

let currentWater = "";
let currentPrice = 0;

let buyCount = Number(localStorage.getItem("buyCount")) || 0;

let discountReady =
localStorage.getItem("discountReady") === "true";

let running = false;
let countdown = 60;
let timer = null;

// ---------- หน้าจอ ----------

const screens = document.querySelectorAll(".screen");

function showScreen(id){

    screens.forEach(screen=>{
        screen.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");

}

// ---------- โหลดข้อมูล ----------

window.onload=function(){

    updateMember();

    const name=localStorage.getItem("memberName");

    if(name){

        document.getElementById("memberName").value=name;

    }

    document.getElementById("progressBar").style.width="100%";

}

// ---------- สมาชิก ----------

function updateMember(){

    document.getElementById("buyCount").innerHTML=buyCount;

}

function registerMember(){

    const name=document
    .getElementById("memberName")
    .value.trim();

    if(name==""){

        alert("กรุณากรอกชื่อสมาชิก");

        return;

    }

    localStorage.setItem(
        "memberName",
        name
    );

    alert("สมัครสมาชิกสำเร็จ");

}

// ---------- เลือกน้ำ ----------

function selectWater(name,price){

    currentWater=name;

    currentPrice=price;

    let finalPrice=price;

    if(discountReady){

        finalPrice=Math.max(
            price-2,
            0
        );

    }

    document.getElementById("priceText").innerHTML=
    `
    <h3>${currentWater}</h3>

    ยอดชำระ

    <br><br>

    <span style="font-size:32px;color:#2196f3;">
    ${finalPrice}
    บาท
    </span>
    `;

    document.getElementById("paymentStatus").innerHTML=
    "⌛ รอการชำระเงิน...";

    showScreen("payment");

}

// ---------- Mobile Banking ----------

document
.getElementById("bankBtn")
.addEventListener("click",()=>{

    window.open(
        "https://promptpay.io/",
        "_blank"
    );

});
// =======================================
// PART 2
// ระบบชำระเงิน
// =======================================

// จำลองการชำระเงิน
// ภายหลังเปลี่ยนเป็น ESP32 หรือ Supabase ได้

function paymentSuccess(){

    const status =
    document.getElementById("paymentStatus");

    status.innerHTML =
    "✅ ชำระเงินสำเร็จ";

    status.style.color = "#2ecc71";

    // เพิ่มจำนวนครั้งซื้อ
    buyCount++;

    // ซื้อครบ 3 ครั้ง
    if(buyCount >= 3){

        buyCount = 0;

        discountReady = true;

        alert("🎉 คุณได้รับส่วนลด 2 บาทในการซื้อครั้งถัดไป");

    }

    updateMember();

    localStorage.setItem(
        "buyCount",
        buyCount
    );

    localStorage.setItem(
        "discountReady",
        discountReady
    );

    // ถ้าใช้ส่วนลดแล้ว
    if(discountReady){

        setTimeout(()=>{

            discountReady = false;

            localStorage.setItem(
                "discountReady",
                false
            );

        },100);

    }

    // รอ 2 วินาที

    setTimeout(()=>{

        showScreen("dispense");

    },2000);

}

// =======================================
// ฟังก์ชันสำหรับ ESP32
// =======================================

// เมื่อ ESP32 แจ้งว่าชำระเงินแล้ว
// ให้เรียก paymentComplete();

function paymentComplete(){

    paymentSuccess();

}

// =======================================
// ตัวอย่างสำหรับทดสอบ
// =======================================

// สามารถเรียกจาก Console

// paymentComplete();
// =======================================
// PART 3
// ระบบจ่ายน้ำ
// =======================================

// กดปุ่มจ่ายน้ำ
function startDispense(){

    if(running) return;

    running = true;

    console.log("START");

    // ===== ส่งคำสั่งไป ESP32 =====
    // command = "START"

    alert("เริ่มจ่ายน้ำ");

}

// กดปุ่มหยุดจ่ายน้ำ
function stopDispense(){

    if(!running){

        alert("กรุณากดเริ่มจ่ายน้ำก่อน");

        return;

    }

    running = false;

    console.log("STOP");

    // ===== ส่ง STOP ไป ESP32 =====
    // command = "STOP"

    countdown = 60;

    document.getElementById("timer").innerHTML = countdown;

    document.getElementById("progressBar").style.width = "100%";

    timer = setInterval(function(){

        countdown--;

        document.getElementById("timer").innerHTML = countdown;

        let percent = (countdown/60)*100;

        document.getElementById("progressBar").style.width =
        percent + "%";

        if(countdown<=0){

            clearInterval(timer);

            timer = null;

            console.log("AUTO STOP");

            // ส่ง STOP อีกรอบ
            // command="STOP"

            showScreen("success");

            setTimeout(function(){

                goHome();

            },5000);

        }

    },1000);

}

// =======================================
// กลับหน้าหลัก
// =======================================

function goHome(){

    if(timer){

        clearInterval(timer);

    }

    timer = null;

    running = false;

    countdown = 60;

    document.getElementById("timer").innerHTML = "60";

    document.getElementById("progressBar").style.width = "100%";

    document.getElementById("paymentStatus").innerHTML =
    "⌛ รอการชำระเงิน...";

    document.getElementById("paymentStatus").style.color =
    "#ff9800";

    showScreen("home");

}

// =======================================
// รีเซ็ตระบบ
// =======================================

function resetSystem(){

    running = false;

    countdown = 60;

    if(timer){

        clearInterval(timer);

    }

    timer = null;

}
// ======================================
// PART 4
// ESP32 COMMUNICATION
// ======================================

// เปลี่ยนเป็น IP ของ ESP32
const ESP32_IP = "http://192.168.1.100";

// ส่งคำสั่งไป ESP32
async function sendCommand(command){

    try{

        const response = await fetch(
            ESP32_IP + "/command",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    command:command
                })
            }
        );

        const result = await response.json();

        console.log(result);

    }catch(error){

        console.log("ESP32 Offline");

    }

}

// ======================================
// เริ่มจ่ายน้ำ
// ======================================

async function startDispense(){

    if(running) return;

    running=true;

    await sendCommand("START");

    alert("เริ่มจ่ายน้ำ");

}

// ======================================
// หยุดจ่ายน้ำ
// ======================================

async function stopDispense(){

    if(!running){

        alert("กรุณากดเริ่มจ่ายน้ำก่อน");

        return;

    }

    running=false;

    await sendCommand("STOP");

    countdown=60;

    document.getElementById("timer").innerHTML=countdown;

    document.getElementById("progressBar").style.width="100%";

    timer=setInterval(()=>{

        countdown--;

        document.getElementById("timer").innerHTML=countdown;

        document.getElementById("progressBar").style.width=
        (countdown/60*100)+"%";

        if(countdown<=0){

            clearInterval(timer);

            sendCommand("STOP");

            showScreen("success");

            setTimeout(goHome,5000);

        }

    },1000);

}

// ======================================
// ตรวจสอบการชำระเงิน
// ======================================

async function checkPayment(){

    try{

        const response=await fetch(
            ESP32_IP+"/payment"
        );

        const result=await response.json();

        if(result.payment=="paid"){

            paymentSuccess();

        }

    }catch(e){

        console.log("Waiting payment...");

    }

}

// เช็คทุก 2 วินาที

setInterval(function(){

    const paymentScreen=

    document.getElementById("payment");

    if(paymentScreen.classList.contains("active")){

        checkPayment();

    }

},2000);
