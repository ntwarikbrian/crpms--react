import React, { useState, useEffect } from 'react';
import { paymentsAPI, serviceRecordsAPI, carsAPI } from '../api/endpoints';
import AlertBox from '../components/AlertBox';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [records, setRecords] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    PaymentNumber: '',
    AmountPaid: '',
    PaymentDate: new Date().toISOString().split('T')[0],
    ServiceRecordId: '',
    CarId: '',
    PaymentMethod: 'Cash'
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, recordsRes, carsRes] = await Promise.all([
        paymentsAPI.getAll(),
        serviceRecordsAPI.getAll(),
        carsAPI.getAll()
      ]);
      setPayments(paymentsRes.data);
      setRecords(recordsRes.data);
      setCars(carsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setPayments([]);
      setRecords([]);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'AmountPaid' ? parseFloat(value) : value
    }));
  };

  const handleRecordChange = (e) => {
    const recordId = e.target.value;
    const record = records.find(r => r._id === recordId);
    if (record) {
      setFormData(prev => ({
        ...prev,
        ServiceRecordId: recordId,
        CarId: record.CarId
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Trim and validate all required fields
    const paymentNumber = formData.PaymentNumber?.trim();
    const amountPaid = formData.AmountPaid;
    const serviceRecordId = formData.ServiceRecordId?.trim();
    const carId = formData.CarId?.trim();

    if (!paymentNumber || !amountPaid || !serviceRecordId || !carId) {
      setError('❌ Please fill in all required fields');
      return;
    }

    if (parseFloat(amountPaid) <= 0) {
      setError('❌ Payment amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await paymentsAPI.create(formData);
      setSuccess('✅ Payment recorded successfully!');
      setTimeout(() => {
        setFormData({
          PaymentNumber: '',
          AmountPaid: '',
          PaymentDate: new Date().toISOString().split('T')[0],
          ServiceRecordId: '',
          CarId: '',
          PaymentMethod: 'Cash'
        });
        setShowForm(false);
        fetchAllData();
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const getCarName = (carId) => {
    const car = cars.find(c => c._id === carId);
    return car ? car.PlateNumber : 'Unknown';
  };

  const getRecordDetails = (recordId) => {
    const record = records.find(r => r._id === recordId);
    return record ? record.RecordNumber : 'Unknown';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(price);
  };

  const totalPayments = payments.reduce((sum, p) => sum + (p.AmountPaid || 0), 0);

  return (
    <div className="page-container">
      <LoadingSpinner isLoading={loading} message="Processing..." />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="page-title">💳 Payments</h1>
            <p className="text-gray-600 mt-2">Record and track payments for repairs</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary flex items-center gap-2"
          >
            <span>➕</span>
            <span>Record Payment</span>
          </button>
        </div>

        {success && <AlertBox message={success} type="success" onClose={() => setSuccess('')} />}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="stat-card border-l-4 border-blue-600">
            <p className="stat-label">💰 Total Payments</p>
            <p className="stat-value">{formatPrice(totalPayments)}</p>
          </div>
          <div className="stat-card border-l-4 border-green-600">
            <p className="stat-label">📊 Payment Records</p>
            <p className="stat-value">{payments.length}</p>
          </div>
          <div className="stat-card border-l-4 border-purple-600">
            <p className="stat-label">📈 Avg Payment</p>
            <p className="stat-value">
              {formatPrice(payments.length > 0 ? totalPayments / payments.length : 0)}
            </p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card mb-8 animate-slideDown">
            <h2 className="text-2xl font-bold mb-8 text-gray-900">💳 Record New Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <AlertBox message={error} type="error" onClose={() => setError('')} />}
              {success && <AlertBox message={success} type="success" onClose={() => setSuccess('')} />}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
                      <option key={car.id} value={car.id}>
                        {car.PlateNumber} - {car.Type} {car.Model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Number */}
                <div className="input-box">
                  <label className="form-label text-sm">Payment No.</label>
                  <input
                    type="text"
                    name="PaymentNumber"
                    value={formData.PaymentNumber}
                    onChange={handleChange}
                    placeholder="PAY001"
                    className="form-input h-8 text-sm"
                    required
                  />
                </div>

                {/* Payment Date */}
                <div className="input-box">
                  <label className="form-label text-sm">Date</label>
                  <input
                    type="date"
                    name="PaymentDate"
                    value={formData.PaymentDate}
                    onChange={handleChange}
                    className="form-input h-8 text-sm"
                    required
                  />
                </div>

                {/* Service Record */}
                <div className="input-box">
                  <label className="form-label text-sm">Service Record</label>
                  <select
                    value={formData.ServiceRecordId}
                    onChange={handleRecordChange}
                    className="form-input h-8 text-sm"
                    required
                  >
                    <option value="">Select record...</option>
                    {records.map(record => (
                      <option key={record._id} value={record._id}>
                        {record.RecordNumber} - {getCarName(record.CarId)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Paid */}
                <div className="input-box">
                  <label className="form-label text-sm">Amount (RWF)</label>
                  <input
                    type="number"
                    name="AmountPaid"
                    value={formData.AmountPaid}
                    onChange={handleChange}
                    placeholder="1000"
                    className="form-input h-8 text-sm"
                    required
                    step="1000"
                    min="0"
                  />
                </div>

                {/* Payment Method */}
                <div className="input-box">
                  <label className="form-label text-sm">Method</label>
                  <select
                    name="PaymentMethod"
                    value={formData.PaymentMethod}
                    onChange={handleChange}
                    className="form-input h-8 text-sm"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Check">Check</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                >
                  ✅ Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 btn btn-secondary"
                >
                  ✖️ Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-lg">No payments recorded yet. Record one to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment #</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Record #</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Car</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Method</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={payment._id} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{payment.PaymentNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getRecordDetails(payment.ServiceRecordId)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getCarName(payment.CarId)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatPrice(payment.AmountPaid)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{payment.PaymentMethod}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(payment.PaymentDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
