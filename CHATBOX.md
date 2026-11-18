# Pembaruan ruang diskusi

Peran pengirim tetap Ustadz dan Ustadzah. Enter membuat baris baru; tombol Kirim
atau Ctrl/Cmd+Enter mengirim pesan. Pesan maksimal 4.000 karakter. Draf bertahan
saat panel ditutup, tetapi tidak disimpan setelah reload atau pindah halaman.
Pesan diperbarui setiap 15 detik selama tab terlihat, termasuk saat panel tertutup.
Angka tombol Diskusi menunjukkan jumlah pesan terakhir dari peran yang sama yang
menunggu balasan peran lawan. Membaca, membuka panel, atau reload tidak menghapus
angka. Contoh: tiga pesan Ustadz menampilkan 3 menunggu Ustadzah. Pesan tambahan
Ustadz menjadi 4; balasan Ustadzah menyelesaikan rangkaian itu dan memulai 1 pesan
menunggu Ustadz. Riwayat yang sudah ada mengikuti aturan yang sama.

Status dihitung dari riwayat pesan di server dan sama di semua perangkat setelah
pembaruan data; penanda baca lokal dari versi sebelumnya tidak digunakan lagi.
Banner dan pemisah percakapan menunjukkan peran yang perlu membalas. Pengirim wajib
memilih perannya sendiri; aplikasi tidak mengganti peran secara otomatis. Tombol
berubah menjadi Balas saat peran yang dipilih sedang ditunggu. Balasan dianggap
berhasil setelah server menyimpan pesan; gagal kirim tidak mengubah hitungan.
Aplikasi tetap memakai PIN bersama tanpa akun guru individual.

## Daftar bernomor dan lampiran

Tombol Daftar menambahkan atau menghapus penomoran pada baris yang dipilih. Ketik
`1. Catatan` lalu Enter untuk melanjutkan `2. `. Enter pada nomor kosong mengakhiri
daftar; Shift+Enter menyisipkan baris biasa. Pesan tampil sebagai daftar bernomor
tanpa menafsirkan HTML. Ctrl/Cmd+Enter tetap mengirim pesan.

Lampirkan menerima satu file maksimal 10 MiB per pesan: PDF, Word, Excel,
PowerPoint, JPG/PNG/WebP, TXT, ZIP. Pesan boleh berupa file saja atau file dengan
teks. Nama dan ukuran ditampilkan sebelum kirim; lampiran dapat dibuang sebelum
dikirim. Kegagalan pengiriman mempertahankan teks dan file agar bisa dicoba lagi.
Pesan dengan file tetap mengikuti aturan menunggu balasan berdasarkan peran.

File chat terpisah dari file soal utama. File berada di `storage/chat` dan hanya
dapat diunduh melalui route aplikasi dengan sesi PIN aktif. Direktori ini harus
berada pada disk/volume persisten yang dapat ditulis, ikut dibackup, dan tidak
dihapus saat deployment. Untuk beberapa instance server, gunakan volume bersama.
Konfigurasi Server Actions mengizinkan payload 12 MiB untuk file 10 MiB beserta
overhead form; batas reverse proxy hosting juga harus mengizinkan ukuran tersebut.

## Database sebelum deployment

Untuk pembaruan lampiran, jalankan **sekali** `scripts/add-chat-attachments.sql`
sebelum deployment, lalu `npx prisma generate` saat build. SQL ini memperlebar
content sekaligus menambahkan tiga kolom nullable pada Comment. Riwayat pesan lama
tetap ada dan lampirannya kosong. Skema baru memerlukan ketiga kolom tersebut;
deploy kode setelah SQL berhasil. SQL ini juga sudah mencakup perubahan TEXT dari
versi sebelumnya, sehingga tidak perlu menjalankan kedua skrip pada instalasi baru
yang masih memakai skema lama.

Skema lama memakai String MySQL bawaan (VARCHAR(191)) untuk Comment.content.
Jalankan `scripts/expand-comment-content.sql` pada database MySQL aplikasi sebelum
deployment. Perubahan ini memperlebar kolom menjadi TEXT dan mempertahankan pesan
lama. Untuk database baru, gunakan skema Prisma terbaru yang sudah memakai @db.Text.
Jalankan prisma generate pada proses build seperti biasa.

Tanpa perubahan kolom, pesan panjang akan ditolak database; UI mempertahankan
draf dan menampilkan kegagalan pengiriman.

## Verifikasi

`npm run test:chat` menguji validasi pesan, kedua peran, sesi PIN, pesan 4.000
karakter, kegagalan database, serta hitungan rangkaian pesan menunggu balasan.
Batas request/database disimulasikan pada tes server.
Tes juga mencakup kelanjutan/akhir penomoran, file tanpa teks, validasi lampiran,
pembersihan file ketika penyimpanan gagal, dan otorisasi serta nama Unicode pada
unduhan. UI daftar/lampiran diuji pada keenam ukuran layar di bawah dengan respons
pengiriman disimulasikan, termasuk input baris baru dari keyboard mobile.
`npm run build` memeriksa build produksi beserta TypeScript.

Pengujian browser komponen dilakukan pada 1440×900, 768×1024, 390×844, 320×568,
390×420, dan 844×390, dengan respons pengiriman disimulasikan. Pengujian mencakup
pesan panjang, baris baru, draf saat tutup/buka, error server/koneksi, status
mengirim, kedua peran, Ctrl+Enter, scroll pesan terbaru, serta fokus setelah tutup.
Aturan menunggu balasan juga diuji pada keenam ukuran: buka/tutup dan reload tidak
menghapus angka, kiriman dari peran yang sama menambah angka, balasan dari peran
lawan memulai rangkaian baru, gagal kirim mempertahankan angka, dan pengirim wajib
memilih peran. Penanda baca browser versi sebelumnya tidak memengaruhi hitungan.
Keyboard virtual pada perangkat fisik dan integrasi penyimpanan MySQL tetap perlu
diverifikasi pada lingkungan aplikasi yang databasenya aktif.
