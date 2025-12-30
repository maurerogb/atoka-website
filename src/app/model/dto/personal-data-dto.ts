export interface PersonRequest {
  valideOption?:string,
  otp?: string,
  acceptedPolicy?: boolean,
  surname?: string,
  firstName?: string,
  middleName?: string,
  title?: string,
  gender?: string,
  dateOfBirth?: string,
  phoneNumber?: string,
  ocupation?: string,
  imageUrl?: string
  accountTypeId?: number;
  emailAddress?:string
  iownAproperty: boolean,
}

export interface PersonalData {
  occupantDetailId?: number,
  surname?: string,
  firstName?: string,
  middleName?: string,
  title?: string,
  gender?: string,
  dateOfBirth?: string,
  phoneNumber?: string,
  ocupation?: string,
  confirmationStatus?: string,
  atokaAddressId?: number,
  imageUrl?: any,
  userIdentifer?: string,
  emailAddress?: string,
  accountTypeId?: number,
  addressDetails?: any
}
