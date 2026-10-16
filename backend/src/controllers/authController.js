const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { sendResetEmail } = require('../utils/mailer');

const registerUser = async (req, res) => {
  try {

    const { name, email, password, role, especialidad, horarios } = req.body;

    // 2. Verificamos si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ mensaje: 'El usuario ya existe con ese correo' });
    }

    // 3. ENCRIPTAMOS LA CONTRASEÑA (¡Vital para no romper el Login del Sprint 1!)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Creamos el usuario en la base de datos con todos sus atributos
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'paciente', // Si no envían rol, por defecto es paciente
      especialidad,
      horarios
    });

    // 5. Devolvemos respuesta exitosa con los datos confirmados
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log("Error de Login: Usuario no encontrado");
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log("Error de Login: La contraseña no coincide en bcrypt");
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

        // 3. Generar el Token de acceso
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 4. Enviar los datos del usuario junto con el token
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// 1. Nueva función: Solicitar el enlace de recuperación
const solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Por seguridad, no decimos si el correo existe o no, damos un mensaje genérico
      return res.status(200).json({ mensaje: 'Si el correo existe, se ha enviado un enlace de recuperación.' });
    }

    // Generamos un token temporal válido por 15 minutos
    const resetToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    // Creamos la URL que apuntará a una nueva pantalla en tu Frontend de React
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Enviamos el correo
    await sendResetEmail(user.email, resetUrl);

    res.status(200).json({ mensaje: 'Si el correo existe, se ha enviado un enlace de recuperación.' });
  } catch (error) {
    console.error('Error al solicitar recuperación:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// 2. Función actualizada: Cambiar la contraseña validando el token
const resetPassword = async (req, res) => {
  try {
    // Ahora recibimos el token de la URL y la nueva contraseña
    const { token, nuevaPassword } = req.body;

    // Verificamos si el token es válido o si ya expiró
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    // Encriptamos la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaPassword, salt);

    // Actualizamos en la base de datos
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ mensaje: 'El enlace de recuperación ha expirado. Solicita uno nuevo.' });
    }
    res.status(500).json({ mensaje: 'Token inválido o error en el servidor.' });
  }
};

// Función para inicio de sesión / registro automático con Google
const googleLogin = async (req, res) => {
  const { access_token } = req.body;
  
  try {
    // 1. Pedimos los datos del usuario usando AXIOS (más seguro que fetch en Node antiguo)
    const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    // Con axios, la data ya viene parseada en googleResponse.data
    const googleData = googleResponse.data;
    
    if (!googleData.email) {
      return res.status(400).json({ mensaje: 'Token de Google inválido' });
    }

    const { email, name, picture } = googleData;

    // ... (EL RESTO DEL CÓDIGO SIGUE IGUAL: User.findOne, etc.)

    // 2. Buscamos si el usuario ya existe en nuestra base de datos MongoDB
    let user = await User.findOne({ email });

    // 3. Si no existe, lo registramos automáticamente como paciente
    if (!user) {
      user = new User({
        name: name,
        email: email,
        password: 'google-oauth-no-password', // Contraseña dummy de seguridad
        role: 'paciente' 
      });
      await user.save();
    }

    // 4. Generamos nuestro token JWT normal para el sistema
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secreto_super_seguro',
      { expiresIn: '1d' }
    );

    // 5. Enviamos la respuesta al frontend
    res.status(200).json({
      token,
      _id: user._id,
      name: user.name,
      role: user.role,
      email: user.email,
      avatar: picture // ¡Bonus! Capturamos la foto de perfil de Google
    });

  } catch (error) {
    console.error('Error en Google Login:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor durante Google Login.' });
  }
};
module.exports = { registerUser, loginUser, solicitarRecuperacion, resetPassword, googleLogin };