const nodemailer = require('nodemailer');

// Configuración del transporte con tu cuenta de Ethereal
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'rosendo13@ethereal.email',
        pass: 'BB8KgSZarfFsJM6zZN'
    }
});

const enviarCorreoConfirmacion = async (emailPaciente, nombrePaciente, nombreMedico, dia, hora) => {
    try {
        const info = await transporter.sendMail({
            from: '"Clínica Médica" <no-reply@clinicamedica.com>',
            to: emailPaciente,
            subject: 'Confirmación de Reserva de Cita Médica ✔',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2c3e50;">¡Hola, ${nombrePaciente}!</h2>
                    <p>Tu cita ha sido registrada exitosamente en nuestro sistema.</p>
                    <div style="background-color: #f9fbfc; padding: 15px; border-left: 4px solid #1abc9c; margin: 20px 0;">
                        <p><strong>👨‍⚕️ Médico:</strong> Dr(a). ${nombreMedico}</p>
                        <p><strong>📅 Día:</strong> ${dia}</p>
                        <p><strong>⏰ Hora:</strong> ${hora}</p>
                    </div>
                    <p>Si necesitas cancelar tu cita, por favor ingresa a tu panel de control con antelación.</p>
                    <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
                        Este es un mensaje automático, por favor no respondas a este correo.
                    </p>
                </div>
            `
        });

        console.log('Correo de confirmación enviado. URL de vista previa:', nodemailer.getTestMessageUrl(info));
        return true;
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return false;
    }
};

module.exports = { enviarCorreoConfirmacion };