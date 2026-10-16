const express = require('express');
const router = express.Router();
const { registerUser, loginUser, solicitarRecuperacion, resetPassword, googleLogin  } = require('../controllers/authController');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);
router.post('/google-login', googleLogin);

router.post('/olvide-password', solicitarRecuperacion);

module.exports = router;