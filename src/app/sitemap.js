const BASE_URL = 'https://grimzone.vercel.app';

const staticPages = [
  { url: '', priority: 1, changeFrequency: 'weekly' },
  { url: '/tournaments', priority: 0.9, changeFrequency: 'daily' },
  { url: '/rules', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { url: '/world-chat', priority: 0.5, changeFrequency: 'always' },
  { url: '/login', priority: 0.4, changeFrequency: 'monthly' },
  { url: '/register', priority: 0.6, changeFrequency: 'monthly' },
];

export default function sitemap() {
  return staticPages.map(page => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
