const express = require('express');
const router = express.Router();

// IMPORTANTE: Importamos getUsuarios y tus otras funciones desde tu controlador perfecto
const { getDoctors, updateUserProfile, getUsuarios } = require('../controllers/userController');

// Ruta para actualizar el perfil
router.put('/profile', updateUserProfile);

// Ruta para obtener todos los usuarios (usada por el PacienteDashboard para listar médicos)
router.get('/', getUsuarios);

// Ruta original para doctores (si la estabas usando en otro lado)
router.get('/doctors', getDoctors);

module.exports = router;