import { MESSAGE_TYPE } from "../../data-contracts/enums";
import { IWebApiClient } from "../../IWebClient";

export class ForgotPasswordRequest {
    email: string = null;
}

export class ForgotPasswordResponse {
    messages: ForgotPasswordMessage[] = null;
}

export class ForgotPasswordMessage {
    forgottenPasswordToken: string = null;
    message: string = null;
    type: MESSAGE_TYPE = null;
}

export default class ForgotPasswordClient implements IWebApiClient {
    webClient: true;

    public static create(): ForgotPasswordClient {
        return new ForgotPasswordClient();
    }

    public post<TArgs extends ForgotPasswordRequest, TResult extends ForgotPasswordResponse>(data: TArgs, timeout?: number): Promise<TResult> {
        return appHttpProvider.apiPost("authorization/forgot-password", data, timeout);
    }
}
