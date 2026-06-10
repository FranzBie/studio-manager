export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatarColor: string;
  isActive: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  category: 'camera' | 'lens' | 'lighting' | 'audio' | 'support';
  serialNumber: string;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  title: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  employeeIds: string[]; // Assigned employees
  equipmentIds: string[]; // Reserved equipment
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  dateCreated: string;
}
