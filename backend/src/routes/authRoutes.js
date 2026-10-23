const express = require('express');
const router = express.Router();
// Importa TODAS las funciones, incluyendo googleLogin
const { registerUser, loginUser, solicitarRecuperacion, resetPassword, googleLogin } = require('../controllers/authController');

// Rutas tradicionales
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rutas de recuperación de contraseña
router.post('/olvide-password', solicitarRecuperacion);
router.post('/reset-password', resetPassword);

// NUEVA RUTA: Ruta para la autenticación con Google
router.post('/google', googleLogin);

module.exports = router;