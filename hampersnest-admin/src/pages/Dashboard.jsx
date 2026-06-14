import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await apiRequest('/api/dashboard/stats');
        setData(statsData);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '15px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-gold)' }}></i>
        <p style={{ color: 'var(--color-gray-text)', fontSize: '0.9rem' }}>Loading executive analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#FFF5F5', border: '1px solid #FFE3E3', color: '#E53E3E', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-admin" style={{ marginTop: '1rem' }}>Retry</button>
      </div>
    );
  }

  const { stats, statusCounts, salesByCategory, monthlyRevenue, inquiryTrends, topSellingProducts, lowStockProducts, recentOrders } = data;

  // Chart Configurations
  const revenueChartData = {
    labels: (Array.isArray(monthlyRevenue) ? monthlyRevenue : []).map(m => m.month),
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: (Array.isArray(monthlyRevenue) ? monthlyRevenue : []).map(m => m.revenue),
        borderColor: '#4A1D5F',
        backgroundColor: 'rgba(74, 29, 95, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const categoryChartData = {
    labels: (Array.isArray(salesByCategory) ? salesByCategory : []).map(c => c.category),
    datasets: [
      {
        data: (Array.isArray(salesByCategory) ? salesByCategory : []).map(c => c.value),
        backgroundColor: [
          '#4A1D5F',
          '#C8A96B',
          '#A8894A',
          '#6B3480',
          '#3A1649',
          '#E8D5A8'
        ],
        borderWidth: 0
      }
    ]
  };

  const categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' }
    }
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* KPI Cards Grid */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card revenue">
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <div className="stat-value">₹{(stats.totalRevenue || 0).toLocaleString()}</div>
          </div>
          <div className="stat-icon">
            <i className="fa-solid fa-indian-rupee-sign"></i>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-info">
            <h3>Total Orders</h3>
            <div className="stat-value">{stats.totalOrders}</div>
          </div>
          <div className="stat-icon">
            <i className="fa-solid fa-box-archive"></i>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: 'var(--color-gold-dark)' }}>
          <div className="stat-info">
            <h3>Active Products</h3>
            <div className="stat-value">{stats.activeProducts} / {stats.totalProducts}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(200, 169, 107, 0.1)', color: 'var(--color-gold-dark)' }}>
            <i className="fa-solid fa-gift"></i>
          </div>
        </div>

        <div className="stat-card inquiries">
          <div className="stat-info">
            <h3>Total Inquiries</h3>
            <div className="stat-value">{stats.totalInquiries}</div>
          </div>
          <div className="stat-icon">
            <i className="fa-solid fa-envelope-open-text"></i>
          </div>
        </div>
      </div>

      {/* Secondary KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card pending">
          <div className="stat-info">
            <h3>Pending Orders</h3>
            <div className="stat-value">{stats.pendingOrders}</div>
          </div>
          <div className="stat-icon">
            <i className="fa-solid fa-clock-rotate-left"></i>
          </div>
        </div>
        
        <div className="stat-card" style={{ borderLeftColor: 'var(--color-delivered)' }}>
          <div className="stat-info">
            <h3>Completed Orders</h3>
            <div className="stat-value">{stats.completedOrders}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(25, 135, 84, 0.1)', color: 'var(--color-delivered)' }}>
            <i className="fa-solid fa-check-double"></i>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#6C757D' }}>
          <div className="stat-info">
            <h3>Conversion Rate</h3>
            <div className="stat-value">{stats.conversionRate}%</div>
          </div>
          <div className="stat-icon" style={{ background: '#F8F9FA', color: '#6C757D' }}>
            <i className="fa-solid fa-chart-line"></i>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Revenue Trend</h3>
          </div>
          <div style={{ height: '300px' }}>
            {monthlyRevenue && monthlyRevenue.length > 0 ? (
              <Line data={revenueChartData} options={revenueOptions} />
            ) : (
              <div className="empty-state">No revenue data available</div>
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Sales By Category</h3>
          </div>
          <div style={{ height: '300px' }}>
            {salesByCategory && salesByCategory.length > 0 ? (
              <Doughnut data={categoryChartData} options={categoryOptions} />
            ) : (
              <div className="empty-state">No category data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Lists Grid */}
      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Recent Orders</h3>
              <Link to="/orders" className="btn-text">View All <i className="fa-solid fa-angle-right"></i></Link>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders && recentOrders.length > 0 ? (
                    (Array.isArray(recentOrders) ? recentOrders : []).map(o => (
                      <tr key={o.orderId}>
                        <td className="font-semibold" style={{ color: 'var(--color-purple)' }}>{o.orderId}</td>
                        <td>{o.customer?.name}</td>
                        <td><span className={`badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                        <td className="font-semibold">₹{o.totalAmount.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>No recent orders</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>System Activity</h3>
            </div>
            <div>
              {data.recentActivity && data.recentActivity.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(Array.isArray(data.recentActivity) ? data.recentActivity : []).map(log => (
                    <li key={log.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingBottom: '10px', borderBottom: '1px solid var(--color-gray-border)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-purple)', marginTop: '6px' }}></div>
                      <div>
                        <div style={{ fontSize: '0.85rem' }}>
                          <strong>{log.adminUser}</strong> performed <strong>{log.action}</strong> on <em>{log.entity}</em>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-text)' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state" style={{ padding: '1rem 0' }}>No recent activity</div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="dashboard-panel">
            <div className="panel-header" style={{ marginBottom: '0.5rem' }}>
              <h3>Top Selling Products</h3>
            </div>
            <div>
              {topSellingProducts && topSellingProducts.length > 0 ? (
                (Array.isArray(topSellingProducts) ? topSellingProducts : []).map((p, idx) => (
                  <div key={idx} className="flex-between" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-gray-border)' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>#{idx + 1}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-purple)' }}>{p.sold} sold</span>
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{ padding: '1rem 0' }}>No sales data</div>
              )}
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header" style={{ marginBottom: '0.5rem' }}>
              <h3 style={{ color: '#E53E3E' }}><i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>Low Stock Alerts</h3>
              <Link to="/inventory" className="btn-text" style={{ color: '#E53E3E' }}>Manage</Link>
            </div>
            <div>
              {lowStockProducts && lowStockProducts.length > 0 ? (
                (Array.isArray(lowStockProducts) ? lowStockProducts : []).map((p, idx) => (
                  <div key={idx} className="flex-between" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-gray-border)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{p.name}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E53E3E', background: '#FFE3E3', padding: '2px 8px', borderRadius: '4px' }}>{p.stock} left</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-text)', padding: '1rem 0', textAlign: 'center' }}>Inventory levels look good.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
