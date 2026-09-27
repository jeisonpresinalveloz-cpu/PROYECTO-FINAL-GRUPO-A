const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Importación necesaria para el Token

exports.register = async (req, res) => {
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

        // 1. Buscar si el correo existe en la base de datos
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // 2. Comparar la contraseña ingresada con la encriptada en Mongo
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ mensaje: 'Contraseña incorrecta' });
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

// Exportar ambas funciones
module.exports = { registerUser, loginUser };