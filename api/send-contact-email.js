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
    const { name, email, phone, inquiryType, propertyType, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields (name, email, and message are required)' 
      });
    }

    // Validate email configuration
    if (!process.env.OFFICE_APP_PASSWORD) {
      console.error('OFFICE_APP_PASSWORD not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Email service not configured. Please contact us directly at info@luxurycoastal.com' 
      });
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.OFFICE_EMAIL || 'info@luxurycoastal.com',
        pass: process.env.OFFICE_APP_PASSWORD
      }
    });

    // Get current date/time
    const submissionDate = new Date().toLocaleString('en-US', { 
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Map inquiry types
    const inquiryTypes = {
      'buying': 'Buying Property',
      'selling': 'Selling Property',
      'renting': 'Renting Property',
      'general': 'General Inquiry'
    };

    const propertyTypes = {
      'villa': 'Villa',
      'condo': 'Condo',
      'penthouse': 'Penthouse',
      'estate': 'Estate'
    };

    const inquiryName = inquiryTypes[inquiryType] || inquiryType || 'Not specified';
    const propertyName = propertyTypes[propertyType] || propertyType || 'Not specified';

    // Prepare email HTML for business
    const businessEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 28px;">🏡 New Contact Form Inquiry</h2>
          <p style="color: #bfdbfe; margin: 10px 0 0 0;">Luxury Coastal Real Estate</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb;">
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #1f2937;">👤 Client Information:</h3>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> ${phone ? `<a href="tel:${phone}" style="color: #2563eb;">${phone}</a>` : 'Not provided'}</p>
            <p style="margin: 8px 0;"><strong>Submission Date:</strong> ${submissionDate}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #1f2937;">🏠 Inquiry Details:</h3>
            <p style="margin: 8px 0;"><strong>Inquiry Type:</strong> ${inquiryName}</p>
            <p style="margin: 8px 0;"><strong>Property Interest:</strong> ${propertyName}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #1f2937;">📝 Client Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #374151;">${message}</p>
          </div>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
            <p style="margin: 0; font-weight: bold; color: #991b1b;">⚠️ Action Required:</p>
            <p style="margin: 10px 0 0 0; color: #7f1d1d;">Contact this client within 24 hours to discuss their real estate needs.</p>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #fecaca;">
              <p style="margin: 5px 0;">📞 <a href="tel:${phone}" style="color: #dc2626;">${phone || 'No phone provided'}</a></p>
              <p style="margin: 5px 0;">📧 <a href="mailto:${email}" style="color: #dc2626;">Reply to client</a></p>
            </div>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            Luxury Coastal Real Estate | 123 Ocean Drive, Paradise City
          </p>
        </div>
      </div>
    `;

    // Send email to business
    const mailOptions = {
      from: process.env.OFFICE_EMAIL || 'info@luxurycoastal.com',
      to: process.env.OFFICE_EMAIL || 'info@luxurycoastal.com',
      subject: `🏡 New ${inquiryName} Inquiry - ${name}`,
      html: businessEmailHtml,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);

    // Send confirmation email to client
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Inquiry!</h2>
          <p style="color: #bfdbfe; margin: 10px 0 0 0;">Luxury Coastal Real Estate</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${name},</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            We've received your inquiry and appreciate your interest in working with us for your real estate needs. Our team of luxury property specialists is reviewing your request.
          </p>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">What Happens Next?</h3>
            <p style="margin: 10px 0; color: #374151;">✅ We'll review your request carefully</p>
            <p style="margin: 10px 0; color: #374151;">📞 Our team will contact you within 24 hours</p>
            <p style="margin: 10px 0; color: #374151;">🏡 We'll discuss your property needs and answer any questions</p>
            <p style="margin: 10px 0; color: #374151;">📅 Schedule a consultation or property viewing at your convenience</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">Your Inquiry Summary:</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>Inquiry Type:</strong> ${inquiryName}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Property Interest:</strong> ${propertyName}</p>
            <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 15px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; font-style: italic; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">Need Immediate Assistance?</h3>
            <p style="margin: 8px 0; color: #374151;">📱 <strong>Call/Text:</strong> <a href="tel:+1234567890" style="color: #2563eb;">+1 (234) 567-8900</a></p>
            <p style="margin: 8px 0; color: #374151;">📧 <strong>Email:</strong> <a href="mailto:info@luxurycoastal.com" style="color: #2563eb;">info@luxurycoastal.com</a></p>
            <p style="margin: 8px 0; color: #374151;">🏢 <strong>Office Hours:</strong> Monday - Friday, 9 AM - 6 PM</p>
          </div>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">🏡 Our Services:</h3>
            <p style="margin: 5px 0; color: #374151; font-size: 14px;">✓ Luxury Property Sales & Acquisitions</p>
            <p style="margin: 5px 0; color: #374151; font-size: 14px;">✓ Investment Property Consulting</p>
            <p style="margin: 5px 0; color: #374151; font-size: 14px;">✓ Property Management</p>
            <p style="margin: 5px 0; color: #374151; font-size: 14px;">✓ Market Analysis & Valuation</p>
            <p style="margin: 5px 0; color: #374151; font-size: 14px;">✓ Exclusive Off-Market Opportunities</p>
          </div>
          
          <p style="font-size: 16px; color: #374151; margin-top: 30px;">
            We look forward to helping you find your perfect property!
          </p>
          
          <p style="font-size: 16px; color: #374151;">
            Best regards,<br>
            <strong style="color: #1e40af;">The Luxury Coastal Real Estate Team</strong>
          </p>
        </div>
        
        <div style="background: #1f2937; padding: 25px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 5px 0; color: white; font-size: 14px; font-weight: bold;">Your Trusted Luxury Real Estate Partner</p>
          <p style="margin: 5px 0; color: #9ca3af; font-size: 12px;">Licensed | Professional | Experienced</p>
          <p style="margin: 5px 0; color: #9ca3af; font-size: 12px;">123 Ocean Drive, Paradise City, PC 12345</p>
          <p style="margin: 15px 0 5px 0;">
            <a href="https://luxurycoastal.com" style="color: #60a5fa; text-decoration: none;">www.luxurycoastal.com</a>
          </p>
        </div>
      </div>
    `;

    const clientMailOptions = {
      from: process.env.OFFICE_EMAIL || 'info@luxurycoastal.com',
      to: email,
      subject: 'We Received Your Inquiry - Luxury Coastal Real Estate',
      html: clientEmailHtml
    };

    await transporter.sendMail(clientMailOptions);

    console.log('✅ Contact form emails sent successfully to:', email);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Thank you! Your inquiry has been sent successfully. We\'ll contact you within 24 hours.'
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send inquiry. Please try calling us directly at +1 (234) 567-8900',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
