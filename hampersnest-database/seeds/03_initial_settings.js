/**
 * Production Seed: Essential Store & System Settings
 * Derived from hampersnest-backend/controllers/settingsController.js & seed_policies.js
 * Fully idempotent: only seeds each setting if it does not already exist in the database.
 *
 * @param { import("knex").Knex } knex
 */
const defaultPolicies = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    content: '<p>Hampers Nest is committed to protecting your privacy and security of personal information.</p>',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'terms',
    title: 'Terms & Conditions',
    content: '<p>Welcome to Hampers Nest. By browsing and using our services, you agree to these terms.</p>',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery Policy',
    content: '<p>Standard delivery takes 3-5 business days across India. Express delivery available on request.</p>',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'returns',
    title: 'Return & Refund Policy',
    content: '<p>Because our luxury hampers are customized and include perishables, cancellations are accepted within 2 hours of booking.</p>',
    lastUpdated: new Date().toISOString()
  }
];

const defaultBulkDiscounts = {
  enabled: true,
  ruleType: 'Product Quantity',
  heading: '🎉 Bulk Order Discounts',
  footerNote: '✓ Automatically applied at checkout.',
  rules: [
    { minQty: 50, discountPercent: 5 },
    { minQty: 100, discountPercent: 10 },
    { minQty: 200, discountPercent: 15 }
  ]
};

const defaultPriceRangeCards = [
  { id: 'price-under-100', name: 'Under ₹100', slug: 'under-100', minPrice: 0, maxPrice: 100, image: '/assets/price_under_100.png', sortOrder: 1, isActive: true },
  { id: 'price-100-200', name: '₹100–₹200', slug: '100-200', minPrice: 100, maxPrice: 200, image: '/assets/price_100_200.png', sortOrder: 2, isActive: true },
  { id: 'price-200-300', name: '₹200–₹300', slug: '200-300', minPrice: 200, maxPrice: 300, image: '/assets/price_200_300.png', sortOrder: 3, isActive: true },
  { id: 'price-300-plus', name: '₹300 & Above', slug: '300-plus', minPrice: 300, maxPrice: null, image: '/assets/price_300_plus.png', sortOrder: 4, isActive: true }
];

const defaultPdfDeliveryInfo = `• Dispatch within 2–7 business days
• Delivery across India & International
• Shipping calculated based on actual or volumetric weight
• Bulk corporate orders available
• Premium packaging included`;

const defaultPopularSearches = "#WeddingReturnGifts, #BabyShowerReturnGifts, #CorporateGifts, #HousewarmingReturnGifts, #DiwaliGiftHampers";

exports.seed = async function(knex) {
  const settingsToSeed = [
    { key: 'customPolicies', value: defaultPolicies },
    { key: 'bulkDiscountSettings', value: defaultBulkDiscounts },
    { key: 'priceRangeCards', value: defaultPriceRangeCards },
    { key: 'pdfDeliveryInfo', value: defaultPdfDeliveryInfo },
    { key: 'popularSearches', value: defaultPopularSearches },
    { key: 'category_showcase_animation', value: true },
    { key: 'announcementText', value: 'Welcome to HampersNest! Customized Hampers and Return Gifts Hyderabad.' },
    { key: 'announcementActive', value: false },
    { key: 'activeTheme', value: 'theme-default' }
  ];

  for (const item of settingsToSeed) {
    const existing = await knex('settings').where({ key: item.key }).first();
    if (!existing) {
      await knex('settings').insert({
        key: item.key,
        value: Buffer.from(JSON.stringify(item.value))
      });
    }
  }
};

