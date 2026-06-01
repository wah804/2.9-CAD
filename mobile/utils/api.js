import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

const STORAGE_KEY = '@autovault_api_url';

// Default fallback API URLs
// - iOS Simulator uses localhost
// - Android Emulator uses 10.0.2.2 loopback to host machine
// - Web/Default fallback uses localhost
const DEFAULT_URL = Platform.select({
  ios: 'http://localhost:4000/api',
  android: 'http://10.0.2.2:4000/api',
  default: 'http://localhost:4000/api',
});

/**
 * Retrieve the saved API base URL or return the platform default
 */
export const getApiUrl = async () => {
  try {
    const savedUrl = await AsyncStorage.getItem(STORAGE_KEY);
    return savedUrl || DEFAULT_URL;
  } catch (e) {
    return DEFAULT_URL;
  }
};

/**
 * Save a custom API base URL (useful for testing on physical devices)
 */
export const setApiUrl = async (url) => {
  try {
    if (!url || url.trim() === '') {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } else {
      // Ensure the URL includes the protocol and doesn't end with a trailing slash
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'http://' + cleanUrl;
      }
      if (cleanUrl.endsWith('/')) {
        cleanUrl = cleanUrl.slice(0, -1);
      }
      // Ensure it ends with /api if not present
      if (!cleanUrl.endsWith('/api')) {
        cleanUrl = cleanUrl + '/api';
      }
      await AsyncStorage.setItem(STORAGE_KEY, cleanUrl);
    }
    return true;
  } catch (e) {
    console.error('Error saving API URL:', e);
    return false;
  }
};

/**
 * Helper to build an Axios instance dynamically with the current base URL
 */
const getClient = async () => {
  const baseURL = await getApiUrl();
  return axios.create({
    baseURL,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// CRUD API wrappers
export const api = {
  getCars: async () => {
    const client = await getClient();
    const res = await client.get('/cars');
    return res.data;
  },
  createCar: async (carData) => {
    const client = await getClient();
    const res = await client.post('/cars', carData);
    return res.data;
  },
  updateCar: async (id, carData) => {
    const client = await getClient();
    const res = await client.put(`/cars/${id}`, carData);
    return res.data;
  },
  deleteCar: async (id) => {
    const client = await getClient();
    const res = await client.delete(`/cars/${id}`);
    return res.data;
  },
};
