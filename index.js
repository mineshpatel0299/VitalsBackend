require('dotenv').config({ path: './.env.local' });
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5001; 


app.use(cors());
app.use(express.json());


const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

console.log('Nodemailer transporter configured with user:', process.env.EMAIL_USER);
// console.log('Nodemailer transporter configured with pass:', process.env.EMAIL_PASS ? '********' : 'NOT SET'); 

app.post('/api/contact', async (req, res) => {
  console.log('Received contact form submission.');
  const { firstName, lastName, email, phone, subject, message } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({ error: 'All required fields must be filled.' });
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'sharvyac.official@gmail.com', 
      subject: `Contact Form Submission: ${subject}`,
      html: `
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    console.log('Attempting to send email with options:', mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('Nodemailer response:', error.response);
    }
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Failed to start server or server error:', err.message);
  process.exit(1); // Exit the process if the server fails to start or encounters a critical error
});

// Handle unhandled exceptions
process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception:', err);
  process.exit(1); // Exit with a failure code
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Do not exit here, as it might be a minor issue. Log and monitor.
});
