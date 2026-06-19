"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const loggin_1 = __importDefault(require("./loggin"));
const config_1 = __importDefault(require("../config"));
class PaystackService {
    constructor() {
        this.secretKey = process.env.PAYSTACK_SECRET_KEY || "";
        if (!this.secretKey) {
            throw new Error("PAYSTACK_SECRET_KEY not configured");
        }
        this.client = axios_1.default.create({
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
    async createTransferRecipient(data) {
        try {
            const response = await this.client.post("/transferrecipient", data);
            if (!response.data.status) {
                throw new Error(response.data.message || "Failed to create transfer recipient");
            }
            loggin_1.default.info(`[PAYSTACK] Transfer recipient created: ${response.data.data.id}`);
            return response.data;
        }
        catch (error) {
            loggin_1.default.error(`[PAYSTACK] Create transfer recipient failed: ${error.message}`);
            throw new Error(`Paystack error: ${error.response?.data?.message || error.message}`);
        }
    }
    /**
     * Initiate a transfer (withdrawal)
     * Requires recipient to be created first
     */
    async initiateTransfer(data) {
        try {
            const response = await this.client.post("/transfer", data);
            if (!response.data.status) {
                throw new Error(response.data.message || "Failed to initiate transfer");
            }
            loggin_1.default.info(`[PAYSTACK] Transfer initiated: ${response.data.data.reference}`);
            return response.data;
        }
        catch (error) {
            loggin_1.default.error(`[PAYSTACK] Transfer initiation failed: ${error.message}`);
            throw new Error(`Paystack error: ${error.response?.data?.message || error.message}`);
        }
    }
    /**
     * Finalize a transfer (after OTP verification if required)
     */
    async finalizeTransfer(transferCode, otp) {
        try {
            const response = await this.client.post("/transfer/finalize_transfer", {
                transfer_code: transferCode,
                otp,
            });
            if (!response.data.status) {
                throw new Error(response.data.message || "Failed to finalize transfer");
            }
            loggin_1.default.info(`[PAYSTACK] Transfer finalized: ${response.data.data.reference}`);
            return response.data;
        }
        catch (error) {
            loggin_1.default.error(`[PAYSTACK] Transfer finalization failed: ${error.message}`);
            throw new Error(`Paystack error: ${error.response?.data?.message || error.message}`);
        }
    }
    /**
     * Verify a transfer by reference
     */
    async verifyTransfer(reference) {
        try {
            const response = await this.client.get(`/transfer/verify/${reference}`);
            if (!response.data.status) {
                throw new Error(response.data.message || "Failed to verify transfer");
            }
            return response.data;
        }
        catch (error) {
            loggin_1.default.error(`[PAYSTACK] Transfer verification failed: ${error.message}`);
            throw new Error(`Paystack error: ${error.response?.data?.message || error.message}`);
        }
    }
    /**
     * Get list of banks for bank code lookup
     */
    async listBanks() {
        try {
            const response = await axios_1.default.get("https://api.paystack.co/bank?country=NG", {
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                },
            });
            return response.data.data || [];
        }
        catch (error) {
            loggin_1.default.error(`[PAYSTACK] Bank list fetch failed: ${error.message}`);
            throw new Error("Failed to fetch bank list");
        }
    }
    /**
     * Resolve account name from bank (verify account exists and get registered name)
     */
    async resolveAccountName(data) {
        try {
            const response = await this.client.get(`/bank/resolve?account_number=${data.accountNumber}&bank_code=${data.bankCode}`);
            if (!response.data.status) {
                throw new Error(response.data.message || "Failed to resolve account name");
            }
            loggin_1.default.info(`[PAYSTACK] Account resolved: ${data.accountNumber} on ${data.bankCode}`);
            return {
                accountName: response.data.data.account_name,
                accountNumber: response.data.data.account_number,
            };
        }
        catch (error) {
            loggin_1.default.error(`[PAYSTACK] Account name resolution failed: ${error.message}`);
            throw new Error(error.response?.data?.message || "Unable to verify account details");
        }
    }
    /**
     * Verify Paystack webhook signature (HMAC-SHA512)
     * Use this to validate that webhook events are from Paystack
     */
    verifyWebhookSignature(rawBody, signature) {
        try {
            const hash = crypto_1.default
                .createHmac("sha512", this.secretKey)
                .update(rawBody)
                .digest("hex");
            const isValid = hash === signature;
            if (!isValid) {
                loggin_1.default.warn("[PAYSTACK] Webhook signature verification failed");
            }
            return isValid;
        }
        catch (error) {
            loggin_1.default.error(`[PAYSTACK] Webhook signature verification error: ${error.message}`);
            return false;
        }
    }
    /**
     * Initialize Paystack transaction (Charge API)
     * Used for payment processing (deposits)
     * Required: amount, email, callback_url
     */
    async initializeTransaction(data) {
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
            loggin_1.default.info(`[PAYSTACK] Transaction initialized: ${response.data.data.reference}`);
            return response.data;
        }
        catch (error) {
            loggin_1.default.error(`[PAYSTACK] Transaction initialization failed: ${error.message}`);
            throw error;
        }
    }
    /**
     * Verify Paystack transaction (Charge API)
     * Used to confirm payment (deposits)
     */
    async verifyTransaction(reference) {
        try {
            const response = await this.client.get(`/transaction/verify/${reference}`);
            if (!response.data.status) {
                throw new Error(response.data.message || "Failed to verify transaction");
            }
            return response.data;
        }
        catch (error) {
            loggin_1.default.error(`[PAYSTACK] Transaction verification failed: ${error.message}`);
            throw error;
        }
    }
    /**
     * Generate callback URL for Paystack redirects
     * Paystack redirects here after payment with ?reference={ref}&trxref={tx_id}
     * Mobile app webview watches for this URL and closes when it loads
     */
    generateCallbackUrl() {
        return `${config_1.default.frontend.baseUrl}/wallet/topup/success`;
    }
}
exports.paystackService = new PaystackService();
