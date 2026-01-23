import apiClient from './client';


export const authAPI = {
  register: (username, password) => 
    apiClient.post('/auth/register', { username, password }),
  
  login: (username, password) => 
    apiClient.post('/auth/login', { username, password }),
  
  verify: () => 
    apiClient.get('/auth/verify'),
};


export const servicesAPI = {
  getAll: () => 
    apiClient.get('/services'),
  
  getById: (id) => 
    apiClient.get(`/services/${id}`),
  
  create: (data) => 
    apiClient.post('/services', data),
  
  update: (id, data) => 
    apiClient.put(`/services/${id}`, data),
};

export const carsAPI = {
  getAll: () => 
    apiClient.get('/cars'),
  
  getById: (id) => 
    apiClient.get(`/cars/${id}`),
  
  create: (data) => 
    apiClient.post('/cars', data),
  
  update: (id, data) => 
    apiClient.put(`/cars/${id}`, data),
};


export const serviceRecordsAPI = {
  getAll: () => 
    apiClient.get('/service-records'),
  
  getById: (id) => 
    apiClient.get(`/service-records/${id}`),
  
  create: (data) => 
    apiClient.post('/service-records', data),
  
  update: (id, data) => 
    apiClient.put(`/service-records/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/service-records/${id}`),
};

export const paymentsAPI = {
  getAll: () => 
    apiClient.get('/payments'),
  
  getById: (id) => 
    apiClient.get(`/payments/${id}`),
  
  create: (data) => 
    apiClient.post('/payments', data),
  
  update: (id, data) => 
    apiClient.put(`/payments/${id}`, data),
};

export const reportsAPI = {
  getDailyReport: () => 
    apiClient.get('/reports/daily'),
  
  getBill: (paymentId) => 
    apiClient.get(`/reports/bill/${paymentId}`),
  
  getAllBills: (page = 1, limit = 10) => 
    apiClient.get('/reports', { params: { page, limit } }),
};
