document.addEventListener('DOMContentLoaded', () => {
    // --- ระบบสมาชิก ---
    const modal = document.getElementById('register-modal');
    const registerBtn = document.getElementById('register-btn');
    const memberDisplay = document.getElementById('member-display');

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }

    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const name = document.getElementById('input-name').value;
            const phone = document.getElementById('input-phone').value;

            if (name && phone.length >= 9) {
                document.getElementById('display-name').innerText = name;
                document.getElementById('display-phone').innerText = phone;
                
                document.getElementById('register-btn').style.display = 'none';
                memberDisplay.style.display = 'block';
                modal.style.display = 'none';
            } else {
                alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            }
        });
    }

    // --- ระบบเลือกน้ำ (ส่วนที่แกบอกว่ากดไม่ได้) ---
    document.querySelectorAll('.water-card').forEach(card => {
        card.addEventListener('click', () => {
            const price = card.getAttribute('data-price');
            const vol = card.querySelector('.vol-badge').innerText;
            
            // ใส่คำสั่งตรงนี้ว่าจะให้มันทำอะไร เช่น ส่งค่าไปที่ตู้ หรือจ่ายเงิน
            alert("คุณเลือกน้ำ: " + vol + " ราคา: " + price + " บาท");
            
            // ถ้าอยากให้ทำอย่างอื่นเพิ่ม บอกไอได้เลยครับ!
        });
    });
});
