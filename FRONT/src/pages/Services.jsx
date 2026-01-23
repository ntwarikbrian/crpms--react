import React, { useState, useEffect } from 'react';
import { servicesAPI } from '../api/endpoints';
import AlertBox from '../components/AlertBox';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

export default function Services() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    ServiceCode: '',
    ServiceName: '',
    ServicePrice: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredServices(services);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = services.filter(service =>
        service.ServiceName.toLowerCase().includes(lowerTerm) ||
        service.ServiceCode.toLowerCase().includes(lowerTerm)
      );
      setFilteredServices(filtered);
    }
  }, [searchTerm, services]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data || []);
      setFilteredServices(response.data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ServicePrice' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.ServiceCode || !formData.ServiceName || !formData.ServicePrice) {
      setError('❌ All fields are required');
      return;
    }

    if (parseFloat(formData.ServicePrice) <= 0) {
      setError('❌ Service price must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await servicesAPI.create(formData);
      setSuccess('✅ Service added successfully!');
      setTimeout(() => {
        setFormData({ ServiceCode: '', ServiceName: '', ServicePrice: '' });
        setShowForm(false);
        fetchServices();
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to add service');
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

  return (
    <div className="page-container animate-fadeIn">
      <LoadingSpinner isLoading={loading} message="Processing..." />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4 page-header">
        <div>
          <h1 className="page-title text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            Service Management
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Configure repair service catalog and pricing
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Service
        </button>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-slideUp">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name or code..."
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 text-sm text-slate-500 font-medium">
          <span className="bg-slate-100 px-3 py-1 rounded-lg">
            Total: <span className="text-slate-900">{filteredServices.length}</span>
          </span>
        </div>
      </div>

      {success && <AlertBox message={success} type="success" onClose={() => setSuccess('')} />}

      {/* Services Table */}
      <div className="table-container animate-slideUp" style={{ animationDelay: '0.1s' }}>
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-slate-500">No services found</p>
            <p className="text-sm mt-1">Try adjusting your search or add a new service.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-32">Code</th>
                <th>Service Name</th>
                <th className="text-right">Price</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredServices.map((service, index) => (
                <tr
                  key={service.id || index}
                  className="group hover:bg-blue-50/30 transition-colors duration-200"
                >
                  <td className="font-mono text-sm font-semibold text-slate-500">
                    {service.ServiceCode}
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-slate-700">{service.ServiceName}</span>
                    </div>
                  </td>
                  <td className="text-right font-mono font-medium text-emerald-600">
                    {formatPrice(service.ServicePrice)}
                  </td>
                  <td className="text-right">
                    <button className="text-slate-400 hover:text-blue-600 transition-colors p-2" title="Details">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Service"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <AlertBox message={error} type="error" onClose={() => setError('')} />}

          {/* Service Identity */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Service Identity
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Service Code</label>
                <input
                  type="text"
                  name="ServiceCode"
                  value={formData.ServiceCode}
                  onChange={handleChange}
                  placeholder="e.g. SR-001"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-mono text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Service Name</label>
                <input
                  type="text"
                  name="ServiceName"
                  value={formData.ServiceName}
                  onChange={handleChange}
                  placeholder="e.g. Full System Diagnostic"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Pricing
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Standard Price (RWF)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">RWF</span>
                <input
                  type="number"
                  name="ServicePrice"
                  value={formData.ServicePrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full pl-14 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono font-bold text-slate-700 text-sm"
                  required
                  min="0"
                  step="100"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/30 transition-all transform active:scale-95"
            >
              Add Service
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

