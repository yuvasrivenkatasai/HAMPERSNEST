export const normalizeFolderName = (name) => {
  if (!name) return '';
  return String(name)
    .replace(/[/\\?%*:|"<>]/g, '-') // Replace invalid folder characters
    .trim()
    .replace(/\s+/g, ' '); // Collapse duplicate spaces
};

export const generateProductMediaPath = (categoryName, subCategoryName, productName) => {
  const cat = normalizeFolderName(categoryName);
  const subcat = normalizeFolderName(subCategoryName);
  const prod = normalizeFolderName(productName) || 'Unnamed_Product';

  const parts = [];
  if (cat) parts.push(cat);
  if (subcat) parts.push(subcat);
  parts.push(prod);

  return parts.join('/');
};
