# Generator Link Undangan

Aplikasi statis sederhana untuk membuat link undangan dengan format:

```text
https://asd.com/pernikahan/?to=Nama+Tamu
```

## Fitur

- Input banyak nama sekaligus, satu nama per baris.
- Spasi pada nama otomatis diubah menjadi `+`.
- Hasil muncul dalam tabel.
- Tombol `Share via WA` membuka WhatsApp dengan pesan berisi link undangan.
- Tombol `Reset` menghapus daftar undangan.
- Data sementara disimpan di `sessionStorage` supaya daftar tidak hilang saat tab browser tidak aktif lama.

## Deploy ke GitHub Pages

1. Push semua file ke repository GitHub.
2. Buka `Settings` repository.
3. Masuk ke `Pages`.
4. Pilih branch utama, biasanya `main`.
5. Pilih folder `/root`.
6. Simpan pengaturan dan buka URL GitHub Pages yang diberikan.
