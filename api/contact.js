import nodemailer from 'nodemailer';
// Lightweight safeguards for the legacy contact and seller forms.
// Limits are per warm server instance; this is not a global bot firewall.
const formAttempts=new Map();
export function checkFormSubmission(req,kind,now=Date.now()){
  const fail=(status,error)=>({status,error});
  let origin;
  try{origin=new URL(req.headers.origin);}catch{return fail(403,'Please submit this form from our website.');}
  if(origin.protocol!=='https:'||origin.host!==req.headers.host)return fail(403,'Please submit this form from our website.');
  if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return fail(415,'Please submit this form from our website.');
  const body=req.body;
  if(!body||typeof body!=='object'||Array.isArray(body))return fail(400,'Please check the form and try again.');
  if(body.website!==undefined&&(typeof body.website!=='string'||body.website.trim()))return fail(400,'We could not verify this submission. Please contact our office directly.');
  const name=kind==='seller'?body.sellerName:body.name,email=kind==='seller'?body.sellerEmail:body.email;
  if(typeof name!=='string'||name.trim().length<2||name.length>160||/[<>\r\n]/.test(name))return fail(400,'Please enter your name.');
  // Reject long random mixed-case tokens, not ordinary names or non-Latin names.
  const randomToken=name.split(/\s+/).some(word=>/^[A-Za-z]{16,}$/.test(word)&&(word.match(/(?=[a-z][A-Z]|[A-Z][a-z])/g)||[]).length>=8);
  if(randomToken)return fail(400,'Please check your name and try again, or contact our office directly.');
  if(typeof email!=='string'||email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||/[<>\r\n,;]/.test(email))return fail(400,'Please enter a valid email address.');
  const message=kind==='seller'?body.propertyAddress:body.message;
  if(typeof message!=='string'||message.trim().length<3||message.length>6000)return fail(400,kind==='seller'?'Please enter the property address.':'Please enter your message (up to 6,000 characters).');
  const phone=kind==='seller'?body.sellerPhone:body.phone;
  if(phone!==undefined&&(typeof phone!=='string'||phone.length>60||/[<>\r\n]/.test(phone)))return fail(400,'Please check your phone number.');
  if(kind==='seller'&&(!phone||!phone.trim()))return fail(400,'Please enter your phone number.');
  if(body.agentEmail){
    const allowed=new Set(['robertvanpatten2@gmail.com','erika80@gmail.com','alfonso@bircabo.com','cozbi@bajainternationalrealty.com','hector@bircabo.com','charles@bircabo.com','mtortricardi@gmail.com','david@bircabo.com','susu@bircabo.com','edgar@bircabo.com','erikagraciano@bircabo.com','don@bircabo.com','fernando@bircabo.com','erika@bircabo.com','bonnie@bircabo.com','erikag@bircabo.com','cabocharlie79@gmail.com','info@bircabo.com']);
    if(typeof body.agentEmail!=='string'||!allowed.has(body.agentEmail.toLowerCase()))return fail(400,'Please select an agent from the website.');
  }
  // Prevent submitted markup being embedded in office/client notification emails.
  for(const [key,value] of Object.entries(body)){
    if(key==='images')continue;
    if(typeof value==='string'&&(value.length>6000||/<\/?[a-z][^>]*>/i.test(value)))return fail(400,'Please use plain text in the form.');
  }
  const address=String(req.headers['x-forwarded-for']||'').split(',')[0].trim();
  if(address){
    for(const [key,value] of formAttempts)if(value.until<=now)formAttempts.delete(key);
    if(formAttempts.size>10000)formAttempts.clear();
    const entry=formAttempts.get(address)||{count:0,until:now+600000};
    if(entry.count>=8)return fail(429,'Too many requests. Please wait a few minutes or contact our office directly.');
    entry.count++;formAttempts.set(address,entry);
  }
  return null;
}


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

  const rejected=checkFormSubmission(req,'contact');
  if(rejected){if(rejected.status===429)res.setHeader('Retry-After','600');return res.status(rejected.status).json({success:false,error:rejected.error});}

  try {
    const { name, email, phone, inquiryType, propertyType, preferredAgent, agentEmail, message } = req.body;

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

    // Determine email recipients
    const officeEmail = process.env.OFFICE_EMAIL || 'cabosbir@gmail.com';
    let emailRecipients = [officeEmail];
    
    // Add agent email if an agent was selected
    if (agentEmail && agentEmail !== officeEmail) {
      emailRecipients.push(agentEmail);
    }

    // Prepare email HTML for business
    const businessEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 28px;">🏡 New Contact Form Inquiry</h2>
          <p style="color: #bfdbfe; margin: 10px 0 0 0;">BAJA INTERNATIONAL REALTY</p>
          ${preferredAgent ? `<p style="color: #fbbf24; margin: 10px 0 0 0; font-weight: bold;">⭐ Requested Agent: ${preferredAgent}</p>` : ''}
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
            ${preferredAgent ? `<p style="margin: 8px 0;"><strong>Preferred Agent:</strong> <span style="color: #ea580c; font-weight: bold;">${preferredAgent}</span></p>` : '<p style="margin: 8px 0;"><strong>Preferred Agent:</strong> No preference</p>'}
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #1f2937;">📝 Client Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #374151;">${message}</p>
          </div>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
            <p style="margin: 0; font-weight: bold; color: #991b1b;">⚠️ Action Required:</p>
            <p style="margin: 10px 0 0 0; color: #7f1d1d;">${preferredAgent ? `${preferredAgent}, please` : 'Please'} contact this client within 24 hours to discuss their real estate needs.</p>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #fecaca;">
              <p style="margin: 5px 0;">📞 <a href="tel:${phone}" style="color: #dc2626;">${phone || 'No phone provided'}</a></p>
              <p style="margin: 5px 0;">📧 <a href="mailto:${email}" style="color: #dc2626;">Reply to client</a></p>
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

    // Send email to business (and agent if selected)
    const mailOptions = {
      from: process.env.OFFICE_EMAIL || 'cabosbir@gmail.com',
      to: emailRecipients.join(', '),
      subject: `🏡 New ${inquiryName} Inquiry${preferredAgent ? ` for ${preferredAgent}` : ''} - ${name}`,
      html: businessEmailHtml,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);

    // Send confirmation email to client
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Inquiry!</h2>
          <p style="color: #bfdbfe; margin: 10px 0 0 0;">BAJA INTERNATIONAL REALTY</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${name},</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            We've received your inquiry and appreciate your interest in working with us for your real estate needs in Cabo San Lucas. ${preferredAgent ? `<strong>${preferredAgent}</strong> and our team of luxury property specialists are` : 'Our team of luxury property specialists is'} reviewing your request.
          </p>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">What Happens Next?</h3>
            <p style="margin: 10px 0; color: #374151;">✅ We'll review your request carefully</p>
            <p style="margin: 10px 0; color: #374151;">📞 ${preferredAgent ? `${preferredAgent} will` : 'Our team will'} contact you within 24 hours</p>
            <p style="margin: 10px 0; color: #374151;">🏡 We'll discuss your property needs and answer any questions</p>
            <p style="margin: 10px 0; color: #374151;">📅 Schedule a consultation or property viewing at your convenience</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">Need Immediate Assistance?</h3>
            <p style="margin: 8px 0; color: #374151;">📱 <strong>Call/Text:</strong> <a href="tel:+526241435555" style="color: #2563eb;">+52 624 143 5555</a></p>
            <p style="margin: 8px 0; color: #374151;">📧 <strong>Email:</strong> <a href="mailto:cabosbir@gmail.com" style="color: #2563eb;">cabosbir@gmail.com</a></p>
            ${agentEmail ? `<p style="margin: 8px 0; color: #374151;">👤 <strong>${preferredAgent}:</strong> <a href="mailto:${agentEmail}" style="color: #2563eb;">${agentEmail}</a></p>` : ''}
          </div>
          
          <p style="font-size: 16px; color: #374151; margin-top: 30px;">
            We look forward to helping you find your perfect property in Cabo San Lucas!
          </p>
          
          <p style="font-size: 16px; color: #374151;">
            Best regards,<br>
            <strong style="color: #1e40af;">${preferredAgent ? preferredAgent + ' & ' : ''}The Baja International Realty Team</strong>
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
      to: email,
      subject: `We Received Your Inquiry${preferredAgent ? ` - ${preferredAgent}` : ''} - Baja International Realty`,
      html: clientEmailHtml
    };

    await transporter.sendMail(clientMailOptions);

    console.log('✅ Contact form emails sent successfully');
    
    return res.status(200).json({ 
      success: true, 
      message: preferredAgent 
        ? `Thank you! Your inquiry has been sent to ${preferredAgent}. We'll contact you within 24 hours.`
        : 'Thank you! Your inquiry has been sent successfully. We\'ll contact you within 24 hours.'
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send inquiry. Please try calling us directly at +52 624 143 5555',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
