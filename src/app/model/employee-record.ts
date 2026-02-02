export type EmployeeStatus = 'Confirmed' | 'Pending' | 'Removed';

export interface EmployeeRecord {
  id: string;
  fullName: string;
  email: string;
  requestDate: string;
  locationId: string;
  status: EmployeeStatus;
  gender: string;
  phoneNumber: string;
  employmentLength: string;
  employmentStartDate: string;
  state: string;
  avatarUrl: string;
}

export interface Employee {
  id?: string,
  occupantDetailId: number;
  surname: string;
  firstName: string;
  middleName: string;
  title: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  ocupation: string;
  imageUrl: string;
  emailAddress?: any;
  placeOfWorkId: number;
  contactPerson: string;
  businessPhoneNo: string;
  employmentStartDate: string;
  businessId: number;
  branchId: number;
  isCurrentJob: boolean;
  confirmationStatus: string;
  approvedOn: string;
  approvedBy: string;
  status?: string;
}