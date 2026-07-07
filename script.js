document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('register-modal');
    const registerBtn = document.getElementById('register-btn');
    const memberBanner = document.getElementById('member-banner');
    const memberDisplay = document.getElementById('member-display');

    // เปิดหน้ากรอกข้อมูล
    registerBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // ปุ่มตกลง
    document.getElementById('save-btn').addEventListener('click', () => {
        const name = document.getElementById('input-name').value;
        const phone = document.getElementById('input-phone').value;

        if (name && phone.length >= 9) {
            // โชว์ชื่อสมาชิก
            document.getElementById('display-name').innerText = name;
            document.getElementById('display-phone').innerText = phone;
            
            // สลับโหมดแสดงผล
            registerBtn.style.display = 'none';
            memberDisplay.style.display = 'block';
            modal.style.display = 'none';
            
            alert("ยินดีต้อนรับคุณ " + name);
        } else {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        }
    });
});
