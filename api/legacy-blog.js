// Retired WordPress URLs must return a real 404, not the SPA's 200 shell.
const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,follow"><title>Page no longer available | Baja International Realty</title><style>body{margin:0;background:#f6f7f5;color:#193653;font:18px/1.65 system-ui,sans-serif}main{max-width:720px;margin:10vh auto;padding:32px}header{font-weight:700;letter-spacing:.04em}h1{font-size:clamp(30px,6vw,44px);line-height:1.2}nav{display:flex;flex-wrap:wrap;gap:14px;margin-top:28px}a{color:#155b60}nav a{padding:12px 18px;border:1px solid #155b60;border-radius:6px;text-decoration:none}a:focus-visible{outline:3px solid #bd9449;outline-offset:4px}</style></head><body><main><header><a href="/">Baja International Realty</a></header><h1>This page is no longer available.</h1><p>You followed a link to our former real estate blog. For current listings and information about buying or selling in Los Cabos, please use the links below.</p><nav aria-label="Continue exploring"><a href="/property-search.html">Search current MLS listings</a><a href="https://www.caborealestatepros.com/cabo-real-estate-buyers-guide.html">Buying guide</a><a href="https://www.caborealestatepros.com/selling-los-cabos-mexico-real-estate.html">Selling guide</a><a href="/">BIR homepage</a></nav></main></body></html>`;

export default function handler(req, res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex, follow');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.end(req.method === 'HEAD' ? undefined : page);
}
