export type TransitUserTransportCard = {
  id: string;
  number: string;
  balance: string;
} | null;

export type TransitUserFine = {
  id: string;
  status: string;
  issuedAt: string;
};

export type TransitUserComplaint = {
  id: string;
  type: string;
  status: string;
};

export type TransitUserGpsLog = {
  id: string;
  latitude: string;
  longitude: string;
  capturedAt: string;
} | null;

export type TransitUser = {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  registeredAt: string;
  transportCard?: TransitUserTransportCard;
  fines?: Array<TransitUserFine>;
  complaints?: Array<TransitUserComplaint>;
  lastGpsLog?: TransitUserGpsLog;
};

export type TransitUserPayload = {
  email: string;
  phone: string;
  fullName: string;
};

export type TransitUserUpdatePayload = TransitUserPayload & { id: string };
