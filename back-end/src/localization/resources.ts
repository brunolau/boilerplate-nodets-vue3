import { LANGUAGE } from 'src/data/data-contracts/enums';
import csData from './res/cs.json';
import enData from './res/en.json';
import plData from './res/pl.json';
import skData from './res/sk.json';
type LanguageType = typeof skData;


export default class res {
	static cs = csData;
    static en = enData;
	static pl = plData;
    static sk = skData;
    private static fallbackLanguage = 'sk';

    static t<K extends keyof LanguageType>(key: K, language: LANGUAGE): string {
        let resPack = (this as any)[language as any];
        if (resPack == null) {
            (this as any)[language as any] = this.en;
            resPack = this.en;
        }

        const retVal = resPack[key];
        if (retVal != null) {
            return retVal;
        }

        return (this as any)[this.fallbackLanguage][key];
    }
}
