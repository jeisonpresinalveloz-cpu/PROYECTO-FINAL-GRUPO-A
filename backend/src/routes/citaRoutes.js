const express = require('express');
const router = express.Router();

const { 
  crearCita, 
  getCitasPaciente, 
  getCitasMedico, 
  actualizarEstadoCita, 
  getHorasOcupadas,
  cancelarCita,
  getTodasLasCitas // 1. Importamos la nueva función
} = require('../controllers/citaController');

// Rutas de uso general (Pacientes y Médicos)
router.post('/crear', crearCita);
router.get('/paciente/:pacienteId', getCitasPaciente); 
router.get('/medico/:medicoId', getCitasMedico);       
router.put('/:id/estado', actualizarEstadoCita);       
router.put('/:id/cancelar', cancelarCita);           
router.get('/disponibilidad', getHorasOcupadas);

// 2. Nueva ruta global para el Administrador
router.get('/', getTodasLasCitas);

module.exports = router;