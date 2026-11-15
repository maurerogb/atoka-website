export interface UseProfile {
  occupantDetailId: number;
  surname: string;
  firstName: string;
  middleName?: string;
  title?: string;
  gender?: string;
  phoneNumber: string;
  imageUrl?: string;
  emailAddress?: string;
  status?: string;
  isVerified?: boolean;
  address?: string;
  fullAddress?: string;
  residentialAddress?: string;
  dateAtAddress?: string;
  timeAtAddress?: string;
}

export interface CreateViewRequestPayload {
  profileId: number;
  requesterId: number;
  isBusiness: boolean;
}

export interface ViewApprovedProfileRequest {
  requestId?: number;
  profileId?: number;
  requesterId?: number;
  occupantDetailId?: number;
  status?: string;
  requestStatus?: string;
  confirmationStatus?: string;
  isApproved?: boolean;
  isPending?: boolean;
  isDeclined?: boolean;
  isValid?: boolean;
  expiresOn?: string;
  expiryDate?: string;
  validTill?: string;
  approvedTill?: string;
  createdOn?: string;
  requestedOn?: string;
  updatedOn?: string;
}

export interface PendingViewRequest {
  accessRequestId: number;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  photo?: string;
  relationship?: string;
  requestDate?: string;
  createdOn?: string;
  requestedOn?: string;
}

export interface MyViewRequest {
  accessRequestId: number;
  ownerName?: string;
  status?: string;
  phoneNumber?: string;
  requestedOn?: string;
  respondedOn?: string;
  expiresOn?: string;
  isExpired?: boolean;
  message?: string;
}

export interface ViewApprovedProfileData {
  name?: string;
  gender?: string;
  phoneNumber?: string;
  email?: string;
  photo?: string | null;
  dateAtAddress?: string;
  address?: string | null;
  isValidated?: string;
  longitude?: number | string | null;
  latitude?: number | string | null;
  residentDetailId?: number;
}

export interface ActionOnViewRequestPayload {
  approvalStatus: number;
  accessRequestId: number;
}
