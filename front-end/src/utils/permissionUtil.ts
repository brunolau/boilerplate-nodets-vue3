import { PERMISSION } from "../api/data-contracts/enums";

export default class PermissionUtil {
    static hasPermission(permission: PERMISSION): boolean {
        const user = AppState.user;
        if (user == null) {
            return false;
        }

        for (const perm of AppState.user.Profile.permissions || []) {
            if (perm.key == PERMISSION.ADMIN || perm.key == PERMISSION.SUPER_ADMIN || perm.key == permission) {
                return true;
            }
        }

        // for (const role of resort.roles) {
        //     for (const perm of role.permissions) {
        //         if (perm.key == PERMISSION.ADMIN || perm.key == PERMISSION.SUPER_ADMIN || perm.key == permission) {
        //             return true;
        //         }
        //     }
        // }

        return false;
    }

    static isAdmin(): boolean {
        return true;
    }
}
