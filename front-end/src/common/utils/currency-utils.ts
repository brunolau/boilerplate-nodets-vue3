export class CurrencyUtils {
    /**
     * Converts number to currency representation
     *
     * @param value Number
     * @param currency Currency symbol
     */
    static floatToCurrency(value: number, currency: Currency | string | any): string {
        return LanguageUtils.floatToCurrency(value, currency);
    }

    static getCurrencySymbol(currency: Currency | string | any) {
        return CurrencyUtils.floatToCurrency(1.11, currency).replace("1.11", "").replace("1,11", "").trim();
    }
}
