export type TransportCardUserPreview = {
  id: number;
  fullName: string;
} | null;

export type TransportCardTicketPreview = {
  id: string;
  price: string;
  purchasedAt: string;
};

export type TransportCardTopUpPreview = {
  id: string;
  amount: string;
  rechargedAt: string;
};

export type TransportCard = {
  id: string;
  userId: string;
  balance: string;
  number: string;
  user?: TransportCardUserPreview;
  tickets?: Array<TransportCardTicketPreview>;
  topUps?: Array<TransportCardTopUpPreview>;
};

export type TransportCardPayload = {
  userId: string;
  balance?: string;
  number: string;
};
