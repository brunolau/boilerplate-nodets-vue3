export default class EsModuleImportHelper {
    static getObj(importedObj: any): any {
        if (importedObj != null && importedObj.__esModule == true) {
            return importedObj.default;
        }

        return importedObj;
    }
}
