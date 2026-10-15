import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/', // رابط السيرفر المحلي للـ Django
});

export default api;