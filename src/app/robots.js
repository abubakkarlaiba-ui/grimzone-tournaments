export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/owner/', '/api/'],
    },
    sitemap: 'https://grimzone.vercel.app/sitemap.xml',
  };
}
