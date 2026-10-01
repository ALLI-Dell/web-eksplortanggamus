const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🌴 Memulai proses seeding database Eksplor Tanggamus...');

  // 1. Bersihkan tabel lama
  await prisma.review.deleteMany();
  await prisma.tripPlan.deleteMany();
  await prisma.gameScore.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.culinary.deleteMany();
  await prisma.transportation.deleteMany();
  await prisma.emergencyContact.deleteMany();

  // 2. Baca data.json sumber
  const rawData = fs.readFileSync(path.join(__dirname, '../public/data.json'), 'utf8');
  const data = JSON.parse(rawData);

  // 3. Masukkan Data Destinasi
  console.log('📍 Memasukkan destinasi wisata...');
  const createdDestinations = [];
  for (const item of data.destinasi) {
    const dest = await prisma.destination.create({
      data: {
        id: item.id,
        nama: item.nama,
        namaEn: item.nama_en || null,
        kategori: item.kategori,
        lokasi: item.lokasi,
        lat: item.lat,
        lng: item.lng,
        deskripsi: item.deskripsi,
        deskripsiEn: item.deskripsi_en || null,
        hargaTiket: item.harga_tiket,
        rating: item.rating,
        fasilitas: JSON.stringify(item.fasilitas || []),
        gambar: item.gambar,
        galeri: JSON.stringify(item.galeri || []),
        rekomendasi: Boolean(item.rekomendasi),
        audioDeskripsiId: item.audio_deskripsi_id || null,
        audioDeskripsiEn: item.audio_deskripsi_en || null
      }
    });
    createdDestinations.push(dest);
  }
  console.log(`✅ Berhasil menambahkan ${createdDestinations.length} destinasi wisata.`);

  // 4. Masukkan Data Kuliner
  console.log('🍲 Memasukkan kuliner khas...');
  let culinaryCount = 0;
  for (const item of data.kuliner) {
    await prisma.culinary.create({
      data: {
        id: item.id,
        nama: item.nama,
        namaEn: item.nama_en || null,
        kategori: item.kategori,
        kategoriEn: item.kategori_en || null,
        deskripsi: item.deskripsi,
        deskripsiEn: item.deskripsi_en || null,
        hargaEstimasi: item.harga_estimasi,
        lokasiRekomendasi: item.lokasi_rekomendasi,
        gambar: item.gambar,
        badge: item.badge || null
      }
    });
    culinaryCount++;
  }
  console.log(`✅ Berhasil menambahkan ${culinaryCount} kuliner & oleh-oleh.`);

  // 5. Masukkan Data Transportasi
  console.log('🚗 Memasukkan panduan transportasi...');
  let transCount = 0;
  for (const item of data.transportasi) {
    await prisma.transportation.create({
      data: {
        id: item.id,
        asal: item.asal,
        asalEn: item.asal_en || null,
        jarak: item.jarak,
        waktu: item.waktu,
        rute: item.rute,
        opsi: JSON.stringify(item.opsi || []),
        biayaEstimasi: item.biaya_estimasi
      }
    });
    transCount++;
  }
  console.log(`✅ Berhasil menambahkan ${transCount} panduan rute transportasi.`);

  // 6. Masukkan Kontak Darurat
  console.log('📞 Memasukkan kontak darurat wisata...');
  let contactCount = 0;
  for (const item of data.kontak_darurat) {
    await prisma.emergencyContact.create({
      data: {
        instansi: item.instansi,
        nomor: item.nomor,
        layanan: item.layanan
      }
    });
    contactCount++;
  }
  console.log(`✅ Berhasil menambahkan ${contactCount} kontak darurat.`);

  // 7. Masukkan Contoh Review Ulasan Pengunjung
  console.log('💬 Memasukkan ulasan wisatawan...');
  const sampleReviews = [
    {
      destinationId: 1, // Gigi Hiu
      authorName: 'Rian Pratama',
      origin: 'Jakarta Selatan',
      rating: 5.0,
      comment: 'Pemandangan karangnya magis banget saat sunrise! Jalur offroad terbayar lunas dengan deburan ombak Samudra Hindia yang dahsyat.'
    },
    {
      destinationId: 1,
      authorName: 'Sarah Jenkins',
      origin: 'Melbourne, Australia',
      rating: 5.0,
      comment: 'One of the most dramatic coastal rock landscapes in Southeast Asia. Truly untouched nature and worth every bump on the road.'
    },
    {
      destinationId: 2, // Teluk Kiluan
      authorName: 'Dina Maulida',
      origin: 'Bandung',
      rating: 5.0,
      comment: 'Lumba-lumbanya beneran banyak dan melompat dekat banget dari perahu cadik! Wajib sewa homestay di Kiluan biar bisa jalan jam 6 pagi.'
    },
    {
      destinationId: 2,
      authorName: 'Ferry Hendrawan',
      origin: 'Bandar Lampung',
      rating: 4.8,
      comment: 'Laguna Gayau juga keren banget buat berenang air laut tenang. Jangan lupa bawa jaket pelampung dan kamera anti air.'
    },
    {
      destinationId: 3, // Way Lalaan
      authorName: 'Ahmad Kusuma',
      origin: 'Palembang',
      rating: 4.7,
      comment: 'Airnya dingin dan segar dari lereng Gunung Tanggamus. Sangat asri dan cocok buat rekreasi santai bersama anak-anak.'
    },
    {
      destinationId: 6, // Gunung Tanggamus
      authorName: 'Bagus Setyo',
      origin: 'Yogyakarta',
      rating: 4.9,
      comment: 'Hutan Lumut (Mossy Forest) Tanggamus terasa seperti dunia dongeng Lord of the Rings. Suhu puncaknya dingin menusuk, siapkan jaket tebal!'
    },
    {
      destinationId: 9, // Danau Hijau Ulubelu
      authorName: 'Novita Anggraini',
      origin: 'Tangerang',
      rating: 4.8,
      comment: 'Warna air danau toska alami berpadu dengan uap belerang hangat. Seru banget sambil minum kopi robusta Ulubelu panas di pinggir danau.'
    }
  ];

  for (const rev of sampleReviews) {
    await prisma.review.create({
      data: rev
    });
  }
  console.log(`✅ Berhasil menambahkan ${sampleReviews.length} ulasan wisatawan awal.`);

  // 8. Masukkan Contoh Simpanan Rencana Perjalanan (Trip Plan)
  console.log('📋 Memasukkan contoh rencana liburan...');
  await prisma.tripPlan.create({
    data: {
      planCode: 'TGG-88219',
      travelerName: 'Keluarga Budi Santoso',
      travelersCount: 4,
      durationDays: 3,
      transportType: 'car_rental',
      accommodationType: 'homestay',
      mealTier: 'standard',
      selectedDestinations: JSON.stringify(['Teluk Kiluan', 'Pantai Gigi Hiu (Pegadungan)', 'Air Terjun Way Lalaan']),
      ticketCost: 180000,
      transportCost: 1500000,
      accommodationCost: 900000,
      mealCost: 1440000,
      totalCost: 4020000,
      costPerPerson: 1005000
    }
  });

  // 9. Masukkan Skor Game Awal
  await prisma.gameScore.createMany({
    data: [
      { playerName: 'DolphinHunter', gameType: 'SHOOTER', score: 2850, detail: 'Combo x4, 18 sampah dibersihkan' },
      { playerName: 'KetikKilatLampung', gameType: 'TYPING', score: 68, detail: '68 WPM, Akurasi 98%' },
      { playerName: 'PenjelajahTanggamus', gameType: 'QUIZ', score: 100, detail: '10/10 Benar, Waktu 1m 20s' }
    ]
  });

  console.log('🎉 Seeding database Eksplor Tanggamus SELESAI!');
  console.log('✨ Database SQLite siap digunakan dengan data destinasi, kuliner, rute, kontak, review, dan rencana perjalanan!');
}

main()
  .catch((e) => {
    console.error('❌ Gagal seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
