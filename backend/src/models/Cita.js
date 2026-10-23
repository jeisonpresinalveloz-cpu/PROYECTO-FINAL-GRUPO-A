const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dia: { type: String, required: true },
  horario: { type: String, required: true },
  motivo: { type: String, required: true },
  estado: { 
    type: String, 
    default: 'pendiente',
    enum: ['pendiente', 'confirmada', 'en_sala', 'en_consulta', 'atendida', 'cancelada']
  },
  diagnostico: { type: String },
  sintomas: { type: String },
  receta: { type: Array, default: [] },
  razonCancelacion: { type: String } 
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Cita', citaSchema);