// Types for User/Resident App (Read-Only)
export interface Building {
  id: string;
  buildingCode: string;
  buildingName: string;
  buildingNo: string;
  address: string;
  location?: string | null;
}

export interface UnitInfo {
  id: string;
  buildingCode: string;
  unitNo: string;
  accessNo: string;
  sakenName: string;
  sakenLastName?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface Parking {
  id: string;
  buildingCode: string;
  parkingName?: string | null;
  parkingNo: string;
  parkingLots?: number | null;
  description?: string | null;
}

export interface Reserving {
  id: string;
  dateTime: string;
  parkingNo: string;
  vehicleCode?: string | null;
  accessNo: string;
  duration?: number | null;
}
