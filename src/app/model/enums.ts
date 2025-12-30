export enum VerificationOption {
  Phone = 1,
  Email
}

export enum VerificationState {
  Default = 1,
  OTP,
  Success
}

export const Regex = {
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumeric: /[0-9]/,
  specialChar: /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
}

export enum ResponseCode  {
  Success = 0,
  Error = 10,
  INVALIDTOKEN = 13,
  ERROR_ATOKACODE_NOTFOUND = 11,
  ERROR_NOTFOUND = 12,
  INVALID_LOGIN_CREDENTIALS = 15,
  DISPUTE = 110
}

export enum RegistrationStep {
  None = 0,
  PersonalInformationCompleted = 1,
  CreatePasswordCompleted = 2,
  ProfilePictureCompleted = 3,
}
