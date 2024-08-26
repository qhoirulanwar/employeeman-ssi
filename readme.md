# Employeeman

Employeeman adalah aplikasi manajemen karyawan yang terdiri dari backend (employeeman-be) dan frontend (employeeman-fe).

## Deskripsi

Aplikasi ini dirancang untuk membantu perusahaan dalam mengelola data karyawan mereka. Dengan Employeeman, Anda dapat melakukan berbagai operasi terkait manajemen karyawan seperti menambahkan karyawan baru, memperbarui informasi karyawan, menghapus data karyawan, dan melihat daftar karyawan.

## Struktur Proyek

Proyek ini terdiri dari dua bagian utama:

1. `employeeman-be`: Backend aplikasi
2. `employeeman-fe`: Frontend aplikasi

## Petunjuk Penggunaan

### Persiapan

1. Pastikan Anda memiliki Node.js dan npm terinstal di sistem Anda.
2. Clone repositori ini ke komputer lokal Anda.

### Konfigurasi Backend (.env)

1. Navigasikan ke folder `employeeman-be`.
2. Salin file `.env.example` menjadi `.env`:
   ```
   cp .env.example .env
   ```
3. Buka file `.env` dan sesuaikan nilai-nilai variabel sesuai dengan konfigurasi Anda.

### Menjalankan Backend

1. Buka terminal dan navigasikan ke folder `employeeman-be`.
2. Jalankan perintah `npm install` untuk menginstal semua dependensi.
3. Setelah instalasi selesai, jalankan perintah `npm run start` untuk memulai server backend.


### Konfigurasi Frontend 

1. Navigasikan ke folder `employeeman-fe/src`.
2. Buka file `config.ts` dan sesuaikan `serverURL` dengan URL backend Anda.

### Menjalankan Frontend

1. Buka terminal baru dan navigasikan ke folder `employeeman-fe`.
2. Jalankan perintah `npm install` untuk menginstal semua dependensi.
3. Setelah instalasi selesai, jalankan perintah `npm start` untuk memulai aplikasi frontend.

### Mengakses Aplikasi

Setelah kedua backend dan frontend berjalan, Anda dapat mengakses aplikasi melalui browser dengan membuka `http://localhost:3000` (atau port lain yang ditentukan oleh aplikasi frontend).

## Kontribusi

Jika Anda ingin berkontribusi pada proyek ini, silakan buat pull request atau laporkan issues melalui GitHub.

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
