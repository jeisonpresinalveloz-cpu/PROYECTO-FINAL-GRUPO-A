const User = require('../models/User');

const getDoctors = async (req, res) => {
    try {
        // Capturar la especialidad si viene en la URL (ej. ?specialty=Cardiología)
        const { specialty } = req.query; 
        
        // Empezamos buscando solo a los usuarios con rol 'medico'
        let query = { role: 'medico' };

        // Si el paciente seleccionó una especialidad, la agregamos al filtro
        if (specialty) {
            query.specialty = specialty;
        }

        // Buscar en MongoDB y usar .select('-password') para NUNCA enviar las contraseñas al frontend
        const doctors = await User.find(query).select('-password');
        
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el catálogo de médicos', error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
  try {
    // Añadimos 'especialidad' y 'exequatur' a la desestructuración
    const { userId, name, phone, bloodType, allergies, especialidad, exequatur } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, bloodType, allergies, especialidad, exequatur }, // Y los añadimos aquí
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    res.status(200).json({
      mensaje: 'Perfil actualizado exitosamente.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al guardar el perfil.' });
  }
};



module.exports = { getDoctors, updateUserProfile };