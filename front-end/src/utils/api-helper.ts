import PingClient from "../api/clients/authorization/pingClient"
import WebRequestArgsBase from "../api/clients/_common/webRequestArgsBase"
import NotificationProvider from "../ui/notification"

export default class apiHelper {
    static apiPostHttp<T>(apiMethodName: string, data: Object | string, timeout?: number): Promise<T> {
        return appHttpProvider.apiPost(apiMethodName, data, timeout)
    }

    public static async resortAwareApiGet<T>(apiMethodName: string, data: Object | string, timeout: number = null): Promise<T> {
        return this.apiGet<T>(apiMethodName, data, null, timeout)
    }

    public static async resortAwareApiDelete<T>(apiMethodName: string, timeout: number = null): Promise<T> {
        return this.apiDelete<T>(apiMethodName,  timeout)
    }

    public static async resortAwareApiPost<T>(apiMethodName: string, httpMethod: "POST" | "PUT" | "PATCH", data: Object | string, timeout: number = null): Promise<T> {
        return this.apiPost(apiMethodName, httpMethod, data, null, timeout)
    }

    public static async v1ApiGet<T>(apiMethodName: string, data: Object | string, timeout: number = null): Promise<T> {
        let apiUrl = appHttpProvider.enforceDomain
        if (apiUrl.endsWith("/")) {
            apiUrl = apiUrl.substring(0, apiUrl.length - 1)
        }

        let version = apiUrl.split("/").pop()
        let apiUrlBase = appHttpProvider.enforceDomain.replace("/" + version + "/", "/")

        return appHttpProvider.callAjax({
            type: "GET",
            url: apiUrlBase + apiMethodName,
            data: data,
            contentType: "application/json; charset=utf-8",
            timeout: timeout,
        })
    }

    public static async apiGetNoToken<T>(apiMethodName: string, data: Object | string, timeout: number = null): Promise<T> {
        return appHttpProvider.callAjax({
            type: "GET",
            url: appHttpProvider.enforceDomain + apiMethodName,
            data: data,
            contentType: "application/json; charset=utf-8",
            timeout: timeout,
        })
    }

    public static async mobileApiGetNoToken<T>(apiMethodName: string, data: Object | string, timeout: number = null): Promise<T> {
        let apiUrl = appHttpProvider.enforceDomain
        if (apiUrl.endsWith("/")) {
            apiUrl = apiUrl.substring(0, apiUrl.length - 1)
        }
        let version = apiUrl.split("/").pop()
        let apiUrlBase = appHttpProvider.enforceDomain.replace("/" + version + "/", "/mobile/")

        console.log(apiUrlBase + apiMethodName)

        return appHttpProvider.callAjax({
            type: "GET",
            url: apiUrlBase + apiMethodName,
            data: data,
            contentType: "application/json; charset=utf-8",
            timeout: timeout,
        })
    }

    public static async apiGet<T>(apiMethodName: string, data: Object | string, postProcessUrl: (url: string) => string, timeout: number = null): Promise<T> {
        const normalized = await this.getUrl(apiMethodName, data)
        if (postProcessUrl != null) {
            normalized.url = postProcessUrl(normalized.url)
        }

        return appHttpProvider.callAjax({
            type: "GET",
            url: normalized.url,
            data: data,
            contentType: "application/json; charset=utf-8",
            timeout: timeout,
        })
    }

    public static async apiPost<T>(
        apiMethodName: string,
        httpMethod: "POST" | "PUT" | "PATCH",
        data: Object | string,
        postProcessUrl: (url: string) => string,
        timeout: number = null
    ): Promise<T> {
        const normalized = await this.getUrl(apiMethodName, data)
        if (postProcessUrl != null) {
            normalized.url = postProcessUrl(normalized.url)
        }

        const patchEmptyValues = (obj) => {
            Object.keys(obj).forEach((key) => {
                if (obj[key] === "") {
                    obj[key] = null
                }

                if (typeof obj[key] === "object" && obj[key] !== null) {
                    patchEmptyValues(obj[key])
                }
            })
        }

        patchEmptyValues(data)
        return appHttpProvider.callAjax({
            type: httpMethod,
            url: normalized.url,
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            timeout: timeout,
        })
    }

    public static async apiDelete<T>(apiMethodName: string, timeout: number = null): Promise<T> {
        await this.ensureTokenValidity()

        return appHttpProvider.callAjax({
            type: "DELETE",
            url: appHttpProvider.enforceDomain + apiMethodName,
            data: null,
            contentType: "application/json; charset=utf-8",
            timeout: timeout,
        })
    }

    private static async getUrl(apiMethodName: string, data: WebRequestArgsBase | string): Promise<{ url: string }> {
        let url = appHttpProvider.enforceDomain + apiMethodName
        const apiKey = (data as any)?.apiKey

        if (!isNullOrEmpty(apiKey)) {
            url = url + (url.contains("?") ? "&" : "?") + "api_key=" + apiKey
        } else {
            await this.ensureTokenValidity()
        }

        if (data != null) {
            try {
                delete (data as any).apiKey
            } catch (error) {}
        }

        return {
            url: url,
        }
    }

    private static async ensureTokenValidity() {
        const user = AppState.user
        const throwUnauthorized = () => {
            throw "not authorized, token expired"
        }

        if (user == null) {
            throwUnauthorized()
            return
        }

        const now = new Date().getTime()
        const validRemaining = user.ExpiresAt - now

        //If more then 10 minutes remaining, skip the ping
        if (validRemaining > 600000) {
            return
        }

        if (validRemaining < 0) {
            throwUnauthorized()
            return
        }

        try {
            const pingResp = await PingClient.create().post({})
            if (pingResp != null && !isNullOrEmpty(pingResp.accessToken)) {
                let newUser: ISessionUser = JSON.parse(JSON.stringify(user))
                newUser.ExpiresAt = null
                newUser.Token = pingResp.accessToken

                AppState.setUser(newUser, true)
            }
        } catch (error) {
            console.error(error)
        }
    }
}
