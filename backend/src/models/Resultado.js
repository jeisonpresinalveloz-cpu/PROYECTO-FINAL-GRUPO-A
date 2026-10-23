const mongoose = require('mongoose');

const resultadoSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { type: String, required: true }, // Ej. Hemograma Completo
  estado: { type: String, default: 'Pendiente', enum: ['Pendiente', 'Listo'] },
  observaciones: { type: String, default: '' },
  fecha: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Resultado', resultadoSchema);