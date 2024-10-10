import { LANGUAGE } from "../../../api/data-contracts/enums";
import LocalizedText from "../../../api/data-contracts/localized-text";

export default class LocalizedTextUtil {
    static getLocalizedTextValue(value: LocalizedText, langKey: string | LANGUAGE): string {
        if (value == null) {
            return null;
        }

        let retVal = (value as any)[langKey];
        if (retVal == null) {
            if (langKey == "sk") {
                retVal = value.cs;
            } else if (langKey == "cs") {
                retVal = value.sk;
            } else {
                retVal = value.en;
            }
        }

        if (retVal == null) {
            if (value.sk != null) {
                return value.sk;
            }

            for (const propName in value) {
                const text = (value as any)[propName];
                if (text != null && text.toString().length > 0) {
                    return text;
                }
            }
        }

        return retVal || value.sk;
    }
}
