import { Product, Order, Inquiry } from '../database/models.js';
import { Op, fn, col } from 'sequelize';

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const activeProducts = await Product.count({ where: { isActive: true } });
    const totalInquiries = await Inquiry.count();
    
    const orders = await Order.findAll();
    const inquiries = await Inquiry.findAll();
    const productsAnalytics = await Product.findAll({ attributes: ['id', 'name', 'views', 'clicks', 'category', 'stockQuantity'] });
    
    let totalRevenue = 0;
    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Packed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0
    };

    const monthlyRevenue = {};
    const ordersByMonth = {};
    const inquiryTrends = {};

    // Grouping orders by status and month
    orders.forEach(order => {
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status]++;
      }
      
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;

      if (['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'].includes(order.status)) {
        totalRevenue += order.totalAmount;
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.totalAmount;
      }
    });

    inquiries.forEach(inq => {
      const month = new Date(inq.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      inquiryTrends[month] = (inquiryTrends[month] || 0) + 1;
    });

    const salesByCategory = {};
    const productCategoryMap = {};
    const topSellingMap = {};

    productsAnalytics.forEach(p => {
      productCategoryMap[p.id] = p.category;
    });

    orders.forEach(order => {
      if (['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'].includes(order.status)) {
        const itemsList = Array.isArray(order.items) ? order.items : [];
        itemsList.forEach(item => {
          const category = productCategoryMap[item.productId] || 'Other';
          const itemSalesValue = item.price * item.quantity;
          salesByCategory[category] = (salesByCategory[category] || 0) + itemSalesValue;
          
          // Track top selling products
          topSellingMap[item.productId] = (topSellingMap[item.productId] || 0) + item.quantity;
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

    const recentInquiries = await Inquiry.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // For Activity Feed (Phase 9)
    const { AuditLog } = await import('../database/models.js');
    const recentActivity = await AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    let totalViews = 0;
    let totalClicks = 0;
    const lowStockProducts = [];

    productsAnalytics.forEach(p => {
      totalViews += (p.views || 0);
      totalClicks += (p.clicks || 0);
      if (p.stockQuantity <= 5) {
        lowStockProducts.push({ id: p.id, name: p.name, stock: p.stockQuantity });
      }
    });

    const topViewedProducts = [...productsAnalytics]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        views: p.views || 0,
        clicks: p.clicks || 0
      }));

    const topSellingProductsList = Object.keys(topSellingMap)
      .sort((a, b) => topSellingMap[b] - topSellingMap[a])
      .slice(0, 5)
      .map(id => {
        const prod = productsAnalytics.find(p => p.id === id);
        return {
          id,
          name: prod ? prod.name : 'Unknown Product',
          sold: topSellingMap[id]
        };
      });

    res.json({
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        pendingOrders: statusCounts['Pending'],
        completedOrders: statusCounts['Delivered'],
        totalInquiries,
        totalProducts,
        activeProducts,
        totalViews,
        totalClicks,
        conversionRate: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0
      },
      statusCounts,
      salesByCategory: categoryData,
      monthlyRevenue: Object.keys(monthlyRevenue).map(k => ({ month: k, revenue: monthlyRevenue[k] })),
      ordersByMonth: Object.keys(ordersByMonth).map(k => ({ month: k, count: ordersByMonth[k] })),
      inquiryTrends: Object.keys(inquiryTrends).map(k => ({ month: k, count: inquiryTrends[k] })),
      recentOrders,
      recentInquiries,
      recentActivity,
      topViewedProducts,
      topSellingProducts: topSellingProductsList,
      lowStockProducts: lowStockProducts.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
