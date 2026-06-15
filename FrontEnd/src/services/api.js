const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

export const BASE_URL = getBaseUrl();

let accessToken = null;
let logoutCallback = null;
let isRefreshing = false;
let refreshSubscribers = [];

// Register callback to execute on logout
export const registerLogoutCallback = (cb) => {
  logoutCallback = cb;
};

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

// Helper to make API requests with credentials (cookies) and tokens
const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach access token if present
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config = {
    ...options,
    headers,
  };

  // Include credentials (cookies) for all requests
  config.credentials = 'include';

  try {
    const response = await fetch(url, config);
    
    // If response is unauthorized and token expired, try to refresh
    if (response.status === 401) {
      const cloneResponse = response.clone();
      const data = await cloneResponse.json().catch(() => ({}));
      
      if (data.tokenExpired) {
        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken) => {
              config.headers['Authorization'] = `Bearer ${newToken}`;
              resolve(fetch(url, config).then(res => res.json()));
            });
          });
        }

        isRefreshing = true;

        try {
          // Hit refresh token endpoint
          const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newToken = refreshData.accessToken;
            
            setAccessToken(newToken);
            isRefreshing = false;
            onRefreshed(newToken);

            // Retry original request with new token
            config.headers['Authorization'] = `Bearer ${newToken}`;
            const retriedResponse = await fetch(url, config);
            return await retriedResponse.json();
          } else {
            // Refresh token failed (expired or invalid in DB)
            isRefreshing = false;
            setAccessToken(null);
            if (logoutCallback) {
              logoutCallback();
            }
            throw new Error('Session expired. Please log in again.');
          }
        } catch (refreshErr) {
          isRefreshing = false;
          setAccessToken(null);
          if (logoutCallback) {
            logoutCallback();
          }
          throw refreshErr;
        }
      }
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};
