const express = require('express');
const router = express.Router();
const { getHorasOcupadas, crearCita, getCitasMedico, getCitasPaciente, cancelarCita, actualizarEstadoCita } = require('../controllers/citaController');

router.get('/ocupadas', getHorasOcupadas);
router.post('/reservar', crearCita);
router.get('/medico/:medicoId', getCitasMedico);

router.get('/paciente/:pacienteId', getCitasPaciente);
router.put('/cancelar/:id', cancelarCita);
router.put('/estado/:id', actualizarEstadoCita);

module.exports = router;