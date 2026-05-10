JapaneseCenter - JSMART

Tong quan
- Nen tang hoc tieng Nhat voi khoa hoc, bai hoc, quiz, va cong dong.
- Backend Django REST API va frontend HTML/CSS/JS.
- Tich hop thanh toan VNPAY sandbox.

Tinh nang chinh
- Dang ky, dang nhap JWT, cap nhat ho so.
- Danh sach khoa hoc, chi tiet khoa hoc, goi y tim kiem.
- Tien do hoc tap, danh dau hoan thanh bai hoc.
- Quiz: lam bai, nop bai, lich su, leaderboard, xem lai dap an.
- Gio hang, thanh toan VNPAY, xu ly return/IPN.
- Binh luan bai hoc, ghi chu ca nhan, forum chu de va tra loi.

Cong nghe
- Python, Django, Django REST Framework
- MySQL
- Frontend HTML/CSS/JS

Cai dat nhanh
1) Tao moi truong ao va cai dependency
```
python -m venv venv
.
venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
```

2) Tao file env
- Tao file [backend/.env](backend/.env) va khai bao:
```
VNPAY_TMN_CODE=YOUR_TMN_CODE
VNPAY_HASH_SECRET=YOUR_HASH_SECRET
VNPAY_RETURN_URL=http://127.0.0.1:8000/educations/vnpay/return/
VNPAY_IPN_URL=http://127.0.0.1:8000/educations/vnpay/ipn/
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_FRONTEND_RETURN_URL=http://127.0.0.1:5500/Frontend/Payment.html
```

3) Migrate va chay server
```
Set-Location backend
python manage.py migrate
python manage.py runserver
```

Test
```
Set-Location backend
python manage.py test education
```

Thanh toan VNPAY sandbox
- Frontend goi POST /educations/checkout/ de lay payment_url
- VNPAY goi returnUrl va ipnUrl de xac nhan thanh toan

Tu dong het han thanh toan
- Command: python manage.py expire_payments --seconds 60
- Co the chay dinh ky bang Task Scheduler

Ghi chu
- IPN can public URL (vd ngrok) neu chay local.
