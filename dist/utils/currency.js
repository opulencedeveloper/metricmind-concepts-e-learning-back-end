"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyUtil = void 0;
/**
 * Currency utility to manage absolute conversions between Naira and Kobo.
 * All internal logic must use Kobo (Minor Units) to prevent floating-point drift.
 */
class CurrencyUtil {
    /**
     * Convert Major Units (Naira) to Minor Units (Kobo).
     * Math.round protects against floating-point edge cases (e.g., 0.14 * 100 = 14.000000000000002)
     */
    nairaToKobo(naira) {
        return Math.round(naira * 100);
    }
    /**
     * Convert Minor Units (Kobo) to Major Units (Naira).
     */
    koboToNaira(kobo) {
        return kobo / 100;
    }
    /**
     * Convert Kobo to a strictly formatted Naira string (e.g., for gateways).
     * Monnify API expects a strict two-decimal format like "1000.00".
     */
    formatKoboToNairaString(kobo) {
        return this.koboToNaira(kobo).toFixed(2);
    }
    /**
     * Format Naira amount for user-facing display with comma thousands separator.
     * Example: 5000000 → "5,000,000.00" (Nigerian format)
     * Used for notifications, messages, and UI display where readability matters.
     */
    formatNairaForDisplay(naira) {
        return naira.toLocaleString('en-NG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}
exports.currencyUtil = new CurrencyUtil();
