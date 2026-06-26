import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { products, MASTER_CATEGORIES } from '../src/data/products.js';

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
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
  
  // 1. Static Routes
  staticRoutes.forEach(route => {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}${route}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>\n`;
    xml += `    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });
  
  // 2. Collection Category Routes
  if (MASTER_CATEGORIES) {
    MASTER_CATEGORIES.forEach(category => {
      if (category.id !== 'All') {
        xml += `  <url>\n`;
        xml += `    <loc>${DOMAIN}/collections?category=${encodeURIComponent(category.id)}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }
    });
  }

  // 3. Dynamic Product Routes
  products.forEach(product => {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/product/${product.id}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    
    // Image SEO
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        const imgUrl = img.startsWith('http') ? img : `${DOMAIN}${img}`;
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${imgUrl}</image:loc>\n`;
        xml += `      <image:title><![CDATA[${product.name}]]></image:title>\n`;
        xml += `    </image:image>\n`;
      });
    } else if (product.image) {
      const imgUrl = product.image.startsWith('http') ? product.image : `${DOMAIN}${product.image}`;
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${imgUrl}</image:loc>\n`;
      xml += `      <image:title><![CDATA[${product.name}]]></image:title>\n`;
      xml += `    </image:image>\n`;
    }
    
    xml += `  </url>\n`;
  });
  
  xml += `</urlset>\n`;
  return xml;
}

// Generate robots.txt content
function generateRobotsTxt() {
  let robots = `User-agent: *\n`;
  robots += `Allow: /\n`;
  robots += `Disallow: /admin\n`;
  robots += `Disallow: /login\n`;
  robots += `Disallow: /dashboard\n`;
  robots += `Disallow: /test\n`;
  robots += `Disallow: /*?*\n`; // Disallow complex query params for indexing, except what's handled by canonicals
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
