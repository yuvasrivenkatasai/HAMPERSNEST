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

        const imgRatio = img.width / img.height;
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1000 / targetAspectRatio;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let dx = 0, dy = 0, dWidth = canvas.width, dHeight = canvas.height;

        if (imgRatio > targetAspectRatio) {
          dHeight = canvas.width / imgRatio;
          dy = (canvas.height - dHeight) / 2;
        } else {
          dWidth = canvas.height * imgRatio;
          dx = (canvas.width - dWidth) / 2;
        }
        
        ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dWidth, dHeight);
        resolve(canvas.toDataURL('image/jpeg', 0.90));
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
    categories = []
  } = options;

  let sections = [];

  // Consistent sorting logic inside categories/tiers
  const sortProductsInGroup = (prods) => {
    return prods.sort((a, b) => {
      const aFeat = (a.isFeatured || a.featured) ? 1 : 0;
      const bFeat = (b.isFeatured || b.featured) ? 1 : 0;
      if (aFeat !== bFeat) return bFeat - aFeat;
      
      const aStock = a.stock > 0 ? 1 : 0;
      const bStock = b.stock > 0 ? 1 : 0;
      if (aStock !== bStock) return bStock - aStock;
      
      return stripArticle(a.name || '').localeCompare(stripArticle(b.name || ''));
    });
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
    
    // Strict numeric sort
    const sorted = [...products].sort((a, b) => {
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      return priceAsc ? (priceA - priceB) : (priceB - priceA);
    });
    
    const tiers = {};
    sorted.forEach(p => {
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
    // NAME_ASC (ignore articles)
    const sorted = [...products].sort((a, b) => stripArticle(a.name || '').localeCompare(stripArticle(b.name || '')));
    
    sections.push({
      type: 'SECTION_HEADER',
      title: 'Products (A–Z)',
      subtitle: `${sorted.length} Products`
    });

    sections.push({
      type: 'PRODUCTS',
      products: sorted
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
  const footerHeight = 15;
  const marginTop = 10;
  const marginBottom = 10;
  
  const printableHeight = pageHeight - headerHeight - footerHeight - marginTop - marginBottom;
  const marginX = 15;
  const colGap = 10;
  const rowGap = 10;
  
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
  
  doc.setTextColor(gray);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  let filterStr = `Export: ${exportMode.replace('_', ' ')}`;
  if (sortBy === 'CATEGORY') {
    filterStr += ` | Sorted By: Category`;
  } else {
    filterStr += ` | Sorted By: ${sortBy.replace('_', ' ')}`;
  }

  doc.text(`Generated: ${dateStr} at ${timeStr}`, pageWidth / 2, (pageHeight / 3) + 30, { align: 'center' });
  doc.text(`Total Products: ${products.length}`, pageWidth / 2, (pageHeight / 3) + 40, { align: 'center' });
  doc.text(filterStr, pageWidth / 2, (pageHeight / 3) + 50, { align: 'center' });
  doc.text('Generated By: Hampers Nest Admin', pageWidth / 2, (pageHeight / 3) + 60, { align: 'center' });

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
    doc.setFillColor(purple);
    doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(9);
    doc.text('www.hampersnest.in | +91 79892 02194 | Hyderabad, India', 15, pageHeight - 6);
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
        
        // Proportional Internals (Image 60%)
        const imgH = cardHeight * 0.60;
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
        
        let textY = y + imgH + 6; 
        
        // Name (max 2 lines)
        doc.setTextColor(purple);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        let titleLines = doc.splitTextToSize(cleanText(p.name), cardWidth - 8);
        if (titleLines.length > 2) {
          titleLines = [titleLines[0], titleLines[1].substring(0, titleLines[1].length - 3) + '...'];
        }
        doc.text(titleLines, x + 4, textY);
        textY += (titleLines.length * 4.5) + 1;
        
        // Category (1 line)
        doc.setTextColor(gray);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        
        const isUUIDStr = (str) => {
          if (!str) return false;
          return /^[0-9a-fA-F]{24}$/.test(str) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        };
        
        let cName = p.categoryName || p.category;
        if (isUUIDStr(cName) || !cName || cName === 'undefined') cName = 'Uncategorized';
        
        let scName = p.subcategoryName || p.subCategory;
        if (isUUIDStr(scName) || !scName || scName === 'undefined' || scName === 'null') scName = '';
        
        const catStr = scName ? cleanText(`${cName} > ${scName}`) : cleanText(cName);
        let catLines = doc.splitTextToSize(catStr, cardWidth - 8);
        if (catLines.length > 1) {
           catLines = [catLines[0].substring(0, catLines[0].length - 3) + '...'];
        }
        doc.text(catLines, x + 4, textY);
        textY += 5;

        // Details (Availability, MOQ) (1 line)
        doc.setFont('helvetica', 'normal');
        let detailsStr = [];
        if (p.moq) detailsStr.push(`MOQ: ${p.moq}`);
        detailsStr.push(p.stock > 0 ? 'In Stock' : 'Out of Stock');
        
        const detLines = doc.splitTextToSize(cleanText(detailsStr.join(' | ')), cardWidth - 8);
        doc.text(detLines[0], x + 4, textY); 
        textY += 5;

        // Price
        if (showPrice) {
          doc.setTextColor(purple);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          const priceTxt = `Rs. ${p.price.toLocaleString()}`;
          // Position price precisely near the bottom
          const priceY = y + cardHeight - 6;
          doc.text(priceTxt, x + 4, priceY);
          
          if (p.pricePerPiece) {
            doc.setFontSize(9);
            doc.setTextColor(gray);
            doc.setFont('helvetica', 'normal');
            doc.text(`(Rs. ${p.pricePerPiece} / Pc)`, x + 4 + doc.getTextWidth(priceTxt) + 3, priceY);
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
  // TABLE OF CONTENTS GENERATION
  // ==========================================
  if (tocEntries.length > 0) {
    if (onProgress) onProgress(95);
    const totalContentPages = doc.internal.getNumberOfPages();
    
    doc.addPage();
    let tocY = usableYStart;
    
    doc.setTextColor(purple);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('TABLE OF CONTENTS', marginX, tocY);
    tocY += 15;
    
    doc.setDrawColor(gold);
    doc.setLineWidth(0.5);
    doc.line(marginX, tocY - 8, pageWidth - marginX, tocY - 8);
    
    doc.setFontSize(14);
    
    for (let i = 0; i < tocEntries.length; i++) {
      if (tocY > maxSafeY - 10) {
        doc.addPage();
        tocY = usableYStart;
      }
      
      const entry = tocEntries[i];
      doc.setFont('helvetica', 'bold');
      doc.text(entry.title, marginX, tocY);
      
      const pageStr = entry.page.toString();
      const pageX = pageWidth - marginX - doc.getTextWidth(pageStr);
      doc.text(pageStr, pageX, tocY);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 200);
      const dotStartX = marginX + doc.getTextWidth(entry.title) + 5;
      const dotEndX = pageX - 5;
      const dotWidth = doc.getTextWidth('.');
      for (let dx = dotStartX; dx < dotEndX; dx += dotWidth * 2) {
        doc.text('.', dx, tocY);
      }
      
      doc.setTextColor(purple);
      tocY += 12;
    }
    
    const totalTocPages = doc.internal.getNumberOfPages() - totalContentPages;
    
    // Recalculate TOC with offset page numbers
    for (let i = 0; i < totalTocPages; i++) {
      doc.deletePage(doc.internal.getNumberOfPages());
    }
    
    doc.addPage();
    tocY = usableYStart;
    
    doc.setTextColor(purple);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('TABLE OF CONTENTS', marginX, tocY);
    tocY += 15;
    
    doc.setDrawColor(gold);
    doc.setLineWidth(0.5);
    doc.line(marginX, tocY - 8, pageWidth - marginX, tocY - 8);
    
    doc.setFontSize(14);
    
    for (let i = 0; i < tocEntries.length; i++) {
      if (tocY > maxSafeY - 10) {
        doc.addPage();
        tocY = usableYStart;
      }
      
      const entry = tocEntries[i];
      // Add totalTocPages offset since the TOC will be inserted at page 2
      const correctPageNum = entry.page + totalTocPages;
      
      doc.setFont('helvetica', 'bold');
      doc.text(entry.title, marginX, tocY);
      
      const pageStr = correctPageNum.toString();
      const pageX = pageWidth - marginX - doc.getTextWidth(pageStr);
      doc.text(pageStr, pageX, tocY);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 200);
      const dotStartX = marginX + doc.getTextWidth(entry.title) + 5;
      const dotEndX = pageX - 5;
      const dotWidth = doc.getTextWidth('.');
      for (let dx = dotStartX; dx < dotEndX; dx += dotWidth * 2) {
        doc.text('.', dx, tocY);
      }
      
      doc.setTextColor(purple);
      tocY += 12;
    }
    
    // Shift TOC to index 2
    for (let i = 0; i < totalTocPages; i++) {
      doc.movePage(doc.internal.getNumberOfPages(), 2 + i);
    }
  }

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
