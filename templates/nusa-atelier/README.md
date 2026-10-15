# Nusa Atelier

Template premium satu halaman untuk studio desain interior, dibuat dengan Jekyll dan Thicket UI. Preview template di situs demo tersedia pada `/templates/nusa-atelier/`.

## Isi template

- Hero editorial dengan CTA, navigasi desktop dan menu mobile
- Profil studio dan ringkasan layanan
- Galeri tiga proyek, proses kerja, testimoni, dan FAQ interaktif
- CTA kontak dan footer
- Layout responsif, fokus keyboard, teks alternatif, dan dukungan reduced motion
- Copywriting Bahasa Indonesia yang siap disesuaikan

## Menjalankan di proyek ini

Jalankan perintah dari root repositori:

```bash
bundle exec jekyll serve
```

Buka `/jekyll-component-framework/templates/nusa-atelier/` saat menggunakan konfigurasi GitHub Pages proyek ini, atau `/templates/nusa-atelier/` jika `baseurl` kosong.

## Memakai sebagai starter Jekyll

1. Salin `index.html` dan `site.css` ke proyek Jekyll Anda, pertahankan struktur folder `templates/nusa-atelier/` atau sesuaikan URL stylesheet di `<head>`.
2. Pasang stylesheet dan komponen Thicket UI pada proyek. Halaman ini memakai `assets/css/main.css`, include `components/button.html`, dan entrypoint `assets/js/main.js`.
3. Salin aset Thicket UI yang dibutuhkan ke proyek, atau sesuaikan path stylesheet, include, dan script dengan cara instalasi Thicket UI Anda.
4. Ubah judul, deskripsi, email, tautan sosial, teks, dan informasi proyek dalam `index.html`.
5. Ganti gambar contoh Unsplash dengan foto proyek yang Anda punya hak untuk gunakan. Jika mengunduh gambar, simpan di folder aset proyek dan perbarui `src`.
6. Sesuaikan warna di properti `--nusa-*` pada `site.css`.

Tautan kontak dan navigasi sudah berfungsi. Email `halo@nusa-atelier.id`, profil Instagram, nama studio, statistik, kutipan klien, dan detail proyek adalah konten contoh yang harus diganti sebelum digunakan untuk bisnis nyata.
