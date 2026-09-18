import axios from 'axios';

const AGENT_API_URL = 'http://localhost:8003';
const BACKEND_API_URL = 'http://localhost:8000';

export const agentService = {
  run: (data: { incident_id: string; prompt: string }) =>
    axios.post(`${AGENT_API_URL}/agent/run`, data).catch(() =>
      axios.post(`${BACKEND_API_URL}/api/simulator/payment/database-timeout?user_id=USR-DEMO`)
    ),
  getIncident: (incident_id: string) =>
    axios.get(`${AGENT_API_URL}/incidents/${incident_id}`).catch(() => ({ data: null })),
};

export const monitoringService = {
  getHealth: () => axios.get(`${BACKEND_API_URL}/api/health`),
  getLogs: (params?: any) => axios.get(`${BACKEND_API_URL}/api/logs`, { params }),
  getEvents: (params?: any) => axios.get(`${BACKEND_API_URL}/api/events`, { params }),
};
