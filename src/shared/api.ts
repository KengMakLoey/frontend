import type { QueueData, StaffData, StaffQueue, ApiResponse } from './types';

// ==================== CONSTANTS ====================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

// ==================== API FUNCTIONS ====================
export const API = {
  async getQueueByVN(vn: string): Promise<QueueData | null> {
    const response = await fetch(`${API_URL}/api/queue/${vn}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch queue');
    }
    return response.json();
  },
  
  async staffLogin(username: string, password: string): Promise<StaffData | false> {
    const response = await fetch(`${API_URL}/api/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.success ? data : false;
  },
  
  async getDepartmentQueues(departmentId: number): Promise<StaffQueue[]> {
    const response = await fetch(`${API_URL}/api/staff/queues/${departmentId}`);
    if (!response.ok) throw new Error('Failed to fetch queues');
    return response.json();
  },
  
  async callQueue(queueId: number, staffName: string): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/staff/queue/${queueId}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffName }),
    });
    if (!response.ok) throw new Error('Failed to call queue');
    return response.json();
  },
  
  async skipQueue(queueId: number, staffName: string): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/staff/queue/${queueId}/skip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffName }),
    });
    if (!response.ok) throw new Error('Failed to skip queue');
    return response.json();
  },
  
  async completeQueue(queueId: number, staffName: string): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/staff/queue/${queueId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffName }),
    });
    if (!response.ok) throw new Error('Failed to complete queue');
    return response.json();
  },
  
  async recallSkippedQueue(queueId: number, staffName: string): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/staff/queue/${queueId}/recall`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffName }),
    });
    if (!response.ok) throw new Error('Failed to recall queue');
    return response.json();
  },
  
  async createQueue(vn: string, staffId: number): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/staff/queue/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vn, staffId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create queue');
    }
    return response.json();
  },

  async updatePatientArrived(queueId: number, staffName: string): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/staff/queue/${queueId}/arrived`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffName }),
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  }
};