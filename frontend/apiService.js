import axios from 'https://cdn.jsdelivr.net/npm/axios@1.3.5/+esm';

// Initialize with a default value, will be updated once we fetch the config
let API_URL = '';
let api = null;

// Fetch server configuration and initialize the API
const initAPI = async () => {
  const createAxiosInstance = (baseURL) => {
    const instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 300000, // 5-minute timeout for longer server processing
    });

    // Add auth token to requests if available
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  };

  const initializeAPI = (serverIP, apiPort) => {
    const baseURL = `http://${serverIP}:${apiPort}/api`;
    api = createAxiosInstance(baseURL);
  };

  try {
    const configResponse = await axios.get('/api/config');
    const { serverIP, apiPort } = configResponse.data;
    initializeAPI(serverIP, apiPort);
  } catch (error) {
    console.error('Failed to fetch server configuration, using default settings:', error);
    const defaultServerIP = window.location.hostname;
    const defaultApiPort = 3000;
    initializeAPI(defaultServerIP, defaultApiPort);
  }
};

// Helper function to ensure API is initialized before making requests
const ensureAPI = async () => {
  if (!api) {
    await initAPI();
  }
  return api;
};

// Auth endpoints
export const login = async (email, password) => {
  const apiInstance = await ensureAPI();
  return apiInstance.post('/auth/login', { email, password });
};

export const register = async (username, email, password) => {
  const apiInstance = await ensureAPI();
  return apiInstance.post('/auth/register', { username, email, password });
};

export const getProfile = async () => {
  const apiInstance = await ensureAPI();
  return apiInstance.get('/auth/me');
};

// Title endpoints
export const createTitle = async (title, instructions) => {
  const apiInstance = await ensureAPI();
  return apiInstance.post('/titles', { title, instructions });
};

export const getTitles = async () => {
  const apiInstance = await ensureAPI();
  return apiInstance.get('/titles');
};

export const getTitle = async (id) => {
  const apiInstance = await ensureAPI();
  return apiInstance.get(`/titles/${id}`);
};

export const updateTitle = async (id, title, instructions) => {
  const apiInstance = await ensureAPI();
  return apiInstance.put(`/titles/${id}`, { title, instructions });
};

export const deleteTitle = async (id) => {
  const apiInstance = await ensureAPI();
  return apiInstance.delete(`/titles/${id}`);
};

// Reference endpoints
export const uploadReference = async (titleId, imageData, isGlobal = false) => {
  const apiInstance = await ensureAPI();
  return apiInstance.post('/references', { titleId, imageData, isGlobal });
};

export const getReferences = async (titleId) => {
  const apiInstance = await ensureAPI();
  return apiInstance.get(`/references/${titleId}`);
};

export const getGlobalReferences = async () => {
  const apiInstance = await ensureAPI();
  return apiInstance.get('/references/global');
};

export const deleteReference = async (id) => {
  const apiInstance = await ensureAPI();
  return apiInstance.delete(`/references/${id}`);
};

// Painting endpoints (renamed from Thumbnail)
export const generateThumbnails = async (titleId, quantity = 5) => {
  const apiInstance = await ensureAPI();
  return apiInstance.post('/paintings/generate', { titleId, quantity });
};

export const getThumbnails = async (titleId) => {
  const apiInstance = await ensureAPI();
  return apiInstance.get(`/paintings/${titleId}`);
};

// Initialize API when this module is imported
initAPI();

export default async () => ensureAPI(); 