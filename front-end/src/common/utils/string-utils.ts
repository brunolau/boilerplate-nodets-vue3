export default class StringUtils {
    static getRandomString = (length: number) => {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        let result = "";

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    };

    static normalizeFileName = (name: string) => {
        const nameSplit = name.split(".");
        const extension = nameSplit.pop();
        const justName = nameSplit.join("").replace(/\W/g, "");
        return `${justName}-${StringUtils.getRandomString(8)}.${extension}`;
    };
}
