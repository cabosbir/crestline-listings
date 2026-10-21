// Retired October 20, 2026. Keep this tombstone so old clients and bots cannot send mail.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    success: false,
    error: 'This registration form has been retired. Please send an inquiry from our contact page.',
    contactUrl: '/contact'
  });
}
