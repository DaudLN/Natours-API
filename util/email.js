const nodemailer = require('nodemailer');
/*Dealing with nodemailer, we need to define
1. Transporter
2. Define mail options
3. Send email*/

const sendEmail = async (options) => {
  // Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.Host,
    port: process.env.Port,
    auth: {
      user: process.env.Username,
      pass: process.env.Password,
    },
  });
  // Mail options
  const mailOptions = {
    from: 'Daud Namayala <test@natour.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // Send email
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
