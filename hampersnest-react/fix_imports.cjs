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
    const importStatement = "import SeoKeywordsSection from '../components/SeoKeywordsSection';\n";
    content = content.replace(/import React.*?['"];?\n/, match => match + importStatement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
}
