const express = require('express');
const router = express.Router();
const { getMedicos, getMedicoById } = require('../controllers/medicoController');

// Ruta GET para obtener todos los médicos
router.get('/', getMedicos);
// NUEVA: Ruta GET para obtener un médico específico por su ID
router.get('/:id', getMedicoById); 

module.exports = router;