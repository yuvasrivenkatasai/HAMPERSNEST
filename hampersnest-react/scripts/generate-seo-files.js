import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { products } from '../src/data/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define output directory (dist)
const outputDir = path.resolve(__dirname, '../dist');

// Define canonical domain
const DOMAIN = 'https://hampersnest.com';

// Define static routes
const staticRoutes = [
  '/',
  '/collections',
  '/featured',
  '/gallery',
  '/about',
  '/contact'
];

// Generate sitemap XML content
function generateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // 1. Static Routes
  staticRoutes.forEach(route => {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}${route}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });
  
  // 2. Dynamic Product Routes
  products.forEach(product => {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/product/${product.id}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });
  
  xml += `</urlset>\n`;
  return xml;
}

// Generate robots.txt content
function generateRobotsTxt() {
  let robots = `User-agent: *\n`;
  robots += `Allow: /\n`;
  robots += `\n`;
  robots += `Sitemap: ${DOMAIN}/sitemap.xml\n`;
  return robots;
}

function run() {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    console.log(`Creating output directory: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Write sitemap.xml
  const sitemapPath = path.join(outputDir, 'sitemap.xml');
  const sitemapXml = generateSitemap();
  fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
  console.log(`Successfully generated: sitemap.xml -> ${sitemapPath}`);

  // 2. Write robots.txt
  const robotsPath = path.join(outputDir, 'robots.txt');
  const robotsTxt = generateRobotsTxt();
  fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
  console.log(`Successfully generated: robots.txt -> ${robotsPath}`);
}

run();
