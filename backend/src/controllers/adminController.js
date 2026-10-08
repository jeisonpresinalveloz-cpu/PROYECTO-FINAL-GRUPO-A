const User = require('../models/User');
const Cita = require('../models/Cita');

const getAdminStats = async (req, res) => {
  try {
    // Contamos usando filtros directos en la base de datos
    const doctoresRegistrados = await User.countDocuments({ role: 'medico' });
    const citasTotales = await Cita.countDocuments();
    const citasPendientes = await Cita.countDocuments({ estado: 'pendiente' });
    const citasCanceladas = await Cita.countDocuments({ estado: 'cancelada' });

    res.status(200).json({
      doctoresRegistrados,
      citasTotales,
      citasPendientes,
      citasCanceladas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del admin:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = { getAdminStats };