import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      // Client info
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      
      // Property preferences
      propertyType,
      priceRange,
      bedrooms,
      bathrooms,
      preferredAreas,
      moveInTimeline,
      
      // Additional info
      additionalNotes,
      howDidYouHear,
      
      // Agent info
      agentName,
      agentEmail,
      agentId,
      
      // Metadata
      source,
      timestamp
    } = req.body;

    // Validate required fields
    if (!clientName || !clientEmail || !agentEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields (client name, email, and agent email are required)'
      });
    }

    // Validate email configuration
    if (!process.env.OFFICE_APP_PASSWORD) {
      console.error('OFFICE_APP_PASSWORD not configured');
      return res.status(500).json({
        success: false,
        error: 'Email service not configured. Please contact us directly at cabosbir@gmail.com'
      });
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.OFFICE_EMAIL || 'cabosbir@gmail.com',
        pass: process.env.OFFICE_APP_PASSWORD
      }
    });

    // Get current date/time
    const submissionDate = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Determine email recipients
    const officeEmail = process.env.OFFICE_EMAIL || 'cabosbir@gmail.com';
    let emailRecipients = [agentEmail];
    
    // Always CC the office
    if (agentEmail !== officeEmail) {
      emailRecipients.push(officeEmail);
    }

    // Prepare email HTML for agent/office
    const agentEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 28px;">🎉 New Client Registration</h2>
          <p style="color: #d1fae5; margin: 10px 0 0 0;">BAJA INTERNATIONAL REALTY</p>
          <p style="color: #fbbf24; margin: 10px 0 0 0; font-weight: bold; font-size: 18px;">⭐ For: ${agentName}</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb;">
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #065f46;">👤 Client Information:</h3>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${clientName}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${clientEmail}" style="color: #2563eb;">${clientEmail}</a></p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> ${clientPhone ? `<a href="tel:${clientPhone}" style="color: #2563eb;">${clientPhone}</a>` : 'Not provided'}</p>
            ${clientAddress ? `<p style="margin: 8px 0;"><strong>Current Address:</strong> ${clientAddress}</p>` : ''}
            <p style="margin: 8px 0;"><strong>Submission Date:</strong> ${submissionDate}</p>
          </div>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #1e40af;">🏡 Property Preferences:</h3>
            ${propertyType ? `<p style="margin: 8px 0;"><strong>Property Type:</strong> ${propertyType}</p>` : ''}
            ${priceRange ? `<p style="margin: 8px 0;"><strong>Price Range:</strong> ${priceRange}</p>` : ''}
            ${bedrooms ? `<p style="margin: 8px 0;"><strong>Bedrooms:</strong> ${bedrooms}</p>` : ''}
            ${bathrooms ? `<p style="margin: 8px 0;"><strong>Bathrooms:</strong> ${bathrooms}</p>` : ''}
            ${preferredAreas ? `<p style="margin: 8px 0;"><strong>Preferred Areas:</strong> ${preferredAreas}</p>` : ''}
            ${moveInTimeline ? `<p style="margin: 8px 0;"><strong>Move-in Timeline:</strong> ${moveInTimeline}</p>` : ''}
          </div>
          
          ${additionalNotes ? `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #1f2937;">📝 Additional Notes:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #374151;">${additionalNotes}</p>
          </div>
          ` : ''}
          
          ${howDidYouHear ? `
          <div style="background: #fae8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #1f2937;">📢 How They Found You:</h3>
            <p style="margin: 0; color: #374151;">${howDidYouHear}</p>
          </div>
          ` : ''}
          
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="margin: 0; font-weight: bold; color: #065f46;">✅ Next Steps:</p>
            <p style="margin: 10px 0 0 0; color: #14532d;">Client has been registered in your database. Follow up to discuss their property needs in detail.</p>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #bbf7d0;">
              <p style="margin: 5px 0;">📞 <a href="tel:${clientPhone}" style="color: #059669;">${clientPhone || 'No phone provided'}</a></p>
              <p style="margin: 5px 0;">📧 <a href="mailto:${clientEmail}" style="color: #059669;">Email client</a></p>
            </div>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            BAJA INTERNATIONAL REALTY | Blvd. Marina, Cabo San Lucas, BCS, Mexico
          </p>
        </div>
      </div>
    `;

    // Send email to agent and office
    const mailOptions = {
      from: process.env.OFFICE_EMAIL || 'cabosbir@gmail.com',
      to: emailRecipients.join(', '),
      subject: `🎉 New Client Registration - ${clientName} (${agentName})`,
      html: agentEmailHtml,
      replyTo: clientEmail
    };

    await transporter.sendMail(mailOptions);

    // Send confirmation email to client
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 28px;">Welcome to Baja International Realty!</h2>
          <p style="color: #bfdbfe; margin: 10px 0 0 0;">Your Journey Starts Here</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${clientName},</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Thank you for registering with <strong>${agentName}</strong> at Baja International Realty! We're excited to help you find your perfect property in Cabo San Lucas.
          </p>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">What Happens Next?</h3>
            <p style="margin: 10px 0; color: #374151;">✅ Your information has been securely saved</p>
            <p style="margin: 10px 0; color: #374151;">📞 ${agentName} will contact you shortly</p>
            <p style="margin: 10px 0; color: #374151;">🏡 We'll discuss your property preferences in detail</p>
            <p style="margin: 10px 0; color: #374151;">📅 Schedule viewings at your convenience</p>
            <p style="margin: 10px 0; color: #374151;">🤝 Guide you through the entire process</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #065f46; font-size: 18px;">Your Dedicated Agent:</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>Name:</strong> ${agentName}</p>
            ${agentEmail ? `<p style="margin: 8px 0; color: #374151;"><strong>Email:</strong> <a href="mailto:${agentEmail}" style="color: #059669;">${agentEmail}</a></p>` : ''}
            <p style="margin: 8px 0; color: #374151;"><strong>Office:</strong> <a href="tel:+526241435555" style="color: #059669;">+52 624 143 5555</a></p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">Need Immediate Assistance?</h3>
            <p style="margin: 8px 0; color: #374151;">📱 <strong>Office:</strong> <a href="tel:+526241435555" style="color: #2563eb;">+52 624 143 5555</a></p>
            <p style="margin: 8px 0; color: #374151;">📧 <strong>Email:</strong> <a href="mailto:cabosbir@gmail.com" style="color: #2563eb;">cabosbir@gmail.com</a></p>
          </div>
          
          <p style="font-size: 16px; color: #374151; margin-top: 30px;">
            We look forward to helping you find your dream property in beautiful Cabo San Lucas!
          </p>
          
          <p style="font-size: 16px; color: #374151;">
            Best regards,<br>
            <strong style="color: #1e40af;">${agentName}<br>Baja International Realty</strong>
          </p>
        </div>
        
        <div style="background: #1f2937; padding: 25px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 5px 0; color: white; font-size: 14px; font-weight: bold;">Your Trusted Luxury Real Estate Partner</p>
          <p style="margin: 5px 0; color: #9ca3af; font-size: 12px;">Blvd. Marina, Cabo San Lucas, BCS, Mexico</p>
        </div>
      </div>
    `;

    const clientMailOptions = {
      from: process.env.OFFICE_EMAIL || 'cabosbir@gmail.com',
      to: clientEmail,
      subject: `Welcome to Baja International Realty - ${agentName}`,
      html: clientEmailHtml
    };

    await transporter.sendMail(clientMailOptions);

    console.log('✅ New client registration emails sent successfully');

    return res.status(200).json({
      success: true,
      message: `Thank you ${clientName}! ${agentName} will contact you shortly.`
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to submit registration. Please contact us directly at +52 624 143 5555',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
