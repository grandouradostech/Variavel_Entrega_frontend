import axios from 'axios';

// URL da sua API FastAPI (confirme se a porta é 8000)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
});

// Interceptor: Adiciona o Token a TODOS os pedidos automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Tratamento de erros (ex: 401 - Token Expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirou ou inválido
      localStorage.removeItem('access_token');
      // Redireciona para login se não estiver lá
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;