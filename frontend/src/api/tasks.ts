import api from './axios';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'done';
  owner_id: number;
  created_at: string;
  updated_at?: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'done';
}

export const getTasks = () => api.get<Task[]>('/tasks/');
export const createTask = (data: TaskCreate) => api.post<Task>('/tasks/', data);
export const updateTask = (id: number, data: Partial<TaskCreate>) =>
  api.put<Task>(`/tasks/${id}`, data);
export const deleteTask = (id: number) => api.delete(`/tasks/${id}`);
