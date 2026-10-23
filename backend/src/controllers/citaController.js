const Cita = require('../models/Cita');
const User = require('../models/User');
const { enviarCorreoConfirmacion } = require('../services/emailService');

// HU05: Obtener las horas que YA están ocupadas para un médico en un día
const getHorasOcupadas = async (req, res) => {
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
const crearCita = async (req, res) => {
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
const getCitasMedico = async (req, res) => {
  try {
    const { medicoId } = req.params;
    
    // Buscamos las citas de este médico y traemos el 'name' del paciente
    const citas = await Cita.find({ medicoId })
                            .populate('pacienteId', 'name email age') // Se agrega age para la vista del médico
                            .sort({ dia: 1, horario: 1 }); // Ordenamos por día y hora
                            
    res.status(200).json(citas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la agenda del médico' });
  }
};

// HU: Obtener la lista de citas de un paciente específico
const getCitasPaciente = async (req, res) => {
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

// HU: Cancelar una cita (Cambiar estado a 'cancelada' y guardar la razón)
const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;
    // NUEVO: Extraemos la razón del cuerpo de la petición (req.body)
    const { razonCancelacion } = req.body; 

    // Buscamos la cita por su ID y actualizamos su estado Y su razón
    const citaActualizada = await Cita.findByIdAndUpdate(
      id, 
      { 
        estado: 'cancelada',
        razonCancelacion: razonCancelacion // Guardamos la razón en MongoDB
      },
      { returnDocument: 'after' } // Para que devuelva el documento actualizado
    );

    if (!citaActualizada) {
      return res.status(404).json({ mensaje: 'Cita no encontrada' });
    }

    res.status(200).json({ mensaje: 'Cita cancelada correctamente', cita: citaActualizada });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cancelar la cita' });
  }
};

// HU: Médico aprueba, atiende o declina una cita
const actualizarEstadoCita = async (req, res) => {
  try {
    const { id } = req.params;
    // NUEVO: Extraemos la razonCancelacion del body
    const { estado, diagnostico, sintomas, receta, razonCancelacion } = req.body; 
    
    const estadosPermitidos = ['pendiente', 'confirmada', 'en_sala', 'en_consulta', 'atendida', 'cancelada'];
    if (estado && !estadosPermitidos.includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado no válido' });
    }

    let datosActualizar = {};
    if (estado) datosActualizar.estado = estado;
    if (diagnostico) datosActualizar.diagnostico = diagnostico;
    if (sintomas) datosActualizar.sintomas = sintomas;
    if (receta) datosActualizar.receta = receta;
    
    // NUEVO: Si enviaron una razón de cancelación/declinación, la guardamos
    if (razonCancelacion) datosActualizar.razonCancelacion = razonCancelacion;

    const citaActualizada = await Cita.findByIdAndUpdate(id, datosActualizar, { returnDocument: 'after' });
    res.status(200).json({ mensaje: 'Cita actualizada correctamente', cita: citaActualizada });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el estado de la cita' });
  }
};

// NUEVA FUNCIÓN PARA EL PANEL DE ADMINISTRACIÓN
const getTodasLasCitas = async (req, res) => {
  try {
    // Poblamos los datos del paciente y del médico para que el admin vea los nombres
    const citas = await Cita.find()
      .populate('pacienteId', 'name email')
      .populate('medicoId', 'name especialidad')
      .sort({ createdAt: -1 }); // Las más recientes primero

    res.json(citas);
  } catch (error) {
    console.error("Error al obtener todas las citas:", error);
    res.status(500).json({ mensaje: 'Error al cargar el historial de citas' });
  }
};

// Exportamos todas las funciones al final usando un solo module.exports
module.exports = {
  getHorasOcupadas,
  crearCita,
  getCitasMedico,
  getCitasPaciente,
  cancelarCita,
  actualizarEstadoCita,
  getTodasLasCitas // Nueva función exportada
};