import { Router } from 'express'
import HelloRouter from './_router.hello';


const router = Router()

export default () => {
	router.use('/hello', HelloRouter())

    return router;
}
