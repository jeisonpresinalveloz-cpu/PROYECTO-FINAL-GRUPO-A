const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const medicoRoutes = require('./src/routes/medicoRoutes');
const adminRoutes = require('./src/routes/adminRoutes');



// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// 2. Crear las reglas del limitador
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos de ventana de tiempo
    max: 100, // Límite de 100 peticiones por IP en esa ventana
    message: { mensaje: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.' }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(limiter); // 3. Activar el limitador globalmente para todas las rutas
app.use('/api/medicos', medicoRoutes);

// Rutas
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/schedules', require('./src/routes/scheduleRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/appointments', require('./src/routes/appointmentRoutes'));
app.use('/api/citas', require('./src/routes/citaRoutes'));
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('API del Sistema de Citas Médicas funcionando');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});