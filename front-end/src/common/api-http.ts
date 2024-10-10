/**
 * Interface for the AJAX setting that will configure the AJAX request
 */
interface AjaxDefinition<T> {
    /**
     * Specifies the content type for content negotiation with the server
     */
    contentType?: string;

    /**
     * Data to be sent to the server.
     */
    data?: string | Object;

    /**
     * Timeout (in milliseconds) for the request.
     */
    timeout?: number;

    /**
     * Custom JSON property adapter allowing changing JSON property to custom object if desired
     */
    jsonAdapter?: (val: any, propName: string, obj: any) => void;

    /**
     * Additional HTTP Headers to-be sent
     */
    headers?: Array<AjaxHeader>;

    /**
     * HTTP request provider
     */
    requestProvider?: AppHttpRequestProvider;

    /**
     * Settings for automated UI-blocking interface
     */
    blockUi?: AjaxBlockUiDefinition;

    /**
     * The type of request to make ("POST" or "GET"), default is "GET". Note: Other HTTP request methods, such as PUT and DELETE, can also be used here, but they are not supported by all browsers.
     */
    type?: string;
}

interface AjaxDefinitionWithUrl<T> extends AjaxDefinition<T> {
    /**
     * A string containing the URL to which the request is sent.
     */
    url: string;
}

interface AjaxDefinitionWithApiMethodName<T> extends AjaxDefinition<T> {
    /**
     * Name of the app API method to call
     */
    apiMethod: string;

    /**
     * Determines if public or private API should be accessed
     */
    apiMode: AppApiMode;

    /**
     * Optional App system domain on which the request should be performed, not mandatory
     */
    appDomain?: string;
}

interface AjaxHeader {
    name: string;
    value: (() => string) | string;
}

interface AjaxBlockUiDefinition {
    enabled: boolean | string;
    blockArgument: boolean | string;
    block?(data: AjaxBlockUiArgs): void;
    unblock?(data: AjaxBlockUiArgs): void;
}

interface AjaxBlockUiArgs {
    callingElement: HTMLElement;
    blockArgument: boolean | string;
}

/**
 * Error data of the AJAX request
 */
interface AjaxError {
    /**
     * Determines if the request was authorized by the App server
     */
    authorized: boolean;

    /**
     * Response data of the AJAX request
     */
    responseData?: any;

    /**
     * Error data of the AJAX request
     */
    errorData?: any;

    /**
     * Unique App error code
     */
    appErrorCode: AppErrorCode;

    /**
     * HTTP status code
     */
    httpCode: number;

    /**
     * Text of the error response from the server
     */
    responseText: string;
}

type AppHttpRequestProvider = "cordovaNative" | "xhr";

const enum AppApiMode {
    Public = 0,
    Private = 1,
}

const enum AppErrorCode {
    NotSpecified = 0,
    Timeout = 1,

    NullUser = 100,
    Unauthorized = 101,

    //Generic units must be below 10000
    MandatoryFieldEmpty = 200,

    //Each tematical unit has reserved 4-digit leading and each part has 4-digit unique code

    NotEnoughFreeTickets = 10000001,
    SeatingReservationValidation = 10000002,
    OneEmailPerEventValidation = 10000003,
    ReservationExpired = 10000004,

    PromoterTermsNotAgreedPromoter = 10010001,
    PromoterTermsNotAgreedAdmin = 10010002,
    PromoterDataEmptyPromoter = 10010003,
    PromoterDataEmptyAdmin = 10010004,

    SeatingReservedBySomeoneElse = 10060001,
}

interface AjaxUrlBuilder {
    buildUrl(args: AjaxUrlBuilderArgs): string;
}

interface AjaxUrlBuilderArgs {
    endpoint: string;
    appDomain: string;
    apiMode: AppApiMode;
}

interface AjaxRequestProviderRequestArgs {
    method: string;
    data: any;
    query: string[];
    headers: AjaxHeader[];
    timeout: number;
    url: string;
}

interface AjaxRequestProviderRequestResponse {
    httpCode: number;
    responseText: string;
}

interface AjaxRequestProvider {
    sendRequest<T>(args: AjaxRequestProviderRequestArgs): Promise<AjaxRequestProviderRequestResponse>;
}

interface AjaxLogProvider {
    log(level: "debug" | "info" | "warning" | "error", message: string, data: any);
}

class appHttpProvider {
    static getRetryCount = 0;
    static postRetryCount = 0;
    static appLanguage: string = null;
    static logProvider: AjaxLogProvider = null;
    static defaultRequestProvider: AppHttpRequestProvider = "xhr";
    static xhrRequestProvider: AjaxRequestProvider = null;
    static cordovaRequestProvider: AjaxRequestProvider = null;
    static getRequestTimeoutMessage(): string {
        if ((window as any).AppState != null) {
            return (window as any).AppState.resources.requestTimeout;
        }

        return null;
    }

    static ajaxDefaults = {
        blockUi: <AjaxBlockUiDefinition>(<any>{
            enabled: false,
            block: null,
            unblock: null,
            blockArgument: null,
        }),
        headers: <Array<AjaxHeader>>[],
    };

    static getRequestProvider(): AjaxRequestProvider {
        if (this.defaultRequestProvider == "cordovaNative" && appHttpProvider.cordovaRequestProvider != null) {
            return appHttpProvider.cordovaRequestProvider;
        }

        return appHttpProvider.xhrRequestProvider;
    }

    private static log(level: "info" | "warning" | "error", message: string, data?: any) {
        if (this.logProvider != null) {
            this.logProvider.log(level, message, data);
        }
    }

    /**
     * Post-process JS object to auto-load some common framework types
     *
     * @param jsObj
     * @param jsonAdapter
     */
    static postProcessJsObject<T>(jsObj: T, jsonAdapter?: any): T {
        var recIterate = function (obj) {
            for (var key in obj) {
                var keyVal = obj[key];
                if (jsonAdapter != null) {
                    jsonAdapter(keyVal, key, obj);
                }

                if (Array.isArray(keyVal)) {
                    keyVal.forEach((arrItem) => {
                        recIterate(arrItem);
                    });
                } else if (keyVal != null && typeof keyVal === "object") {
                    recIterate(keyVal);
                } else {
                    if (keyVal != null && keyVal.indexOf && DateWrapper.isSerializedDate(keyVal)) {
                        try {
                            obj[key] = DateWrapper.deserialize(keyVal);
                            if (isNaN(obj[key].getTime())) {
                                obj[key] = keyVal;
                            }
                        } catch (e) {
                            obj[key] = keyVal;
                        }
                    }
                }
            }
        };

        recIterate(jsObj);
        return jsObj;
    }

    private static performAjaxCall<T>(args: AjaxDefinition<T>, url: string): Promise<T> {
        var mySelf = this;

        return new (window as any).Promise(function (resolve, reject) {
            function tryGetJSON(resp: any): any {
                try {
                    return JSON.parse(resp);
                } catch (e) {
                    try {
                        return JSON.parse(resp + "}");
                    } catch (e) {
                        return null;
                    }
                }
            }

            var method = (args.type || "GET").toUpperCase(),
                data = <any>(args.data || {}),
                ajaxDefaults = mySelf.ajaxDefaults,
                blockUiEnabled = false,
                query: string[] = [];

            if ((method == "GET" || method == "DELETE") && data != null) {
                for (var key in data) {
                    var value = data[key];
                    if (value != null) {
                        if (value.constructor === Array) {
                            var encodedKey = encodeURIComponent(key);
                            for (var i = 0; i < value.length; i++) {
                                query.push(encodedKey + "=" + value[i]);
                            }
                        } else {
                            query.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
                        }
                    }
                }

                data = null;
            }

            if (args.blockUi != null) {
                blockUiEnabled == args.blockUi.enabled;
            } else if (ajaxDefaults.blockUi != null) {
                blockUiEnabled == ajaxDefaults.blockUi.enabled;
            }

            var customAuth = false;
            let headerArr = (args.headers || []).concat(ajaxDefaults.headers || []);
            headerArr.forEach(function (ajaxHeader) {
                if (ajaxHeader.name == "Authorization") {
                    customAuth = true;
                }

                if (!(typeof ajaxHeader.value === "string" || ajaxHeader.value instanceof String)) {
                    ajaxHeader.value = ajaxHeader.value();
                }
            });

            if (!customAuth) {
                if (appHttpProvider.bearerToken != null && appHttpProvider.bearerToken.length > 0 && url.indexOf("UserLogin") == -1) {
                    if (headerArr == null) {
                        headerArr = [];
                    }

                    headerArr.push({
                        name: "Authorization",
                        value: "Bearer " + appHttpProvider.bearerToken,
                    });
                }
            }

            if (appHttpProvider.appLanguage != null && appHttpProvider.appLanguage.length > 0) {
                if (headerArr == null) {
                    headerArr = [];
                }

                headerArr.push({
                    name: "app-language",
                    value: appHttpProvider.appLanguage,
                });
            }

            if (args.contentType != null) {
                if (headerArr == null) {
                    headerArr = [];
                }

                headerArr.push({
                    name: "Content-type",
                    value: args.contentType,
                });

                headerArr.push({
                    name: "Accept",
                    value: "*/*",
                });
            }

            //Build GET url
            url = url + (query.length ? "?" + query.join("&") : "");

            //Start request
            let retryCount = 0;
            let requestLoop = () => {
                let start = new Date().getTime();
                appHttpProvider
                    .getRequestProvider()
                    .sendRequest({
                        data: data,
                        headers: headerArr,
                        method: method,
                        query: query,
                        timeout: args.timeout,
                        url: url,
                    })
                    .then((resp) => {
                        if (blockUiEnabled) {
                            try {
                                mySelf.unblockUi(args);
                            } catch (e) {}
                        }

                        let stop = new Date().getTime();
                        var jsonData = tryGetJSON(resp.responseText);
                        if (jsonData != null) {
                            appHttpProvider.postProcessJsObject(jsonData, args.jsonAdapter);
                        }

                        if (resp.httpCode < 300 && resp.httpCode > 0) {
                            if (resp.httpCode == 204) {
                                appHttpProvider.log("info", "Request success to " + url + ", took " + (stop - start) + "ms");
                                resolve(<any>null);
                            } else if (jsonData != null) {
                                appHttpProvider.log("info", "Request success to " + url + ", took " + (stop - start) + "ms, data returned", jsonData);
                                resolve(<any>jsonData);
                            } else {
                                appHttpProvider.log("info", "Request success to " + url + ", took " + (stop - start) + "ms, text returned", resp.responseText);
                                resolve(<any>resp.responseText);
                            }
                        } else {
                            var errObj: AjaxError = <any>{
                                httpCode: resp.httpCode,
                                data: null,
                                responseText: null,
                                appErrorCode: null,
                                authorized: true,
                            };

                            //Determine if it's an ExceptionWithStatusCode API call error object, or some other, construct the error object
                            if (jsonData != null && jsonData["ErrorCode"] != null) {
                                errObj.responseData = jsonData;
                                errObj.responseText = jsonData["ErrorMessage"];
                                errObj.appErrorCode = jsonData["ErrorCode"];
                                errObj.errorData = jsonData["ErrorData"];
                                errObj.authorized = !(errObj.appErrorCode == AppErrorCode.Unauthorized || errObj.appErrorCode == AppErrorCode.NullUser);

                                try {
                                    delete errObj.responseData["ErrorCode"];
                                    delete errObj.responseData["ErrorMessage"];
                                    delete errObj.responseData["ErrorData"];
                                } catch (e) {
                                    //Do nothing, not that essential
                                }
                            } else {
                                errObj.responseText = resp.responseText;
                            }

                            if (resp.httpCode == -4 || resp.httpCode == -6) {
                                let timeoutMsg = appHttpProvider.getRequestTimeoutMessage();
                                if (timeoutMsg != null && timeoutMsg.length > 0) {
                                    errObj.responseText = timeoutMsg;
                                }

                                errObj.appErrorCode = AppErrorCode.Timeout;
                            }

                            if (errObj.appErrorCode != null && errObj.appErrorCode != AppErrorCode.Timeout) {
                                appHttpProvider.log("warning", "Request to " + url + " failed with known exception, took " + (stop - start) + "ms", errObj);
                                reject(errObj);
                                return;
                            }

                            let performRetry = () => {
                                let getRandomArbitrary = (min, max) => {
                                    return Math.random() * (max - min) + min;
                                };

                                setTimeout(() => {
                                    appHttpProvider.log("warning", "Attempting retry to " + url + ", the request took " + (stop - start) + "ms", args.data);
                                    requestLoop();
                                }, getRandomArbitrary(250, 1100));
                            };

                            if (method == "GET" && retryCount < appHttpProvider.getRetryCount) {
                                retryCount += 1;
                                performRetry();
                            } else if (retryCount < appHttpProvider.postRetryCount) {
                                retryCount += 1;
                                performRetry();
                            } else {
                                appHttpProvider.log("error", "Request to " + url + " has failed, took " + (stop - start) + "ms", {
                                    err: errObj,
                                    postData: data,
                                });

                                reject(errObj);
                            }
                        }
                    });
            };

            appHttpProvider.log("info", "Starting request to " + url, args);
            requestLoop();
        });
    }

    static enforceDomain: string;
    static bearerToken: string;

    /**
     * Performs AJAX call based on given call definition
     */
    static callAjax<T>(args: AjaxDefinitionWithUrl<T>): Promise<T> {
        return this.performAjaxCall(args, args.url);
    }

    /**
     * Performs AJAX call to current App API version
     */
    static callApi<T>(args: AjaxDefinitionWithApiMethodName<T>): Promise<T> {
        return this.performAjaxCall(args, this.getApiUrl(args.apiMode, args.appDomain, args.apiMethod) + args.apiMethod);
    }

    /**
     * Load JSON-encoded data from the server using a POST HTTP request.
     *
     * @param url A string containing the URL to which the request is sent.
     * @param data A plain object or string that is sent to the server with the request.
     * @param success A callback function that is executed if the request succeeds.
     * @param error? A callback function that is executed if the request fails.
     * @param timeout Amount of ms after which the request times out
     */
    static postJSON<T>(url: string, data: Object | string, timeout?: number): Promise<T> {
        if (data != null && !(typeof data === "string" || data instanceof String)) {
            data = JSON.stringify(data);
        }

        return this.callAjax<T>({
            type: "POST",
            url: url,
            data: data,
            contentType: "application/json; charset=utf-8",
            timeout: timeout,
        });
    }

    /**
     * POST data to App API and obtain response
     *
     * @param apiMethodName App server API method name
     * @param data A plain object or string that is sent to the server with the request.
     * @param success A callback function that is executed if the request succeeds.
     * @param error? A callback function that is executed if the request fails.
     * @param timeout Amount of ms after which the request times out
     */
    static apiPost<T>(apiMethodName: string, data: Object | string, timeout?: number): Promise<T> {
        return this.postJSON(this.getApiUrl(AppApiMode.Public, null, apiMethodName) + apiMethodName, data, timeout);
    }

    /**
     * POST data to PRIVATE App API and obtain response
     *
     * @param apiMethodName App server API method name
     * @param data A plain object or string that is sent to the server with the request.
     * @param success A callback function that is executed if the request succeeds.
     * @param error? A callback function that is executed if the request fails.
     * @param timeout Amount of ms after which the request times out
     */
    static privateApiPost<T>(apiMethodName: string, data: Object | string, timeout?: number): Promise<T> {
        return this.postJSON(this.getApiUrl(AppApiMode.Private, null, apiMethodName) + apiMethodName, data, timeout);
    }

    /**
     * Load JSON-encoded data from the server using a GET HTTP request.
     *
     * @param url A string containing the URL to which the request is sent.
     * @param data A plain object or string that is sent to the server with the request.
     * @param success A callback function that is executed if the request succeeds.
     * @param error? A callback function that is executed if the request fails.
     * @param timeout Amount of ms after which the request times out
     */
    static getJSON<T>(url: string, data: Object | string, timeout?: number): Promise<T> {
        return this.callAjax<T>({
            type: "GET",
            url: url,
            data: data,
            contentType: "application/json; charset=utf-8",
            timeout: timeout,
        });
    }

    /**
     * GETs data from App server API
     *
     * @param apiMethodName App server API method name
     * @param data A plain object or string that is sent to the server with the request.
     * @param success A callback function that is executed if the request succeeds.
     * @param error? A callback function that is executed if the request fails.
     * @param timeout Amount of ms after which the request times out
     */
    public static apiGet<T>(apiMethodName: string, data: Object | string, timeout: number = null): Promise<T> {
        return this.getJSON(this.getApiUrl(AppApiMode.Public, null, apiMethodName) + apiMethodName, data, timeout);
    }

    /**
     * GETs data from PRIVATE App server API
     *
     * @param apiMethodName App server API method name
     * @param data A plain object or string that is sent to the server with the request.
     * @param success A callback function that is executed if the request succeeds.
     * @param error? A callback function that is executed if the request fails.
     * @param timeout Amount of ms after which the request times out
     */
    public static privateApiGet<T>(apiMethodName: string, data: Object | string, timeout: number = null): Promise<T> {
        return this.getJSON(this.getApiUrl(AppApiMode.Private, null, apiMethodName) + apiMethodName, data, timeout);
    }

    /**
     * DELETE data to App API and obtain response
     *
     * @param apiMethodName App server API method name
     * @param data A plain object or string that is sent to the server with the request.
     * @param success A callback function that is executed if the request succeeds.
     * @param error? A callback function that is executed if the request fails.
     * @param timeout Amount of ms after which the request times out
     */
    static apiDelete<T>(apiMethodName: string, args: number | string | any, timeout?: number): Promise<T> {
        let url: string;
        if ((!isNaN(parseFloat(args)) && isFinite(args)) || typeof args === "string" || args instanceof String) {
            url = apiMethodName + "/" + args;
        } else {
            url = apiMethodName;
            for (let key in args as any) {
                if (url.indexOf("?") > -1) {
                    url += "&";
                } else {
                    url += "?";
                }

                url += key;
                url += "=";
                url += encodeURIComponent(args[key]);
            }
        }

        return this.callApi({
            apiMethod: url,
            apiMode: AppApiMode.Public,
            type: "DELETE",
            timeout: timeout,
            contentType: "application/json;charset=utf-8",
        });
    }

    public static getApiUrl(apiMode: AppApiMode, appDomain?: string, endpoint?: string): string {
        if (endpoint != null && endpoint.length > 0) {
            let builderArr = this.getApiUrlBuilders();
            if (builderArr != null && builderArr.length > 0) {
                let buildArgs: AjaxUrlBuilderArgs = {
                    apiMode: apiMode,
                    appDomain: appDomain,
                    endpoint: endpoint,
                };

                for (let i = 0, len = builderArr.length; i < len; i++) {
                    let builder = builderArr[i];
                    try {
                        let retVal = builder.buildUrl(buildArgs);
                        if (retVal != null && retVal.length > 0) {
                            return retVal;
                        }
                    } catch (e) {}
                }
            }
        }

        if (apiMode == AppApiMode.Private) {
            return "/api/private/";
        }

        if (this.enforceDomain != null && this.enforceDomain.length > 0) {
            return this.enforceDomain;
        }

        if (window["portalUtils"] && window["portalUtils"].getApiUrl) {
            return window["portalUtils"].getApiUrl();
        }

        if (window["portalUtils"] && window["portalUtils"]["INV_FORCE_DOMAIN"] != null) {
            appDomain = window["portalUtils"]["INV_FORCE_DOMAIN"];
        }

        if (appDomain == null) {
            appDomain = "";
        }

        return appDomain + "/api/" + "v1" + "/";
    }

    private static getApiUrlBuilders(): AjaxUrlBuilder[] {
        if ((window as any).inviton && (window as any).inviton.ajaxUrlBuilders) {
            return (window as any).inviton.ajaxUrlBuilders;
        } else if ((window as any).appAjaxUrlBuilders) {
            return (window as any).appAjaxUrlBuilders;
        }

        return null;
    }

    private static blockUi<T>(args: AjaxDefinition<T>) {
        var blockArgs = this.getBlockArgs(args);
        var ajaxDefaults = this.ajaxDefaults;

        if (args.blockUi != null && args.blockUi.block != null) {
            args.blockUi.block(blockArgs);
        } else if (ajaxDefaults.blockUi != null && ajaxDefaults.blockUi.block != null) {
            ajaxDefaults.blockUi.block(blockArgs);
        }
    }

    private static unblockUi<T>(args: AjaxDefinition<T>) {
        var blockArgs = this.getBlockArgs(args);
        var ajaxDefaults = this.ajaxDefaults;

        if (args.blockUi != null && args.blockUi.unblock != null) {
            args.blockUi.unblock(blockArgs);
        } else if (ajaxDefaults.blockUi != null && ajaxDefaults.blockUi.unblock != null) {
            ajaxDefaults.blockUi.unblock(blockArgs);
        }
    }

    private static getBlockArgs<T>(args: AjaxDefinition<T>): AjaxBlockUiArgs {
        var defVals = <AjaxBlockUiDefinition>(this.ajaxDefaults.blockUi || <any>{ blockArgument: null });

        return <any>{
            callingElement: null, // invUtils.getTopMostCallerTarget(null, null)
            blockArgument: args.blockUi != null ? args.blockUi.blockArgument : defVals.blockArgument,
        };
    }
}

(function () {
    class ajaxProviderXhr implements AjaxRequestProvider {
        sendRequest<T>(args: AjaxRequestProviderRequestArgs): Promise<AjaxRequestProviderRequestResponse> {
            return new Promise((resolve) => {
                var x = new XMLHttpRequest();

                x.open(args.method, args.url, true);
                x.onreadystatechange = function () {
                    if (x.readyState == 4) {
                        let status = x.status;
                        if (status == 0) {
                            status = -4;
                        }

                        resolve({
                            httpCode: status,
                            responseText: x.responseText,
                        });
                    }
                };
                (args.headers || []).forEach(function (ajaxHeader) {
                    x.setRequestHeader(ajaxHeader.name, typeof ajaxHeader.value === "string" || ajaxHeader.value instanceof String ? (ajaxHeader.value as string) : ajaxHeader.value());
                });

                if (args.timeout != null) {
                    x.timeout = args.timeout;
                }

                x.send(args.data);
            });
        }
    }

    class ajaxProviderCordova implements AjaxRequestProvider {
        sendRequest<T>(args: AjaxRequestProviderRequestArgs): Promise<AjaxRequestProviderRequestResponse> {
            return new Promise((resolve) => {
                let cordova = (window as any).cordova;
                let timeout: number = 45;

                if (args.timeout > 0) {
                    timeout = args.timeout / 1000;
                }

                let headerMap = {} as any;
                (args.headers || []).forEach((header) => {
                    headerMap[header.name] = header.value;
                });

                let requestArgs = {
                    timeout: timeout,
                    method: args.method.toLowerCase(),
                    serializer: "json",
                    responseType: "text",
                    headers: headerMap,
                };

                if (args.data != null) {
                    let data = args.data;
                    if (typeof data === "string" || data instanceof String) {
                        data = JSON.parse(data as any);
                    }

                    (requestArgs as any).data = data;
                }

                let timeoutEnsure = timeout * 1000 + 3500;
                let cbRaised = false;
                let timeoutEnsureHandle = setTimeout(function () {
                    if (!cbRaised) {
                        cbRaised = true;
                        resolve({
                            httpCode: 0,
                            responseText: "timeout",
                        });
                    }
                }, timeoutEnsure);

                let tryClearTimeoutEnsure = function () {
                    cbRaised = true;

                    try {
                        clearTimeout(timeoutEnsureHandle);
                    } catch (e) {}
                };

                cordova.plugin.http.sendRequest(
                    args.url,
                    requestArgs,
                    function (response) {
                        if (cbRaised) {
                            return;
                        }

                        tryClearTimeoutEnsure();
                        resolve({
                            httpCode: response.status,
                            responseText: response.data,
                        });
                    },
                    function (response) {
                        if (cbRaised) {
                            return;
                        }

                        tryClearTimeoutEnsure();
                        resolve({
                            httpCode: response.status,
                            responseText: response.error,
                        });
                    }
                );
            });
        }
    }

    appHttpProvider.xhrRequestProvider = new ajaxProviderXhr();

    if ((window as any).cordova != null) {
        appHttpProvider.cordovaRequestProvider = new ajaxProviderCordova();
    }
})();
(function () {
    window["appHttpProvider"] = appHttpProvider;
})();
