import JsonColumnUtils from "../../../common/json-column-utils";
import apiHelper from "../../../utils/api-helper";
import { Log, LogWithValues } from "../../data-contracts/log";
import { IWebApiClient } from "../../IWebClient";

export class LogsListRequest {
    limit?: number;
    page?: number;
    search?: string;
}

export class LogsListResponse {
    logs: Log[] = null;
}

export class LogGetRequest {
    logId: number;
}

export class LogGetResponse {
    log: LogWithValues;
}

export default class LogsClient implements IWebApiClient {
    webClient: true;

    public static create(): LogsClient {
        return new LogsClient();
    }

    public getList<TArgs extends LogsListRequest, TResult extends LogsListResponse>(data: TArgs, timeout?: number): Promise<TResult> {
        return apiHelper.resortAwareApiGet("logs/", data, timeout);
    }

    public async get<TArgs extends LogGetRequest, TResult extends LogGetResponse>(data: TArgs, timeout?: number): Promise<TResult> {
        const resp = await apiHelper.resortAwareApiGet<TResult>("logs/" + data.logId, null, timeout);
        if (resp != null) {
            resp.log = JsonColumnUtils.ensureSubtype(resp.log, LogWithValues);
        }

        return resp;
    }
}
