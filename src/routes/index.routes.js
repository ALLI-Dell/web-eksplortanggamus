const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// Halaman Utama: Dashboard Statistik & Overview
router.get('/', dashboardController.getDashboard);

module.exports = router;
