const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');

// 1. Full Data Endpoint (kompatibel dengan script.js)
router.get('/data', apiController.getFullData);

// 2. Destinasi Endpoints
router.get('/destinasi', apiController.getDestinations);
router.get('/destinasi/:id', apiController.getDestinationById);
router.post('/destinasi/:id/reviews', apiController.addReview);

// 3. Kuliner Endpoints
router.get('/kuliner', apiController.getAllCulinary);

// 4. Transportasi & Kontak Darurat Endpoints
router.get('/transportasi', apiController.getAllTransportation);
router.get('/kontak-darurat', apiController.getAllEmergency);

// 5. Trip Budget Plan Endpoints
router.post('/budget-plan', apiController.saveTripPlan);
router.get('/budget-plan/:code', apiController.getTripPlan);

// 6. Mini Game Endpoints
router.post('/game-score', apiController.saveGameScore);
router.get('/leaderboard', apiController.getLeaderboard);

// 7. Live Database Stats
router.get('/stats', apiController.getStats);

module.exports = router;
