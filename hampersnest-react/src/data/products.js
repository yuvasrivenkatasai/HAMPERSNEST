// USD conversion constant — update this single value to change all USD prices
export const USD_RATE = 83; // ₹83 = $1 USD

export const MASTER_CATEGORIES = [
  { id: 'All',        label: 'All',                  emoji: '' },
  { id: 'Weddings',   label: 'Weddings',             emoji: '' },
  { id: 'Baby',       label: 'Baby Celebrations',    emoji: '' },
  { id: 'Traditional',label: 'Traditional',          emoji: '' },
  { id: 'Festivals',  label: 'Festivals & Seasonal', emoji: '' },
  { id: 'Corporate',  label: 'Corporate & Bulk',     emoji: '' },
];

export const products = [
  {
    id: "wedding-hamper",
    name: "Wedding Gift Hamper",
    price: 499,
    image: "/assets/wedding_gift.png",
    category: "Wedding",
    masterCategory: "Weddings",
    rating: 4.9,
    description: "Exquisite traditional brass items and luxury gift packs styled for premium weddings.",
    details: [
      "1 x Intricately engraved traditional brass bowl",
      "Premium kumkum and haldi containers",
      "Scented jasmine-infused wax candle",
      "Luxury custom-made rigid cardboard hamper box with silk lining",
      "Personalized thank-you gift card with gold foil lettering"
    ],
    customization: ["Name Personalization", "Custom Packaging", "Custom Message Card", "Bulk Order Support"],
    shipping: ["Pan India Delivery", "Safe Packaging", "Bulk Shipping Available"],
    isFeatured: true
  },
  {
    id: "baby-shower-hamper",
    name: "Baby Shower Hamper",
    price: 399,
    image: "/assets/baby_shower.png",
    category: "Baby Shower",
    masterCategory: "Baby",
    rating: 4.8,
    description: "Sweet, elegant lavender and pastel-themed hampers filled with custom keepsakes.",
    details: [
      "Aromatic organic lavender potpourri sachet",
      "Set of 4 hand-painted baby motif milk chocolates",
      "Silver-plated baby rattle souvenir",
      "Pastel purple theme box decorated with premium satin ribbons",
      "Customized baby announcement card"
    ],
    customization: ["Name Personalization", "Custom Packaging", "Custom Message Card", "Bulk Order Support"],
    shipping: ["Pan India Delivery", "Safe Packaging", "Bulk Shipping Available"],
    isFeatured: true
  },
  {
    id: "housewarming-hamper",
    name: "Housewarming Hamper",
    price: 799,
    image: "/assets/housewarming.png",
    category: "Housewarming",
    masterCategory: "Traditional",
    rating: 4.7,
    description: "Charming home decor, brass diyas, incense holders, and premium dry fruit setups.",
    details: [
      "2 x Solid brass polished diyas",
      "Artisan-crafted stone incense stick holder",
      "200g select premium almonds and cashews pack",
      "Hand-woven bamboo storage basket with gold lace wrapping",
      "Griha pravesham traditional greeting card"
    ],
    customization: ["Name Personalization", "Custom Packaging", "Custom Message Card", "Bulk Order Support"],
    shipping: ["Pan India Delivery", "Safe Packaging", "Bulk Shipping Available"],
    isFeatured: true
  },
  {
    id: "corporate-exec",
    name: "Corporate Executive Hamper",
    price: 999,
    image: "/assets/corporate.png",
    category: "Corporate",
    masterCategory: "Corporate",
    rating: 4.9,
    description: "Sleek corporate presentation boxes containing leather goods, flask, and fine chocolates.",
    details: [
      "Premium leatherette card holder and key ring set",
      "Temperature-indicator smart matte black vacuum flask",
      "Premium dark chocolate almond bark (150g)",
      "Elite presentation drawer-box in textured navy blue coating",
      "Branded corporate note card with custom embossing options"
    ],
    customization: ["Logo Branding", "Custom Packaging", "Bulk Order Support", "Custom Message Card"],
    shipping: ["Pan India Delivery", "Safe Packaging", "Bulk Shipping Available"],
    isFeatured: true
  },
  {
    id: "custom-luxury",
    name: "Customized Luxury Box",
    price: 1299,
    image: "/assets/hero_banner.png",
    category: "Customized",
    masterCategory: "Traditional",
    rating: 5.0,
    description: "Bespoke luxury hampers tailored precisely with the gifts and packaging of your choice.",
    details: [
      "Fully customized choice of premium gifts (brass items, dry fruits, sweets, etc.)",
      "Heavy-duty luxury wooden or hardboard gift box",
      "Choice of velvet, silk, or straw inner cushioning",
      "Embossed names/logo print on the box cover",
      "Custom handwritten calligraphy message card"
    ],
    customization: ["Name Personalization", "Custom Packaging", "Custom Message Card", "Bulk Order Support"],
    shipping: ["Pan India Delivery", "Safe Packaging", "Bulk Shipping Available"],
    isFeatured: true
  },
  {
    id: "brass-bowl-set",
    name: "Brass Bowl Gift Set",
    price: 299,
    image: "/assets/brass_cup.png",
    category: "Brass",
    masterCategory: "Traditional",
    rating: 4.6,
    description: "Timeless, intricately engraved brass bowls, cups, and custom decorative items.",
    details: [
      "2 x Hand-engraved pure brass cups/bowls",
      "Silk cloth presentation box with traditional motif design",
      "Matching brass spoons with floral detailing",
      "Eco-friendly handmade paper packaging envelope"
    ],
    customization: ["Name Personalization", "Custom Packaging", "Custom Message Card", "Bulk Order Support"],
    shipping: ["Pan India Delivery", "Safe Packaging", "Bulk Shipping Available"],
    isFeatured: true
  },
  {
    id: "brass-cups-artisan",
    name: "Artisan Engraved Brass Cups",
    price: 299,
    image: "/assets/brass_cup.png",
    category: "Brass",
    masterCategory: "Traditional",
    rating: 4.8,
    description: "Exquisite handcrafted brass mugs showing custom traditional Indian engraving on silk backing.",
    details: [
      "2 x Premium heavy-gauge engraved brass mugs",
      "Traditional red velvet gift casing",
      "Instruction card for brass care and longevity",
      "Gold thread decoration bow ribbon"
    ],
    customization: ["Name Personalization", "Custom Packaging", "Custom Message Card", "Bulk Order Support"],
    shipping: ["Pan India Delivery", "Safe Packaging", "Bulk Shipping Available"],
    isFeatured: false
  },
  {
    id: "half-saree-gift",
    name: "Half Saree Return Gift",
    price: 349,
    image: "/assets/half_saree.png",
    category: "Wedding",
    masterCategory: "Weddings",
    rating: 4.7,
    description: "A return gifting combination featuring high-end brass diyas and silk bangle pouch with custom detailing.",
    details: [
      "Premium quality silk zari bangle holder pouch",
      "1 x Traditional brass peacock diya",
      "Scented dhoop sticks package",
      "Elegant custom-designed wedding envelope"
    ],
    customization: ["Name Personalization", "Custom Packaging", "Custom Message Card", "Bulk Order Support"],
    shipping: ["Pan India Delivery", "Safe Packaging", "Bulk Shipping Available"],
    isFeatured: false
  },
  {
    id: "lavender-premium",
    name: "Custom Lavender Hamper",
    price: 899,
    image: "/assets/hero_banner.png",
    category: "Customized",
    masterCategory: "Festivals",
    rating: 4.9,
    description: "An elegant purple-hued customized basket curated with high-end fragrances, sweets, and premium cards.",
    details: [
      "Luxury lavender-infused organic body scrub (100g)",
      "Premium soy wax lavender essential oil candle",
      "Gourmet French lavender macarons box (4 pcs)",
      "Woven white wicker basket with lavender ribbon lining"
    ],
    customization: ["Name Personalization", "Custom Packaging", "Custom Message Card", "Bulk Order Support"],
    shipping: ["Pan India Delivery", "Safe Packaging", "Bulk Shipping Available"],
    isFeatured: false
  },
  {
    id: "corporate-premium",
    name: "Premium Corporate Pack",
    price: 1499,
    image: "/assets/corporate.png",
    category: "Corporate",
    masterCategory: "Corporate",
    rating: 5.0,
    description: "High-end corporate box featuring a customized metallic bottle, notebook, and handcrafted dry fruit assortments.",
    details: [
      "Stainless steel double-walled insulated hydration bottle",
      "A5 executive notebook with built-in power bank (8000 mAh)",
      "Metal executive signature ballpoint pen",
      "Premium glass jars containing pistachios and walnuts (150g each)"
    ],
    customization: ["Logo Branding", "Custom Packaging", "Bulk Order Support", "Custom Message Card"],
    shipping: ["Pan India Delivery", "Safe Packaging", "Bulk Shipping Available"],
    isFeatured: false
  }
];
