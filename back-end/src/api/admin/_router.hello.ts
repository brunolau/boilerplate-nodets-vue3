import { Router } from 'express'
import { RouteBinder } from 'src/utils/express-utils';
import HelloAdminController from './helloAdminController';

const router = Router()

export default () => {
   RouteBinder.registerController(router, HelloAdminController);
    return router;
}
