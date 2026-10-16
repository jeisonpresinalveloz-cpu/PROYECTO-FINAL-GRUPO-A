const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendResetEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: `"Plaza De La Salud" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Recuperación de Contraseña - Plaza De La Salud',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #34C7A5; text-align: center;">Plaza De La Salud</h2>
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva. Este enlace <strong>expirará en 15 minutos</strong> por seguridad.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #34C7A5; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Restablecer mi contraseña</a>
        </div>
        <p style="font-size: 12px; color: #666; text-align: center;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };