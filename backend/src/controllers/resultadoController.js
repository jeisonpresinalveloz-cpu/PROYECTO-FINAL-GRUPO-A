const Resultado = require('../models/Resultado');

// Obtener resultados de un paciente específico
exports.getResultadosPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const resultados = await Resultado.find({ pacienteId }).populate('medicoId', 'name');
    res.status(200).json(resultados);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los resultados clínicos' });
  }
};