import { Product, Order, Inquiry } from '../database/models.js';

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const totalInquiries = await Inquiry.count();
    
    const orders = await Order.findAll();
    
    let totalRevenue = 0;
    let pendingOrders = 0;
    let confirmedOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;

    const salesByCategory = {};
    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Shipped: 0,
      Delivered: 0
    };

    orders.forEach(order => {
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status]++;
      }

      if (order.status === 'Pending') {
        pendingOrders++;
      } else {
        totalRevenue += order.totalAmount;
        if (order.status === 'Confirmed') confirmedOrders++;
        if (order.status === 'Shipped') shippedOrders++;
        if (order.status === 'Delivered') deliveredOrders++;
      }
    });

    const allProducts = await Product.findAll({
      attributes: ['id', 'category']
    });
    const productCategoryMap = {};
    allProducts.forEach(p => {
      productCategoryMap[p.id] = p.category;
    });

    orders.forEach(order => {
      if (order.status !== 'Pending') {
        const itemsList = Array.isArray(order.items) ? order.items : [];
        itemsList.forEach(item => {
          const category = productCategoryMap[item.productId] || 'Other';
          const itemSalesValue = item.price * item.quantity;
          salesByCategory[category] = (salesByCategory[category] || 0) + itemSalesValue;
        });
      }
    });

    const categoryData = Object.keys(salesByCategory).map(key => ({
      category: key,
      value: salesByCategory[key]
    }));

    const recentOrders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const productsAnalytics = await Product.findAll({
      attributes: ['name', 'views', 'clicks']
    });
    let totalViews = 0;
    let totalClicks = 0;
    productsAnalytics.forEach(p => {
      totalViews += (p.views || 0);
      totalClicks += (p.clicks || 0);
    });

    const topViewedProducts = [...productsAnalytics]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        views: p.views || 0,
        clicks: p.clicks || 0
      }));

    res.json({
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        totalInquiries,
        totalProducts,
        totalViews,
        totalClicks
      },
      statusCounts,
      salesByCategory: categoryData,
      recentOrders,
      topViewedProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
