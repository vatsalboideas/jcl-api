const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Email templates
const templates = {
  career: (data) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2a2a2a;">Career Form Submission</h2>
      <p><strong>First Name:</strong> ${data.firstName}</p>
      <p><strong>Last Name:</strong> ${data.lastName}</p>
      <p><strong>Email ID:</strong> ${data.emailId}</p>
      <p><strong>Phone Number:</strong> ${data.contactNumber}</p>
      ${data.portfolioLink ? `<p><strong>Portfolio Link:</strong> <a href="${data.portfolioLink}" target="_blank">${data.portfolioLink}</a></p>` : ''}
      ${data.message ? `<p><strong>Message:</strong><br />${data.message}</p>` : ''}
      ${data.resume ? `<p><strong>Resume:</strong> <a href="${process.env.API_LINK}/${data.resume}" target="_blank">Download Resume</a></p>` : ''}
      <hr />
      <p style="font-size: 0.9em; color: #666;">This email was sent automatically from the Career Form submission.</p>
    </div>
  `,

  contact: (data) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2a2a2a;">Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
      <p><strong>Phone Number:</strong> ${data.contactNumber}</p>
      <p><strong>Email:</strong> ${data.emailId}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong><br />${data.message}</p>
      <hr />
      <p style="font-size: 0.9em; color: #666;">This email was sent automatically from the Contact Form submission.</p>
    </div>
  `,
};

// Send email function
const sendEmail = async ({ subject, template, data }) => {
  try {
    // Validate required parameters
    if (!subject || !template || !data) {
      console.error('Email sending failed: Missing required parameters', {
        subject,
        template,
        dataKeys: Object.keys(data || {}),
      });
      return { success: false };
    }

    // Validate template
    if (!templates[template]) {
      console.error('Email sending failed: Invalid template', { template });
      return { success: false };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: process.env.SMTP_FROM_EMAIL,
      subject,
      html: templates[template](data),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(
      'Email sent successfully:',
      info.messageId,
      info.response,
      template,
      'to',
      data.emailId
    );

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    // Log the error with context but don't throw
    console.error('Email sending failed:', {
      errorMessage: error.message,
      template,
      dataKeys: Object.keys(data || {}),
      subject,
    });

    // Return a failure object instead of throwing an error
    return { success: false };
  }
};

module.exports = { sendEmail };
