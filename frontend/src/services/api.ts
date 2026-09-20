// =============================================================================
// API Service — frontend/src/services/api.ts
// =============================================================================
// HTTP client for communicating with the Task Manager REST API.
// Uses the native fetch API.
// =============================================================================

import { Task, CreateTaskInput, UpdateTaskInput, ApiResponse } from '../types/task';

// In production, use the ALB URL or relative path.
// In development, Vite proxy handles /api requests.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with error handling.
 */
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Fetch all tasks from the API.
 */
export async function fetchTasks(): Promise<Task[]> {
  const response = await request<ApiResponse<Task[]>>(`${API_BASE}/tasks`);
  return response.data;
}

/**
 * Create a new task.
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await request<ApiResponse<Task>>(`${API_BASE}/tasks`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data;
}

/**
 * Update an existing task.
 */
export async function updateTask(id: number, input: UpdateTaskInput): Promise<Task> {
  const response = await request<ApiResponse<Task>>(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return response.data;
}

/**
 * Delete a task by ID.
 */
export async function deleteTask(id: number): Promise<void> {
  await request(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
}
