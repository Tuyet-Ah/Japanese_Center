.\venv\Scripts\Activate.ps1

$ngrokPath = "D:\down\ngrok.exe"
$port = 8000

Start-Process -NoNewWindow -FilePath $ngrokPath -ArgumentList "http $port"
python manage.py runserver
