# Kalkulator Rams

Kalkulator web yang tampil seperti perangkat fisik: tombol bulat yang bisa "ditekan", layar dengan pratinjau hasil langsung, dan tema terang/gelap. Terinspirasi dari desain kalkulator Braun era 1980-an.

## Fitur
- Prioritas operator yang benar (`2 + 3 × 4 = 14`), tanpa `eval()`
- Pratinjau hasil saat mengetik
- Persen, ubah tanda (±), hapus satu karakter, dan reset
- Dukungan keyboard penuh: angka, `+ - * /`, `%`, `Enter`, `Backspace`, `Esc`
- Riwayat perhitungan (tersimpan di browser), klik untuk memakai ulang hasil
- Tema terang/gelap, responsif, menghormati `prefers-reduced-motion`

## Menjalankan
Tanpa build tool. Buka `index.html` di browser, atau:

```bash
python3 -m http.server 8000
```

## Deploy ke GitHub Pages
Settings → Pages → Deploy from a branch → `main` / root.

## Lisensi
MIT
