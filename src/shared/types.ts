// ==================== TYPE DEFINITIONS ====================
export interface QueueData {
  queueNumber: string;
  vn: string;
  patientName: string;
  department: string;
  departmentLocation: string;
  status: 'waiting' | 'called' | 'in_progress' | 'completed' | 'skipped';
  currentQueue: string;
  yourPosition: number;
  estimatedTime: string;
  issuedTime: string;
  priorityScore: number;
  isSkipped: boolean;
}

export interface StaffData {
  success: boolean;
  staffId: number;
  staffName: string;
  role: string;
  departmentId: number;
  departmentName: string;
}

export interface StaffQueue {
  queueId: number;
  queueNumber: string;
  patientName: string;
  vn: string;
  status: 'waiting' | 'called' | 'in_progress' | 'completed' | 'skipped';
  issuedTime: string;
  isSkipped: boolean;
  priorityScore: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  queueNumber?: string;
  queueId?: number;
}

export type ViewType = 'landing' | 'patient' | 'staff';