const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet'); // 1. Oculta cabeceras de vulnerabilidad
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const medicoRoutes = require('./src/routes/medicoRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Escudo personalizado contra Inyección NoSQL
const sanitizeMongo = (req, res, next) => {
  const limpiarObjeto = (obj) => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key]; // Elimina la inyección maliciosa
        } else {
          limpiarObjeto(obj[key]);
        }
      }
    }
  };

  if (req.body) limpiarObjeto(req.body);
  if (req.params) limpiarObjeto(req.params);
  next();
};

// 2. Crear las reglas del limitador
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos de ventana de tiempo
    max: 100, // Límite de 100 peticiones por IP en esa ventana
    message: { mensaje: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.' }
});

// Middlewares
app.use(helmet()); // 4. Activar Helmet para ocultar cabeceras de vulnerabilidad
app.use(cors());
app.use(express.json());
app.use(limiter); // 3. Activar el limitador globalmente para todas las rutas

// Activar el escudo
app.use(sanitizeMongo);

// Rutas
app.use('/api/medicos', medicoRoutes);
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/schedules', require('./src/routes/scheduleRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/appointments', require('./src/routes/appointmentRoutes'));
app.use('/api/citas', require('./src/routes/citaRoutes'));
app.use('/api/admin', adminRoutes);

// ==========================================
// RUTAS DIRECTAS DE RESULTADOS CLÍNICOS
// ==========================================

// 1. Obtener resultados del Paciente
app.get('/api/resultados/paciente/:pacienteId', require('./src/controllers/resultadoController').getResultadosPaciente);

// 2. Obtener resultados pendientes del Médico
app.get('/api/resultados/medico/:medicoId', async (req, res) => {
  try {
    const Resultado = require('./src/models/Resultado'); // Llama al modelo
    // Busca los resultados asignados a este médico y trae el nombre del paciente
    const resultados = await Resultado.find({ medicoId: req.params.medicoId }).populate('pacienteId', 'name');
    res.json(resultados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al cargar resultados del médico' });
  }
});

// 3. Actualizar estado de un resultado (Para "Marcar revisado")
app.put('/api/resultados/:id/estado', async (req, res) => {
  try {
    const Resultado = require('./src/models/Resultado'); // Llama al modelo
    const { estado } = req.body;
    await Resultado.findByIdAndUpdate(req.params.id, { estado });
    res.json({ mensaje: 'Resultado actualizado a ' + estado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el resultado' });
  }
});

// ==========================================

app.get('/', (req, res) => {
    res.send('API del Sistema de Citas Médicas funcionando');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});