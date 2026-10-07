// ==========================================
// ARCHIVO: src/controllers/citaController.js
// HISTORIA: HU05 y HU06 - Motor de Reservas
// ==========================================
const Cita = require('../models/Cita');

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

// HU06: Guardar la cita y bloquear el horario
exports.crearCita = async (req, res) => {
  try {
    const { pacienteId, medicoId, dia, horario, motivo } = req.body;

    // Verificación de seguridad: Evitar duplicidad si dos pacientes intentan al mismo tiempo
    const citaExistente = await Cita.findOne({ 
      medicoId, dia, horario, estado: { $ne: 'cancelada' } 
    });

    if (citaExistente) {
      return res.status(400).json({ mensaje: 'Este horario acaba de ser reservado por otro paciente.' });
    }

    const nuevaCita = new Cita({ pacienteId, medicoId, dia, horario, motivo });
    await nuevaCita.save();

    res.status(201).json({ mensaje: 'Cita agendada exitosamente', cita: nuevaCita });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al procesar la reserva' });
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