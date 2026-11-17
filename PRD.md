# PRD: Aplikasi Web Pengelolaan Keuangan Pribadi

*Versi 1.0 (draf awal) · 17 November 2026 · Stack: Next.js + Supabase*

## 1. Ringkasan Produk

Aplikasi web khusus penggunaan pribadi (satu akun untuk satu orang) untuk mencatat pemasukan dan pengeluaran, mengatur anggaran, dan memantau tujuan tabungan di satu tempat. Aplikasi dibangun dengan Next.js (frontend dan server) dan Supabase (database PostgreSQL, autentikasi, dan Row Level Security). Nama produk: **Ojan Menabung**, dibuat untuk penggunaan pribadi dan sebagai portofolio.

**Visi:** membuat pencatatan keuangan pribadi cepat (kurang dari 10 detik per transaksi), jelas, dan aman, sehingga pengguna tahu ke mana uangnya pergi dan bisa mengambil keputusan yang lebih baik.

## 2. Latar Belakang dan Masalah

- Banyak orang tidak tahu pasti ke mana uangnya habis setiap bulan.
- Pencatatan manual (buku, catatan ponsel, spreadsheet) melelahkan sehingga sering ditinggalkan.
- Aplikasi yang ada sering terlalu rumit, penuh iklan, atau meminta akses ke rekening bank.
- Pengguna butuh gambaran sederhana: sisa saldo, pengeluaran per kategori, dan apakah masih sesuai anggaran.

## 3. Tujuan dan Metrik Keberhasilan

**Tujuan MVP**

- Pengguna dapat mendaftar, membuat dompet, dan mencatat transaksi pertama dalam kurang dari 3 menit.
- Pengguna dapat melihat ringkasan keuangan bulanan dalam satu halaman dashboard.
- Data setiap pengguna terisolasi dan aman (RLS aktif di semua tabel).

**Metrik keberhasilan** (angka adalah asumsi awal, sesuaikan dengan target Anda)

- Aktivasi: minimal 60% pengguna baru mencatat 3 transaksi atau lebih dalam 7 hari pertama.
- Retensi: minimal 30% pengguna kembali aktif pada minggu ke-4.
- Kecepatan: input transaksi rata-rata 10 detik atau kurang; LCP dashboard di bawah 2,5 detik.
- Kualitas: tingkat error server di bawah 1%; nol kebocoran data antar pengguna.

## 4. Target Pengguna

Target pengguna utama adalah pemilik aplikasi sendiri (penggunaan pribadi) dan pengunjung portofolio yang mencoba mode guest. Persona berikut hanya gambaran kebutuhan, bukan target pasar.

- **Persona 1, mahasiswa atau pekerja awal:** penghasilan terbatas, ingin disiplin menabung dan tahu uang bulanannya habis ke mana.
- **Persona 2, pekerja atau keluarga muda:** punya beberapa sumber pemasukan dan tagihan rutin, butuh anggaran per kategori.
- **Persona 3, freelancer atau pelaku usaha kecil:** ingin memisahkan uang pribadi dan usaha secara sederhana lewat beberapa dompet.

## 5. Ruang Lingkup

**Masuk MVP**

1. Halaman login dengan dua pilihan: masuk dengan akun (email dan password saja) atau mode guest (hanya melihat fitur, tanpa data dan tanpa input).
2. Manajemen dompet/akun (tunai, bank, e-wallet).
3. Manajemen kategori (bawaan dan kustom).
4. Pencatatan transaksi: pemasukan, pengeluaran, dan transfer antar dompet.
5. Anggaran bulanan per kategori.
6. Tujuan tabungan.
7. Dashboard dan laporan dasar.
8. Ekspor CSV.
9. Pengaturan profil (mata uang IDR, bahasa Indonesia, tema terang/gelap).
10. PWA: aplikasi dapat dipasang ke layar utama ponsel dan dibuka seperti aplikasi biasa.

**Di luar MVP (fase berikutnya)**

- Transaksi berulang otomatis dan pengingat tagihan.
- Impor mutasi dari file CSV bank.
- Multi-mata uang dan kurs.
- Berbagi dompet dengan orang lain (tidak direncanakan, karena aplikasi untuk penggunaan pribadi).
- Lampiran struk dan OCR.
- Mode offline penuh pada PWA (data tetap bisa dibuka dan dicatat tanpa internet).
- Integrasi langsung ke bank (open banking).

## 6. Kebutuhan Fungsional

### 6.1 Autentikasi, Mode Guest, dan Profil

- Pengguna dapat daftar, masuk, keluar, dan reset password melalui Supabase Auth.
- Verifikasi email diperlukan sebelum akses penuh.
- Saat pertama kali masuk, sistem otomatis membuat profil, satu dompet default ('Tunai'), dan kategori bawaan.
- Pengguna dapat mengubah nama dan preferensi, serta menghapus akun beserta seluruh datanya.

**Kriteria penerimaan:** sesi tersimpan aman (cookie httpOnly via @supabase/ssr); halaman terproteksi mengalihkan ke /login jika belum masuk.

**Halaman login dan pilihan masuk**

- Halaman /login menampilkan dua pilihan yang jelas: **Masuk dengan akun** dan **Lanjut sebagai guest**.
- Masuk dengan akun: hanya email dan password (tanpa Google atau magic link); pengguna yang belum punya akun diarahkan ke pendaftaran.
- Aplikasi hanya untuk penggunaan pribadi: satu akun untuk satu pengguna, tanpa berbagi data antar akun.

**Mode guest**

- Tujuan: calon pengguna dapat melihat tampilan dan fitur aplikasi sebelum mendaftar.
- Guest dapat membuka halaman fitur (dashboard, transaksi, dompet, kategori, anggaran, tujuan, laporan), tetapi setiap halaman tampil dalam keadaan kosong tanpa data apa pun: tidak ada saldo, transaksi, atau grafik berisi angka.
- Guest tidak dapat menginput atau mengubah data: tombol tambah, simpan, edit, hapus, dan ekspor dinonaktifkan; saat diklik, muncul ajakan 'Masuk untuk mulai mencatat'.
- Guest tidak membaca atau menulis ke database. Mode ini tidak memakai sesi Supabase Auth, ditandai dengan cookie atau state sisi klien, dan semua Server Action menolak operasi tulis tanpa sesi terautentikasi.
- Banner 'Mode guest' tampil permanen dengan tombol Masuk dan Daftar.
- Halaman /settings tidak tersedia bagi guest.
- Saat guest masuk atau mendaftar, ia diarahkan ke dashboard akunnya; tidak ada data yang dipindahkan karena guest tidak punya data.

**Kriteria penerimaan mode guest:** tidak ada query ke tabel data dari sesi guest; semua kontrol input tampil nonaktif; upaya menulis langsung ke API ditolak (RLS dan pengecekan sesi); pengguna yang sudah masuk tidak pernah melihat banner guest.

### 6.2 Dompet / Akun

- CRUD dompet dengan atribut: nama, tipe (tunai, bank, e-wallet, kartu kredit, lainnya), saldo awal, ikon/warna, dan status arsip.
- Saldo dompet dihitung dari saldo awal ditambah semua transaksi (bukan disimpan manual) agar tidak terjadi selisih.
- Dompet yang sudah punya transaksi tidak dihapus permanen, hanya diarsipkan.

### 6.3 Kategori

- Kategori bawaan pemasukan: Gaji, Bonus, Hadiah, Lainnya.
- Kategori bawaan pengeluaran: Makan, Transportasi, Belanja, Tagihan, Hiburan, Kesehatan, Pendidikan, Lainnya.
- Pengguna dapat menambah, mengubah, dan mengarsipkan kategori kustom dengan ikon dan warna.

### 6.4 Transaksi

- Tambah transaksi dengan field: tipe, jumlah, tanggal (default hari ini), dompet, kategori, catatan, dan tag (opsional).
- Transfer antar dompet membuat dua catatan terhubung (keluar dan masuk) dalam satu operasi atomik.
- Daftar transaksi dengan filter (rentang tanggal, dompet, kategori, tipe), pencarian catatan, dan pagination atau infinite scroll.
- Edit dan hapus transaksi; saldo dan laporan ter-update otomatis.
- Input cepat melalui tombol tambah global yang membuka dialog modal.

**Kriteria penerimaan:** jumlah wajib lebih dari 0; tanggal wajib diisi; format Rupiah dengan pemisah ribuan; validasi dengan Zod di klien dan server.

### 6.5 Anggaran

- Pengguna menetapkan batas pengeluaran per kategori untuk setiap bulan.
- Indikator progres: hijau (di bawah 80%), kuning (80% sampai 100%), merah (di atas 100%).
- Peringatan di dalam aplikasi saat pemakaian anggaran mencapai 80% dan 100%.
- Tombol 'salin anggaran bulan lalu' untuk mempercepat pengaturan.

### 6.6 Tujuan Tabungan

- Pengguna membuat tujuan dengan nama, nominal target, dan tenggat (opsional).
- Pengguna menambahkan setoran manual ke tujuan; progres ditampilkan dalam persen dan nominal.
- Tujuan ditandai tercapai otomatis saat total setoran mencapai target.

### 6.7 Dashboard

- Kartu ringkasan: total saldo, pemasukan bulan ini, pengeluaran bulan ini, dan selisih.
- Grafik pengeluaran per kategori (donat) dan tren pemasukan vs pengeluaran 6 bulan terakhir.
- Lima transaksi terakhir, progres anggaran teratas, dan progres tujuan tabungan.
- Pemilih bulan untuk melihat periode sebelumnya.

### 6.8 Laporan dan Ekspor

- Laporan bulanan dan tahunan: total per kategori, per dompet, dan per tipe.
- Ekspor CSV transaksi sesuai filter yang sedang aktif.

### 6.9 Instalasi sebagai PWA

- Aplikasi dapat dipasang ke layar utama ponsel (Android dan iOS) dan terbuka seperti aplikasi biasa: layar penuh tanpa bilah alamat (display: standalone), dengan ikon dan splash screen bernama Ojan Menabung.
- Web app manifest berisi nama, ikon 192 px dan 512 px, theme color, dan start_url ke /dashboard; service worker menyimpan aset statis di cache.
- Tombol atau banner 'Pasang aplikasi' tampil di browser yang mendukung (Chrome di Android); untuk iOS Safari ditampilkan petunjuk 'Tambahkan ke Layar Utama'.
- Saat tidak ada internet, aplikasi menampilkan halaman offline sederhana; input data tetap memerlukan koneksi pada MVP.
- Data keuangan pengguna tidak disimpan di cache service worker, hanya aset statis.
- Aplikasi disajikan lewat HTTPS, syarat agar PWA dapat dipasang.

**Kriteria penerimaan:** lolos pemeriksaan installable di Lighthouse; berhasil dipasang dan dibuka dalam mode standalone di Android (Chrome) dan iOS (Safari); mode guest dan login berfungsi sama seperti di browser.

## 7. Kebutuhan Non-Fungsional

- **Performa:** halaman utama termuat di bawah 2,5 detik pada koneksi 4G; agregasi dashboard dikerjakan di database (view atau fungsi SQL), bukan di klien.
- **Keamanan:** RLS aktif di semua tabel dan peran anon tidak punya akses ke data; mode guest tidak membaca atau menulis data apa pun; service role key hanya di server; rate limiting pada endpoint autentikasi; validasi input di server.
- **Privasi:** aplikasi tidak meminta kredensial bank; penghapusan akun menghapus seluruh data; tersedia kebijakan privasi dan syarat layanan.
- **Responsif:** mobile-first, nyaman dipakai di layar 360 px sampai desktop, serta dapat dipasang sebagai PWA di ponsel.
- **Aksesibilitas:** kontras warna memadai, navigasi keyboard, label form yang jelas (target WCAG AA).
- **Keandalan:** backup harian Supabase; migrasi skema terversi lewat Supabase CLI.
- **Lokalisasi:** bahasa Indonesia, format Rupiah (Rp 1.250.000), zona waktu Asia/Jakarta; struktur teks siap untuk bahasa lain.
- **Observabilitas:** pelacakan error (misalnya Sentry) dan analitik penggunaan dasar.

## 8. Arsitektur dan Tech Stack

- **Frontend:** Next.js (App Router) dengan TypeScript, Tailwind CSS, dan shadcn/ui; React Hook Form dan Zod untuk form; Recharts untuk grafik; date-fns untuk tanggal; PWA dengan manifest bawaan Next.js (app/manifest.ts) dan service worker (misalnya Serwist).
- **Backend:** Server Actions dan Route Handlers Next.js; agregasi laporan lewat view atau fungsi SQL (RPC) di Supabase.
- **Supabase:** PostgreSQL, Auth, dan Row Level Security. Fase berikutnya: Edge Functions atau pg_cron untuk transaksi berulang dan pengingat.
- **Integrasi klien:** paket @supabase/ssr dengan dua klien (browser dan server); service role key tidak pernah dikirim ke browser.
- **Deployment:** Vercel untuk aplikasi, proyek Supabase terpisah untuk development, staging, dan production.
- **Pengujian:** unit test (Vitest), end-to-end (Playwright), dan pengujian kebijakan RLS (misalnya pgTAP).

## 9. Model Data (Ringkas)

- **profiles:** id (uuid, sama dengan auth.users.id), nama, mata_uang (default IDR), created_at.
- **accounts:** id, user_id, nama, tipe, saldo_awal numeric(14,2), warna, ikon, is_archived, created_at.
- **categories:** id, user_id, nama, tipe (income/expense), ikon, warna, is_archived.
- **transactions:** id, user_id, account_id, category_id (kosong untuk transfer), tipe (income/expense/transfer), jumlah numeric(14,2) dengan CHECK lebih dari 0, tanggal (date), catatan, transfer_group_id (uuid, opsional), created_at, updated_at.
- **budgets:** id, user_id, category_id, periode (tanggal awal bulan), batas numeric(14,2); UNIQUE (user_id, category_id, periode).
- **goals:** id, user_id, nama, target numeric(14,2), tenggat (opsional), status.
- **goal_contributions:** id, goal_id, user_id, jumlah, tanggal, account_id (opsional).

**Aturan data**

- Semua tabel memiliki user_id dan kebijakan RLS: select, insert, update, dan delete hanya jika user_id sama dengan auth.uid().
- Nominal uang memakai tipe numeric, tidak pernah float.
- Index yang disarankan: (user_id, tanggal desc), (user_id, account_id), (user_id, category_id).
- Transfer dibuat lewat fungsi SQL (RPC) transaksional agar kedua sisi tersimpan atau gagal bersamaan.
- Trigger saat pengguna baru terdaftar untuk membuat profil, dompet default, dan kategori bawaan.

## 10. Struktur Halaman

- **/** : halaman landing (publik)
- **/login** dan **/register** : pilihan masuk dengan akun atau mode guest
- **/dashboard** : ringkasan keuangan
- **/transactions** : daftar, filter, tambah, dan edit transaksi
- **/accounts** : dompet
- **/categories** : kategori
- **/budgets** : anggaran bulanan
- **/goals** : tujuan tabungan
- **/reports** : laporan dan ekspor
- **/settings** : profil, preferensi, dan hapus akun

Halaman yang dapat dibuka guest: /, /login, /register, dan tampilan kosong dari /dashboard, /transactions, /accounts, /categories, /budgets, /goals, dan /reports. Halaman /settings hanya untuk pengguna yang sudah masuk.

## 11. Alur Pengguna Utama

1. **Onboarding:** daftar, verifikasi email, dompet dan kategori default dibuat otomatis, pengguna mengisi saldo awal.
2. **Catat transaksi:** tekan tombol tambah, isi jumlah, pilih kategori dan dompet, simpan; saldo dan dashboard langsung ter-update.
3. **Atur anggaran:** buka halaman anggaran, tetapkan batas per kategori, pantau progres di dashboard.
4. **Tinjau bulanan:** buka laporan, lihat pengeluaran terbesar, ekspor CSV bila perlu.

**Alur guest:** buka /login, pilih 'Lanjut sebagai guest', jelajahi halaman fitur dalam keadaan kosong, lalu tekan tombol input apa pun dan diarahkan untuk masuk atau mendaftar.

## 12. Rencana Rilis

Estimasi untuk 1 sampai 2 developer; sesuaikan dengan kapasitas tim.

- **Fase 0 (minggu 1):** setup repo, desain UI dasar, skema database, dan kebijakan RLS.
- **Fase 1 (minggu 2-3):** autentikasi, profil, dompet, dan kategori.
- **Fase 2 (minggu 4-5):** transaksi, transfer, filter, dan pencarian.
- **Fase 3 (minggu 6):** anggaran dan tujuan tabungan.
- **Fase 4 (minggu 7):** dashboard, laporan, ekspor CSV, dan konfigurasi PWA (manifest, ikon, service worker).
- **Fase 5 (minggu 8):** QA, optimasi performa, audit keamanan, beta tertutup, lalu rilis.

## 13. Risiko dan Asumsi

**Risiko**

- Kebijakan RLS yang salah dapat membocorkan data: tulis pengujian otomatis untuk setiap tabel.
- Perhitungan saldo dan transfer rawan tidak konsisten: gunakan fungsi SQL transaksional dan jangan simpan saldo sebagai kolom manual.
- Pengguna berhenti mencatat karena terasa merepotkan: prioritaskan input cepat dan default yang cerdas.
- Agregasi melambat saat data bertambah: gunakan index, view, dan pagination.

**Asumsi**

- Satu akun dipakai oleh satu pengguna, dengan satu mata uang (IDR) pada MVP.
- Pengguna mencatat manual; belum ada sinkronisasi otomatis dengan bank.
- Paket gratis Supabase dan Vercel cukup untuk tahap beta.

## 14. Keputusan Produk

- Target pengguna: penggunaan pribadi pemilik aplikasi dan sebagai proyek portofolio, bukan untuk keluarga atau usaha kecil.
- Model bisnis: tidak diperjualbelikan; gratis dan tanpa langganan.
- Login: cukup email dan password; login Google dan magic link tidak dipakai.
- PWA: web app harus bisa dipasang ke layar utama ponsel agar mudah dibuka dan ditutup; masuk MVP.
- Nama produk: Ojan Menabung; identitas visual gunakan liquid glass dari npm install glisse.