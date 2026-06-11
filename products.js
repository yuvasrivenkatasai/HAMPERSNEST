/* ==========================================
   HAMPERS NEST — PRODUCT CATALOG
   Central product data store. Admin-panel ready.
   ========================================== */

const HN_CONFIG = {
  whatsappNumber: '917989202194',
  usdRate: 0.012,           // 1 INR = 0.012 USD (update as needed)
  currencySymbol: '₹',
  deliveryDays: '5–10 Days',
  siteUrl: window.location.origin + window.location.pathname
};

const HN_PRODUCTS = [
  {
    id: 'wedding-gift-hamper',
    name: 'Wedding Gift Hamper',
    slug: 'wedding-gift-hamper',
    category: 'Wedding',
    price_inr: 499,
    price_usd: 6,
    priceOnRequest: false,
    images: ['assets/wedding_gift.png'],
    description: 'Exquisite traditional brass items and luxury gift packs styled for premium weddings.',
    longDescription: 'Our Wedding Gift Hamper is a masterpiece of traditional Indian artistry. Each hamper is curated with premium handcrafted brass bowls, silk-lined gift boxes, and personalized accessories that reflect the grandeur of a wedding celebration. Perfect as return gifts for guests, these hampers are customizable with your family name, wedding date, and personalized messages.',
    availability: 'in-stock',
    stock: 'In Stock',
    featured: true,
    customizable: true,
    shippingTime: '5–10 Days',
    tags: ['wedding', 'brass', 'traditional', 'return-gift'],
    customizationOptions: [
      'Gift Message',
      'Custom Name / Family Name',
      'Custom Packaging',
      'Custom Color Theme',
      'Additional Instructions'
    ],
    careInstructions: 'Wipe brass items gently with a dry soft cloth. Avoid exposure to moisture. Store in a cool, dry place.',
    shippingInfo: 'Ships Pan India. Delivered in 5–10 business days. Bulk orders (50+) may require 12–15 days. Free shipping on orders above ₹5000.',
    customizationInfo: 'We offer full customization — family names, custom messages, box colors, and ribbon designs. Share your preferences on WhatsApp and our team will create a custom design preview.',
    relatedIds: ['baby-shower-hamper', 'housewarming-hamper', 'brass-bowl-gift-set'],
    createdAt: '2026-01-01',
    updatedAt: '2026-06-11'
  },
  {
    id: 'baby-shower-hamper',
    name: 'Baby Shower Hamper',
    slug: 'baby-shower-hamper',
    category: 'Baby Shower',
    price_inr: 399,
    price_usd: 5,
    priceOnRequest: false,
    images: ['assets/baby_shower.png'],
    description: 'Sweet, elegant lavender and pastel-themed hampers filled with custom keepsakes.',
    longDescription: 'Celebrate the joy of a new arrival with our Baby Shower Hamper — a tender collection of pastel-hued keepsakes, hand-tied ribbons, personalized name tags, and curated baby accessories. Each piece is wrapped in premium lavender tissue and presented in a designer gift box that delights both parents and guests.',
    availability: 'in-stock',
    stock: 'In Stock',
    featured: true,
    customizable: true,
    shippingTime: '5–10 Days',
    tags: ['baby-shower', 'pastel', 'keepsake', 'return-gift'],
    customizationOptions: [
      'Gift Message',
      'Custom Baby Name',
      'Custom Packaging',
      'Custom Color Theme',
      'Additional Instructions'
    ],
    careInstructions: 'Handle fabric items with care. Store in provided gift box to preserve shape and fragrance.',
    shippingInfo: 'Ships Pan India. Delivered in 5–10 business days. Bulk orders are welcome with advance notice.',
    customizationInfo: 'Personalize with the baby\'s name, birth date, and custom message. Choose from pink, blue, or lavender themes.',
    relatedIds: ['wedding-gift-hamper', 'half-saree-return-gift', 'housewarming-hamper'],
    createdAt: '2026-01-01',
    updatedAt: '2026-06-11'
  },
  {
    id: 'housewarming-hamper',
    name: 'Housewarming Hamper',
    slug: 'housewarming-hamper',
    category: 'Housewarming',
    price_inr: 799,
    price_usd: 10,
    priceOnRequest: false,
    images: ['assets/housewarming.png'],
    description: 'Charming home decor, brass diyas, incense holders, and premium dry fruit setups.',
    longDescription: 'Welcome guests into a new home with our Housewarming Hamper — an exquisite curation of polished brass diyas, handcrafted incense holders, premium dry fruit assortments, and artisan-made home decor pieces. Each hamper is packed in a luxury kraft box with a gold-embossed greeting card, making it the perfect blessing for a new beginning.',
    availability: 'in-stock',
    stock: 'In Stock',
    featured: false,
    customizable: true,
    shippingTime: '5–10 Days',
    tags: ['housewarming', 'brass', 'home-decor', 'griha-pravesham'],
    customizationOptions: [
      'Gift Message',
      'Custom Name',
      'Custom Packaging',
      'Company Branding',
      'Additional Instructions'
    ],
    careInstructions: 'Brass items: wipe with dry cloth. Diyas: keep away from water. Dry fruits: consume within 30 days of delivery.',
    shippingInfo: 'Ships Pan India. Delivered in 5–10 business days. Fragile items carefully packed to prevent breakage.',
    customizationInfo: 'Add family name, custom pooja box design, and personalized message card. Corporate branding available for bulk orders.',
    relatedIds: ['wedding-gift-hamper', 'brass-bowl-gift-set', 'corporate-executive-hamper'],
    createdAt: '2026-01-01',
    updatedAt: '2026-06-11'
  },
  {
    id: 'corporate-executive-hamper',
    name: 'Corporate Executive Hamper',
    slug: 'corporate-executive-hamper',
    category: 'Corporate',
    price_inr: 999,
    price_usd: 12,
    priceOnRequest: false,
    images: ['assets/corporate.png'],
    description: 'Sleek corporate presentation boxes containing leather goods, flask, and fine chocolates.',
    longDescription: 'Make a powerful brand impression with our Corporate Executive Hamper. Each set features a premium metallic flask, hand-stitched leather notebook, gourmet chocolate assortment, and artisan dry fruits — all arranged in a structured matte-black presentation box with your company logo embossed in gold. Minimum order: 10 units.',
    availability: 'made-to-order',
    stock: 'Made To Order',
    featured: true,
    customizable: true,
    shippingTime: '7–12 Days',
    tags: ['corporate', 'executive', 'branding', 'bulk'],
    customizationOptions: [
      'Company Branding / Logo',
      'Gift Message',
      'Custom Packaging',
      'Custom Color Theme',
      'Additional Instructions'
    ],
    careInstructions: 'Leather items: condition with leather care product. Flask: hand wash only. Chocolates: consume within 15 days.',
    shippingInfo: 'Ships Pan India. Bulk corporate orders: 7–12 business days after design approval. PAN India delivery for all corporate clients.',
    customizationInfo: 'Full corporate branding available — logo embossing, custom ribbon, branded tissue paper, and custom message cards. Minimum 10 units for corporate branding.',
    relatedIds: ['housewarming-hamper', 'customized-luxury-box', 'wedding-gift-hamper'],
    createdAt: '2026-01-01',
    updatedAt: '2026-06-11'
  },
  {
    id: 'customized-luxury-box',
    name: 'Customized Luxury Box',
    slug: 'customized-luxury-box',
    category: 'Customized',
    price_inr: 1299,
    price_usd: 16,
    priceOnRequest: true,   // Price on request — show "Request Quote"
    images: ['assets/hero_banner.png'],
    description: 'Bespoke luxury hampers tailored precisely with the gifts and packaging of your choice.',
    longDescription: 'The Customized Luxury Box is our flagship offering — a completely bespoke hamper built exactly to your vision. You choose the products, the packaging, the color theme, and the presentation. Our curation team works with you step by step to create a hamper that is truly one of a kind. Price varies based on contents and quantity.',
    availability: 'made-to-order',
    stock: 'Made To Order',
    featured: true,
    customizable: true,
    shippingTime: '10–15 Days',
    tags: ['bespoke', 'luxury', 'customized', 'premium'],
    customizationOptions: [
      'Gift Message',
      'Custom Name',
      'Custom Packaging',
      'Company Branding',
      'Custom Color Theme',
      'Additional Instructions'
    ],
    careInstructions: 'Care instructions vary by contents. Our team will include a care card specific to your hamper.',
    shippingInfo: 'Ships Pan India. Delivery timeline depends on customization complexity — typically 10–15 business days.',
    customizationInfo: 'Fully bespoke. Tell us your budget, occasion, and preferences — we\'ll design a custom hamper and send a catalog/mockup on WhatsApp before production.',
    relatedIds: ['corporate-executive-hamper', 'wedding-gift-hamper', 'housewarming-hamper'],
    createdAt: '2026-01-01',
    updatedAt: '2026-06-11'
  },
  {
    id: 'brass-bowl-gift-set',
    name: 'Brass Bowl Gift Set',
    slug: 'brass-bowl-gift-set',
    category: 'Brass Collection',
    price_inr: 299,
    price_usd: 4,
    priceOnRequest: false,
    images: ['assets/brass_cup.png'],
    description: 'Timeless, intricately engraved brass bowls, cups, and custom decorative items.',
    longDescription: 'Our Brass Bowl Gift Set celebrates the timeless tradition of handcrafted Indian brassware. Each set includes premium engraved brass bowls and cups made by master artisans in Hyderabad. Presented in a silk-lined gift box with a handwritten card, these pieces make an elegant and lasting return gift for any celebration.',
    availability: 'in-stock',
    stock: 'Limited Stock',
    featured: false,
    customizable: true,
    shippingTime: '5–10 Days',
    tags: ['brass', 'traditional', 'artisan', 'hyderabad'],
    customizationOptions: [
      'Gift Message',
      'Custom Name Engraving',
      'Custom Packaging',
      'Additional Instructions'
    ],
    careInstructions: 'Wipe with a dry soft cloth. Do not use harsh chemicals. Polish occasionally with brass cleaner. Keep away from moisture.',
    shippingInfo: 'Ships Pan India. Delivered in 5–10 business days. Carefully packed to avoid tarnishing during transit.',
    customizationInfo: 'Name engraving available on brass items. Custom message cards and box ribbon colors available on request.',
    relatedIds: ['wedding-gift-hamper', 'housewarming-hamper', 'half-saree-return-gift'],
    createdAt: '2026-01-01',
    updatedAt: '2026-06-11'
  },
  {
    id: 'half-saree-return-gift',
    name: 'Half Saree Return Gift',
    slug: 'half-saree-return-gift',
    category: 'Half Saree Function',
    price_inr: 349,
    price_usd: 4,
    priceOnRequest: false,
    images: ['assets/half_saree.png'],
    description: 'A return gifting combination featuring high-end brass diyas and silk bangle pouch.',
    longDescription: 'Curated especially for the beloved Half Saree Function, this return gift set beautifully blends tradition with elegance. Each set includes handcrafted brass diyas, a silk bangle pouch with custom detailing, and traditional sweets packaging — all arranged in a premium purple or gold themed box to match the celebratory spirit of this milestone occasion.',
    availability: 'in-stock',
    stock: 'In Stock',
    featured: false,
    customizable: true,
    shippingTime: '5–10 Days',
    tags: ['half-saree', 'traditional', 'silk', 'function'],
    customizationOptions: [
      'Gift Message',
      'Custom Name',
      'Custom Packaging',
      'Custom Color Theme',
      'Additional Instructions'
    ],
    careInstructions: 'Silk items: handle gently, avoid direct sunlight. Brass diyas: wipe with dry cloth. Store in provided box.',
    shippingInfo: 'Ships Pan India. Delivered in 5–10 business days.',
    customizationInfo: 'Customize with the girl\'s name, event date, and a personal message. Choose your preferred box color and ribbon style.',
    relatedIds: ['baby-shower-hamper', 'wedding-gift-hamper', 'brass-bowl-gift-set'],
    createdAt: '2026-01-01',
    updatedAt: '2026-06-11'
  }
];

// Helper: get product by id
function hn_getProduct(id) {
  return HN_PRODUCTS.find(p => p.id === id) || null;
}

// Helper: calculate USD from INR
function hn_toUSD(inr) {
  return Math.round(inr * HN_CONFIG.usdRate);
}

// Helper: format INR
function hn_formatINR(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Helper: get related products (excluding current)
function hn_getRelated(product) {
  if (!product || !product.relatedIds) return [];
  return product.relatedIds
    .map(id => hn_getProduct(id))
    .filter(Boolean)
    .slice(0, 3);
}
