import React, { useState, useEffect } from 'react';
import api from '../api/api';
import '../styles/Analytics.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Analytics = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalSales: 0,
        totalInventory: 0,
        recentSales: [],
        salesTrend: [],
        categoryDist: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await api.get('/artists/analytics');
                console.log('Analytics Data:', data);
                setStats(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className="analytics-container"><p>Loading analytics...</p></div>;

    // Line Chart Data (Sales Trend)
    const lineChartData = {
        labels: stats.salesTrend?.map(d => d.date) || [],
        datasets: [
            {
                label: 'Revenue (₹)',
                data: stats.salesTrend?.map(d => d.revenue) || [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.3
            }
        ]
    };

    const lineChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Sales Revenue Trend' }
        }
    };

    // Doughnut Chart Data (Category Distribution)
    const doughnutData = {
        labels: stats.categoryDist?.map(d => d.name) || [],
        datasets: [
            {
                label: '# of Sales',
                data: stats.categoryDist?.map(d => d.value) || [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="analytics-container">
            <h2>Dashboard Analytics</h2>

            <div className="stats-grid">
                <div className="stat-card revenue-card">
                    <h3>Total Revenue</h3>
                    <p className="stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Sales</h3>
                    <p className="stat-value">{stats.totalSales}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Inventory</h3>
                    <p className="stat-value">{stats.totalInventory}</p>
                </div>
            </div>

            <div className="analytics-lower-section" style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '40px' }}>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {/* Line Chart */}
                    <div className="chart-container" style={{ flex: 2, minWidth: '300px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Line options={lineChartOptions} data={lineChartData} />
                    </div>

                    {/* Doughnut Chart */}
                    <div className="chart-container" style={{ flex: 1, minWidth: '300px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '300px' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Sales by Category</h3>
                            <Doughnut data={doughnutData} />
                        </div>
                    </div>
                </div>

                {/* Recent Sales List */}
                <div className="recent-sales-list" style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '20px' }}>Recent Sales</h3>
                    {stats.recentSales.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {stats.recentSales.map((sale) => (
                                <li key={sale.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '500' }}>{sale.title}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(sale.date).toLocaleDateString()}</span>
                                    </div>
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>+₹{sale.price}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#888', fontStyle: 'italic' }}>No sales recorded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
