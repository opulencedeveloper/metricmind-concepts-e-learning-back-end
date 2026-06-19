import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import Logging from "./loggin";
import config from "../config";
import {
  IPaystackTransferRecipient,
  IPaystackTransfer,
  ITransferRecipientResponse,
  ITransferResponse,
  PaystackRecipientType,
  PaystackTransferSource,
} from "./paystack.interface";

class PaystackService {
  private client: AxiosInstance;
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || "";
    if (!this.secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY not configured");
    }

    this.client = axios.create({
      baseURL: "https://api.paystack.co",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });
  }

  /**
   * Create a transfer recipient (bank account)
   * Used when driver adds a new bank account for withdrawal
   */
  async createTransferRecipient(
    data: IPaystackTransferRecipient
  ): Promise<ITransferRecipientResponse> {
    try {
      const response = await this.client.post<ITransferRecipientResponse>(
        "/transferrecipient",
        data
      );

      if (!response.data.status) {
        throw new Error(response.data.message || "Failed to create transfer recipient");
      }

      Logging.info(
        `[PAYSTACK] Transfer recipient created: ${response.data.data.id}`
      );
      return response.data;
    } catch (error: any) {
      Logging.error(
        `[PAYSTACK] Create transfer recipient failed: ${error.message}`
      );
      throw new Error(`Paystack error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Initiate a transfer (withdrawal)
   * Requires recipient to be created first
   */
  async initiateTransfer(
    data: IPaystackTransfer
  ): Promise<ITransferResponse> {
    try {
      const response = await this.client.post<ITransferResponse>(
        "/transfer",
        data
      );

      if (!response.data.status) {
        throw new Error(response.data.message || "Failed to initiate transfer");
      }

      Logging.info(
        `[PAYSTACK] Transfer initiated: ${response.data.data.reference}`
      );
      return response.data;
    } catch (error: any) {
      Logging.error(
        `[PAYSTACK] Transfer initiation failed: ${error.message}`
      );
      throw new Error(`Paystack error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Finalize a transfer (after OTP verification if required)
   */
  async finalizeTransfer(transferCode: string, otp: string): Promise<ITransferResponse> {
    try {
      const response = await this.client.post<ITransferResponse>(
        "/transfer/finalize_transfer",
        {
          transfer_code: transferCode,
          otp,
        }
      );

      if (!response.data.status) {
        throw new Error(response.data.message || "Failed to finalize transfer");
      }

      Logging.info(
        `[PAYSTACK] Transfer finalized: ${response.data.data.reference}`
      );
      return response.data;
    } catch (error: any) {
      Logging.error(
        `[PAYSTACK] Transfer finalization failed: ${error.message}`
      );
      throw new Error(`Paystack error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verify a transfer by reference
   */
  async verifyTransfer(reference: string): Promise<ITransferResponse> {
    try {
      const response = await this.client.get<ITransferResponse>(
        `/transfer/verify/${reference}`
      );

      if (!response.data.status) {
        throw new Error(response.data.message || "Failed to verify transfer");
      }

      return response.data;
    } catch (error: any) {
      Logging.error(`[PAYSTACK] Transfer verification failed: ${error.message}`);
      throw new Error(`Paystack error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get list of banks for bank code lookup
   */
  async listBanks(): Promise<
    Array<{ id: number; code: string; name: string }>
  > {
    try {
      const response = await axios.get(
        "https://api.paystack.co/bank?country=NG",
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      return response.data.data || [];
    } catch (error: any) {
      Logging.error(`[PAYSTACK] Bank list fetch failed: ${error.message}`);
      throw new Error("Failed to fetch bank list");
    }
  }

  /**
   * Resolve account name from bank (verify account exists and get registered name)
   */
  async resolveAccountName(data: {
    bankCode: string;
    accountNumber: string;
  }): Promise<{ accountName: string; accountNumber: string }> {
    try {
      const response = await this.client.get(
        `/bank/resolve?account_number=${data.accountNumber}&bank_code=${data.bankCode}`
      );

      if (!response.data.status) {
        throw new Error(response.data.message || "Failed to resolve account name");
      }

      Logging.info(
        `[PAYSTACK] Account resolved: ${data.accountNumber} on ${data.bankCode}`
      );
      return {
        accountName: response.data.data.account_name,
        accountNumber: response.data.data.account_number,
      };
    } catch (error: any) {
      Logging.error(
        `[PAYSTACK] Account name resolution failed: ${error.message}`
      );
      throw new Error(
        error.response?.data?.message || "Unable to verify account details"
      );
    }
  }

  /**
   * Verify Paystack webhook signature (HMAC-SHA512)
   * Use this to validate that webhook events are from Paystack
   */
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    try {
      const hash = crypto
        .createHmac("sha512", this.secretKey)
        .update(rawBody)
        .digest("hex");

      const isValid = hash === signature;

      if (!isValid) {
        Logging.warn("[PAYSTACK] Webhook signature verification failed");
      }

      return isValid;
    } catch (error: any) {
      Logging.error(`[PAYSTACK] Webhook signature verification error: ${error.message}`);
      return false;
    }
  }

  /**
   * Initialize Paystack transaction (Charge API)
   * Used for payment processing (deposits)
   * Required: amount, email, callback_url
   */
  async initializeTransaction(data: {
    amount: number;
    customerEmail: string;
    customerName?: string;
    paymentReference?: string;
    callbackUrl: string; // Required: where Paystack redirects after payment
    metadata?: Record<string, any>;
  }): Promise<any> {
    // Map customer fields to Paystack API field names
    const paystackData = {
      amount: data.amount,
      email: data.customerEmail,
      first_name: data.customerName?.split(" ")[0] || "",
      last_name: data.customerName?.split(" ").slice(1).join(" ") || "",
      callback_url: data.callbackUrl, // Top-level parameter (required by Paystack)
      metadata: {
        paymentReference: data.paymentReference,
        ...data.metadata,
      },
    };
    try {
      const response = await this.client.post("/transaction/initialize", paystackData);

      if (!response.data.status) {
        throw new Error(response.data.message || "Failed to initialize transaction");
      }

      Logging.info(`[PAYSTACK] Transaction initialized: ${response.data.data.reference}`);
      return response.data;
    } catch (error: any) {
      Logging.error(`[PAYSTACK] Transaction initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify Paystack transaction (Charge API)
   * Used to confirm payment (deposits)
   */
  async verifyTransaction(reference: string): Promise<any> {
    try {
      const response = await this.client.get(`/transaction/verify/${reference}`);

      if (!response.data.status) {
        throw new Error(response.data.message || "Failed to verify transaction");
      }

      return response.data;
    } catch (error: any) {
      Logging.error(`[PAYSTACK] Transaction verification failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate callback URL for Paystack redirects
   * Paystack redirects here after payment with ?reference={ref}&trxref={tx_id}
   * Mobile app webview watches for this URL and closes when it loads
   */
  generateCallbackUrl(): string {
    return `${config.frontend.baseUrl}/wallet/topup/success`;
  }
}

export const paystackService = new PaystackService();
