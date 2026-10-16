const express = require('express');
const router = express.Router();
const { getDoctors, updateUserProfile  } = require('../controllers/userController');

// Ruta para obtener la lista de médicos (GET /api/users/doctors)
router.get('/doctors', getDoctors);
    
// Ruta para actualizar el perfil de un usuario (PUT /api/users/profile)
router.put('/profile', updateUserProfile);

module.exports = router;