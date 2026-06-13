import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';

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
        <p style={{ color: 'var(--color-gray-text)', fontSize: '0.9rem' }}>Loading dashboard analytics...</p>
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

  const { stats, salesByCategory, recentOrders, topViewedProducts } = data;

  // Find the highest category sale value to scale the progress charts
  const maxCategorySale = salesByCategory && salesByCategory.length > 0 
    ? Math.max(...salesByCategory.map(c => c.value)) 
    : 1;

  const shopConversionRate = stats.totalViews > 0
    ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(1)
    : 0;

  return (
    <div>
      {/* 1. Core Financial/Order Statistics Grid */}
      <div className="stats-grid" style={{ marginBottom: '1.2rem' }}>
        <div className="stat-card revenue">
          <div className="stat-info">
            <h3>Revenue (Confirmed)</h3>
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

        <div className="stat-card pending">
          <div className="stat-info">
            <h3>Pending Orders</h3>
            <div className="stat-value">{stats.pendingOrders}</div>
          </div>
          <div className="stat-icon">
            <i className="fa-solid fa-clock-rotate-left"></i>
          </div>
        </div>

        <div className="stat-card inquiries">
          <div className="stat-info">
            <h3>Customer Inquiries</h3>
            <div className="stat-value">{stats.totalInquiries}</div>
          </div>
          <div className="stat-icon">
            <i className="fa-solid fa-envelope-open-text"></i>
          </div>
        </div>
      </div>

      {/* Traffic & Conversion Analytics Grid */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card" style={{ borderLeftColor: 'var(--color-gold-dark)' }}>
          <div className="stat-info">
            <h3>Total Product Views</h3>
            <div className="stat-value">{stats.totalViews || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(200, 169, 107, 0.1)', color: 'var(--color-gold-dark)' }}>
            <i className="fa-regular fa-eye"></i>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: 'var(--color-purple)' }}>
          <div className="stat-info">
            <h3>Total Cart Clicks</h3>
            <div className="stat-value">{stats.totalClicks || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(74, 29, 95, 0.08)', color: 'var(--color-purple)' }}>
            <i className="fa-solid fa-arrow-pointer"></i>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: 'var(--color-delivered)' }}>
          <div className="stat-info">
            <h3>Conversion Rate</h3>
            <div className="stat-value">{shopConversionRate}%</div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(25, 135, 84, 0.1)', color: 'var(--color-delivered)' }}>
            <i className="fa-solid fa-chart-line"></i>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#6C757D', opacity: 0.85 }}>
          <div className="stat-info">
            <h3>Average Order Value</h3>
            <div className="stat-value">
              ₹{stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#F8F9FA', color: '#6C757D' }}>
            <i className="fa-solid fa-calculator"></i>
          </div>
        </div>
      </div>

      {/* 2. Main Dashboard Breakdown Layout */}
      <div className="dashboard-grid">
        
        {/* Recent Orders List */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Recent Orders</h3>
            <Link to="/orders" className="btn-text">View All Orders <i className="fa-solid fa-angle-right"></i></Link>
          </div>

          <div className="table-responsive">
            {recentOrders && recentOrders.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Celebration</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td className="font-semibold" style={{ color: 'var(--color-purple-dark)' }}>{order.orderId}</td>
                      <td>{order.customer.name}</td>
                      <td>{order.eventType}</td>
                      <td className="font-semibold">₹{order.totalAmount.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-gray-text)', fontSize: '0.8rem' }}>
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <i className="fa-solid fa-cart-shopping"></i>
                <p>No orders registered yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sales by Category (CSS Visual Chart) */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Category Performance</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
            {salesByCategory && salesByCategory.length > 0 ? (
              salesByCategory.map((cat) => {
                const percentage = maxCategorySale > 0 ? (cat.value / maxCategorySale) * 100 : 0;
                return (
                  <div key={cat.category}>
                    <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '500' }}>{cat.category}</span>
                      <span className="font-semibold" style={{ color: 'var(--color-purple)' }}>
                        ₹{cat.value.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--color-lavender)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          background: 'var(--gold-gradient)',
                          width: `${percentage}%`,
                          borderRadius: '4px',
                          transition: 'width 0.8s ease'
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                <i className="fa-solid fa-chart-pie" style={{ fontSize: '2rem' }}></i>
                <p style={{ fontSize: '0.85rem' }}>No sales distribution recorded.</p>
              </div>
            )}
            
            <div style={{ marginTop: '1rem', padding: '12px', background: 'var(--color-lavender)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--color-purple)' }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i>
              Stats show revenue from Confirmed, Shipped, and Delivered orders.
            </div>
          </div>
        </div>

        {/* Popular Hampers (Views and conversion rates) */}
        <div className="dashboard-panel" style={{ marginTop: '0.1rem' }}>
          <div className="panel-header">
            <h3>Popular Hampers (Views & Conv.)</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '0.5rem' }}>
            {topViewedProducts && topViewedProducts.length > 0 ? (
              topViewedProducts.map((p, idx) => {
                const convRate = p.views > 0 
                  ? ((p.clicks / p.views) * 100).toFixed(0) 
                  : 0;
                return (
                  <div key={idx} className="flex-between" style={{ fontSize: '0.82rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--color-gray-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-gold-dark)' }}>#{idx + 1}</span>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: 'var(--color-gray-text)', fontSize: '0.8rem' }} title="Views">
                        <i className="fa-regular fa-eye" style={{ marginRight: '4px' }}></i>{p.views}
                      </span>
                      <span className="font-semibold" style={{ color: 'var(--color-purple)', fontSize: '0.8rem' }} title="Conversion Rate">
                        {convRate}% conv
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state" style={{ padding: '1rem 0' }}>
                <p style={{ fontSize: '0.8rem' }}>No product views recorded yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
