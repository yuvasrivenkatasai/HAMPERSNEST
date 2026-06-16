import { jsPDF } from 'jspdf';

// Helper to load image as base64
const loadImageAsBase64 = async (url) => {
  try {
    // If it's a relative URL, prepend origin
    let targetUrl = url;
    if (targetUrl.startsWith('/')) {
      targetUrl = window.location.origin + targetUrl;
    } else if (targetUrl.startsWith('http')) {
      // Add a cache-buster query parameter to bypass browser and CDN CORS caches
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
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

export const generateCatalogPdf = async (products, mode = 'download', onProgress) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Brand Colors
  const purple = '#4A1D5F';
  const gold = '#C8A96B';
  const gray = '#4A4A4A';
  const lightBg = '#FAF6FC';

  // Helper to add header
  const addHeader = (pageNumber, totalPages) => {
    doc.setFillColor(purple);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('HAMPERS NEST', 15, 17);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Luxury Gifting Collection', pageWidth - 15, 17, { align: 'right' });
  };

  // Helper to add footer
  const addFooter = (pageNumber) => {
    doc.setFillColor(purple);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(9);
    doc.text('www.hampersnest.com | +91 99999 99999 | Hyderabad, India', 15, pageHeight - 6);
    
    doc.text(`Page ${pageNumber}`, pageWidth - 15, pageHeight - 6, { align: 'right' });
  };

  // Cover Page
  doc.setFillColor(lightBg);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setTextColor(purple);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.text('HAMPERS NEST', pageWidth / 2, pageHeight / 3, { align: 'center' });
  
  doc.setTextColor(gold);
  doc.setFontSize(18);
  doc.text('PREMIUM GIFTING COLLECTION', pageWidth / 2, (pageHeight / 3) + 15, { align: 'center' });
  
  doc.setTextColor(gray);
  doc.setFontSize(12);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  doc.text(`Catalog Edition: ${dateStr}`, pageWidth / 2, (pageHeight / 3) + 30, { align: 'center' });
  
  addFooter(1);

  // Layout Constants
  const itemsPerPage = 4; // 2x2 grid
  const marginX = 15;
  const marginY = 35;
  const cardWidth = (pageWidth - (marginX * 2) - 10) / 2;
  const cardHeight = 110;
  
  let currentPage = 2;
  
  for (let i = 0; i < products.length; i++) {
    const itemIndexOnPage = i % itemsPerPage;
    
    if (itemIndexOnPage === 0) {
      doc.addPage();
      addHeader(currentPage);
      addFooter(currentPage);
      currentPage++;
    }
    
    const row = Math.floor(itemIndexOnPage / 2);
    const col = itemIndexOnPage % 2;
    
    const x = marginX + (col * (cardWidth + 10));
    const y = marginY + (row * (cardHeight + 10));
    
    // Draw Card Background
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');
    
    const product = products[i];
    
    // Notify Progress
    if (onProgress) {
      onProgress(Math.round(((i + 1) / products.length) * 100));
    }
    
    // Load Image
    const base64Img = await loadImageAsBase64(product.image);
    if (base64Img) {
      try {
        // Image at top of card, height 50mm
        doc.addImage(base64Img, 'JPEG', x + 2, y + 2, cardWidth - 4, 50, undefined, 'FAST');
      } catch (e) {
        console.warn('Could not draw image', e);
        doc.setFillColor(240, 240, 240);
        doc.rect(x + 2, y + 2, cardWidth - 4, 50, 'F');
      }
    } else {
      doc.setFillColor(240, 240, 240);
      doc.rect(x + 2, y + 2, cardWidth - 4, 50, 'F');
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(10);
      doc.text('Image Not Available', x + cardWidth / 2, y + 25, { align: 'center' });
    }
    
    // Title
    doc.setTextColor(purple);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const titleLines = doc.splitTextToSize(product.name, cardWidth - 8);
    doc.text(titleLines.slice(0, 2), x + 4, y + 60);
    
    // Category Badge
    doc.setFillColor(gold);
    doc.roundedRect(x + 4, y + 70, 30, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    // Fake category resolve if it's an ID (we assume caller maps it, or we just print what we have)
    doc.text('PREMIUM', x + 19, y + 74.5, { align: 'center' });
    
    // Description
    doc.setTextColor(gray);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const desc = product.description || (product.details ? product.details.join(', ') : '');
    const descLines = doc.splitTextToSize(desc, cardWidth - 8);
    doc.text(descLines.slice(0, 3), x + 4, y + 82);
    
    // Price
    doc.setTextColor(purple);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Rs. ${product.price.toLocaleString()}`, x + 4, y + 104);
  }

  const filename = `HampersNest-Catalog-${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`;

  if (mode === 'preview') {
    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
  } else {
    doc.save(filename);
  }
};
