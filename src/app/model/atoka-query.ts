
export interface Address {
  atokaAddressId?:       number;
  parkingType?:          string;
  chargable?:            boolean;
  roadTypeName?:         string;
  stateName?:            string;
  lga?:                  string;
  districtName?:         string;
  cityName?:             string;
  countries?:            string;
  countryCode?:          string;
  countryCurrency?:      string;
  houseName?:            string;
  oldNumber?:            string;
  atokaNumber?:          string;
  streetName?:           string;
  drainageType?:         string;
  streetLight?:          string;
  electricDistribution?: string;
  mast?:                 string;
  atoka?:                string;
  longitude:             string;
  latitude:              string;
  residentDetailId?:     number;
}

export interface ListItem{
  id?: number;
  name?: string;
}

export interface NewStreetRequest {
  countryId?:   number;
  stateId?:     number;
  lgaId?:       number;
  cityId?:      number;
  streetId?:    number;
  streetName?:  string;
  houseName?:   string;
  houseNumber?: string;
}

export interface MoveInDate {
  startFrom: string
}
export interface StreetDetails {
  cityName:       string;
  cityId:         number;
  streetName:     string;
  atokaNumber:    string;
  houseName:      string;
  atoka:          string;
  atokaAddressId: number;
  oldNumber:      string;
  fullStreetName: string;
}
