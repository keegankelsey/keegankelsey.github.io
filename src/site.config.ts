// Site-wide settings. Edit these to change your name, tagline, and social links.
export const site = {
  name: 'Keegan Kelsey',
  title: 'Keegan Kelsey',
  tagline: 'Building and learning',
  // Title of the blog (the nav link still says "Blog").
  blogTitle: 'At the Still Point of the Turning World',
  location: 'San Francisco, CA',
  description:
    'Keegan Kelsey, Ph.D. — Scientist, engineer, and creative with operator and hands-on expertise in clinical and multi-omic data. Background, projects, and writing.',
  email: 'keegankelsey@gmail.com',
  // Google Analytics 4 measurement ID. Loaded on every page in production builds only.
  googleAnalyticsId: 'G-QKNQPHN2GF',
  links: {
    github: 'https://github.com/keegankelsey',
    linkedin: 'https://www.linkedin.com/in/keegankelsey',
    twitter: 'https://x.com/keegankelsey',
  },
};

/** Prefix an internal path with the deploy base (empty when served from the root). */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
