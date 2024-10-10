import { ResortModel } from "./user";

class APIKeyBase {
    token: string = null;
    description: string = null;
    allowAccess: boolean = null;
}

export class APIKeySaveModel extends APIKeyBase {
    resorts: ResortModel[] = null;
}

export default class APIKey extends APIKeyBase {
    id: number = null;
    lastAccess: DateWrapper = null;
    userID: number = null;
    updatedAt: DateWrapper = null;
}
