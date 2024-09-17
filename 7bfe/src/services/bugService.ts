import axios from 'axios';
import { Bug } from '../models/Bug';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ApiResponse {
  $id: string;
  $values: Bug[];
}

export const getBugs = async (): Promise<Bug[]> => {
  try {
    const response = await apiClient.get<ApiResponse>('/bugs');
    
    // Ensure that $values is an array, else return an empty array
    return Array.isArray(response.data.$values) ? response.data.$values : [];
  } catch (error) {
    console.error('Error fetching bugs:', error);
    return []; // Return an empty array on error to avoid breaking the UI
  }
};


export const getUsers = async (): Promise<{ id: number; name: string }[]> => {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserBugs = async (userId: number): Promise<Bug[]> => {
  try {
    const response = await apiClient.get(`/bugs/user-bugs/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user bugs:', error);
    throw error;
  }
};

export const resolveBug = async (id: number): Promise<void> => {
  await apiClient.put(`/bugs/${id}/resolve`);
};

export const createBug = async (
  title: string,
  description: string,
  priority: string,
  assignedUserId: number
): Promise<Bug> => {
  const bugData = {
    title,
    description,
    status: 'Open',
    priority,
    assignedUserId,
  };

  try {
    const response = await apiClient.post<Bug>('/bugs', bugData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};
