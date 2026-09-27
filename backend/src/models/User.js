const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['paciente', 'medico', 'admin'], default: 'paciente' },

  especialidad: { 
    type: String, 
    // Solo es obligatorio si el rol es 'medico'
    required: function() { return this.role === 'medico'; } 
  },
  horarios: [{
    dia: { type: String, required: true },       // Ej: 'Lunes'
    horaInicio: { type: String, required: true }, // Ej: '08:00'
    horaFin: { type: String, required: true }     // Ej: '12:00'
  }]
});

module.exports = mongoose.model('User', userSchema);