const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src/GlobalStyles.css');

const cssToAdd = `
/* --- Product Detail Mobile Spacing --- */
@media (max-width: 767px) {
  .secondary-info-card .modal-customize-btn {
    margin-top: 16px !important;
    margin-bottom: 24px !important;
  }
}
`;

fs.appendFileSync(cssPath, cssToAdd);
console.log('Appended mobile spacing CSS.');
