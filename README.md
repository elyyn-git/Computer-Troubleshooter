# Computer Troubleshooter

Aplikasi pembelajaran untuk membantu pengguna menelusuri kemungkinan masalah komputer/laptop melalui pertanyaan Ya/Tidak.

## Teknologi
- C++17 dan Crow untuk backend API
- HTML, CSS, dan JavaScript untuk frontend
- CSV sebagai sumber data kategori, pertanyaan, dan solusi

## Struktur
- `backend/` — server Crow dan logika diagnosis C++
- `frontend/` — halaman web dan JavaScript
- `database/` — `kategori.csv`, `pertanyaan.csv`, dan `solusi.csv`
- `.vscode/tasks.json` — konfigurasi build MSVC untuk lingkungan pengembang

## Menjalankan backend (Windows + MSVC)

1. Pastikan Visual Studio C++ Build Tools, Crow, dan Asio sudah terpasang.
2. Buka **x64 Native Tools Command Prompt for VS** atau Developer Command Prompt.
3. Masuk ke folder utama project:
   `cd /d D:\VSCODE\Computer-Troubleshooter`
4. Build melalui VS Code dengan `Ctrl+Shift+B`, atau jalankan perintah build yang ada di `.vscode/tasks.json`.
5. Jalankan `server.exe` dari folder utama project. Jangan menjalankan executable dari folder lain karena backend membaca CSV dengan path relatif `database/...`.
6. Buka `http://localhost:18080/`. Pesan `Computer Troubleshooter API is running!` menandakan server hidup.

> Konfigurasi task saat ini memakai lokasi include Crow dan Asio `D:/Library/Crow/include` dan `D:/Library/asio/include`. Sesuaikan dua path tersebut jika lokasi library di komputer berbeda.

## Menjalankan frontend

1. Dengan backend tetap berjalan, buka folder `frontend` di VS Code.
2. Jalankan `index.html` menggunakan ekstensi Live Server (atau server file statis lain).
3. Frontend mengakses API di `http://localhost:18080/api`.
4. Jika browser menampilkan error koneksi/CORS, pastikan server Crow aktif dan buka Console browser untuk melihat pesan error.

## Akun demo
- Admin: username `admin`
- Password: `admin123`
- Guest: isi username bebas

Akun admin di atas hanya simulasi frontend, bukan autentikasi aman untuk produksi.

## Batasan implementasi saat ini
- Kategori, pertanyaan diagnosis, dan solusi diagnosis dibaca dari CSV backend.
- Riwayat diagnosis disimpan di `localStorage` browser yang digunakan; data tidak otomatis dibagikan antarperangkat atau antar-browser.
- Form pertanyaan Admin saat ini menyimpan pertanyaan tambahan di `localStorage` browser. Form tersebut **belum menambah atau mengubah** `database/pertanyaan.csv` maupun `database/solusi.csv`, dan pertanyaan tambahan belum dipakai oleh mesin diagnosis backend.
- File `database/riwayat.csv` belum menjadi penyimpanan riwayat yang digunakan oleh halaman web.

## Catatan pengembangan
Sebelum digunakan di luar demo/pembelajaran, autentikasi Admin, validasi API, penyimpanan riwayat server, dan CRUD database perlu dikembangkan lebih lanjut.
