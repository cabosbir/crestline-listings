// api/contact/seller-evaluation.js
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
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const {
      sellerName,
      sellerEmail,
      sellerPhone,
      propertyAddress,
      propertyCity,
      propertyState,
      propertyZip,
      propertyType,
      bedrooms,
      bathrooms,
      squareFootage,
      lotSize,
      yearBuilt,
      currentlyOccupied,
      reasonForSelling,
      desiredTimeframe,
      expectedPrice,
      recentUpgrades,
      additionalDetails,
      images,
      imageCount,
      agentName,
      agentEmail,
      agentId,
      source,
      formType,
      timestamp
    } = req.body;

    // Validate required fields
    if (!sellerName || !sellerEmail || !sellerPhone || !propertyAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
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

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.OFFICE_EMAIL || 'cabosbir@gmail.com',
        pass: process.env.OFFICE_APP_PASSWORD
      }
    });

    const submissionDate = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const officeEmail = process.env.OFFICE_EMAIL || 'cabosbir@gmail.com';
    let emailRecipients = [officeEmail];

    if (agentEmail && agentEmail !== officeEmail) {
      emailRecipients.push(agentEmail);
    }

    // Prepare image attachments
    const attachments = images?.map((img, index) => ({
      filename: img.filename || `property-photo-${index + 1}.jpg`,
      content: img.content,
      encoding: 'base64',
      contentType: img.contentType || 'image/jpeg'
    })) || [];

    // Business email HTML
    const businessEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #102f74 0%, #1a4ba8 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
          .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .section h2 { color: #102f74; margin-top: 0; border-bottom: 2px solid #102f74; padding-bottom: 10px; font-size: 20px; }
          .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }
          .info-row:last-child { border-bottom: none; }
          .info-label { font-weight: bold; width: 200px; color: #555; }
          .info-value { flex: 1; color: #333; }
          .alert-box { background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin-top: 20px; }
          .alert-box p { margin: 5px 0; color: #7f1d1d; }
          .footer { background: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏡 Seller Evaluation Request</h1>
          <p>BAJA INTERNATIONAL REALTY</p>
          ${agentName ? `<p style="color: #fbbf24; font-weight: bold;">⭐ For: ${agentName}</p>` : ''}
        </div>
        
        <div class="content">
          <div class="section">
            <h2>👤 Seller Information</h2>
            <div class="info-row"><div class="info-label">Name:</div><div class="info-value">${sellerName}</div></div>
            <div class="info-row"><div class="info-label">Email:</div><div class="info-value"><a href="mailto:${sellerEmail}">${sellerEmail}</a></div></div>
            <div class="info-row"><div class="info-label">Phone:</div><div class="info-value"><a href="tel:${sellerPhone}">${sellerPhone}</a></div></div>
            <div class="info-row"><div class="info-label">Submission Date:</div><div class="info-value">${submissionDate}</div></div>
          </div>
          
          <div class="section">
            <h2>🏠 Property Details</h2>
            <div class="info-row"><div class="info-label">Address:</div><div class="info-value">${propertyAddress}</div></div>
            <div class="info-row"><div class="info-label">City:</div><div class="info-value">${propertyCity || 'Not provided'}</div></div>
            <div class="info-row"><div class="info-label">State:</div><div class="info-value">${propertyState || 'Not provided'}</div></div>
            <div class="info-row"><div class="info-label">Zip Code:</div><div class="info-value">${propertyZip || 'Not provided'}</div></div>
            <div class="info-row"><div class="info-label">Property Type:</div><div class="info-value">${propertyType || 'Not specified'}</div></div>
            <div class="info-row"><div class="info-label">Bedrooms:</div><div class="info-value">${bedrooms || 'Not specified'}</div></div>
            <div class="info-row"><div class="info-label">Bathrooms:</div><div class="info-value">${bathrooms || 'Not specified'}</div></div>
            <div class="info-row"><div class="info-label">Square Footage:</div><div class="info-value">${squareFootage || 'Not specified'}</div></div>
            <div class="info-row"><div class="info-label">Lot Size:</div><div class="info-value">${lotSize || 'Not specified'}</div></div>
            <div class="info-row"><div class="info-label">Year Built:</div><div class="info-value">${yearBuilt || 'Not specified'}</div></div>
          </div>
          
          <div class="section">
            <h2>💼 Selling Information</h2>
            <div class="info-row"><div class="info-label">Currently Occupied:</div><div class="info-value">${currentlyOccupied || 'Not specified'}</div></div>
            <div class="info-row"><div class="info-label">Desired Timeframe:</div><div class="info-value">${desiredTimeframe || 'Not specified'}</div></div>
            <div class="info-row"><div class="info-label">Expected Price:</div><div class="info-value">${expectedPrice || 'Not specified'}</div></div>
            <div class="info-row"><div class="info-label">Reason for Selling:</div><div class="info-value">${reasonForSelling || 'Not provided'}</div></div>
          </div>
          
          ${recentUpgrades ? `
          <div class="section">
            <h2>🔧 Recent Upgrades/Renovations</h2>
            <p style="white-space: pre-wrap;">${recentUpgrades}</p>
          </div>
          ` : ''}
          
          ${additionalDetails ? `
          <div class="section">
            <h2>📝 Additional Details</h2>
            <p style="white-space: pre-wrap;">${additionalDetails}</p>
          </div>
          ` : ''}
          
          ${imageCount > 0 ? `
          <div class="section">
            <h2>📷 Property Photos</h2>
            <p>${imageCount} photo(s) attached to this email</p>
          </div>
          ` : ''}
          
          <div class="alert-box">
            <p style="font-weight: bold; color: #991b1b;">⚠️ Action Required:</p>
            <p>${agentName ? `${agentName}, please` : 'Please'} contact this seller within 24 hours to schedule a property evaluation.</p>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #fecaca;">
              <p style="margin: 5px 0;">📞 <a href="tel:${sellerPhone}" style="color: #dc2626;">${sellerPhone}</a></p>
              <p style="margin: 5px 0;">📧 <a href="mailto:${sellerEmail}" style="color: #dc2626;">Reply to seller</a></p>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>BAJA INTERNATIONAL REALTY | Blvd. Marina, Cabo San Lucas, BCS, Mexico</p>
        </div>
      </body>
      </html>
    `;

    // Send email to business
    const mailOptions = {
      from: process.env.OFFICE_EMAIL || 'cabosbir@gmail.com',
      to: emailRecipients.join(', '),
      subject: `🏡 Seller Evaluation Request${agentName ? ` for ${agentName}` : ''} - ${sellerName}`,
      html: businessEmailHtml,
      replyTo: sellerEmail,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);

    // Client confirmation email
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #102f74 0%, #1a4ba8 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #ddd; }
          .info-box { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2563eb; }
          .contact-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; }
          .footer { background: #1f2937; padding: 25px; text-align: center; border-radius: 0 0 10px 10px; color: white; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Thank You for Your Request!</h1>
          <p>BAJA INTERNATIONAL REALTY</p>
        </div>
        
        <div class="content">
          <p style="font-size: 16px;">Dear ${sellerName},</p>
          
          <p style="font-size: 16px;">
            Thank you for requesting a free property evaluation from ${agentName || 'Baja International Realty'}! 
            We've received your submission and ${agentName ? `<strong>${agentName}</strong> will` : 'our team will'} contact you within 24 hours.
          </p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">What Happens Next?</h3>
            <p style="margin: 10px 0;">✅ We'll review your property details carefully</p>
            <p style="margin: 10px 0;">📞 ${agentName ? `${agentName} will` : 'Our team will'} contact you within 24 hours</p>
            <p style="margin: 10px 0;">🏡 Schedule an in-person property evaluation</p>
            <p style="margin: 10px 0;">💰 Receive a comprehensive market analysis and pricing strategy</p>
          </div>
          
          <div class="contact-box">
            <h3 style="margin-top: 0; font-size: 18px;">Need Immediate Assistance?</h3>
            <p style="margin: 8px 0;">📱 <strong>Office:</strong> <a href="tel:+526241435555" style="color: #2563eb;">+52 624 143 5555</a></p>
            <p style="margin: 8px 0;">📧 <strong>Email:</strong> <a href="mailto:cabosbir@gmail.com" style="color: #2563eb;">cabosbir@gmail.com</a></p>
            ${agentEmail ? `<p style="margin: 8px 0;">👤 <strong>${agentName}:</strong> <a href="mailto:${agentEmail}" style="color: #2563eb;">${agentEmail}</a></p>` : ''}
          </div>
          
          <p style="font-size: 16px; margin-top: 30px;">
            We look forward to helping you sell your property in Cabo San Lucas!
          </p>
          
          <p style="font-size: 16px;">
            Best regards,<br>
            <strong style="color: #1e40af;">${agentName ? agentName + ' & ' : ''}The Baja International Realty Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">Your Trusted Luxury Real Estate Partner</p>
          <p style="margin: 5px 0; color: #9ca3af; font-size: 12px;">Blvd. Marina, Cabo San Lucas, BCS, Mexico</p>
        </div>
      </body>
      </html>
    `;

    const clientMailOptions = {
      from: process.env.OFFICE_EMAIL || 'cabosbir@gmail.com',
      to: sellerEmail,
      subject: `Thank You for Your Property Evaluation Request - ${agentName || 'Baja International Realty'}`,
      html: clientEmailHtml
    };

    await transporter.sendMail(clientMailOptions);

    console.log('✅ Seller evaluation emails sent successfully');

    return res.status(200).json({
      success: true,
      message: agentName
        ? `Thank you! ${agentName} will contact you within 24 hours with your property evaluation.`
        : 'Thank you! We\'ll contact you within 24 hours with your property evaluation.'
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to send evaluation request. Please try calling us directly at +52 624 143 5555',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}