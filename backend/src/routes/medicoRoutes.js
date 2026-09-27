// ==========================================
// ARCHIVO: src/routes/medicoRoutes.js
// HISTORIA: HU04 - Catálogo de médicos
// ==========================================
const express = require('express');
const router = express.Router();
const { getMedicos } = require('../controllers/medicoController');

// Ruta GET para obtener todos los médicos
router.get('/', getMedicos);

module.exports = router;