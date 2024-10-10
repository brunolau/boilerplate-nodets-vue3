import { CURRENCY_CODE } from "src/data/data-contracts/enums";

export default class CurrencyHelper {
	/**
	 * Returns the currency symbol for the provided currency
	 * @param currency Currency code
	 * @returns The currency symbol
	 */
	static getSymbol(currency: CURRENCY_CODE): string {
		switch (currency) {
			case CURRENCY_CODE.EUR:
				return '€';
			case CURRENCY_CODE.USD:
				return '$';
			case CURRENCY_CODE.CZK:
				return 'Kč';
			case CURRENCY_CODE.PLN:
				return 'zł';
			case CURRENCY_CODE.GBP:
				return '£';
			default:
				return '';
		}
	}
}
