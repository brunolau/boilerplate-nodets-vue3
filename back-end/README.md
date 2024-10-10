# Node.js backend boilerplate
Backend for Node.js applications, provides basic architecture for building scalable and maintainable applications.

# **Table of Content**

- [NPM commands](#npm-commands)
- [ENV variables](#env-variables)
- [Debugging](#debugging)
- [Basic architecture](#basic-architecture)
  - [Services](#services)
    - [Example](#sample-hello-services)
  - [Controllers](#controllers)
    - [Example](#sample-hello-controller)
  - [Routers](#express-routers)
    - [Example](#sample-router)
- [Database](#database)


## **NPM commands**

| Command				        | Note																				|
| ------------------------------|-----------------------------------------------------------------------------------|
| dev						    | Launches app debug session														|
| db-dev-seed						    | Seed database with data														|
| db-generate-migrations		| Generates migrations according to current DB schema								|
| db-apply-migrations			| Applies pending migrations to the database										|
| db-drop-migration			| Drop selected migration file										|
| db-push-migrations			| Applies pending changes to the database										|
| type-check					| Runs typescript type-check for whole application									|


## **ENV variables**

| ENV variable					| Development	| Production	| Note																					|
| ------------------------------|---------------|---------------|---------------------------------------------------------------------------------------|
| NODE_ENV						| optional		| required		| development/test/production															|
| APP_PORT					    | optional		| required		| Port on which the app listens, default 5492   										|
| DB_URL						| required		| required		| Postgres database connection string													|
| DB_TRACE_TIME						| optional		| optional		| Determines if query completion time is traced (true,false)													|
| DB_LOG_QUERY						| optional		| optional		| Determines if SQL sent to postgres is logged (true, false)											|

## **Debugging**
App comes with attached launch profile for VS code, which simplifies launching the debug, alternatively, run the npm "debug" command

## **Basic architecture**
App is powered by Express 5 and makes heavy use of dependepcy injection. This aims to provide similar architecture that is common in .NET ecosystem and has advantage in easier fulfilling the SOLID principles. DI is provided by the [InversifyJS](https://github.com/inversify/InversifyJS) library, which allows easy binding to interfaces by using symbols. See their docs for more info. Endpoints are driven by "controllers", this is a simple class, which implements the IController interface, for easier implementation there is also a simple base-class provided. Controllers request services as needed from the service container and are just tiny wrapper around the services. All the application and business logic must reside in the service layer.


### **Services**
Service can be defined as a class providing some functionality. Think of it as a small internal SDK. It should follow [SOLID](https://en.wikipedia.org/wiki/SOLID) principles. The app uses [InversifyJS](https://github.com/inversify/InversifyJS) as the DI container, for more details how to use it, check their documentation, this document provides only basic example of usage in this app.

#### **Sample hello services**
The service resides in a folder and consists of multiple files {{serviceName}}.interface.ts, {{serviceName}}.ts, then there is "args" folder for the request and response args and various other needed data models. Check "HotelSettingsService" as a reference. 

Let's create a new folder called "helloService" with following structure

![Hello World](data:image/png;base64,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
)

The implementation is simple and returns just a string that concatenates given request args, it goes as follows:

create-hello.ts
```
export interface CreateHelloRequest {
    count: number,
    type: string,
}

export interface CreateHelloResponse {
    message: string
}

```


helloService.interface.ts
```
import { CreateHelloRequest, CreateHelloResponse } from "./args/create-hello";

export interface IHelloService {
    createHello(args: CreateHelloRequest): Promise<CreateHelloResponse>
}

```


helloService.ts
```
import { injectable } from "inversify";
import { IHelloService } from "./helloService.interface";
import { CreateHelloRequest, CreateHelloResponse } from "./args/create-hello";

@injectable()
export default class HelloService implements IHelloService {
    async createHello(args: CreateHelloRequest): Promise<CreateHelloResponse> {
        return {
            message: `You requested ${args.type} with count of ${args.count}`
        }
    }
}
```

This service has to be registered in the DI container used by the app. This usually resides in the serviceContainer.ts class. To register the service, ensure serviceContainer.ts contains following line

```
container.bind<IHelloService>(SERVICE_TYPES.HelloService).to(HelloService);
```

And exported member SERVICE_TYPES from serviceTypes.ts contains following line
```
const SERVICE_TYPES = {
    ...
    HelloService: Symbol("HelloService")
    ...
};
```

This service is now registered in the DI container.

​


​




### **Controllers**
Controller is just a tiny class implementing the IController interface providing bridge between Express router and the service layer. The controller is defined as follows


```
export interface IController {
    $route?: string
    getAll?(req: ExpressRequest, res: ExpressResponse): Promise<void>
    get?(req: ExpressRequest, res: ExpressResponse): Promise<void>
    post?(req: ExpressRequest, res: ExpressResponse): Promise<void>
    delete?(req: ExpressRequest, res: ExpressResponse): Promise<void>
}

export class ControllerBase implements IController {

}
```

#### **Sample hello controller**
Very simple controller requesting service defined in IHelloService can look like this
```
import container from "src/config/serviceContainer";
import SERVICE_TYPES from "src/config/serviceTypes";
import { IHelloService } from "src/services/booking/helloService/helloService.interface";
import { ControllerBase, ExpressParseQueryNumber, ExpressParseQueryString, ExpressRequest, ExpressResponse, RequestSize, Route } from "src/utils/express-utils";

@Route('/hello')
export default class HelloBookingController extends ControllerBase {
    async get(req: ExpressRequest, res: ExpressResponse) {
        const helloService = container.get<IHelloService>(SERVICE_TYPES.HelloService);
        const resp = await helloService.createHello({
            count: ExpressParseQueryNumber(req, 'count'),
            type: ExpressParseQueryString(req, 'type')
        });

        res.status(200).json(resp);
    }
}
```

Also note the ExpressParseQueryNumber,ExpressParseQueryString helper functions. These are to simplify parsing the query string to request object as no reliable library that would provide parsing query string into given type exists at the moment.

### **Express routers**
App uses standard express routers, for reference check for example the /api/admin/_router.ts. Controller is registered by using the "RouteBinder" helper class. This absorbs all route-registering logic for the controller.

#### **Sample router**
Router contains no logic and no direct route binding, all the logic is provided by the RouteBinder class. Sample code for router could be like this

```
import { Router } from 'express'
import HotelSettingsController from './hotelSettingsController';
import { RouteBinder } from 'src/utils/express-utils';

const router = Router()

export default () => {
    RouteBinder.registerController(router, HotelSettingsController);
    return router;
}
```


```
export interface IController {
    $route?: string
    getAll?(req: ExpressRequest, res: ExpressResponse): Promise<void>
    get?(req: ExpressRequest, res: ExpressResponse): Promise<void>
    post?(req: ExpressRequest, res: ExpressResponse): Promise<void>
    delete?(req: ExpressRequest, res: ExpressResponse): Promise<void>
}

export class ControllerBase implements IController {

}
```

#### **Sample hello controller**
Very simple controller requesting service defined in IHelloService can look like this
```
import container from "src/config/serviceContainer";
import SERVICE_TYPES from "src/config/serviceTypes";
import { IHelloService } from "src/services/booking/helloService/helloService.interface";
import { ControllerBase, ExpressParseQueryNumber, ExpressParseQueryString, ExpressRequest, ExpressResponse, RequestSize, Route } from "src/utils/express-utils";

@Route('/hello')
export default class HelloBookingController extends ControllerBase {
    async get(req: ExpressRequest, res: ExpressResponse) {
        const helloService = container.get<IHelloService>(SERVICE_TYPES.HelloService);
        const resp = await helloService.createHello({
            count: ExpressParseQueryNumber(req, 'count'),
            type: ExpressParseQueryString(req, 'type')
        });

        res.status(200).json(resp);
    }
}
```

Also note the ExpressParseQueryNumber,ExpressParseQueryString helper functions. These are to simplify parsing the query string to request object as no reliable library that would provide parsing query string into given type exists at the moment.

## **Database**
App uses postgres for the data storage. Data access is provided by using [Drizzle ORM](https://orm.drizzle.team/docs/quick-start) in combination with [postgres](https://github.com/porsager/postgres) node client. On top of this there is a layer called drizzle-eftify, which aims to provide more relational approach then drizzle's built-in CRUD and relational API similar to what Entity Framework Core offers for .NET ecosystem. This does not aim to be a full-featured ORM with change tracker, however makes selection and aggregation queries easier without constant need of joins. 

First there is a need to declare a drizzle schema just as written in Drizzle docs, this resides in src/db/schema folder.

Similar to EF Core, the data context has to inherit from DbContext class. Each table (entity) is represented by the DbSet class. This is a generic class of the underlying entity. The underlying data entity represents the table contents itself and has to inherit from DbEntity class. Main application context can be found in src/db/dataContext class and entities have to be located in src/db/entity folder.

### **Example table**
First let's define a simple drizzle schema

```
import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';


export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	name: text('name'),
});

export const userAddress = pgTable('userAddress', {
	id: serial('id').primaryKey(),
	userId: integer('sender_user_id').references(() => users.id),
	address: text('address'),
});
```


Now the entities

usersEntity.ts
```
import { DbEntity } from "../drizzle/drizzle-eftify/db-entity";
import { DbColumn } from "../drizzle/drizzle-eftify/decorators/db-column";
import { DbNavigationProperty } from "../drizzle/drizzle-eftify/decorators/db-navigation-property";
import { users } from "../schema/schema";
import UserAddressEntity from "./userAddressEntity";


export default class UsersEntity extends DbEntity<typeof users> {
    @DbColumn()
    get id() { return this.table.id };

    @DbColumn()
    get name() { return this.table.name }

    @DbNavigationProperty()
    userAddress!: UserAddressEntity

    protected getTableEntity() {
        return users;
    }
}
```


userAddressEntity.ts
```
import { DbEntity } from "../drizzle/drizzle-eftify/db-entity";
import { DbColumn } from "../drizzle/drizzle-eftify/decorators/db-column";
import { userAddress } from "../schema/schema";

export default class UserAddressEntity extends DbEntity<typeof userAddress> {
    @DbColumn()
    get id() { return this.table.id }

    @DbColumn()
    get address() { return this.table.address }

    @DbColumn()
    get userId() { return this.table.userId }

    protected getTableEntity() {
        return userAddress;
    }
}
```


And finally, the data context

```
export default class DataContext extends DbContext {
	get users() { return new DbSet<typeof users, UsersEntity>(this, UsersEntity) }
    get userAddress() { return new DbSet<typeof userAddress, UserAddressEntity>(this, UserAddressEntity) }

    static create() {
        return new DataContext(drizzleDb);
    }

	protected onModelCreating(modelBuilder: DbModelBuilder): void {
		modelBuilder.of(UsersEntity, (entity) => {
			entity.addRelation({
				childEntity: UserAddressEntity,
				fieldName: nameof<UsersEntity>("userAddress"),
				type: 'one',
				mandatory: false,
				joinStatement: function (args) {
					return eq(args.parent.id, args.child.userId);
				}
			})
		});
	}
}
```

DataContext can be created by using the static "create" method and is not a subject to dependency injection for now

### **pre-commit tests**

To activate *pre-commit* hook for type-check and eslint test purposes you need to copy `git_hooks/pre-commit` file to `.git/hooks` folder.
