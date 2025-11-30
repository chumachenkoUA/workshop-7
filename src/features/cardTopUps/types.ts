export type CardTopUp = {
  id: string;
  cardId: string;
  amount: string;
  rechargedAt: string;
};

export type CardTopUpPayload = {
  cardId: string;
  amount: string;
};

export type CardTopUpUpdatePayload = {
  id: string;
  amount: string;
};
