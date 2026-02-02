export type IncidentStatus = 'Successful' | 'Draft' | 'Pending' | 'Failed';

export interface Incident {
  id: string;
  // locationCode: string;
  // locationDescription: string;
  // priority: string;
  // entryDate: string;
  // status: IncidentStatus;
  details: string;
  // resolution: string;
  addess: string | null;
  atokaCode: string;
  images: string[];
  incidentDate: string;
  incidentDetails: string;
  incidentLocation: string;
  incidentType: string;
  incidentTypeId: number;
  isAtokaCodeKnown: boolean;
  latitude: string;
  longitude: string;
}