const mongoose = require('express'); // Solo para que VS Code no se queje, pero usaremos mongoose
const mongooseDb = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Asegúrate de que esta ruta apunte correctamente a tu modelo de Usuario
const User = require('./src/models/User'); 

const poblarBaseDeDatos = async () => {
  try {
    // 1. Conectar a la base de datos usando tu variable de entorno
    await mongooseDb.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/horizonte');
    console.log('Conectado a MongoDB...');

    // 2. Limpiar usuarios de prueba anteriores para evitar errores de correos duplicados
    const testEmails = ['admin@horizonte.com', 'medico@horizonte.com', 'paciente@horizonte.com'];
    await User.deleteMany({ email: { $in: testEmails } });

    // 3. Crear contraseña encriptada (123456)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // 4. Preparar el usuario Administrador (Usando tu nombre real para el acceso maestro)
    const adminUser = {
      name: 'Jeison Admin',
      email: 'admin@horizonte.com',
      password: hashedPassword,
      role: 'admin'
    };

    // 5. Preparar un Médico de prueba
    const medicoUser = {
      name: 'Dr. Francisco',
      email: 'medico@horizonte.com',
      password: hashedPassword,
      role: 'medico',
      especialidad: 'Cardiología',
      exequatur: '12345-MED'
    };

    // 6. Preparar un Paciente de prueba
    const pacienteUser = {
      name: 'María Pérez',
      email: 'paciente@horizonte.com',
      password: hashedPassword,
      role: 'paciente'
    };

    // 7. Insertarlos en la base de datos
    await User.create(adminUser);
    await User.create(medicoUser);
    await User.create(pacienteUser);

    console.log('✅ Base de datos poblada exitosamente.');
    console.log('-------------------------------------------');
    console.log('Credenciales listas para que tu equipo pruebe:');
    console.log('🟢 Administrador : admin@horizonte.com    | Clave: 123456');
    console.log('🔵 Médico        : medico@horizonte.com   | Clave: 123456');
    console.log('🟣 Paciente      : paciente@horizonte.com | Clave: 123456');
    console.log('-------------------------------------------');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  }
};

poblarBaseDeDatos();