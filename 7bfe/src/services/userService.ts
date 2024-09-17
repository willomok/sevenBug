import axios from 'axios';
import { User } from '../models/User';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUserProfile = async (id: number): Promise<User> => {
  const response = await apiClient.get<User>(`/Users/${id}`);
  return response.data;
};

export const updateUserProfile = async (id: number, user: Partial<User>): Promise<void> => {
  await apiClient.put(`/Users/${id}`, user);
};

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/Users');
  return response.data;
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  try {
    const response = await apiClient.post<User>('/Users', user);
    return response.data;
  } catch (error) {
    console.error('Error creating user', error);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/Users/${id}`);
};
