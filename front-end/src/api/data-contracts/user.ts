class UserBase {
    confirmedAt: DateWrapper = null;
    deletedAt: DateWrapper = null;
    lastLoginAt: DateWrapper = null;
    lastTokenAt: DateWrapper = null;
    email: string = null;
    fullName: string = null;
    phone: string = null;
    disabled: boolean = null;
}

export class User extends UserBase {
    id: number = null;
    permissions: UserPermissionModel[] = null;
    updatedAt: DateWrapper = null;
    updatedBy: string = null;
}

export class UserExtended extends User {
    name: string = null;
    surname: string = null;
    editor: EditorModel = null;
}

export class UserEdit {
    name: string = null;
    surname: string = null;
    email: string = null;
    phone: string = null;
    disabled: boolean = null;
}

export class UserCreate {
    name: string = null;
    surname: string = null;
    email: string = null;
    phone: string = null;
    disabled: boolean = null;
    resorts: ResortModel[] = null;
}

export class ResortModel {
    resortID: number = null;
    roleID: number = null;
}

class EditorModel {
    fullName: string = null;
    name: string = null;
    surname: string = null;
}
