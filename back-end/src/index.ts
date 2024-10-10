import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import "reflect-metadata";
import adminApi from './api/admin/_router';
import appConfig from './config/appConfig';



const app = express()
app.disable('x-powered-by');
app.use('/apidoc', express.static('apidoc')) // NOTE: serve apidoc before helmet

//Disable helmet if requested via env
const testDeployMode = (process.env.TEST_DEPLOY_MODE == 'true' || process.env.TEST_DEPLOY_MODE == '1')
if (!testDeployMode) {
    //app.use(helmet())
}

if (appConfig.mode == 'development') {
    app.use(cors());
}

// app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
//app.use(loggingMiddleware)
//app.use(modelBuilderMiddleware)


// app.use(express.json())


//API
app.use('/api/admin', adminApi());

app.listen(appConfig.server.port);
console.log(`Server started in ${appConfig.mode} mode at port ${appConfig.server.port}`);

if (appConfig.mode == 'development') {
    const baseUrl = `http://localhost:${appConfig.server.port}`;
    let epBuilder = `Server url is ${baseUrl}`;
    const routes: string[] = [];

    const getRouterPaths = (router: any, basePath: string) => {
        for (const middleware of router.stack) {
            if (middleware.route) { // routes registered directly on the app
                routes.push(basePath + middleware.route.path);
            } else if (middleware.name === 'router') { // router middleware
                const routePrefix = middleware.regexp.toString().split(`(?:`)[0].split('\\/').join('/').split('/^').join('');
                getRouterPaths(middleware.handle, routePrefix);
            }
        }
    }

    try {
        getRouterPaths(app.router, '');
        epBuilder += '\n\nAvailable endpoints:';


        for (const route of routes) {
            epBuilder += `\n${baseUrl}${route}`;
        }

        console.log(epBuilder);
    } catch (error) { }
}
