import React, { useState, useEffect } from 'react';
import { carsAPI } from '../api/endpoints';
import AlertBox from '../components/AlertBox';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    PlateNumber: '',
    Type: '',
    Model: '',
    ManufacturingYear: new Date().getFullYear(),
    DriverPhone: '',
    MechanicName: ''
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await carsAPI.getAll();
      setCars(response.data);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ManufacturingYear' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Trim values to check
    const plate = formData.PlateNumber?.trim();
    const type = formData.Type?.trim();
    const model = formData.Model?.trim();
    const phone = formData.DriverPhone?.trim();
    const mechanic = formData.MechanicName?.trim();

    if (!plate || !type || !model || !phone || !mechanic) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await carsAPI.create(formData);
      setSuccess('✅ Car added successfully!');
      setTimeout(() => {
        setFormData({
          PlateNumber: '',
          Type: '',
          Model: '',
          ManufacturingYear: new Date().getFullYear(),
          DriverPhone: '',
          MechanicName: ''
        });
        setShowForm(false);
        fetchCars();
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to add car');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <LoadingSpinner isLoading={loading} message="Processing..." />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="page-title">🚗 Cars Management</h1>
            <p className="text-gray-600 mt-2">Manage and track all vehicles in the system</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary flex items-center gap-2"
          >
            <span>➕</span>
            <span>Add New Car</span>
          </button>
        </div>

        {success && <AlertBox message={success} type="success" onClose={() => setSuccess('')} />}

        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title="🚗 Add New Car"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <AlertBox message={error} type="error" onClose={() => setError('')} />}

            <div className="space-y-6">
              {/* Group 1: Vehicle Information */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-4 h-px bg-slate-200"></span>
                  Vehicle Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="input-box">
                    <label className="form-label text-sm text-slate-600">Plate Number</label>
                    <input
                      type="text"
                      name="PlateNumber"
                      value={formData.PlateNumber}
                      onChange={handleChange}
                      placeholder="e.g. RAL123A"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="input-box">
                    <label className="form-label text-sm text-slate-600">Vehicle Type</label>
                    <input
                      type="text"
                      name="Type"
                      value={formData.Type}
                      onChange={handleChange}
                      placeholder="e.g. Sedan, SUV"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="input-box sm:col-span-2">
                    <label className="form-label text-sm text-slate-600">Model Name</label>
                    <input
                      type="text"
                      name="Model"
                      value={formData.Model}
                      onChange={handleChange}
                      placeholder="e.g. Toyota Camry"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Management & Assignment */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-4 h-px bg-slate-200"></span>
                  Management & Assignment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="input-box">
                    <label className="form-label text-sm text-slate-600">Manufacturing Year</label>
                    <input
                      type="number"
                      name="ManufacturingYear"
                      value={formData.ManufacturingYear}
                      onChange={handleChange}
                      placeholder="2024"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="input-box">
                    <label className="form-label text-sm text-slate-600">Driver Phone</label>
                    <input
                      type="tel"
                      name="DriverPhone"
                      value={formData.DriverPhone}
                      onChange={handleChange}
                      placeholder="+250..."
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="input-box sm:col-span-2">
                    <label className="form-label text-sm text-slate-600">Assigned Mechanic</label>
                    <input
                      type="text"
                      name="MechanicName"
                      value={formData.MechanicName}
                      onChange={handleChange}
                      placeholder="Mechanic name"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
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
                ✅ Add Car
              </button>
            </div>
          </form>
        </Modal>

        {/* Cars Table */}
        <div className="card">
          {cars.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-lg">No cars registered yet. Add one to get started! 🚗</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>🚘 Plate Number</th>
                    <th>📦 Type</th>
                    <th>🏷️ Model</th>
                    <th>📅 Year</th>
                    <th>📱 Driver Phone</th>
                    <th>👨‍🔧 Mechanic</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car._id}>
                      <td className="font-bold">{car.PlateNumber}</td>
                      <td>{car.type}</td>
                      <td>{car.Model}</td>
                      <td>{car.ManufacturingYear}</td>
                      <td>{car.DriverPhone}</td>
                      <td>{car.MechanicName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 text-right text-gray-600 text-sm font-medium">
          📊 Total Cars: <span className="text-blue-600 font-bold">{cars.length}</span>
        </div>
      </div>
    </div>
  );
}
