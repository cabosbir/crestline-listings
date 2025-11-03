// Backend API Route: /api/contact/agent-inquiry
// This should be placed in your backend API routes folder
// Example: server/routes/contact.js or pages/api/contact/agent-inquiry.ts (Next.js)

import nodemailer from 'nodemailer';

// Configure your email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Your email
    pass: process.env.SMTP_PASSWORD, // Your email password or app-specific password
  },
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name,
      email,
      phone,
      message,
      propertyInterest,
      agentName,
      agentEmail,
      agentId,
      agent,
      source,
      timestamp
    } = req.body;

    // Validate required fields
    if (!name || !email || !message || !agentEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Email to Alfonso
    const mailToAgent = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: agentEmail, // alfonso@bircabo.com
      subject: `New Lead from Agent Landing Page - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #102f74; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8f9fa; padding: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #102f74; }
            .value { margin-top: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🏠 New Lead from Your Landing Page</h2>
              <p>Agent: ${agentName}</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Contact Name:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              ${phone ? `
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              ` : ''}
              ${propertyInterest ? `
              <div class="field">
                <div class="label">Property Interest:</div>
                <div class="value">${propertyInterest}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message}</div>
              </div>
              <div class="field">
                <div class="label">Source:</div>
                <div class="value">${source}</div>
              </div>
              <div class="field">
                <div class="label">Received:</div>
                <div class="value">${new Date(timestamp).toLocaleString()}</div>
              </div>
            </div>
            <div class="footer">
              <p>This inquiry was submitted through your agent landing page.</p>
              <p>Baja International Realty - bircabo.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Lead from Agent Landing Page

Agent: ${agentName}

Contact Information:
-------------------
Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${propertyInterest ? `Property Interest: ${propertyInterest}` : ''}

Message:
${message}

Source: ${source}
Received: ${new Date(timestamp).toLocaleString()}
      `
    };

    // Auto-reply to the customer
    const mailToCustomer = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Thank you for contacting ${agentName} - Baja International Realty`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #102f74; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8f9fa; padding: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Thank You for Your Inquiry!</h2>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Thank you for reaching out to me regarding your real estate needs in Cabo San Lucas. I've received your message and will get back to you within 24 hours.</p>
              <p>In the meantime, feel free to call me directly at <strong>+52 664 188 8681</strong> if you have any urgent questions.</p>
              <p>I look forward to helping you find your dream property!</p>
              <p>Best regards,<br>
              <strong>${agentName}</strong><br>
              Sales Manager & Commercial Real Estate Expert<br>
              Baja International Realty<br>
              ${agentEmail}<br>
              +52 664 188 8681</p>
            </div>
            <div class="footer">
              <p>Baja International Realty | bircabo.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Dear ${name},

Thank you for reaching out to me regarding your real estate needs in Cabo San Lucas. I've received your message and will get back to you within 24 hours.

In the meantime, feel free to call me directly at +52 664 188 8681 if you have any urgent questions.

I look forward to helping you find your dream property!

Best regards,
${agentName}
Sales Manager & Commercial Real Estate Expert
Baja International Realty
${agentEmail}
+52 664 188 8681
      `
    };

    // Send both emails
    await transporter.sendMail(mailToAgent);
    await transporter.sendMail(mailToCustomer);

    // Optionally: Save to database
    // await saveLeadToDatabase({ name, email, phone, message, propertyInterest, agentId, timestamp });

    return res.status(200).json({ 
      success: true, 
      message: 'Inquiry sent successfully' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      error: 'Failed to send inquiry',
      details: error.message 
    });
  }
}

// Optional: Function to save leads to database
async function saveLeadToDatabase(leadData) {
  // Example using a hypothetical database connection
  // Replace with your actual database logic
  /*
  const db = await connectToDatabase();
  await db.collection('leads').insertOne({
    ...leadData,
    status: 'new',
    createdAt: new Date()
  });
  */
}
