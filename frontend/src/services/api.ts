import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  signup: (data: { name: string; mobile: string }) =>
    api.post('/api/auth/signup', data),
  login: (data: { mobile: string }) =>
    api.post('/api/auth/login', data),
};

export const otpService = {
  send: (user_id: string, mobile: string) =>
    api.post('/api/otp/send', { user_id, mobile }),
  verify: (user_id: string, otp: string) =>
    api.post('/api/otp/verify', { user_id, otp }),
  resend: (user_id: string, mobile: string) =>
    api.post('/api/otp/resend', { user_id, mobile }),
};

export const productService = {
  list: (category?: string, search?: string) =>
    api.get('/api/products', { params: { category, search } }),
  get: (product_id: string) =>
    api.get(`/api/products/${product_id}`),
};

export const cartService = {
  get: (user_id: string = 'USR-101') =>
    api.get('/api/cart', { params: { user_id } }),
  add: (user_id: string, product_id: string, quantity: number = 1) =>
    api.post('/api/cart/items', { user_id, product_id, quantity }),
  update: (item_id: string, user_id: string, quantity: number) =>
    api.put(`/api/cart/items/${item_id}`, { user_id, quantity }),
  remove: (item_id: string, user_id: string = 'USR-101') =>
    api.delete(`/api/cart/items/${item_id}`, { params: { user_id } }),
};

export const orderService = {
  create: (data: any) =>
    api.post('/api/orders', data),
  get: (order_id: string) =>
    api.get(`/api/orders/${order_id}`),
};

export const paymentService = {
  process: (data: {
    order_id: string;
    user_id: string;
    amount: number;
    payment_method: string;
    simulate_failure?: boolean;
    failure_type?: string;
  }) => api.post('/api/payment/process', data),
};

export const simulatorService = {
  triggerOtpFailure: (type: string, user_id: string = 'USR-DEMO') =>
    api.post(`/api/simulator/otp/${type}?user_id=${user_id}`),
  triggerPaymentFailure: (type: string, user_id: string = 'USR-DEMO') =>
    api.post(`/api/simulator/payment/${type}?user_id=${user_id}`),
};

export const monitoringService = {
  getHealth: () => api.get('/api/health'),
  getLogs: (params?: any) => api.get('/api/logs', { params }),
  getEvents: (params?: any) => api.get('/api/events', { params }),
};

export const agentService = {
  run: (data: { incident_id: string; prompt: string }) =>
    axios.post('http://localhost:8003/agent/run', data).catch(() =>
      api.post('/api/simulator/payment/database-timeout?user_id=USR-DEMO')
    ),
  getIncident: (incident_id: string) =>
    axios.get(`http://localhost:8003/incidents/${incident_id}`).catch(() => ({ data: null })),
};
