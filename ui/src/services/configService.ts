import axios from 'axios';

// Create a shared axios instance for admin endpoints
const adminApi = axios.create();

// Attach Authorization header with access token for every request
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const configService = {
  async getRegistrationEnabled(): Promise<boolean> {
    const res = await axios.get('/api/config/registration');
    return res.data.enabled;
  },
  async setRegistrationEnabled(enabled: boolean): Promise<boolean> {
    const res = await adminApi.post('/api/admin/config/registration', { enabled });
    return res.data.enabled;
  },
  async getAccessTokenTTL(): Promise<number> {
    const res = await adminApi.get('/api/admin/config/access_token_ttl');
    console.log('Response data:', res.data);
    return res.data.ttl;
  },
  async setAccessTokenTTL(ttl: number): Promise<number> {
    const res = await adminApi.post('/api/admin/config/access_token_ttl', { access_token_ttl: ttl });
    return res.data.ttl;
  },
};

export default configService;
