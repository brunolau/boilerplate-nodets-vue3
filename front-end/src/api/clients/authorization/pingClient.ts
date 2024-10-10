import { IWebApiClient } from "../../IWebClient";

export class PingRequest {}

export class PingResponse {
    accessToken: string;
}

export default class PingClient implements IWebApiClient {
    webClient: true;

    public static create(): PingClient {
        return new PingClient();
    }

    public post<TArgs extends PingRequest, TResult extends PingResponse>(data: TArgs, timeout?: number): Promise<TResult> {
        return appHttpProvider.apiPost("authorization/ping", data, timeout);
    }
}
