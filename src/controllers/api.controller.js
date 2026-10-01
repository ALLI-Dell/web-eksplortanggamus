const prisma = require('../config/db');

// Helper untuk format data dari Prisma ke format yang dibutuhkan frontend
function formatDestination(d, reviews = []) {
  let fasilitas = [];
  try {
    fasilitas = typeof d.fasilitas === 'string' ? JSON.parse(d.fasilitas) : d.fasilitas;
  } catch (e) {
    fasilitas = [];
  }

  let galeri = [];
  try {
    galeri = typeof d.galeri === 'string' ? JSON.parse(d.galeri) : d.galeri;
  } catch (e) {
    galeri = [];
  }

  return {
    id: d.id,
    nama: d.nama,
    nama_en: d.namaEn,
    kategori: d.kategori,
    lokasi: d.lokasi,
    lat: d.lat,
    lng: d.lng,
    deskripsi: d.deskripsi,
    deskripsi_en: d.deskripsiEn,
    harga_tiket: d.hargaTiket,
    rating: d.rating,
    fasilitas,
    gambar: d.gambar,
    galeri,
    rekomendasi: d.rekomendasi,
    audio_deskripsi_id: d.audioDeskripsiId,
    audio_deskripsi_en: d.audioDeskripsiEn,
    reviews: reviews.map(r => ({
      id: r.id,
      name: r.authorName,
      rating: r.rating,
      text: r.comment,
      origin: r.origin,
      date: new Date(r.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
    }))
  };
}

// 1. GET /data.json & GET /api/data (Mengambil seluruh dataset dari SQLite database)
exports.getFullData = async (req, res) => {
  try {
    const [destinations, culinary, transportation, emergencyContacts] = await Promise.all([
      prisma.destination.findMany({
        include: {
          reviews: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { id: 'asc' }
      }),
      prisma.culinary.findMany({ orderBy: { id: 'asc' } }),
      prisma.transportation.findMany({ orderBy: { id: 'asc' } }),
      prisma.emergencyContact.findMany({ orderBy: { id: 'asc' } })
    ]);

    const formattedDestinasi = destinations.map(d => formatDestination(d, d.reviews));

    const formattedCulinary = culinary.map(c => ({
      id: c.id,
      nama: c.nama,
      nama_en: c.namaEn,
      kategori: c.kategori,
      kategori_en: c.kategoriEn,
      deskripsi: c.deskripsi,
      deskripsi_en: c.deskripsiEn,
      harga_estimasi: c.hargaEstimasi,
      lokasi_rekomendasi: c.lokasiRekomendasi,
      gambar: c.gambar,
      badge: c.badge
    }));

    const formattedTransport = transportation.map(t => {
      let opsi = [];
      try {
        opsi = typeof t.opsi === 'string' ? JSON.parse(t.opsi) : t.opsi;
      } catch (e) {
        opsi = [];
      }
      return {
        id: t.id,
        asal: t.asal,
        asal_en: t.asalEn,
        jarak: t.jarak,
        waktu: t.waktu,
        rute: t.rute,
        opsi,
        biaya_estimasi: t.biayaEstimasi
      };
    });

    const formattedEmergency = emergencyContacts.map(e => ({
      id: e.id,
      instansi: e.instansi,
      nomor: e.nomor,
      layanan: e.layanan
    }));

    res.json({
      destinasi: formattedDestinasi,
      kuliner: formattedCulinary,
      transportasi: formattedTransport,
      kontak_darurat: formattedEmergency
    });
  } catch (error) {
    console.error('Error fetching full data from database:', error);
    res.status(500).json({ error: 'Gagal memuat data dari database' });
  }
};

// 2. GET /api/destinasi (Filter & Search Destinasi)
exports.getDestinations = async (req, res) => {
  try {
    const { q, kategori, maxPrice, minRating, sort } = req.query;

    const where = {};
    if (q) {
      where.OR = [
        { nama: { contains: q } },
        { lokasi: { contains: q } },
        { deskripsi: { contains: q } }
      ];
    }
    if (kategori && kategori !== 'Semua') {
      where.kategori = kategori;
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      where.hargaTiket = { lte: Number(maxPrice) };
    }
    if (minRating && !isNaN(Number(minRating))) {
      where.rating = { gte: Number(minRating) };
    }

    let orderBy = { id: 'asc' };
    if (sort === 'rating-desc') orderBy = { rating: 'desc' };
    else if (sort === 'price-asc') orderBy = { hargaTiket: 'asc' };
    else if (sort === 'price-desc') orderBy = { hargaTiket: 'desc' };
    else if (sort === 'name-asc') orderBy = { nama: 'asc' };
    else if (sort === 'default') orderBy = [{ rekomendasi: 'desc' }, { rating: 'desc' }];

    const items = await prisma.destination.findMany({
      where,
      orderBy,
      include: {
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.json({
      success: true,
      total: items.length,
      data: items.map(d => formatDestination(d, d.reviews))
    });
  } catch (error) {
    console.error('Error getting destinations:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data destinasi' });
  }
};

// 3. GET /api/destinasi/:id
exports.getDestinationById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = await prisma.destination.findUnique({
      where: { id },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Destinasi tidak ditemukan' });
    }

    res.json({
      success: true,
      data: formatDestination(item, item.reviews)
    });
  } catch (error) {
    console.error('Error getting destination detail:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail destinasi' });
  }
};

// 4. POST /api/destinasi/:id/reviews (Simpan ulasan ke SQLite)
exports.addReview = async (req, res) => {
  try {
    const destinationId = parseInt(req.params.id);
    const { name, rating, text, origin } = req.body;

    if (!text || !rating) {
      return res.status(400).json({ success: false, message: 'Rating dan ulasan wajib diisi' });
    }

    const dest = await prisma.destination.findUnique({
      where: { id: destinationId }
    });
    if (!dest) {
      return res.status(404).json({ success: false, message: 'Destinasi tidak ditemukan' });
    }

    const newReview = await prisma.review.create({
      data: {
        destinationId,
        authorName: name || 'Wisatawan',
        rating: parseFloat(rating) || 5.0,
        comment: text,
        origin: origin || 'Wisatawan'
      }
    });

    // Hitung ulang rating rata-rata destinasi
    const allReviews = await prisma.review.findMany({
      where: { destinationId },
      select: { rating: true }
    });
    const avgRating = allReviews.reduce((acc, cur) => acc + cur.rating, 0) / allReviews.length;
    const roundedRating = parseFloat(avgRating.toFixed(1));

    await prisma.destination.update({
      where: { id: destinationId },
      data: { rating: roundedRating }
    });

    res.status(201).json({
      success: true,
      message: 'Ulasan berhasil disimpan ke database!',
      review: {
        id: newReview.id,
        name: newReview.authorName,
        rating: newReview.rating,
        text: newReview.comment,
        origin: newReview.origin,
        date: new Date(newReview.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
      },
      updatedRating: roundedRating
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ success: false, message: 'Gagal menyimpan ulasan ke database' });
  }
};

// 5. GET /api/kuliner
exports.getAllCulinary = async (req, res) => {
  try {
    const { kategori } = req.query;
    const where = {};
    if (kategori && kategori !== 'Semua') {
      where.kategori = { contains: kategori };
    }

    const items = await prisma.culinary.findMany({
      where,
      orderBy: { id: 'asc' }
    });

    res.json({
      success: true,
      total: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error getting culinary:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data kuliner' });
  }
};

// 6. GET /api/transportasi
exports.getAllTransportation = async (req, res) => {
  try {
    const items = await prisma.transportation.findMany({
      orderBy: { id: 'asc' }
    });

    res.json({
      success: true,
      data: items.map(t => {
        let opsi = [];
        try { opsi = JSON.parse(t.opsi); } catch (e) { opsi = []; }
        return { ...t, opsi };
      })
    });
  } catch (error) {
    console.error('Error getting transportation:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data transportasi' });
  }
};

// 7. GET /api/kontak-darurat
exports.getAllEmergency = async (req, res) => {
  try {
    const items = await prisma.emergencyContact.findMany({
      orderBy: { id: 'asc' }
    });

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error getting emergency contacts:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil kontak darurat' });
  }
};

// 8. POST /api/budget-plan (Simpan Rencana Liburan ke SQLite)
exports.saveTripPlan = async (req, res) => {
  try {
    const {
      travelerName,
      travelersCount,
      durationDays,
      transportType,
      accommodationType,
      mealTier,
      selectedDestinations,
      ticketCost,
      transportCost,
      accommodationCost,
      mealCost,
      totalCost,
      costPerPerson
    } = req.body;

    const planCode = 'TGG-' + Math.floor(10000 + Math.random() * 90000);

    const plan = await prisma.tripPlan.create({
      data: {
        planCode,
        travelerName: travelerName || 'Wisatawan Tanggamus',
        travelersCount: parseInt(travelersCount) || 2,
        durationDays: parseInt(durationDays) || 2,
        transportType: transportType || 'car_rental',
        accommodationType: accommodationType || 'homestay',
        mealTier: mealTier || 'standard',
        selectedDestinations: typeof selectedDestinations === 'object' ? JSON.stringify(selectedDestinations) : (selectedDestinations || '[]'),
        ticketCost: parseInt(ticketCost) || 0,
        transportCost: parseInt(transportCost) || 0,
        accommodationCost: parseInt(accommodationCost) || 0,
        mealCost: parseInt(mealCost) || 0,
        totalCost: parseInt(totalCost) || 0,
        costPerPerson: parseInt(costPerPerson) || 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Rencana anggaran berhasil disimpan ke database!',
      data: plan
    });
  } catch (error) {
    console.error('Error saving trip plan:', error);
    res.status(500).json({ success: false, message: 'Gagal menyimpan rencana ke database' });
  }
};

// 9. GET /api/budget-plan/:code
exports.getTripPlan = async (req, res) => {
  try {
    const { code } = req.params;
    const plan = await prisma.tripPlan.findUnique({
      where: { planCode: code }
    });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Rencana liburan tidak ditemukan' });
    }

    res.json({
      success: true,
      data: {
        ...plan,
        selectedDestinations: JSON.parse(plan.selectedDestinations || '[]')
      }
    });
  } catch (error) {
    console.error('Error getting trip plan:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil rencana liburan' });
  }
};

// 10. POST /api/game-score & GET /api/leaderboard
exports.saveGameScore = async (req, res) => {
  try {
    const { playerName, gameType, score, detail } = req.body;
    if (!gameType || score === undefined) {
      return res.status(400).json({ success: false, message: 'Data skor tidak lengkap' });
    }

    const saved = await prisma.gameScore.create({
      data: {
        playerName: playerName || 'Pemain Tanggamus',
        gameType: gameType.toUpperCase(),
        score: parseInt(score),
        detail: detail || ''
      }
    });

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving game score:', error);
    res.status(500).json({ success: false, message: 'Gagal menyimpan skor game' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { gameType } = req.query;
    const where = gameType ? { gameType: gameType.toUpperCase() } : {};
    const topScores = await prisma.gameScore.findMany({
      where,
      orderBy: { score: 'desc' },
      take: 10
    });

    res.json({ success: true, data: topScores });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data leaderboard' });
  }
};

// 11. GET /api/stats (Statistik Live dari Database)
exports.getStats = async (req, res) => {
  try {
    const [totalDestinasi, totalKuliner, totalUlasan, totalRencana, avgResult] = await Promise.all([
      prisma.destination.count(),
      prisma.culinary.count(),
      prisma.review.count(),
      prisma.tripPlan.count(),
      prisma.destination.aggregate({
        _avg: { rating: true }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalDestinasi,
        totalKuliner,
        totalUlasan,
        totalRencana,
        averageRating: parseFloat((avgResult._avg.rating || 4.8).toFixed(1))
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik' });
  }
};
