const express = require('express');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api.routes');
const dashboardController = require('./controllers/dashboard.controller');
const apiController = require('./controllers/api.controller');
const prisma = require('./config/db');

const app = express();
let currentPort = Number(process.env.PORT) || 3000;

// 1. Konfigurasi View Engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// 2. Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3. Dynamic API endpoint untuk data.json (Langsung dari SQLite via Prisma)
app.get('/data.json', apiController.getFullData);

// 4. API Endpoints
app.use('/api', apiRoutes);

// 5. Dashboard Database Admin
app.get('/dashboard', dashboardController.getDashboard);
app.get('/admin', dashboardController.getDashboard);

// 6. Static files (CSS, JS, Gambar, Video, Fonts)
app.use(express.static(path.join(__dirname, '../public')));

// 7. Halaman Utama Portal Eksplor Tanggamus
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 8. 404 Route Handler
app.use((req, res) => {
  res.status(404).send('<h1>404 - Halaman Tidak Ditemukan</h1><p><a href="/">Kembali ke Eksplor Tanggamus</a></p>');
});

// 9. Graceful Shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\n🛑 Server Express & Prisma dimatikan.');
  process.exit(0);
});

// 10. Start Server dengan Auto Port Fallback jika Port Sedang Dipakai
function startServer(port) {
  const server = app.listen(port, () => {
    console.log('=======================================================');
    console.log('🌴 EKSPLOR TANGGAMUS — PORTAL WISATA & DATABASE SQLITE');
    console.log(`🌐 Website Utama:  http://localhost:${port}`);
    console.log(`📊 Admin Database: http://localhost:${port}/dashboard`);
    console.log(`⚡ API Endpoint:   http://localhost:${port}/api/data`);
    console.log('=======================================================');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} sedang digunakan oleh aplikasi lain. Mencoba port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Server error:', err);
    }
  });
}

startServer(currentPort);
