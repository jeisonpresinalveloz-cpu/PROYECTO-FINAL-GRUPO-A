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

// Obtener un médico específico por su ID
exports.getMedicoById = async (req, res) => {
  try {
    const medico = await User.findById(req.params.id).select('-password');
    if (!medico || medico.role !== 'medico') {
      return res.status(404).json({ mensaje: 'Médico no encontrado' });
    }
    res.status(200).json(medico);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los datos del médico' });
  }
};