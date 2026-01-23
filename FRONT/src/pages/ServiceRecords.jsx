import React, { useState, useEffect } from 'react';
import { serviceRecordsAPI, carsAPI, servicesAPI } from '../api/endpoints';
import AlertBox from '../components/AlertBox';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

export default function ServiceRecords() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [cars, setCars] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRecords(records);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = records.filter(record =>
        record.RecordNumber?.toLowerCase().includes(lowerTerm) ||
        getCarName(record.CarId).toLowerCase().includes(lowerTerm) ||
        getServiceName(record.ServiceId).toLowerCase().includes(lowerTerm)
      );
      setFilteredRecords(filtered);
    }
  }, [searchTerm, records, cars, services]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [recordsRes, carsRes, servicesRes] = await Promise.all([
        serviceRecordsAPI.getAll(),
        carsAPI.getAll(),
        servicesAPI.getAll()
      ]);
      setRecords(recordsRes.data || []);
      setFilteredRecords(recordsRes.data || []);
      setCars(carsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setRecords([]);
      setFilteredRecords([]);
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
        resetForm();
        setShowForm(false);
        fetchAllData();
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      RecordNumber: '',
      ServiceDate: new Date().toISOString().split('T')[0],
      CarId: '',
      ServiceId: '',
      Notes: ''
    });
  };

  const handleEdit = (record) => {
    setFormData({
      RecordNumber: record.RecordNumber,
      ServiceDate: record.ServiceDate.split('T')[0],
      CarId: record.CarId,
      ServiceId: record.ServiceId,
      Notes: record.Notes || ''
    });
    setEditingId(record.id);
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
    resetForm();
  };

  const getCarName = (carId) => {
    const car = cars.find(c => c.id === carId);
    return car ? `${car.PlateNumber} - ${car.Model}` : 'Unknown Vehicle';
  };

  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.ServiceName : 'Unknown Service';
  };

  return (
    <div className="page-container animate-fadeIn">
      <LoadingSpinner isLoading={loading} message="Processing..." />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4 page-header">
        <div>
          <h1 className="page-title text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            Service History
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Track and manage all repair and maintenance records
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(true);
          }}
          className="btn btn-primary shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Record
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
            placeholder="Search by ID, plate, or service..."
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 text-sm text-slate-500 font-medium">
          <span className="bg-slate-100 px-3 py-1 rounded-lg">
            Total: <span className="text-slate-900">{filteredRecords.length}</span>
          </span>
        </div>
      </div>

      {success && <AlertBox message={success} type="success" onClose={() => setSuccess('')} />}

      {/* Main Content */}
      <div className="table-container animate-slideUp" style={{ animationDelay: '0.1s' }}>
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-slate-500">No records found</p>
            <p className="text-sm mt-1">Try adjusting your search or create a new record.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-32">Record No.</th>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Service Date</th>
                <th>Status</th>
                <th>Notes</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.map((record, index) => (
                <tr
                  key={record._id || record.id || index}
                  className="group hover:bg-blue-50/30 transition-colors duration-200"
                >
                  <td className="font-mono text-sm font-semibold text-blue-600">
                    {record.RecordNumber}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-lg">
                        🚗
                      </div>
                      <span className="font-medium text-slate-700">{getCarName(record.CarId)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-medium text-slate-700">{getServiceName(record.ServiceId)}</span>
                  </td>
                  <td className="text-slate-500">
                    {new Date(record.ServiceDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${record.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'
                        }`}></span>
                      {record.status || 'Pending'}
                    </span>
                  </td>
                  <td className="max-w-xs truncate text-slate-500 text-sm" title={record.Notes}>
                    {record.Notes || <span className="text-slate-300 italic">No notes</span>}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(record)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Record"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(record._id || record.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Record"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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
        onClose={handleCancel}
        title={editingId ? 'Edit Service Record' : 'New Service Record'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <AlertBox message={error} type="error" onClose={() => setError('')} />}

          {/* Section 1: Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Record Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Record Number</label>
                <input
                  type="text"
                  name="RecordNumber"
                  value={formData.RecordNumber}
                  onChange={handleChange}
                  placeholder="e.g. REC-2024-001"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-mono text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Service Date</label>
                <input
                  type="date"
                  name="ServiceDate"
                  value={formData.ServiceDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Assignment */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Assignment
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Vehicle</label>
                <select
                  name="CarId"
                  value={formData.CarId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  required
                >
                  <option value="">Select a vehicle...</option>
                  {cars.map(car => (
                    <option key={car.id} value={car.id}>
                      {car.PlateNumber} - {car.Model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Service Type</label>
                <select
                  name="ServiceId"
                  value={formData.ServiceId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  required
                >
                  <option value="">Select service type...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.ServiceName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Additional Notes</label>
            <textarea
              name="Notes"
              value={formData.Notes}
              onChange={handleChange}
              placeholder="Enter any observations, parts used, or mechanic notes..."
              rows="3"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-sm placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/30 transition-all transform active:scale-95"
            >
              {editingId ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

