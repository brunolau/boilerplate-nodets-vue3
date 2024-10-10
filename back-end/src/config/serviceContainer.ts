import { Container } from "inversify";
import SERVICE_TYPES from "./serviceTypes";
import { ICache } from "src/services/common/cache/cache.interface";
import CacheProvider from "src/services/common/cache/cache";
import { IHelloService } from "src/services/admin/helloService/helloService.interface";
import HelloService from "src/services/admin/helloService/helloService";


const container = new Container();

container.bind<ICache>(SERVICE_TYPES.Cache).to(CacheProvider).inSingletonScope();
container.bind<IHelloService>(SERVICE_TYPES.HelloService).to(HelloService);

export default container;

