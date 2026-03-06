import type { QueueData, StaffData, StaffQueue, ApiResponse } from "./types";

// ==================== CONSTANTS ====================
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

// ==================== AUTH HELPERS ====================
const getToken = () => localStorage.getItem("staff_token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ==================== API FUNCTIONS ====================
export const API = {
  async getQueueByVN(vn: string): Promise<QueueData | null> {
    const response = await fetch(`${API_URL}/api/queue/${vn}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch queue");
    }
    return response.json();
  },

  async getQueueByPhone(phoneNumber: string): Promise<QueueData | null> {
    const response = await fetch(`${API_URL}/api/queue/phone/${phoneNumber}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch queue by phone");
    }
    return response.json();
  },

  async staffLogin(
    username: string,
    password: string
  ): Promise<StaffData | false> {
    const response = await fetch(`${API_URL}/api/staff/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    if (data.success) {
      // เก็บ token จริงลง localStorage
      localStorage.setItem("staff_token", data.token);
      return data;
    }
    return false;
  },

  async getDepartmentQueues(departmentId: number): Promise<StaffQueue[]> {
    const response = await fetch(
      `${API_URL}/api/staff/queues/${departmentId}`,
      { headers: authHeaders() }  
    );
    if (!response.ok) throw new Error("Failed to fetch queues");
    return response.json();
  },

  async callQueue(queueId: number, staffName: string): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/staff/queue/${queueId}/call`, {
      method: "POST",
      headers: authHeaders(),  
      body: JSON.stringify({ staffName }),
    });
    if (!response.ok) throw new Error("Failed to call queue");
    return response.json();
  },

  async skipQueue(queueId: number, staffName: string): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/staff/queue/${queueId}/skip`, {
      method: "POST",
      headers: authHeaders(),  
      body: JSON.stringify({ staffName }),
    });
    if (!response.ok) throw new Error("Failed to skip queue");
    return response.json();
  },

  async completeQueue(
    queueId: number,
    staffName: string
  ): Promise<ApiResponse> {
    const response = await fetch(
      `${API_URL}/api/staff/queue/${queueId}/complete`,
      {
        method: "POST",
        headers: authHeaders(),  
        body: JSON.stringify({ staffName }),
      }
    );
    if (!response.ok) throw new Error("Failed to complete queue");
    return response.json();
  },

  async recallSkippedQueue(
    queueId: number,
    staffName: string
  ): Promise<ApiResponse> {
    const response = await fetch(
      `${API_URL}/api/staff/queue/${queueId}/recall`,
      {
        method: "POST",
        headers: authHeaders(),  
        body: JSON.stringify({ staffName }),
      }
    );
    if (!response.ok) throw new Error("Failed to recall queue");
    return response.json();
  },

  async createQueue(vn: string, staffId: number, priorityScore: number = 0): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/staff/queue/create`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ vn, staffId, priorityScore }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create queue");
    }
    return response.json();
  },

  async updatePatientArrived(
    queueId: number,
    staffName: string
  ): Promise<ApiResponse> {
    const response = await fetch(
      `${API_URL}/api/staff/queue/${queueId}/arrived`,
      {
        method: "POST",
        headers: authHeaders(),  
        body: JSON.stringify({ staffName }),
      }
    );
    if (!response.ok) throw new Error("Failed to update status");
    return response.json();
  },
};