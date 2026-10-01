# 🌴 Eksplor Tanggamus — Surga Wisata Alam, Bahari & Kuliner Lampung

Platform web portal panduan pariwisata lengkap Kabupaten Tanggamus, Lampung yang dilengkapi dengan **database relasional SQLite menggunakan Prisma ORM**, **RESTful API Express.js**, **Kalkulator Anggaran Liburan Interaktif**, **Peta Leaflet.js**, **3 Mini Games Edukatif**, dan **Panel Database Admin**.

Aplikasi ini dibuat persis mengikuti referensi [eksplor-tanggamus.vercel.app](https://eksplor-tanggamus.vercel.app/) lengkap dengan backend database dinamis.

---

## 🌟 Fitur Utama

1. **🌊 Beranda & Hero Interaktif**
   - Video latar belakang dinamis (mp4 live stream & poster fallback)
   - Shimmer text & badge animasi
   - Statistik live terhubung ke database SQLite (Destinasi Pilihan, Rating Rata-rata, dll.)
   - Mini widget cuaca real-time dengan rekomendasi wisata
   - Pemisah gelombang laut beranimasi (*Parallax Ocean Waves*)

2. **📍 Destinasi Wisata Pilihan (Database Powered)**
   - 10 destinasi lengkap: Pantai Gigi Hiu, Teluk Kiluan, Way Lalaan, Batutegi, Muara Indah, Gunung Tanggamus, Lembah Pelangi, Bukit Idaman, Danau Hijau Ulubelu, Pantai Sawmill.
   - Filter instan berdasarkan Kategori (Pantai, Air Terjun, Alam, Petualangan, Edukasi, Taman Kota)
   - Filter harga tiket masuk & filter rating minimum
   - Fitur pencarian cepat dengan keyboard shortcut `/`
   - Kartu 3D tilt dengan efek pantulan cahaya (*glare effect*) & tombol favorit dengan partikel hati (*heart burst*)
   - Modal detail destinasi dengan **Audio Tour Guide (Text-to-Speech)** dwibahasa (ID/EN) dan **Sistem Ulasan Wisatawan yang tersimpan langsung ke database SQLite**.

3. **🍲 Kuliner & Oleh-Oleh Khas Tanggamus**
   - 12 hidangan autentik: Gulai Taboh Ikan Tuhuk, Seruit Ikan Bakar, Kopi Robusta Ulubelu, Otak-Otak Tenggiri, Keripik Pisang, Dodol Durian Gisting, Kue Lapis Legit, Kemplang Panggang, Sambal Tempoyak, Kopi Liberika Organik, Ikan Bakar Simba, dan Kue Semprong.
   - Filter kategori makanan utama, tradisional, minuman, dan oleh-oleh khas.

4. **💰 Kalkulator Estimasi Biaya Wisata (Trip Budget Planner)**
   - Pemilihan multi-destinasi (tur keliling)
   - Pengaturan jumlah wisatawan & durasi liburan
   - Pilihan moda transportasi (Sewa Mobil, Mobil Pribadi, Motor, Travel Eksekutif)
   - Pilihan tipe akomodasi (Homestay Kiluan, Hotel/Resort Gisting, Camping, Tanpa Menginap)
   - Paket konsumsi makanan (Hemat, Standar, Pesta Seafood & Seruit)
   - Struk rincian biaya real-time & kalkulasi biaya per orang
   - Tombol **Simpan ke Database** (menyimpan rencana perjalanan ke tabel `TripPlan` dengan kode unik `TGG-XXXXX`), **Cetak Rencana**, dan **Kirim ke WhatsApp**.

5. **🗺️ Peta Interaktif (Leaflet.js)**
   - Peta sebaran lokasi seluruh tempat wisata & kuliner dengan koordinat GPS presisi
   - Filter marker berdasarkan jenis destinasi (Pantai, Air Terjun, Alam, Kuliner)
   - Popup interaktif dengan foto, rating, dan tautan rute navigasi Google Maps.

6. **🎮 3 Mini Games Edukatif**
   - **Game 1: Belajar Mengetik Bahasa Indonesia** (Tes KPM/WPM, akurasi, dan kalimat wisata Tanggamus)
   - **Game 2: Tebak-Tebakan Wisata Tanggamus** (Kuis 10 pertanyaan pengetahuan lokal dengan timer)
   - **Game 3: Penjaga Laut Tanggamus** (Game aksi HTML5 Canvas menembak sampah laut dan melindungi lumba-lumba)
   - Skor otomatis tercatat ke database leaderboard!

7. **📊 Database Admin Dashboard**
   - Akses via `/dashboard` atau `/admin`
   - Ringkasan total destinasi, kuliner, ulasan wisatawan, dan rencana liburan
   - Tabel destinasi wisata, ulasan pengunjung langsung dari SQLite, daftar estimasi budget tersimpan, dan rekor skor game.

---

## 🗄️ Skema Database (Prisma + SQLite)

Struktur tabel di `prisma/schema.prisma`:

```prisma
// 1. Destinasi Wisata
model Destination {
  id               Int      @id @default(autoincrement())
  nama             String
  namaEn           String?
  kategori         String
  lokasi           String
  lat              Float
  lng              Float
  deskripsi        String
  deskripsiEn      String?
  hargaTiket       Int
  rating           Float    @default(4.5)
  fasilitas        String   // JSON array
  gambar           String
  galeri           String   // JSON array
  rekomendasi      Boolean  @default(false)
  audioDeskripsiId String?
  audioDeskripsiEn String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  reviews          Review[]
}

// 2. Kuliner Khas
model Culinary {
  id                Int      @id @default(autoincrement())
  nama              String
  namaEn            String?
  kategori          String
  kategoriEn        String?
  deskripsi         String
  deskripsiEn       String?
  hargaEstimasi     String
  lokasiRekomendasi String
  gambar            String
  badge             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// 3. Panduan Rute Transportasi
model Transportation {
  id            Int      @id @default(autoincrement())
  asal          String
  asalEn        String?
  jarak         String
  waktu         String
  rute          String
  opsi          String   // JSON array
  biayaEstimasi String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// 4. Kontak Darurat (SOS)
model EmergencyContact {
  id        Int      @id @default(autoincrement())
  instansi  String
  nomor     String
  layanan   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 5. Ulasan Pengunjung
model Review {
  id            Int         @id @default(autoincrement())
  destinationId Int
  destination   Destination @relation(fields: [destinationId], references: [id], onDelete: Cascade)
  authorName    String
  rating        Float       @default(5.0)
  comment       String
  origin        String?     @default("Wisatawan")
  createdAt     DateTime    @default(now())
}

// 6. Rencana Anggaran Liburan (Trip Plan)
model TripPlan {
  id                   Int      @id @default(autoincrement())
  planCode             String   @unique
  travelerName         String?  @default("Wisatawan")
  travelersCount       Int      @default(2)
  durationDays         Int      @default(2)
  transportType        String   @default("car_rental")
  accommodationType    String   @default("homestay")
  mealTier             String   @default("standard")
  selectedDestinations String   // JSON array
  ticketCost           Int      @default(0)
  transportCost        Int      @default(0)
  accommodationCost    Int      @default(0)
  mealCost             Int      @default(0)
  totalCost            Int      @default(0)
  costPerPerson        Int      @default(0)
  createdAt            DateTime @default(now())
}

// 7. Leaderboard Mini Games
model GameScore {
  id         Int      @id @default(autoincrement())
  playerName String   @default("Anonim")
  gameType   String   // TYPING, QUIZ, SHOOTER
  score      Int      @default(0)
  detail     String?
  createdAt  DateTime @default(now())
}
```

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Sinkronisasi Skema Database & Seeding Data Awal
```bash
# Push skema Prisma ke database SQLite (dev.db)
npm run prisma:push

# Isi database dengan data destinasi, kuliner, transportasi, kontak, ulasan, & plan
npm run seed
```

### 2. Menjalankan Server
```bash
npm run dev
# atau
npm start
```

### 3. Akses Halaman
- **Website Utama:** [http://localhost:3000](http://localhost:3000) (atau port yang aktif seperti `3002`)
- **Admin Database:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **API Full Data:** [http://localhost:3000/api/data](http://localhost:3000/api/data)
- **GUI Visual Database (Prisma Studio):**
  ```bash
  npm run prisma:studio
  ```
  Lalu buka [http://localhost:5555](http://localhost:5555) di browser.

---

## 📡 Daftar REST API

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/data.json` | Mengambil seluruh data (destinasi, kuliner, transportasi, kontak) dari SQLite |
| `GET` | `/api/destinasi` | Query destinasi dengan filter kategori, harga tiket, rating, dan pencarian |
| `GET` | `/api/destinasi/:id` | Detail destinasi beserta ulasan dari database |
| `POST` | `/api/destinasi/:id/reviews` | Mengirim ulasan baru (nama, bintang rating, pesan) & update rating destinasi |
| `GET` | `/api/kuliner` | Mengambil daftar kuliner khas Tanggamus |
| `GET` | `/api/transportasi` | Panduan rute transportasi ke Tanggamus |
| `GET` | `/api/kontak-darurat` | Daftar kontak darurat & SAR laut 24 jam |
| `POST` | `/api/budget-plan` | Menyimpan rencana anggaran liburan ke tabel `TripPlan` |
| `GET` | `/api/budget-plan/:code` | Mengambil rencana liburan berdasarkan kode `TGG-XXXXX` |
| `POST` | `/api/game-score` | Menyimpan rekor skor pemain game |
| `GET` | `/api/leaderboard` | Mengambil peringkat skor tertinggi mini games |
| `GET` | `/api/stats` | Statistik real-time (jumlah destinasi, ulasan, rencana liburan) |

---

© 2026 Eksplor Tanggamus. Dibuat dengan cinta untuk pariwisata Lampung.
