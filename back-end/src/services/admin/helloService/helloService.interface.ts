import { CreateHelloRequest, CreateHelloResponse } from "./args/create-hello";

export interface IHelloService {
    createHello(args: CreateHelloRequest): Promise<CreateHelloResponse>
}
