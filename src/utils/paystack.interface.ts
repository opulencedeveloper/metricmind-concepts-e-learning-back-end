export enum PaystackRecipientType {
  NUBAN = "nuban",
  MOBILE_MONEY = "mobile_money",
}

export enum PaystackTransferSource {
  BALANCE = "balance",
  MAIN = "main",
}

export interface IPaystackTransferRecipient {
  type: PaystackRecipientType;
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
}

export interface IPaystackTransfer {
  source: PaystackTransferSource;
  reason: string;
  amount: number; // In kobo (1 Naira = 100 kobo)
  recipient: number; // Recipient ID from Paystack
}

export interface ITransferRecipientResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    name: string;
    type: string;
    bank_account: {
      account_number: string;
      bank_code: string;
    };
    active: boolean;
  };
}

export interface ITransferResponse {
  status: boolean;
  message: string;
  data: {
    transfer_code: string;
    reference: string;
    integration: number;
    domain: string;
    amount: number;
    currency: string;
    source: string;
    source_details: null | Record<string, any>;
    reason: string;
    recipient: {
      domain: string;
      type: string;
      id: number;
      name: string;
      details: {
        account_number: string;
        bank_code: string;
      };
    };
    status: "success" | "pending" | "failed";
    failures: null | Record<string, any>;
    transfer_id?: number;
    titan_code?: string;
    transferred_at?: string;
    timestamp?: string;
  };
}
