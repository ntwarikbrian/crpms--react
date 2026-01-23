import React, { useState, useEffect } from 'react';
import { servicesAPI } from '../api/endpoints';
import AlertBox from '../components/AlertBox';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ServiceCode: '',
    ServiceName: '',
    ServicePrice: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices([]);
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
      setError('All fields are required');
      return;
    }

    if (parseFloat(formData.ServicePrice) <= 0) {
      setError('Service price must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await servicesAPI.create(formData);
      setSuccess('✅ Service added successfully!');
      setFormData({ ServiceCode: '', ServiceName: '', ServicePrice: '' });
      setShowForm(false);
      fetchServices();
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
    <div className="page-container">
      <LoadingSpinner isLoading={loading} message="Processing..." />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="page-title">🔧 Services Management</h1>
            <p className="text-gray-600 mt-2">Manage repair services and their prices</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary flex items-center gap-2"
          >
            <span>➕</span>
            <span>Add Service</span>
          </button>
        </div>

        {success && <AlertBox message={success} type="success" onClose={() => setSuccess('')} />}

        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title="🔧 Add New Service"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <AlertBox message={error} type="error" onClose={() => setError('')} />}

            <div className="space-y-4">
              <div className="input-box">
                <label className="form-label text-sm">Service Code</label>
                <input
                  type="text"
                  name="ServiceCode"
                  value={formData.ServiceCode}
                  onChange={handleChange}
                  placeholder="e.g. SR007"
                  className="form-input"
                  required
                />
              </div>

              <div className="input-box">
                <label className="form-label text-sm">Service Name</label>
                <input
                  type="text"
                  name="ServiceName"
                  value={formData.ServiceName}
                  onChange={handleChange}
                  placeholder="e.g. Engine Repair"
                  className="form-input"
                  required
                />
              </div>

              <div className="input-box">
                <label className="form-label text-sm">Price (RWF)</label>
                <input
                  type="number"
                  name="ServicePrice"
                  value={formData.ServicePrice}
                  onChange={handleChange}
                  placeholder="1000"
                  className="form-input"
                  required
                  step="1000"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
              >
                ✅ Add Service
              </button>
            </div>
          </form>
        </Modal>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 card text-center">
              <p className="text-gray-500 text-lg">No services available yet. 🔧</p>
            </div>
          ) : (
            services.map((service) => (
              <div key={service._id} className="card border-l-4 border-blue-600 cursor-pointer transform hover:scale-105 hover:shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">⚙️ {service.ServiceName}</h3>
                    <p className="text-sm text-gray-600">📋 Code: {service.ServiceCode}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-2xl font-bold text-green-600">💰 {formatPrice(service.ServicePrice)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 text-right text-gray-600 text-sm font-medium">
          📊 Total Services: <span className="text-blue-600 font-bold">{services.length}</span>
        </div>
      </div>
    </div>
  );
}
