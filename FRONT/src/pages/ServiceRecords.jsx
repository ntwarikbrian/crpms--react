import React, { useState, useEffect } from 'react';
import { serviceRecordsAPI, carsAPI, servicesAPI } from '../api/endpoints';
import AlertBox from '../components/AlertBox';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ServiceRecords() {
  const [records, setRecords] = useState([]);
  const [cars, setCars] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    RecordNumber: '',
    ServiceDate: new Date().toISOString().split('T')[0],
    CarId: '',
    ServiceId: '',
    Notes: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [recordsRes, carsRes, servicesRes] = await Promise.all([
        serviceRecordsAPI.getAll(),
        carsAPI.getAll(),
        servicesAPI.getAll()
      ]);
      setRecords(recordsRes.data);
      setCars(carsRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setRecords([]);
      setCars([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Trim and validate all required fields
    const recordNumber = formData.RecordNumber?.trim();
    const serviceDate = formData.ServiceDate?.trim();
    const carId = formData.CarId?.trim();
    const serviceId = formData.ServiceId?.trim();

    if (!recordNumber || !serviceDate || !carId || !serviceId) {
      setError('❌ Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await serviceRecordsAPI.update(editingId, formData);
        setSuccess('✅ Service record updated successfully!');
        setEditingId(null);
      } else {
        await serviceRecordsAPI.create(formData);
        setSuccess('✅ Service record created successfully!');
      }
      setTimeout(() => {
        setFormData({
          RecordNumber: '',
          ServiceDate: new Date().toISOString().split('T')[0],
          CarId: '',
          ServiceId: '',
          Notes: ''
        });
        setShowForm(false);
        fetchAllData();
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setFormData({
      RecordNumber: record.RecordNumber,
      ServiceDate: record.ServiceDate.split('T')[0],
      CarId: record.CarId,
      ServiceId: record.ServiceId,
      Notes: record.Notes || ''
    });
    setEditingId(record._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    setLoading(true);
    try {
      await serviceRecordsAPI.delete(id);
      setSuccess('Service record deleted successfully!');
      await fetchAllData();
    } catch (err) {
      setError('Failed to delete record');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      RecordNumber: '',
      ServiceDate: new Date().toISOString().split('T')[0],
      CarId: '',
      ServiceId: '',
      Notes: ''
    });
  };

  const getCarName = (carId) => {
    const car = cars.find(c => c._id === carId);
    return car ? car.PlateNumber : 'Unknown';
  };

  const getServiceName = (serviceId) => {
    const service = services.find(s => s._id === serviceId);
    return service ? service.ServiceName : 'Unknown';
  };

  return (
    <div className="page-container">
      <LoadingSpinner isLoading={loading} message="Processing..." />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="page-title">📋 Service Records</h1>
            <p className="text-gray-600 mt-2">Create, update, and manage service records</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (editingId) handleCancel();
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <span>➕</span>
            <span>{editingId ? 'Cancel' : 'New Record'}</span>
          </button>
        </div>

        {success && <AlertBox message={success} type="success" onClose={() => setSuccess('')} />}

        {/* Form */}
        {showForm && (
          <div className="card mb-8 animate-slideDown">
            <h2 className="text-2xl font-bold mb-8 text-gray-900">
              {editingId ? '✏️ Edit Service Record' : '📋 Create New Service Record'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <AlertBox message={error} type="error" onClose={() => setError('')} />}
              {success && <AlertBox message={success} type="success" onClose={() => setSuccess('')} />}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Record Number */}
                <div className="input-box">
                  <label className="form-label text-sm">Record No.</label>
                  <input
                    type="text"
                    name="RecordNumber"
                    value={formData.RecordNumber}
                    onChange={handleChange}
                    placeholder="REC001"
                    className="form-input h-8 text-sm"
                    required
                  />
                </div>

                {/* Service Date */}
                <div className="input-box">
                  <label className="form-label text-sm">Date</label>
                  <input
                    type="date"
                    name="ServiceDate"
                    value={formData.ServiceDate}
                    onChange={handleChange}
                    className="form-input h-8 text-sm"
                    required
                  />
                </div>

                {/* Select Car */}
                <div className="input-box">
                  <label className="form-label text-sm">Car</label>
                  <select
                    name="CarId"
                    value={formData.CarId}
                    onChange={handleChange}
                    className="form-input h-8 text-sm"
                    required
                  >
                    <option value="">Choose car...</option>
                    {cars.map(car => (
                      <option key={car._id} value={car._id}>
                        {car.PlateNumber} - {car.Model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Service */}
                <div className="input-box">
                  <label className="form-label text-sm\">Service</label>\n                  <select
                    name="ServiceId"
                    value={formData.ServiceId}
                    onChange={handleChange}
                    className="form-input h-8 text-sm"
                    required
                  >
                    <option value="">Choose service...</option>
                    {services.map(service => (
                      <option key={service._id} value={service._id}>
                        {service.ServiceName} - RWF {service.ServicePrice.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="input-box">
                  <label className="form-label text-sm">Notes</label>
                  <textarea
                    name="Notes"
                    value={formData.Notes}
                    onChange={handleChange}
                    placeholder="Notes..."
                    rows="1"
                    className="form-input h-8 text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingId ? 'Update Record' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {records.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-lg">No service records yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Record #</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Car</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={record._id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{record.RecordNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getCarName(record.CarId)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getServiceName(record.ServiceId)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(record.ServiceDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.Notes || '-'}</td>
                      <td className="px-4 py-3 text-sm flex gap-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 text-right text-gray-500 text-sm">
          Total Records: {records.length}
        </div>
      </div>
    </div>
  );
}
