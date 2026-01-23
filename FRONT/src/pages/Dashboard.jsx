import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { carsAPI, servicesAPI, serviceRecordsAPI, paymentsAPI } from '../api/endpoints';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCars: 0,
    totalServices: 0,
    totalRecords: 0,
    totalPayments: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [carsRes, servicesRes, recordsRes, paymentsRes] = await Promise.all([
        carsAPI.getAll(),
        servicesAPI.getAll(),
        serviceRecordsAPI.getAll(),
        paymentsAPI.getAll()
      ]);

      const carsData = Array.isArray(carsRes.data) ? carsRes.data : [];
      const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : [];
      const recordsData = Array.isArray(recordsRes.data) ? recordsRes.data : [];
      const paymentsData = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];

      const totalRevenue = paymentsData.reduce((sum, p) => sum + (p.AmountPaid || 0), 0);

      setStats({
        totalCars: carsData.length,
        totalServices: servicesData.length,
        totalRecords: recordsData.length,
        totalPayments: paymentsData.length,
        totalRevenue: totalRevenue
      });
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(price);
  };

  const statCards = [
    { label: 'Total Fleet', value: stats.totalCars, icon: '🚗', color: 'blue', link: '/dashboard/cars' },
    { label: 'Repair Services', value: stats.totalServices, icon: '🔧', color: 'emerald', link: '/dashboard/services' },
    { label: 'Service History', value: stats.totalRecords, icon: '📋', color: 'amber', link: '/dashboard/service-records' },
    { label: 'Total Transactions', value: stats.totalPayments, icon: '💳', color: 'indigo', link: '/dashboard/payments' }
  ];

  return (
    <div className="animate-fadeIn">
      <LoadingSpinner isLoading={loading} message="Loading overview..." />

      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Real-time statistics for repair operations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-${card.color}-500/5 rounded-full blur-2xl group-hover:bg-${card.color}-500/10 transition-colors`}></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-${card.color}-500/10 flex items-center justify-center text-xl`}>
                {card.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{card.label}</span>
                <span className="text-2xl font-bold text-slate-900 mt-0.5">{card.value}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity or other sections can go here if needed in the future */}
    </div>
  );
}
