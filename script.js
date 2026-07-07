let stampCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.water-card').forEach(card => {
        card.addEventListener('click', () => {
            let price = parseInt(card.getAttribute('data-price'));
            
            if (stampCount >= 3) { // ครบ 4 ครั้ง (คือใช้ครั้งที่ 4)
                price = Math.max(0, price - 2);
                alert("ใช้ส่วนลดสมาชิก 2 บาท! จ่ายราคา: " + price + " บาท");
                stampCount = 0;
            } else {
                stampCount++;
                alert("สะสมแต้มครบ: " + stampCount + "/4 ครั้ง");
            }
        });
    });
});
