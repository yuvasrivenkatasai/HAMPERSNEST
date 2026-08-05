import { jsPDF } from 'jspdf';

// Helper to clean text for jsPDF to prevent encoding issues
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
};

const stripArticle = (str) => str.replace(/^(the|a|an)\s+/i, '').trim();

// Image loader with fast compression and downscaling
const loadImageAsBase64 = async (url, targetAspectRatio) => {
  try {
    let targetUrl = url;
    if (targetUrl.startsWith('/')) {
      targetUrl = window.location.origin + targetUrl;
    } else if (targetUrl.startsWith('http')) {
      try {
        const urlObj = new URL(targetUrl);
        urlObj.searchParams.set('cb', Date.now().toString());
        targetUrl = urlObj.toString();
      } catch (e) {
        targetUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}cb=${Date.now()}`;
      }
    }

    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      const urlCreator = window.URL || window.webkitURL;
      const imageUrl = urlCreator.createObjectURL(blob);
      
      img.onload = () => {
        if (!targetAspectRatio) {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
            urlCreator.revokeObjectURL(imageUrl);
          };
          reader.readAsDataURL(blob);
          return;
        }

        const isLandscape = img.width > img.height;
        const imgRatio = img.width / img.height;
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1000 / targetAspectRatio;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let dx = 0, dy = 0, dWidth = canvas.width, dHeight = canvas.height;
        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

        if (isLandscape) {
          // COVER logic
          if (imgRatio > targetAspectRatio) {
            // Image is wider than target aspect ratio - crop horizontally
            sWidth = img.height * targetAspectRatio;
            sx = (img.width - sWidth) / 2;
          } else {
            // Image is taller than target aspect ratio - crop vertically
            sHeight = img.width / targetAspectRatio;
            sy = (img.height - sHeight) / 2;
          }
        } else {
          // CONTAIN logic (Portrait & Square)
          if (imgRatio > targetAspectRatio) {
            dHeight = canvas.width / imgRatio;
            dy = (canvas.height - dHeight) / 2;
          } else {
            dWidth = canvas.height * imgRatio;
            dx = (canvas.width - dWidth) / 2;
          }
        }
        
        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        resolve(canvas.toDataURL('image/jpeg', 0.82)); // 0.82 Compression
        urlCreator.revokeObjectURL(imageUrl);
      };
      
      img.onerror = () => {
        urlCreator.revokeObjectURL(imageUrl);
        reject(new Error('Image load error'));
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

const getPriceTier = (price) => {
  if (price <= 500) return { label: '₹0 – ₹500', min: 0 };
  if (price <= 1000) return { label: '₹500 – ₹1000', min: 500 };
  if (price <= 2500) return { label: '₹1000 – ₹2500', min: 1000 };
  if (price <= 5000) return { label: '₹2500 – ₹5000', min: 2500 };
  return { label: '₹5000+', min: 5000 };
};

export const generateCatalogPdf = async (products, mode = 'download', onProgress, options = {}) => {
  const {
    showPrice = true,
    showDescription = true,
    showSpecs = false,
    sortBy = 'NAME_ASC',
    exportMode = 'ALL',
    categories = [],
    pdfDeliveryInfo = ''
  } = options;

  let sections = [];

  // Consistent sorting logic inside categories/tiers
  const sortProductsInGroup = (prods) => {
    return prods; // Products are already strictly sorted by the modal before generation
  };

  // Section Builders
  if (sortBy === 'CATEGORY') {
    const catMap = {};
    products.forEach(p => {
      // Prevent UUIDs from showing up
      const isUUID = (str) => {
        if (!str) return false;
        return /^[0-9a-fA-F]{24}$/.test(str) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      };
      
      let c = p.categoryName || p.category;
      if (isUUID(c) || !c || c === 'undefined') c = 'Uncategorized';
      
      let sc = p.subcategoryName || p.subCategory;
      if (isUUID(sc) || !sc || sc === 'undefined' || sc === 'null') sc = '';
      
      if (!catMap[c]) catMap[c] = {};
      if (!catMap[c][sc]) catMap[c][sc] = [];
      catMap[c][sc].push(p);
    });

    const sortedCats = Object.keys(catMap).sort();
    sortedCats.forEach(c => {
      const subcats = catMap[c];
      const sortedSubcats = Object.keys(subcats).sort();
      let totalProducts = 0;
      sortedSubcats.forEach(sc => { totalProducts += subcats[sc].length; });
      
      const catObj = categories.find(cat => cat.name === c || cat.id === c);
      const desc = catObj?.description || 'Premium Gifting Collection';

      sections.push({
        type: 'CATEGORY_DIVIDER',
        title: c.toUpperCase(),
        subtitle: `${totalProducts} Products`,
        description: desc
      });

      sortedSubcats.forEach(sc => {
        // If subcategory is empty string, don't use "General", use category name
        let scLabel = sc;
        if (!sc || sc === 'General') scLabel = c;
        const sortedProds = sortProductsInGroup(subcats[sc]);
        
        sections.push({
          type: 'SECTION_HEADER',
          title: scLabel,
          subtitle: `${sortedProds.length} Products`
        });

        sections.push({
          type: 'PRODUCTS',
          products: sortedProds
        });
      });
    });

  } else if (sortBy.startsWith('PRICE')) {
    const priceAsc = sortBy === 'PRICE_ASC';
    
    const tiers = {};
    products.forEach(p => {
      const tier = getPriceTier(p.price);
      if (!tiers[tier.label]) tiers[tier.label] = { label: tier.label, min: tier.min, products: [] };
      tiers[tier.label].products.push(p);
    });

    const tierKeys = Object.values(tiers).sort((a, b) => priceAsc ? (a.min - b.min) : (b.min - a.min));
    
    tierKeys.forEach(t => {
      // Sub-sort within tier
      const sortedProds = sortProductsInGroup(t.products);

      sections.push({
        type: 'SECTION_HEADER',
        title: t.label,
        subtitle: `${sortedProds.length} Products`
      });
      sections.push({
        type: 'PRODUCTS',
        products: sortedProds
      });
    });

  } else {
    // NAME_ASC, NAME_DESC, RECENT
    let title = 'Products (A–Z)';
    if (sortBy === 'NAME_DESC') title = 'Products (Z–A)';
    else if (sortBy === 'RECENT') title = 'Recently Added';

    sections.push({
      type: 'SECTION_HEADER',
      title: title,
      subtitle: `${products.length} Products`
    });

    sections.push({
      type: 'PRODUCTS',
      products: products
    });
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  const purple = '#4A1D5F';
  const gold = '#C8A96B';
  const gray = '#4A4A4A';
  const lightBg = '#FAF6FC';

  let tocEntries = [];

  // --- GRID ENGINE MATH ---
  const headerHeight = 25;
  const footerHeight = 15; // Adjusted for footer
  const marginTop = 15;
  const marginBottom = 15;
  
  const printableHeight = pageHeight - headerHeight - footerHeight - marginTop - marginBottom;
  const marginX = 15;
  const colGap = 12;
  const rowGap = 20; // Increased spacing for luxury look
  
  const itemsPerRow = 2;
  const cardWidth = (pageWidth - (marginX * 2) - colGap) / 2;
  
  // To ensure we can fit a section header (18mm) and exactly 2 rows of cards on one page:
  // We reserve 18mm from the printable area before dividing by 2.
  const sectionHeaderSpace = 18;
  const cardHeight = (printableHeight - rowGap - sectionHeaderSpace) / 2;
  
  const usableYStart = headerHeight + marginTop;
  const maxSafeY = pageHeight - footerHeight - marginBottom;

  let currentY = 0;
  
  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  doc.setFillColor(lightBg);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setTextColor(purple);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.text('HAMPERS NEST', pageWidth / 2, pageHeight / 3 - 20, { align: 'center' });
  
  doc.setTextColor(gold);
  doc.setFontSize(18);
  doc.text('PREMIUM GIFTS & RETURN GIFTS', pageWidth / 2, (pageHeight / 3) + 5, { align: 'center' });
  
  // Delivery Information
  doc.setTextColor(purple);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Delivery Information', pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });
  
  doc.setTextColor(gray);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const deliveryLines = doc.splitTextToSize(pdfDeliveryInfo || '', pageWidth - 40);
  doc.text(deliveryLines, pageWidth / 2, pageHeight / 2 + 30, { align: 'center' });

  // Force Start on Page 2 for products
  doc.addPage();
  currentY = usableYStart;

  // ==========================================
  // PAGE HELPERS
  // ==========================================
  const drawPageHeader = () => {
    doc.setFillColor(purple);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('HAMPERS NEST', 15, 17);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Premium Gifting Collection', pageWidth - 15, 17, { align: 'right' });
  };

  const drawPageFooter = (pageNum) => {
    const compSettings = options.settings || {};
    const { companyName, website, phone, email, address } = compSettings;
    
    // Draw Footer Background
    doc.setFillColor(purple);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    
    let cleanWebsite = website ? website.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'www.hampersnest.in';
    let cleanPhone = phone || '+91 79892 02194';
    let cleanLocation = address || 'Hyderabad, India';
    
    let leftText = `${cleanWebsite} | ${cleanPhone} | ${cleanLocation}`;
    
    if (leftText) {
      doc.text(leftText, 15, pageHeight - 6);
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${pageNum}`, pageWidth - 15, pageHeight - 6, { align: 'right' });
  };

  let globalProductIndex = 0;
  
  const triggerPageBreak = () => {
    doc.addPage();
    currentY = usableYStart;
  };

  // ==========================================
  // RENDERING LOOP
  // ==========================================
  for (const section of sections) {
    
    if (section.type === 'CATEGORY_DIVIDER') {
      // Category divider always forces a fresh page
      if (currentY !== usableYStart) {
        triggerPageBreak();
      }
      
      tocEntries.push({ title: section.title, page: doc.internal.getNumberOfPages() });
      
      doc.setFillColor(lightBg);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      doc.setTextColor(purple);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.text(section.title, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
      
      doc.setDrawColor(gold);
      doc.setLineWidth(1);
      doc.line(pageWidth/2 - 40, pageHeight/2 - 10, pageWidth/2 + 40, pageHeight/2 - 10);
      
      doc.setTextColor(gray);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.text(section.subtitle, pageWidth / 2, pageHeight / 2 + 5, { align: 'center' });
      doc.text(section.description, pageWidth / 2, pageHeight / 2 + 15, { align: 'center' });

      // After divider, force products to a new page
      triggerPageBreak();
    } 
    else if (section.type === 'SECTION_HEADER') {
      
      // Check if we have room for Header (18mm) + 1 Card Row
      if (currentY + sectionHeaderSpace + cardHeight > maxSafeY) {
         triggerPageBreak();
      }
      
      tocEntries.push({ title: section.title, page: doc.internal.getNumberOfPages() });

      doc.setTextColor(purple);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(section.title, marginX, currentY + 6);
      
      doc.setTextColor(gold);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(section.subtitle, marginX, currentY + 12);
      
      doc.setDrawColor(220, 220, 220);
      doc.line(marginX, currentY + 14, pageWidth - marginX, currentY + 14);
      
      currentY += sectionHeaderSpace; // Consume header space
    } 
    else if (section.type === 'PRODUCTS') {
      
      let cardsOnCurrentPage = 0;

      for (let i = 0; i < section.products.length; i++) {
        
        // If we need a new row, verify space
        if (cardsOnCurrentPage % itemsPerRow === 0 && cardsOnCurrentPage > 0) {
          if (currentY + cardHeight + rowGap > maxSafeY) {
            triggerPageBreak();
            cardsOnCurrentPage = 0; // reset slots for the new page
          } else {
            currentY += cardHeight + rowGap;
          }
        } else if (cardsOnCurrentPage === 0 && i > 0) {
           // We started a new page after a page break triggered in the previous loop iteration
           // Note: if i=0, currentY is already set correctly by SECTION_HEADER or triggerPageBreak
        }
        
        // Check initial space if this is the very first product of the section and the header just drew
        if (i === 0 && currentY + cardHeight > maxSafeY) {
           triggerPageBreak();
        }

        const p = section.products[i];
        if (onProgress) onProgress(Math.round(((globalProductIndex + 1) / products.length) * 90));

        const col = cardsOnCurrentPage % itemsPerRow;
        const x = marginX + (col * (cardWidth + colGap));
        const y = currentY;
        
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');
        
        // Proportional Internals (Image 68%)
        const imgH = cardHeight * 0.68;
        const destW = cardWidth - 4;
        const destH = imgH;
        
        // Ensure primary image only
        const primaryImgUrl = (p.images && p.images.length > 0) ? p.images[0] : p.image;
        
        if (primaryImgUrl) {
          const base64Img = await loadImageAsBase64(primaryImgUrl, destW / destH);
          if (base64Img) {
            try {
              doc.addImage(base64Img, 'JPEG', x + 2, y + 2, destW, destH, undefined, 'FAST');
            } catch (e) {
              doc.setFillColor(245, 245, 245);
              doc.rect(x + 2, y + 2, destW, destH, 'F');
            }
          } else {
            doc.setFillColor(245, 245, 245);
            doc.rect(x + 2, y + 2, destW, destH, 'F');
          }
        } else {
          doc.setFillColor(245, 245, 245);
          doc.rect(x + 2, y + 2, destW, destH, 'F');
        }
        
        const textX = x + (cardWidth / 2);
        
        // Fixed layout vertical anchors to prevent overlap
        const titleY = y + imgH + 7.5;
        const descY = titleY + 8.5;
        
        // Name (max 2 lines)
        doc.setTextColor(purple);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        let titleLines = doc.splitTextToSize(cleanText(p.name), cardWidth - 10);
        if (titleLines.length > 2) {
          titleLines = [titleLines[0], titleLines[1].substring(0, titleLines[1].length - 3) + '...'];
        }
        doc.text(titleLines, textX, titleY, { align: 'center' });
        
        // Short Description (max 2 lines)
        if (showDescription) {
          doc.setTextColor(gray);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          
          let descText = cleanText(p.shortDescription || '');
          if (descText.length > 120) {
            descText = descText.substring(0, 117) + '...';
          }
          let descLines = doc.splitTextToSize(descText, cardWidth - 12);
          if (descLines.length > 2) {
             descLines = [descLines[0], descLines[1].substring(0, descLines[1].length - 3) + '...'];
          }
          if (descLines.length > 0 && descLines[0].trim() !== '') {
            doc.text(descLines, textX, descY, { align: 'center' });
          }
        }
        
        // Price (fixed at bottom)
        if (showPrice) {
          doc.setTextColor(purple);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          const priceTxt = `Rs. ${p.price.toLocaleString()}`;
          const priceY = y + cardHeight - 5.5;
          
          if (p.pricePerPiece) {
            doc.text(priceTxt, textX, priceY - 3, { align: 'center' });
            doc.setFontSize(9);
            doc.setTextColor(gray);
            doc.setFont('helvetica', 'normal');
            doc.text(`(Rs. ${p.pricePerPiece} / Pc)`, textX, priceY + 1.5, { align: 'center' });
          } else {
            doc.text(priceTxt, textX, priceY, { align: 'center' });
          }
        }
        
        globalProductIndex++;
        cardsOnCurrentPage++;
      }
      
      // After rendering a section's products, prepare Y for next section.
      // Next section will figure out if it needs a page break based on its own requirements.
      if (cardsOnCurrentPage > 0) {
        currentY += cardHeight + rowGap;
      }
    }
  }

  // ==========================================
  // TABLE OF CONTENTS GENERATION (REMOVED AS PER CLIENT REQUEST)
  // ==========================================

  // ==========================================
  // FINAL PASS: HEADERS & FOOTERS
  // ==========================================
  const finalTotalPages = doc.internal.getNumberOfPages();
  for (let i = 2; i <= finalTotalPages; i++) {
    doc.setPage(i);
    // Do not draw page header on CATEGORY_DIVIDER pages (they are full-color pages)
    // Wait, how do we know if it's a category divider page? 
    // It's better to just let the header draw over it, or not draw it. 
    // Actually, category dividers have a lightBg covering the whole page, so if we draw header after, it puts the header on top.
    // The user requested: "Every other export must follow the exact same template. Every page must contain Same header Same footer"
    drawPageHeader();
    drawPageFooter(i);
  }

  if (onProgress) onProgress(100);
  const filename = `HampersNest-Catalog-${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`;
  
  if (mode === 'preview') {
    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
  } else {
    doc.save(filename);
  }
};
