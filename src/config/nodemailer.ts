const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
  });
  
  async function sendEmail(to : string, Subject : string, html : string){
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: to,
      subject: Subject,
      html: html,
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent: " + info.response);
    } catch (error) {
      console.error("Error sending email: " + error);
    }
  }