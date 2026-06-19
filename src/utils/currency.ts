/**
 * Currency utility to manage absolute conversions between Naira and Kobo.
 * All internal logic must use Kobo (Minor Units) to prevent floating-point drift.
 */
class CurrencyUtil {
  /**
   * Convert Major Units (Naira) to Minor Units (Kobo).
   * Math.round protects against floating-point edge cases (e.g., 0.14 * 100 = 14.000000000000002)
   */
  public nairaToKobo(naira: number): number {
    return Math.round(naira * 100);
  }

  /**
   * Convert Minor Units (Kobo) to Major Units (Naira).
   */
  public koboToNaira(kobo: number): number {
    return kobo / 100;
  }

  /**
   * Convert Kobo to a strictly formatted Naira string (e.g., for gateways).
   * Monnify API expects a strict two-decimal format like "1000.00".
   */
  public formatKoboToNairaString(kobo: number): string {
    return this.koboToNaira(kobo).toFixed(2);
  }

  /**
   * Format Naira amount for user-facing display with comma thousands separator.
   * Example: 5000000 → "5,000,000.00" (Nigerian format)
   * Used for notifications, messages, and UI display where readability matters.
   */
  public formatNairaForDisplay(naira: number): string {
    return naira.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}

export const currencyUtil = new CurrencyUtil();
