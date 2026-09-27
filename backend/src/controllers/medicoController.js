// ==========================================
// ARCHIVO: src/controllers/medicoController.js
// HISTORIA: HU04 - Catálogo de médicos
// ==========================================
const User = require('../models/User');

exports.getMedicos = async (req, res) => {
  try {
    // Busca todos los usuarios con rol 'medico' y omite la contraseña (-password)
    const medicos = await User.find({ role: 'medico' }).select('-password');
    res.status(200).json(medicos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el catálogo de médicos' });
  }
};