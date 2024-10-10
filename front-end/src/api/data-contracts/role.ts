import { PERMISSION, PERMISSION_GROUP } from "./enums";

export default class Role {
    id: number = null;
    name: string = null;
    createdBy: number = null;
    permissions: RolePermissionModel[] = null;
}

export class RolePermissionModel {
    id: number;
    key: PERMISSION;
    groupKey: PERMISSION_GROUP;
}

export class RoleSaveModel {
    name: string = null;
    permissions: PERMISSION[] = null;
}
