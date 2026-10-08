const Cita = require('../models/Cita');
const User = require('../models/User');
const { enviarCorreoConfirmacion } = require('../services/emailService');

// HU05: Obtener las horas que YA están ocupadas para un médico en un día
exports.getHorasOcupadas = async (req, res) => {
  try {
    const { medicoId, dia } = req.query;
    // Busca citas confirmadas o pendientes para ese médico y día
    const citas = await Cita.find({ 
      medicoId, 
      dia, 
      estado: { $ne: 'cancelada' } 
    });
    
    // Extrae solo un arreglo con las horas de esas citas (Ej: ["14:00", "16:00"])
    const horasOcupadas = citas.map(cita => cita.horario);
    res.status(200).json(horasOcupadas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar disponibilidad' });
  }
};

// HU06: Crear una nueva reserva de cita y disparar correo (HU09)
exports.crearCita = async (req, res) => {
  try {
    const { pacienteId, medicoId, dia, horario, motivo } = req.body;

    // 1. Guardamos la cita en la base de datos
    const nuevaCita = new Cita({ pacienteId, medicoId, dia, horario, motivo });
    await nuevaCita.save();

    // 2. Buscamos los datos del paciente y el médico para personalizar el correo
    const paciente = await User.findById(pacienteId);
    const medico = await User.findById(medicoId);

    // 3. Enviamos el correo de confirmación si encontramos al paciente
    if (paciente && paciente.email) {
        await enviarCorreoConfirmacion(
            paciente.email, 
            paciente.name, 
            medico.name, 
            dia, 
            horario
        );
    }

    res.status(201).json({ mensaje: 'Cita reservada y notificada exitosamente', cita: nuevaCita });
  } catch (error) {
    console.error('Error en crearCita:', error);
    res.status(500).json({ mensaje: 'Error al procesar la reserva de la cita' });
  }
};

// HU: El médico visualiza su agenda de pacientes
exports.getCitasMedico = async (req, res) => {
  try {
    const { medicoId } = req.params;
    
    // Buscamos las citas de este médico y traemos el 'name' del paciente
    const citas = await Cita.find({ medicoId })
                            .populate('pacienteId', 'name email')
                            .sort({ dia: 1, horario: 1 }); // Ordenamos por día y hora
                            
    res.status(200).json(citas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la agenda del médico' });
  }
};

// HU: Obtener la lista de citas de un paciente específico
exports.getCitasPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    // Buscamos las citas del paciente y traemos los datos del médico
    const citas = await Cita.find({ pacienteId })
                            .populate('medicoId', 'name especialidad specialty')
                            .sort({ createdAt: -1 }); // Las más nuevas primero
    res.status(200).json(citas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tus citas' });
  }
};

// HU: Cancelar una cita (Cambiar estado a 'cancelada')
exports.cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;
    // Buscamos la cita por su ID y actualizamos su estado
    await Cita.findByIdAndUpdate(id, { estado: 'cancelada' });
    res.status(200).json({ mensaje: 'Cita cancelada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cancelar la cita' });
  }
};

// HU: Médico aprueba o rechaza una cita pendiente
exports.actualizarEstadoCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; // Recibirá 'confirmada' o 'cancelada'
    
    // Validamos que solo se envíen estados permitidos
    if (!['confirmada', 'cancelada'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado no válido' });
    }

    const citaActualizada = await Cita.findByIdAndUpdate(id, { estado }, { new: true });
    res.status(200).json({ mensaje: `Cita ${estado} correctamente`, cita: citaActualizada });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el estado de la cita' });
  }
};