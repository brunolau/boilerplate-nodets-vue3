import JsonColumnUtils from "../../../common/json-column-utils";
import apiHelper from "../../../utils/api-helper";
import { ResponseMessage } from "../../data-contracts/response-message";
import Role, { RoleSaveModel } from "../../data-contracts/role";
import { IWebApiClient } from "../../IWebClient";

export class RolesListRequest {
    includePermissions: boolean;
}

export class RolesListResponse {
    roles: Role[] = null;
}

export class RoleGetRequest {
    roleId: number;
    includePermissions: boolean;
}

export class RoleGetResponse {
    role: Role;
}

export class RoleSaveRequest {
    roleId: number;
    role: RoleSaveModel;
}

export class RoleCreateResponse {
    role: {
        id: number;
    };

    messages: ResponseMessage[];
}

export default class RolesClient implements IWebApiClient {
    webClient: true;

    public static create(): RolesClient {
        return new RolesClient();
    }

    public getList<TArgs extends RolesListRequest, TResult extends RolesListResponse>(data: TArgs, timeout?: number): Promise<TResult> {
        return apiHelper.resortAwareApiGet("roles/", data, timeout);
    }

    public async get<TArgs extends RoleGetRequest, TResult extends RoleGetResponse>(data: TArgs, timeout?: number): Promise<TResult> {
        const resp = await apiHelper.resortAwareApiGet<TResult>("roles/" + data.roleId, { includePermissions: data.includePermissions }, timeout);
        if (resp != null) {
            resp.role = JsonColumnUtils.ensureSubtype(resp.role, Role);
        }

        return resp;
    }

    public update<TArgs extends RoleSaveRequest, TResult extends ResponseMessage[]>(data: TArgs, timeout?: number): Promise<TResult> {
        return apiHelper.resortAwareApiPost("roles/" + data.roleId, "PATCH", data.role, timeout);
    }

    public createNew<TArgs extends RoleSaveRequest, TResult extends RoleCreateResponse>(data: TArgs, timeout?: number): Promise<TResult> {
        return apiHelper.resortAwareApiPost("roles", "POST", data.role, timeout);
    }
}
