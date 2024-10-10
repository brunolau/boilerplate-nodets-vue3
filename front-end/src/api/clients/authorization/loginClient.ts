import { IWebApiClient } from "../../IWebClient";

export class LoginRequest {
    email: string = null;
    password: string = null;
    extendedProfile: boolean = null;
}

export class LoginResponse {
    accessToken: string = null;
    profile: LoginResponseProfile = null;
    extendedProfile: UserProfile = null;
}

export class LoginResponseProfile {
    id: number = null;
    fullname: string = null;
}

export default class LoginClient implements IWebApiClient {
    webClient: true;

    public static create(): LoginClient {
        return new LoginClient();
    }

    public post<TArgs extends LoginRequest, TResult extends LoginResponse>(data: TArgs, timeout?: number): Promise<TResult> {
        return appHttpProvider.apiPost("authorization/login", data, timeout);
    }
}
