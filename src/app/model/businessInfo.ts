export interface BusinessInfoRequest {
  businessName:         string,
  businessTypeId:       number,
  officialEmail:        string,
  officialPhone:        string,
  isBusinessRegistered: boolean,
  regNumber:            number,
  cacDocFile?:           File,
  roleInBusinessId:     number,
  businessLogFile?:      File,
  atokaCode:            string,
  acceptTM:             boolean,
}
