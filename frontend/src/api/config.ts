const backendBase =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api';

export const API_BASE_URL =
  backendBase.endsWith('/api') ? backendBase : `${backendBase.replace(/\/?$/, '')}/api`;

/** Socket.IO server URL (same host as API, no /api path). */
export const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '') || 'http://localhost:8080';
