const fs = require('fs');
const path = require('path');
const pagesDir = path.join(__dirname, '../hampersnest-admin/src/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

for (let file of files) {
  let content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');

  // Fix the empty $1 issue by replacing `.products` with the correct variable name based on the file context.
  if (file === 'Products.jsx') {
    content = content.replace(/setProducts\(\.products \|\| \.data \|\| \.rows \|\| \(Array\.isArray\(\) \?  : \[\]\)\);/g, 'setProducts(productsData.products || productsData.data || productsData.rows || (Array.isArray(productsData) ? productsData : []));');
    content = content.replace(/setCategories\(\.categories \|\| \.data \|\| \.rows \|\| \(Array\.isArray\(\) \?  : \[\]\)\);/g, 'setCategories(categoriesData.categories || categoriesData.data || categoriesData.rows || (Array.isArray(categoriesData) ? categoriesData : []));');
  } else if (file === 'Orders.jsx') {
    content = content.replace(/setOrders\(\.orders \|\| \.data \|\| \.rows \|\| \(Array\.isArray\(\) \?  : \[\]\)\);/g, 'setOrders(ordersData.orders || ordersData.data || ordersData.rows || (Array.isArray(ordersData) ? ordersData : []));');
  } else if (file === 'Gallery.jsx') {
    content = content.replace(/setGalleryItems\(\.items \|\| \.galleryItems \|\| \.data \|\| \.rows \|\| \(Array\.isArray\(\) \?  : \[\]\)\);/g, 'setGalleryItems(galleryData.items || galleryData.galleryItems || galleryData.data || galleryData.rows || (Array.isArray(galleryData) ? galleryData : []));');
    content = content.replace(/setCategories\(\.categories \|\| \.data \|\| \.rows \|\| \(Array\.isArray\(\) \?  : \[\]\)\);/g, 'setCategories(categoriesData.categories || categoriesData.data || categoriesData.rows || (Array.isArray(categoriesData) ? categoriesData : []));');
  } else if (file === 'Inquiries.jsx') {
    content = content.replace(/setInquiries\(\.inquiries \|\| \.data \|\| \.rows \|\| \(Array\.isArray\(\) \?  : \[\]\)\);/g, 'setInquiries(data.inquiries || data.data || data.rows || (Array.isArray(data) ? data : []));');
  } else if (file === 'Inventory.jsx') {
    content = content.replace(/setProducts\(\.products \|\| \.data \|\| \.rows \|\| \(Array\.isArray\(\) \?  : \[\]\)\);/g, 'setProducts(data.products || data.data || data.rows || (Array.isArray(data) ? data : []));');
    
    // Fix Inventory redeclaration
    content = content.replace(/const safeProducts = Array\.isArray\(products\) \? products : \[\];\n  const outOfStockCount = safeProducts\.filter/g, 'const safeProductsOutOfStock = Array.isArray(products) ? products : [];\n  const outOfStockCount = safeProductsOutOfStock.filter');
  } else if (file === 'Categories.jsx') {
    content = content.replace(/setCategories\(\.categories \|\| \.data \|\| \.rows \|\| \(Array\.isArray\(\) \?  : \[\]\)\);/g, 'setCategories(data.categories || data.data || data.rows || (Array.isArray(data) ? data : []));');
  }

  fs.writeFileSync(path.join(pagesDir, file), content);
}
