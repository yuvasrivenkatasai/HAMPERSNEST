const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        replaceInDir(fullPath);
      }
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      if (content.includes('917989202094')) {
        content = content.replace(/917989202094/g, '917989202194');
        changed = true;
      }
      if (content.includes('+91 7989202094') || content.includes('+91 79892 02094')) {
        content = content.replace(/\+91 79892(\s*)02094/g, '+91 79892$102194');
        changed = true;
      }
      
      if (content.includes("const whatsappBaseNumber = '917989202194';")) {
        content = content.replace(/const whatsappBaseNumber = '917989202194';/g, 'const WHATSAPP_NUMBER = "917989202194";');
        content = content.replace(/whatsappBaseNumber/g, 'WHATSAPP_NUMBER');
        changed = true;
      }

      if (content.includes("const WA_NUMBER = '917989202194';")) {
        content = content.replace(/const WA_NUMBER = '917989202194';/g, 'const WHATSAPP_NUMBER = "917989202194";');
        content = content.replace(/WA_NUMBER/g, 'WHATSAPP_NUMBER');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInDir(path.resolve(__dirname));
