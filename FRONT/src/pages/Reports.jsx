import React, { useState, useEffect } from 'react';
import { carsAPI, servicesAPI, serviceRecordsAPI, paymentsAPI } from '../api/endpoints';
import AlertBox from '../components/AlertBox';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reportType, setReportType] = useState('summary');
  const [selectedCar, setSelectedCar] = useState('');
  const [cars, setCars] = useState([]);
  const [reportData, setReportData] = useState({
    summary: null,
    cars: [],
    services: [],
    payments: [],
    records: []
  });

  useEffect(() => {
    fetchCars();
    generateReport('summary');
  }, []);

  const fetchCars = async () => {
    try {
      const carsRes = await carsAPI.getAll();
      setCars(carsRes.data);
    } catch (err) {
      console.error('Failed to fetch cars', err);
    }
  };

  const generateReport = async (type) => {
    setLoading(true);
    try {
      const [carsRes, servicesRes, recordsRes, paymentsRes] = await Promise.all([
        carsAPI.getAll(),
        servicesAPI.getAll(),
        serviceRecordsAPI.getAll(),
        paymentsAPI.getAll()
      ]);

      const cars = carsRes.data;
      const services = servicesRes.data;
      const records = recordsRes.data;
      const payments = paymentsRes.data;

      const totalRevenue = payments.reduce((sum, p) => sum + (p.AmountPaid || 0), 0);
      const avgPayment = payments.length > 0 ? totalRevenue / payments.length : 0;

      setReportData({
        summary: {
          totalCars: cars.length,
          totalServices: services.length,
          totalRecords: records.length,
          totalPayments: payments.length,
          totalRevenue: totalRevenue,
          avgPayment: avgPayment,
          generatedAt: new Date().toLocaleString()
        },
        cars: cars,
        services: services,
        payments: payments,
        records: records
      });

      setReportType(type);
    } catch (err) {
      console.error('Error generating report:', err);
      setReportData({summary: null, cars: [], services: [], payments: [], records: []});
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

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    let htmlContent = '';

    switch (reportType) {
      case 'summary':
        htmlContent = generateSummaryHTML();
        break;
      case 'cars':
        htmlContent = generateCarsReportHTML();
        break;
      case 'services':
        htmlContent = generateServicesReportHTML();
        break;
      case 'payments':
        htmlContent = generatePaymentsReportHTML();
        break;
      case 'records':
        htmlContent = generateRecordsReportHTML();
        break;
      default:
        htmlContent = generateSummaryHTML();
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const generateSummaryHTML = () => {
    const data = reportData.summary;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CRPMS - Summary Report</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #0f766e;
            padding-bottom: 30px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 28px;
            color: #0f766e;
            margin: 0;
          }
          .header p {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 14px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-box {
            background: linear-gradient(135deg, rgba(15, 118, 110, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%);
            padding: 25px;
            border-radius: 10px;
            border-left: 4px solid #0f766e;
            text-align: center;
          }
          .stat-label {
            color: #666;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #0f766e;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #999;
            font-size: 12px;
          }
          @media print {
            body {
              background-color: white;
            }
            .container {
              box-shadow: none;
              border: 1px solid #ddd;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏢 CRPMS - System Summary Report</h1>
            <p>Car Repair Payment Management System</p>
            <p>Generated on: ${data.generatedAt}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">🚗 Total Vehicles</div>
              <div class="stat-value">${data.totalCars}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">🔧 Services</div>
              <div class="stat-value">${data.totalServices}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">📋 Records</div>
              <div class="stat-value">${data.totalRecords}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">💳 Payments</div>
              <div class="stat-value">${data.totalPayments}</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-box" style="grid-column: 1 / -1; border-left-color: #7c3aed;">
              <div class="stat-label">💰 Total Revenue</div>
              <div class="stat-value" style="color: #7c3aed; font-size: 28px;">
                ${data.totalRevenue.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' })}
              </div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-box" style="grid-column: 1 / -1; border-left-color: #22c55e;">
              <div class="stat-label">📊 Average Payment</div>
              <div class="stat-value" style="color: #22c55e; font-size: 28px;">
                ${data.avgPayment.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' })}
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This is an automatically generated report from the CRPMS system.</p>
            <p>For detailed information, please visit the individual sections in the application.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateCarsReportHTML = () => {
    const cars = reportData.cars;
    const rows = cars.map(car => `
      <tr>
        <td>${car.PlateNumber}</td>
        <td>${car.type}</td>
        <td>${car.Model}</td>
        <td>${car.ManufacturingYear}</td>
        <td>${car.DriverPhone}</td>
        <td>${car.MechanicName}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CRPMS - Cars Report</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 10px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #0f766e;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 28px;
            color: #0f766e;
            margin: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background-color: #0f766e;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px 15px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f0f0f0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Cars Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Plate Number</th>
                <th>Type</th>
                <th>Model</th>
                <th>Year</th>
                <th>Driver Phone</th>
                <th>Mechanic</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="6" style="text-align: center;">No cars found</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <p>Total Cars: ${cars.length}</p>
            <p>This report was generated by CRPMS</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateServicesReportHTML = () => {
    const services = reportData.services;
    const rows = services.map(service => `
      <tr>
        <td>${service.ServiceCode}</td>
        <td>${service.ServiceName}</td>
        <td>${service.ServicePrice.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' })}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CRPMS - Services Report</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 10px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #0f766e;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 28px;
            color: #0f766e;
            margin: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background-color: #0f766e;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px 15px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f0f0f0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔧 Services Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Service Code</th>
                <th>Service Name</th>
                <th>Price (RWF)</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="3" style="text-align: center;">No services found</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <p>Total Services: ${services.length}</p>
            <p>This report was generated by CRPMS</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generatePaymentsReportHTML = () => {
    const payments = reportData.payments;
    const total = payments.reduce((sum, p) => sum + (p.AmountPaid || 0), 0);
    const rows = payments.map(payment => `
      <tr>
        <td>${payment.PaymentNumber}</td>
        <td>${new Date(payment.PaymentDate).toLocaleDateString()}</td>
        <td>${payment.PaymentMethod}</td>
        <td style="text-align: right;">${payment.AmountPaid.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' })}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CRPMS - Payments Report</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 10px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #0f766e;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 28px;
            color: #0f766e;
            margin: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #0f766e;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px 15px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f0f0f0;
          }
          .total-box {
            background-color: #f0f0f0;
            padding: 20px;
            border-radius: 10px;
            text-align: right;
            margin-bottom: 30px;
          }
          .total-label {
            color: #666;
            font-size: 14px;
          }
          .total-value {
            font-size: 24px;
            font-weight: 700;
            color: #0f766e;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payments Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>

          <div class="total-box">
            <div class="total-label">Total Revenue</div>
            <div class="total-value">${total.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' })}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Payment #</th>
                <th>Date</th>
                <th>Method</th>
                <th style="text-align: right;">Amount (RWF)</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="4" style="text-align: center;">No payments found</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <p>Total Payments: ${payments.length}</p>
            <p>This report was generated by CRPMS</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateRecordsReportHTML = () => {
    const records = reportData.records;
    const rows = records.map(record => `
      <tr>
        <td>${record.RecordNumber}</td>
        <td>${new Date(record.ServiceDate).toLocaleDateString()}</td>
        <td>${record.Notes || 'N/A'}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CRPMS - Service Records Report</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 1000px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 10px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #0f766e;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 28px;
            color: #0f766e;
            margin: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background-color: #0f766e;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px 15px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f0f0f0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Service Records Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Record #</th>
                <th>Service Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="3" style="text-align: center;">No records found</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <p>Total Records: ${records.length}</p>
            <p>This report was generated by CRPMS</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="page-container">
      <LoadingSpinner isLoading={loading} message="Generating report..." />
      
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="page-title">📊 Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Generate and print comprehensive reports</p>
        </div>

        {success && <AlertBox message={success} type="success" onClose={() => setSuccess('')} />}

        {/* Report Selection */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">📋 Select Report Type</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { id: 'summary', label: '📊 Summary', icon: '📊' },
              { id: 'cars', label: '🚗 Cars', icon: '🚗' },
              { id: 'services', label: '🔧 Services', icon: '🔧' },
              { id: 'payments', label: '💳 Payments', icon: '💳' },
              { id: 'records', label: '📋 Records', icon: '📋' }
            ].map(report => (
              <button
                key={report.id}
                onClick={() => generateReport(report.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  reportType === report.id
                    ? 'border-primary bg-blue-50 text-primary'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary'
                }`}
              >
                <div className="text-2xl mb-2">{report.icon}</div>
                <div className="font-semibold text-sm">{report.label}</div>
              </button>
            ))}
          </div>

          {/* Car Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">🚗 Filter by Car (Optional)</label>
            <select
              value={selectedCar}
              onChange={(e) => setSelectedCar(e.target.value)}
              className="form-input w-full"
            >
              <option value="">All Cars</option>
              {cars.map(car => (
                <option key={car.id} value={car.id}>
                  {car.PlateNumber} - {car.Type} {car.Model}
                </option>
              ))}
            </select>
          </div>

          {/* Print Button */}
          <div className="flex gap-4">
            <button
              onClick={handlePrintReport}
              className="flex-1 btn btn-primary flex items-center justify-center gap-2"
            >
              <span>🖨️</span>
              <span>Print Report</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
            >
              <span>📄</span>
              <span>Export to PDF</span>
            </button>
          </div>
        </div>

        {/* Report Preview */}
        {reportData.summary && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">📈 Report Preview</h2>
            
            {reportType === 'summary' && reportData.summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="input-box text-center">
                  <div className="text-3xl mb-2">🚗</div>
                  <p className="text-gray-600 text-sm">Total Cars</p>
                  <p className="text-2xl font-bold text-primary mt-2">{reportData.summary.totalCars}</p>
                </div>
                <div className="input-box text-center">
                  <div className="text-3xl mb-2">🔧</div>
                  <p className="text-gray-600 text-sm">Services</p>
                  <p className="text-2xl font-bold text-primary mt-2">{reportData.summary.totalServices}</p>
                </div>
                <div className="input-box text-center">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-gray-600 text-sm">Records</p>
                  <p className="text-2xl font-bold text-primary mt-2">{reportData.summary.totalRecords}</p>
                </div>
                <div className="input-box text-center">
                  <div className="text-3xl mb-2">💳</div>
                  <p className="text-gray-600 text-sm">Payments</p>
                  <p className="text-2xl font-bold text-primary mt-2">{reportData.summary.totalPayments}</p>
                </div>
                <div className="input-box text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <p className="text-gray-600 text-sm">Revenue</p>
                  <p className="text-lg font-bold text-secondary mt-2">{formatPrice(reportData.summary.totalRevenue)}</p>
                </div>
              </div>
            )}

            {reportType === 'cars' && reportData.cars.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-3 text-left font-semibold">Plate</th>
                      <th className="px-4 py-3 text-left font-semibold">Type</th>
                      <th className="px-4 py-3 text-left font-semibold">Model</th>
                      <th className="px-4 py-3 text-left font-semibold">Year</th>
                      <th className="px-4 py-3 text-left font-semibold">Driver</th>
                      <th className="px-4 py-3 text-left font-semibold">Mechanic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.cars.map(car => (
                      <tr key={car._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{car.PlateNumber}</td>
                        <td className="px-4 py-3">{car.type}</td>
                        <td className="px-4 py-3">{car.Model}</td>
                        <td className="px-4 py-3">{car.ManufacturingYear}</td>
                        <td className="px-4 py-3">{car.DriverPhone}</td>
                        <td className="px-4 py-3">{car.MechanicName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'services' && reportData.services.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-3 text-left font-semibold">Code</th>
                      <th className="px-4 py-3 text-left font-semibold">Name</th>
                      <th className="px-4 py-3 text-right font-semibold">Price (RWF)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.services.map(service => (
                      <tr key={service._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{service.ServiceCode}</td>
                        <td className="px-4 py-3">{service.ServiceName}</td>
                        <td className="px-4 py-3 text-right">{formatPrice(service.ServicePrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'payments' && reportData.payments.length > 0 && (
              <div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border-l-4 border-blue-600">
                  <p className="text-gray-600 text-sm uppercase tracking-wide">Total Revenue</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {formatPrice(reportData.payments.reduce((sum, p) => sum + (p.AmountPaid || 0), 0))}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="px-4 py-3 text-left font-semibold">Payment #</th>
                        <th className="px-4 py-3 text-left font-semibold">Date</th>
                        <th className="px-4 py-3 text-left font-semibold">Method</th>
                        <th className="px-4 py-3 text-right font-semibold">Amount (RWF)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.payments.map(payment => (
                        <tr key={payment._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{payment.PaymentNumber}</td>
                          <td className="px-4 py-3">{new Date(payment.PaymentDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3">{payment.PaymentMethod}</td>
                          <td className="px-4 py-3 text-right">{formatPrice(payment.AmountPaid)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportType === 'records' && reportData.records.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-3 text-left font-semibold">Record #</th>
                      <th className="px-4 py-3 text-left font-semibold">Service Date</th>
                      <th className="px-4 py-3 text-left font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.records.map(record => (
                      <tr key={record._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{record.RecordNumber}</td>
                        <td className="px-4 py-3">{new Date(record.ServiceDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{record.Notes || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
