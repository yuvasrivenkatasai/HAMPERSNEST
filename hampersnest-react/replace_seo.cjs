const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/ProductDetail.jsx',
  'src/pages/Gallery.jsx',
  'src/pages/Home.jsx',
  'src/pages/FeaturedGifts.jsx',
  'src/pages/Contact.jsx',
  'src/pages/Collections.jsx',
  'src/pages/AboutUs.jsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import if not exists
  if (!content.includes('import SeoKeywordsSection')) {
    content = content.replace(/(import .*;\n)+/, match => match + "import SeoKeywordsSection from '../components/SeoKeywordsSection';\n");
  }

  // Replace SEO section
  const regex = /\{\/\*\s*SEO Related Keywords Grid Section\s*\*\/\}\s*<div className="container"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;
  
  content = content.replace(regex, '<SeoKeywordsSection />');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
