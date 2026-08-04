export const calculateProductPrice = (basePrice, selectedAddOns = []) => {
  const addonsTotal = selectedAddOns.reduce((total, addon) => total + (Number(addon.price) || 0), 0);
  return Number(basePrice) + addonsTotal;
};

export const calculateCartTotals = (items, discountRules = []) => {
  let subtotal = 0;
  let totalQuantity = 0;
  
  items.forEach(item => {
    const itemUnitPrice = calculateProductPrice(item.basePrice || item.price, item.addOns || []);
    subtotal += itemUnitPrice * (item.quantity || 1);
    totalQuantity += (item.quantity || 1);
  });
  
  let discountPercent = 0;
  
  if (discountRules && discountRules.length > 0) {
    // Sort rules by descending minQty to find the highest applicable discount
    const sortedRules = [...discountRules].sort((a, b) => b.minQty - a.minQty);
    for (const rule of sortedRules) {
      if (totalQuantity >= rule.minQty) {
        discountPercent = rule.discountPercent;
        break;
      }
    }
  }
  
  const discountAmount = subtotal * (discountPercent / 100);
  const finalTotal = subtotal - discountAmount;
  
  return {
    subtotal,
    discountPercent,
    discountAmount,
    finalTotal,
    totalQuantity
  };
};

export const formatCurrency = (amount, currency = 'INR', exchangeRate = 1) => {
  if (amount === undefined || amount === null) return '';
  
  const value = amount * exchangeRate;
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
  
  // Default to INR
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};
