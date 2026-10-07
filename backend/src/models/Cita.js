const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dia: { type: String, required: true },
  horario: { type: String, required: true },
  motivo: { type: String },
  estado: { type: String, enum: ['pendiente', 'confirmada', 'cancelada'], default: 'pendiente' }
}, { timestamps: true });

module.exports = mongoose.model('Cita', citaSchema);