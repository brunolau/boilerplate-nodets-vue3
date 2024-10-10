import JsonColumnUtils from "../../../common/json-column-utils";
import apiHelper from "../../../utils/api-helper";
import ApiKey, { APIKeySaveModel } from "../../data-contracts/apiKey";
import { ResponseMessage } from "../../data-contracts/response-message";
import { IWebApiClient } from "../../IWebClient";

export class ApiKeysListRequest {}

export class ApiKeysListResponse {
    apiKeys: ApiKey[];
}

export class ApiKeysRequest {
    apiKeyID: number;
}

export class ApiKeysResponse {
    apiKey: ApiKey;
}

export class ApiKeySaveRequest {
    apiKeyID: number;
    apiKey: APIKeySaveModel;
}

export class ApiKeyCreateResponse {
    apiKey: {
        id: number;
        userID: number;
    };

    messages: ResponseMessage[];
}

export default class ApiKeysClient implements IWebApiClient {
    webClient: true;

    public static create(): ApiKeysClient {
        return new ApiKeysClient();
    }

    public getList<TArgs extends ApiKeysListRequest, TResult extends ApiKeysListResponse>(data: TArgs, timeout?: number): Promise<TResult> {
        return apiHelper.resortAwareApiGet("api-keys/", data, timeout);
    }

    public async get<TArgs extends ApiKeysRequest, TResult extends ApiKeysResponse>(data: TArgs, timeout?: number): Promise<TResult> {
        const resp = await apiHelper.resortAwareApiGet<TResult>("api-keys/" + data.apiKeyID, null, timeout);
        if (resp != null) {
            resp.apiKey = JsonColumnUtils.ensureSubtype(resp.apiKey, ApiKey);
        }

        return resp;
    }

    public update<TArgs extends ApiKeySaveRequest, TResult extends ResponseMessage[]>(data: TArgs, timeout?: number): Promise<TResult> {
        return apiHelper.resortAwareApiPost("api-keys/" + data.apiKeyID, "PATCH", data.apiKey, timeout);
    }

    public createNew<TArgs extends ApiKeySaveRequest, TResult extends ApiKeyCreateResponse>(data: TArgs, timeout?: number): Promise<TResult> {
        return apiHelper.resortAwareApiPost("api-keys", "POST", data.apiKey, timeout);
    }

    public delete<TArgs extends ApiKeysRequest, TResult extends ResponseMessage[]>(data: TArgs, timeout?: number): Promise<TResult> {
        return apiHelper.resortAwareApiDelete("api-keys/" + data.apiKeyID, timeout);
    }
}
