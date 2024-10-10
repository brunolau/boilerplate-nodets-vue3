import { CURRENCY_CODE } from "../../api/data-contracts/enums";

export default class CurrencyCodeTranslator {
    static getString(val: CURRENCY_CODE) {
        switch (val) {
            case CURRENCY_CODE.EUR:
                return "€";
            case CURRENCY_CODE.CZK:
                return "Kč";
            case CURRENCY_CODE.GBP:
                return "£";
            case CURRENCY_CODE.PLN:
                return "zł";
            case CURRENCY_CODE.USD:
                return "$";
            default:
                return "";
        }
    }
}
