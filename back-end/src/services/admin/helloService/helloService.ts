import { injectable } from "inversify";
import { IHelloService } from "./helloService.interface";
import { CreateHelloRequest, CreateHelloResponse } from "./args/create-hello";
import { db } from "src/db/drizzle/db";
import { lt } from "drizzle-orm";

@injectable()
export default class HelloService implements IHelloService {
	async createHello(args: CreateHelloRequest): Promise<CreateHelloResponse> {
		const userData = await db.users.where(p => lt(p.id, 20)).select(p => ({
			id: p.id,
			name: p.name
		})).firstOrDefault();

		return {
			message: `You requested ${args.type} with count of ${args.count} ... the first user name is ${(userData?.name || 'No user name')}`
		}
	}

}
