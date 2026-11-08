# Identifikasi Warna Motor (HSV + SVM) — Next.js

## Jalankan lokal
```bash
npm install
npm run dev   # http://localhost:3000
```
(Butuh Node.js 18.17+ — https://nodejs.org)

## Push ke GitHub
1. Buat repo kosong di https://github.com/new (mis. `identifikasi-warna-motor`), jangan centang README.
2. Di folder proyek:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<username>/identifikasi-warna-motor.git
git push -u origin main
```

## Deploy ke Vercel
1. Buka https://vercel.com, login dengan GitHub.
2. Klik **Add New… → Project**, pilih repo tadi lalu **Import**.
3. Framework terdeteksi otomatis **Next.js**; biarkan Build Command/Output default.
4. Klik **Deploy**. Tunggu ±1 menit, URL `*.vercel.app` siap.
5. Setiap `git push` ke `main` akan otomatis redeploy.

