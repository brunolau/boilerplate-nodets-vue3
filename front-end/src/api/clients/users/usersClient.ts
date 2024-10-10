import apiHelper from "../../../utils/api-helper";
import { ResortModel, User, UserCreate, UserEdit, UserExtended } from "../../data-contracts/user";
import { ResponseMessage } from "../../data-contracts/response-message";
import { PERMISSION } from "../../data-contracts/enums";
import JsonColumnUtils from "../../../common/json-column-utils";
import { IWebApiClient } from "../../IWebClient";

export class UserListRequest {
    includeShadow?: boolean;
}

export class UserListResponse {
    users: User[] = null;
    resortCount: number = null;
}

export class UserGetRequest {
    userId: number;
}

export class UserSaveRequest {
    userId: number;
    user: UserEdit;
}

export class UserCreateRequest {
    userId: number;
    user: UserCreate;
}

export class UserCreateResponse {
    user: {
        id: number;
    };

    messages: ResponseMessage[];
}

export class UserAssignRolesRequest {
    assignRolesModel: AssignRolesModel;
    permissions: PERMISSION[];
    userID: number;
}

export class AssignRolesModel {
    resorts: ResortModel[];
}

export default class UserClient implements IWebApiClient {
    webClient: true;

    public static create(): UserClient {
        return new UserClient();
    }

    public getList<TArgs extends UserListRequest, TResult extends UserListResponse>(data: TArgs, timeout?: number): Promise<TResult> {
        return apiHelper.resortAwareApiGet("users/", data, timeout);
    }

    public async get<TArgs extends UserGetRequest, TResult extends UserExtended>(data: TArgs, timeout?: number): Promise<TResult> {
        let resp = await apiHelper.resortAwareApiGet<TResult>("users/" + data.userId, null, timeout);
        if (resp != null) {
            resp = JsonColumnUtils.ensureSubtype(resp, UserExtended as any);
        }

        return resp;
    }

    public update<TArgs extends UserSaveRequest, TResult extends ResponseMessage[]>(data: TArgs, timeout?: number): Promise<TResult> {
        return apiHelper.resortAwareApiPost("users/" + data.userId, "PATCH", data.user, timeout);
    }

    public delete<TArgs extends UserGetRequest, TResult extends ResponseMessage[]>(data: TArgs, timeout?: number): Promise<TResult> {
        return apiHelper.resortAwareApiDelete("users/" + data.userId, timeout);
    }

    public createNew<TArgs extends UserCreateRequest, TResult extends UserCreateResponse>(data: TArgs, timeout?: number): Promise<TResult> {
        return apiHelper.resortAwareApiPost("users", "POST", data.user, timeout);
    }

    public assignRoles<TArgs extends UserAssignRolesRequest, TResult extends ResponseMessage[]>(data: TArgs, timeout?: number): Promise<TResult> {
        return apiHelper.resortAwareApiPost(
            "users/" + data.userID + "/assign-roles",
            "POST",
            {
                resorts: data.assignRolesModel.resorts,
                permissions: data.permissions,
            },
            timeout,
        );
    }
}
