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
      setReportData({ summary: null, cars: [], services: [], payments: [], records: [] });
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
    <div className="page-container bg-slate-50/50 min-h-screen">
      <LoadingSpinner isLoading={loading} message="Generating Intelligence Report..." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-blue-500/10 rounded-xl text-blue-600">📊</span>
              Reports & Analytics
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Generate, analyze, and export repair ecosystem data</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handlePrintReport}
              className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <span>🖨️</span> Print Master Report
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
            >
              <span>📄</span> Native PDF
            </button>
          </div>
        </div>

        {success && <AlertBox message={success} type="success" onClose={() => setSuccess('')} />}

        {/* Intelligence Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200/60">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Intelligence Parameter
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { id: 'summary', label: 'Summary', icon: '📊', color: 'blue' },
                  { id: 'cars', label: 'Fleet', icon: '🚗', color: 'emerald' },
                  { id: 'services', label: 'Repairs', icon: '🔧', color: 'amber' },
                  { id: 'payments', label: 'Finance', icon: '💳', color: 'indigo' },
                  { id: 'records', label: 'History', icon: '📋', color: 'slate' }
                ].map(report => (
                  <button
                    key={report.id}
                    onClick={() => generateReport(report.id)}
                    className={`group relative p-4 rounded-2xl border transition-all duration-300 ${reportType === report.id
                        ? `border-${report.color}-500 bg-${report.color}-50 text-${report.color}-700 ring-4 ring-${report.color}-500/10`
                        : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-white'
                      }`}
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{report.icon}</div>
                    <div className="font-bold text-xs uppercase tracking-tight">{report.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200/60 h-full">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                Fleet Filter
              </h2>

              <div className="space-y-4">
                <div className="input-box">
                  <label className="form-label text-[10px] text-slate-400 mb-2">Target Vehicle</label>
                  <select
                    value={selectedCar}
                    onChange={(e) => setSelectedCar(e.target.value)}
                    className="form-input bg-slate-50 border-slate-200"
                  >
                    <option value="">Global Fleet (All Units)</option>
                    {cars.map(car => (
                      <option key={car._id} value={car._id}>
                        {car.PlateNumber} • {car.Model}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  Filtering updates the preview below but does not affect the global Master Export.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Area */}
        {reportData.summary && (
          <div className="space-y-8 animate-slideUp">
            <div className="flex items-center gap-4 px-2">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Intelligence Preview</span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <div className="bg-white rounded-[40px] p-8 lg:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-white">
              {reportType === 'summary' && reportData.summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 group hover:bg-blue-50 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl mb-4">🚗</div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Fleet Assets</p>
                    <p className="text-3xl font-bold text-slate-900">{reportData.summary.totalCars}</p>
                  </div>
                  <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 group hover:bg-emerald-50 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl mb-4">🔧</div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Repair Matrix</p>
                    <p className="text-3xl font-bold text-slate-900">{reportData.summary.totalServices}</p>
                  </div>
                  <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 group hover:bg-amber-50 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl mb-4">📋</div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">History Logs</p>
                    <p className="text-3xl font-bold text-slate-900">{reportData.summary.totalRecords}</p>
                  </div>
                  <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 group hover:bg-indigo-50 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl mb-4">💰</div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Gross Yield</p>
                    <p className="text-xl font-bold text-slate-900">{formatPrice(reportData.summary.totalRevenue)}</p>
                  </div>
                </div>
              )}

              {reportType === 'cars' && reportData.cars.length > 0 && (
                <div className="overflow-hidden rounded-3xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Plate</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Type</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Model</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Year</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Driver Contact</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Mechanic</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {reportData.cars.map(car => (
                        <tr key={car._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 font-bold text-blue-600">{car.PlateNumber}</td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{car.type}</td>
                          <td className="px-6 py-4 text-slate-900 font-semibold">{car.Model}</td>
                          <td className="px-6 py-4 text-slate-500">{car.ManufacturingYear}</td>
                          <td className="px-6 py-4 text-slate-600 font-mono">{car.DriverPhone}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[11px] font-bold text-slate-600">{car.MechanicName}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === 'services' && reportData.services.length > 0 && (
                <div className="overflow-hidden rounded-3xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Code</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Service Portfolio</th>
                        <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase tracking-widest text-[10px]">Standard Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {reportData.services.map(service => (
                        <tr key={service._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-amber-600">{service.ServiceCode}</td>
                          <td className="px-6 py-4 text-slate-900 font-bold">{service.ServiceName}</td>
                          <td className="px-6 py-4 text-right text-slate-900 font-bold">{formatPrice(service.ServicePrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === 'payments' && reportData.payments.length > 0 && (
                <div className="space-y-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-10 rounded-[32px] bg-slate-900 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mt-20 -mr-20"></div>
                    <div className="relative z-10">
                      <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                        Consolidated Revenue
                      </p>
                      <p className="text-4xl font-bold">
                        {formatPrice(reportData.payments.reduce((sum, p) => sum + (p.AmountPaid || 0), 0))}
                      </p>
                    </div>
                    <div className="mt-6 sm:mt-0 relative z-10 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-right">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Transaction Count</p>
                      <p className="text-2xl font-bold">{reportData.payments.length} Units</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-3xl border border-slate-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                          <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Payment ID</th>
                          <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Settled On</th>
                          <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Channel</th>
                          <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase tracking-widest text-[10px]">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {reportData.payments.map(payment => (
                          <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-indigo-600">{payment.PaymentNumber}</td>
                            <td className="px-6 py-4 text-slate-600">{new Date(payment.PaymentDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase">{payment.PaymentMethod}</span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-900">{formatPrice(payment.AmountPaid)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportType === 'records' && reportData.records.length > 0 && (
                <div className="overflow-hidden rounded-3xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Log ID</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Operation Date</th>
                        <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase tracking-widest text-[10px]">Findings / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {reportData.records.map(record => (
                        <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{record.RecordNumber}</td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{new Date(record.ServiceDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-slate-500 italic max-w-md truncate">{record.Notes || 'No technical observations recorded'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
