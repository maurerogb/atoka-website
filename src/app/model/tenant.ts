export interface ClaimPropertyRequest {
  atokaCode: string;
  atokaAddressId: number;
  houseNo: string;
  documentTypeId: number;
  fileExtention: string;
  documentRefNo: string;
  verifyOwnership?: boolean;
  propertyManager?: string;
}

export interface TenantConfirmationStatusRequest {
  title: string;
  firstName: string;
  middleName: string;
  surname: string;
  gender: string;
  phoneNumber: string;
  occupantDetailId: number;
  confirmationStatus: string;
  imageUrl: string;
  startFrom: string;
  createdOn: string;
}

export interface TenantPerson {
  title?: string;
  firstName?: string;
  middleName?: string;
  surname?: string;
  gender?: string;
  phoneNumber?: string;
  emailAddress?: string;
  occupantDetailId?: number;
  confirmationStatus?: string;
  imageUrl?: string;
  startFrom?: string;
  createdOn?: string;
  status?: string;
}

export interface ClaimedProperty {
  atokaCode?: string;
  atokaAddressId?: number;
  houseNo?: string;
  houseNumber?: string;
  oldNumber?: string;
  atokaNumber?: string;
  houseName?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  countries?: string;
  fullAddress?: string;
  totalPeople?: number | string;
  totalTenant?: number | string;
  occupantsCount?: number | string;
}

export interface DocumentType {
  documentTypeId: number;
  documentTypeName: string;
}
