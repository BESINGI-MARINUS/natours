const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `BESINGI MARINUS <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'production') {
      // Use sendgrid
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        // service: 'Sendgrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    }

    // Catch emails in mailtrap during developement.
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // 1. Generate HTML from pug template.
    const html = pug.renderFile(`${__dirname}/../view/email/${template}.pug`, {
      url: this.url,
      firstName: this.firstName,
      subject,
    });
    // 2. Define email options.
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };
    // 3. Create transport and send email.
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (Only valid for 10 minutes).',
    );
  }
};

// const sendEmail = async (options) => {
//   // Create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // 2. Define some email options
//   const mailOptions = {
//     from: 'BESINGI MARINUS',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   // 3. Send the email
//   await transporter.sendMail(mailOptions);
// };
