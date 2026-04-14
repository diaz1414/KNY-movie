import { geolocation } from '@vercel/functions';

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';
  
  // Skip middleware for static assets, public folder, etc.
  if (
    url.pathname.includes('.') || 
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_vercel')
  ) {
    return new Response(null, {
      headers: { 'x-middleware-next': '1' }
    });
  }

  const geo = geolocation(request);
  
  // Tentukan subdomain target berdasarkan negara
  let targetPrefix = '';
  if (geo.country === 'SG') targetPrefix = 'sg';
  if (geo.country === 'ID') targetPrefix = 'id';

  // Logika Smart Redirect:
  // Cek apakah hostname saat ini sudah punya prefix (sg. atau id.)
  const hasPrefix = hostname.startsWith('sg.') || hostname.startsWith('id.');

  // JANGAN REDIRECT jika:
  // 1. User sudah berada di subdomain (supaya orang Indo bisa akses sg secara paksa)
  // 2. Tidak ada target prefix untuk negara tersebut
  if (!hasPrefix && targetPrefix) {
    const newHostname = `${targetPrefix}.${hostname}`;
    // Pastikan kita tidak melakukan redirect loop jika hostname sudah benar
    // Redirect hanya jika kita berada di domain utama
    return Response.redirect(`https://${newHostname}${url.pathname}${url.search}`);
  }

  // Jika tidak diredirect, lanjut ke aplikasi dengan menyertakan cookie geo data
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
