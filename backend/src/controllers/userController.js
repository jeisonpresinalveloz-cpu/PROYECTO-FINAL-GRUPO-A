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
    const { userId, name, phone, bloodType, allergies, especialidad, exequatur, agendaActiva } = req.body;

    // 1. Construimos un objeto SOLO con los campos que realmente se enviaron desde el frontend
    // Esto evita que intentemos guardar valores "undefined" y borremos datos sin querer.
    let datosActualizar = {};
    if (name !== undefined) datosActualizar.name = name;
    if (phone !== undefined) datosActualizar.phone = phone;
    if (bloodType !== undefined) datosActualizar.bloodType = bloodType;
    if (allergies !== undefined) datosActualizar.allergies = allergies;
    if (especialidad !== undefined) datosActualizar.especialidad = especialidad;
    if (exequatur !== undefined) datosActualizar.exequatur = exequatur;
    if (agendaActiva !== undefined) datosActualizar.agendaActiva = agendaActiva; // El booleano se pasa directamente

    // 2. Usamos $set para decirle a Mongo que SOLO actualice esos campos específicos
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: datosActualizar },
      { returnDocument: 'after', runValidators: true }
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

const getUsuarios = async (req, res) => {
  try {
    const roleFiltro = req.query.role; // Captura si en la URL dice ?role=medico
    
    let query = {};
    if (roleFiltro) {
      query.role = roleFiltro; // Filtra en la base de datos solo por el rol pedido
    }

    // Busca en la BD, excluyendo la contraseña
    const usuarios = await User.find(query).select('-password');
    res.json(usuarios);

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
};


const getUsuarioPorId = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error("Error al obtener el usuario por ID:", error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

module.exports = { getDoctors, updateUserProfile, getUsuarios, getUsuarioPorId };