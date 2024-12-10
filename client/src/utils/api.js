import axios from 'axios';

// Create an axios instance with default configurations
const api = axios.create({
  baseURL: '/api', // This will use the proxy setting from package.json
  timeout: 5001,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to handle global request configurations
api.interceptors.request.use(
  (config) => {
    // Log request details for debugging
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data
    });

    // You can add authentication token here in the future
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    console.log('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle global response processing
api.interceptors.response.use(
  (response) => {
    // Log successful response details
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });

      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 400:
          console.error('Bad Request:', error.response.data);
          break;
        case 401:
          console.error('Unauthorized:', error.response.data);
          // Optionally redirect to login or refresh token
          break;
        case 403:
          console.error('Forbidden:', error.response.data);
          break;
        case 404:
          console.error('Not Found:', error.response.data);
          break;
        case 500:
          console.error('Server Error:', error.response.data);
          break;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No Response Received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request Setup Error:', error.message);
    }

    // Always reject to allow catch block handling
    return Promise.reject(error);
  }
);

export default api;
