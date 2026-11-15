export type IncidentStatus = 'Successful' | 'Draft' | 'Pending' | 'Failed';

export interface IncidentPriority {
  key: number;
  name: string;
  description: string;
}

export interface Incident {
  id: string;
  details: string;
  addess: string | null;
  atokaCode: string;
  images: string[];
  priority?: string;
  incidentStatus?: string | null;
  incidentDate: string;
  incidentDetails: string;
  incidentLocation: string;
  incidentType: string;
  incidentTypeId: number;
  isAtokaCodeKnown: boolean;
  latitude: string;
  longitude: string;
}