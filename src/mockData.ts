import { Employee, Equipment, Booking } from './types';

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-1',
    name: 'Alex Rivera',
    role: 'Lead Portraitist',
    email: 'alex.r@studio.com',
    phone: '555-0143',
    avatarColor: '#D97706', // Amber
    isActive: true
  },
  {
    id: 'EMP-2',
    name: 'Elena Rostova',
    role: 'Fashion & Editorials Coach',
    email: 'elena.r@studio.com',
    phone: '555-0189',
    avatarColor: '#DC2626', // Red
    isActive: true
  },
  {
    id: 'EMP-3',
    name: 'Arthur Dent',
    role: 'Lighting Engineer & Grip',
    email: 'arthur.d@studio.com',
    phone: '555-0122',
    avatarColor: '#2563EB', // Blue
    isActive: true
  },
  {
    id: 'EMP-4',
    name: 'Chloe Vance',
    role: 'Commercial Videographer',
    email: 'chloe.v@studio.com',
    phone: '555-0155',
    avatarColor: '#059669', // Emerald
    isActive: true
  },
  {
    id: 'EMP-5',
    name: 'Marcus Brody',
    role: 'Studio Associate',
    email: 'marcus.b@studio.com',
    phone: '555-0100',
    avatarColor: '#7C3AED', // Purple
    isActive: true
  }
];

export const DEFAULT_EQUIPMENT: Equipment[] = [
  {
    id: 'EQ-1',
    name: 'Sony Alpha 7R V (Body Only)',
    category: 'camera',
    serialNumber: 'SN-SNY8801A',
    isAvailable: true
  },
  {
    id: 'EQ-2',
    name: 'Hasselblad H6D-100c Medium Format',
    category: 'camera',
    serialNumber: 'SN-HBL1000C',
    isAvailable: true
  },
  {
    id: 'EQ-3',
    name: 'Sony FE 70-200mm f/2.8 GM OSS II',
    category: 'lens',
    serialNumber: 'SN-LNS70200G',
    isAvailable: true
  },
  {
    id: 'EQ-4',
    name: 'Godox AD600 Pro Studio Monolight Kit',
    category: 'lighting',
    serialNumber: 'SN-GDX600PR',
    isAvailable: true
  },
  {
    id: 'EQ-5',
    name: 'DJI Ronin 2 3-Axis Stabilizer',
    category: 'support',
    serialNumber: 'SN-DJI9092R',
    isAvailable: true
  },
  {
    id: 'EQ-6',
    name: 'Sennheiser AVX-835 Wireless Handheld Mic Guild',
    category: 'audio',
    serialNumber: 'SN-SNH835AV',
    isAvailable: true
  },
  {
    id: 'EQ-7',
    name: 'Aputure LS 600d Pro Daylight Light',
    category: 'lighting',
    serialNumber: 'SN-APT600DPL',
    isAvailable: true
  }
];

export const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'BOK-101',
    title: 'Maternity Portrait Session',
    clientName: 'Sarah Jenkins',
    clientPhone: '555-0143',
    clientEmail: 'sarah.j@example.com',
    date: '2026-06-03',
    startTime: '10:00',
    endTime: '12:30',
    employeeIds: ['EMP-1'],
    equipmentIds: ['EQ-1', 'EQ-4'],
    notes: 'Requested warm autumn background backdrops. Shoot was a gorgeous success.',
    status: 'completed',
    dateCreated: '2026-06-01'
  },
  {
    id: 'BOK-102',
    title: 'Vertex Corporate Headshots',
    clientName: 'Nadia Alvarez',
    clientPhone: '555-0122',
    clientEmail: 'nalvarez@vertex.com',
    date: '2026-06-08', // Today!
    startTime: '10:00',
    endTime: '12:00',
    employeeIds: ['EMP-2', 'EMP-3'],
    equipmentIds: ['EQ-2', 'EQ-7'],
    notes: '5 corporate board members requiring extreme crisp clean corporate headshots. Off-white backdrop.',
    status: 'scheduled',
    dateCreated: '2026-06-04'
  },
  {
    id: 'BOK-103',
    title: 'Grace Family Outdoor Portraits',
    clientName: 'Diana Grace',
    clientPhone: '555-1049',
    clientEmail: 'diana.g@example.com',
    date: '2026-06-08', // Today!
    startTime: '14:30',
    endTime: '16:30',
    employeeIds: ['EMP-1'],
    equipmentIds: ['EQ-1', 'EQ-3'],
    notes: 'Golden hour shoot in Presidio. Need heavy zoom telephoto lens.',
    status: 'scheduled',
    dateCreated: '2026-06-05'
  },
  {
    id: 'BOK-104',
    title: 'Vance Wedding Prep Consultation',
    clientName: 'Marcus Vance',
    clientPhone: '555-0155',
    clientEmail: 'vance.family@example.com',
    date: '2026-06-09', // Tomorrow
    startTime: '09:30',
    endTime: '11:00',
    employeeIds: ['EMP-4'],
    equipmentIds: [],
    notes: 'Discuss shot lists, lighting details, and dynamic gimbal framing.',
    status: 'scheduled',
    dateCreated: '2026-06-05'
  },
  {
    id: 'BOK-105',
    title: 'Commercial Fashion Reel Shoot',
    clientName: 'Studio Nouveau',
    clientPhone: '555-4040',
    clientEmail: 'contact@nouveau.com',
    date: '2026-06-11',
    startTime: '13:00',
    endTime: '17:00',
    employeeIds: ['EMP-2', 'EMP-3', 'EMP-4'],
    equipmentIds: ['EQ-1', 'EQ-5', 'EQ-6', 'EQ-7'],
    notes: 'High fashion video reel and key look capture sequence. Heavy dynamic movement with Ronin 2.',
    status: 'scheduled',
    dateCreated: '2026-06-06'
  },
  {
    id: 'BOK-106',
    title: 'Archival Print Fine Art Framing Spec',
    clientName: 'Robert Lang',
    clientPhone: '555-0100',
    clientEmail: 'robert.lang@example.com',
    date: '2026-06-05',
    startTime: '15:00',
    endTime: '16:00',
    employeeIds: ['EMP-5'],
    equipmentIds: [],
    notes: 'Discuss dimensions for standard museum glass specifications.',
    status: 'completed',
    dateCreated: '2026-06-02'
  },
  {
    id: 'BOK-107',
    title: 'Senior Portraits Session',
    clientName: 'Carly Simon',
    clientPhone: '555-2255',
    clientEmail: 'carly.simon@school.edu',
    date: '2026-06-14',
    startTime: '11:00',
    endTime: '13:00',
    employeeIds: ['EMP-1'],
    equipmentIds: ['EQ-1', 'EQ-3'],
    notes: 'Black studio backdrop and green velvet chair. Traditional high school graduation pose list.',
    status: 'scheduled',
    dateCreated: '2026-06-07'
  }
];
