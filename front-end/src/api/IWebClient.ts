export interface IWebApiClient {
    webClient: boolean;
}

export enum WebClientApiMethod {
    Get = "get",
    GetAll = "getAll",
    Post = "post",
    Put = "put",
    Delete = "delete",
}
