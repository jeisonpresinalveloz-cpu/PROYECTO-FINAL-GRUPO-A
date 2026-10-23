const express = require('express');
const router = express.Router();

// Importamos las funciones desde el controlador
const { getDoctors, updateUserProfile, getUsuarios, getUsuarioPorId } = require('../controllers/userController');

// Ruta para actualizar el perfil o el estado de la agenda (agendaActiva)
router.put('/profile', updateUserProfile);

// Ruta para obtener todos los usuarios (usada por el PacienteDashboard para listar médicos)
router.get('/', getUsuarios);

// Ruta para obtener un usuario específico por su ID (usada por el MedicoDashboard para la agenda)
router.get('/:id', getUsuarioPorId);

// Ruta original para doctores
router.get('/doctors', getDoctors);

module.exports = router;