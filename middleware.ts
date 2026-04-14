import { geolocation } from '@vercel/functions';

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';
  
  // Skip middleware for static assets, public folder, etc.
  if (
    url.pathname.includes('.') || 
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_vercel') ||
    url.pathname === '/restricted' // Jangan redirect halaman restricted
  ) {
    return new Response(null, {
      headers: { 'x-middleware-next': '1' }
    });
  }

  const geo = geolocation(request);
  const country = geo.country || 'US';
  
  // Daftar prefix yang didukung dan mapping negara yang diizinkan
  const regionMapping: Record<string, string[]> = {
    'id': ['ID'],
    'sg': ['SG'],
    'us': ['US', 'CA'],
    'jp': ['JP'],
    'eu': ['GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE'],
    'ar': ['SA', 'AE', 'EG', 'JO', 'LB', 'QA', 'KW', 'OM']
  };

  const supportedPrefixes = Object.keys(regionMapping);
  
  // Cek apakah hostname saat ini sudah punya prefix regional
  const activePrefix = supportedPrefixes.find(p => hostname.startsWith(`${p}.`));

  // 1. LOGIKA REGIONAL LOCK (GEO-BLOCKING)
  // Jika user sudah berada di sebuah subdomain, pastikan lokasinya sesuai
  if (activePrefix) {
    const allowedCountries = regionMapping[activePrefix];
    if (allowedCountries && !allowedCountries.includes(country)) {
      // Jika lokasi TIDAK diizinkan untuk subdomain ini, lempar ke halaman restricted
      // Kita tetap gunakan hostname saat ini agar user tau dia di-block di region mana
      return Response.redirect(`https://${hostname}/restricted`);
    }
  }

  // 2. LOGIKA SMART REDIRECT (AUTO-ROUTING)
  // Jika user berada di domain utama, arahkan ke subdomain yang sesuai lokasinya
  if (!activePrefix) {
    let targetPrefix = '';
    
    // Cari prefix yang cocok dengan negara user
    for (const [p, countries] of Object.entries(regionMapping)) {
      if (countries.includes(country)) {
        targetPrefix = p;
        break;
      }
    }

    if (targetPrefix) {
      return Response.redirect(`https://${targetPrefix}.${hostname}${url.pathname}${url.search}`);
    }
  }

  // Jika tidak diredirect, lanjut ke aplikasi
  const response = new Response(null, {
    headers: { 'x-middleware-next': '1' }
  });

  if (geo.country) {
    const geoData = JSON.stringify({
      country: geo.country,
      city: geo.city || 'Unknown',
      region: geo.region || 'Unknown'
    });
    
    response.headers.append('Set-Cookie', `user-region-data=${encodeURIComponent(geoData)}; Path=/; Max-Age=604800; SameSite=Lax`);
  }

  return response;
}
