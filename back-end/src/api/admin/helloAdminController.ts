import container from "src/config/serviceContainer";
import SERVICE_TYPES from "src/config/serviceTypes";
import { IHelloService } from "src/services/admin/helloService/helloService.interface";
import { ControllerBase, ExpressParseQueryNumber, ExpressParseQueryString, ExpressRequest, ExpressResponse, Route } from "src/utils/express-utils";


@Route('/hello')
export default class HelloAdminController extends ControllerBase {
    async get(req: ExpressRequest, res: ExpressResponse) {
		const helloService = container.get<IHelloService>(SERVICE_TYPES.HelloService);
		const resp = await helloService.createHello({
			type: ExpressParseQueryString(req, 'type'),
			count: ExpressParseQueryNumber(req, 'count')
		});

		res.json(resp);
    }
}
