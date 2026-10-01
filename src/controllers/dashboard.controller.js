const prisma = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalDestinasi,
      totalKuliner,
      totalUlasan,
      totalRencana,
      destinations,
      recentReviews,
      recentTripPlans,
      topGameScores
    ] = await Promise.all([
      prisma.destination.count(),
      prisma.culinary.count(),
      prisma.review.count(),
      prisma.tripPlan.count(),
      prisma.destination.findMany({
        include: {
          reviews: true
        },
        orderBy: { id: 'asc' }
      }),
      prisma.review.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          destination: {
            select: { nama: true }
          }
        }
      }),
      prisma.tripPlan.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.gameScore.findMany({
        take: 8,
        orderBy: { score: 'desc' }
      })
    ]);

    res.render('dashboard', {
      title: 'Database Admin Dashboard - Eksplor Tanggamus',
      currentPage: 'dashboard',
      stats: {
        totalDestinasi,
        totalKuliner,
        totalUlasan,
        totalRencana
      },
      destinations,
      recentReviews,
      recentTripPlans,
      topGameScores
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).send('Terjadi kesalahan saat memuat dashboard database.');
  }
};
