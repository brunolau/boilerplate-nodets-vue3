import RolesClient, {  } from "../api/clients/roles/rolesClient";
import UserClient, {  } from "../api/clients/users/usersClient";
import { PERMISSION } from "../api/data-contracts/enums";
import { ResponseMessage } from "../api/data-contracts/response-message";
import Role from "../api/data-contracts/role";
import { ResortModel, UserExtended } from "../api/data-contracts/user";
import NotificationProvider from "../ui/notification";

export default class UserAdminHelper {
    static async getUserData(userId: number): Promise<UserExtended> {
        if (userId == null || !(userId > 0)) {
            let retVal = new UserExtended();
            return retVal;
        }

        try {
            const resp = await UserClient.create().get({ userId: userId });
            if (resp != null) {
                return resp;
            }
        } catch (error) {
            NotificationProvider.showErrorMessage(AppConfig.parseErrorMessage(error as any));
        }
    }

    static async getRoles(): Promise<Role[]> {
        try {
            const respRoles = await RolesClient.create().getList({ includePermissions: true });
            if (respRoles != null) {
                return respRoles.roles;
            }
        } catch (error) {
            NotificationProvider.showErrorMessage(AppConfig.parseErrorMessage(error as any));
        }
    }


    static async assignRoles(userModel: UserExtended, assignRolesModel: ResortModel[]): Promise<ResponseMessage[]> {
        try {
            const respAssignRoles = await UserClient.create().assignRoles({
                userID: userModel.id,
                assignRolesModel: { resorts: assignRolesModel },
                permissions: (userModel.permissions || []).map((p) => p.key as PERMISSION),
            });
            if (respAssignRoles != null) {
                return respAssignRoles;
            }
        } catch (error) {
            NotificationProvider.showErrorMessage(AppConfig.parseErrorMessage(error as any));
        }
    }
}
