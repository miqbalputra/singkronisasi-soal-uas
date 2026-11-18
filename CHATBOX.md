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

## Database sebelum deployment

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
