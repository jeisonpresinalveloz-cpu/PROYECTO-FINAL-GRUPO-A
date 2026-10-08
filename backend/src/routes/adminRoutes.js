const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/adminController');

// Ruta GET para obtener los números de los widgets
router.get('/stats', getAdminStats);

module.exports = router;