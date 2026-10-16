const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['paciente', 'medico', 'admin'], default: 'paciente' },
  phone: { type: String, default: '' },
  bloodType: { type: String, default: '' },
  allergies: { type: String, default: '' },
  exequatur: { type: String, default: '' }, // Número de licencia del médico

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