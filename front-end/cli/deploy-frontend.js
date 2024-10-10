const fs = require("fs");
const path = require("path");

console.log("Starting frontend deployment");

const copyRecursiveSync = function (src, dest, filesOnly, dirRead) {
    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();

    if (isDirectory && filesOnly && dirRead) {
        return;
    }

    if (isDirectory) {
        if (fs.existsSync(dest)) {
            fs.rmSync(dest, { recursive: true, force: true });
        }

        fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function (childItemName) {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName), filesOnly, true);
        });
    } else {
        fs.copyFileSync(src, dest);
    }
};

const appWorker = async () => {
    const basePath = path.join(__dirname, "..", "src", "app-routes.ts");

    console.log("Removing possible previous compilation temp files");
    const tempTranspileDir = path.join(__dirname, "tmp");
    if (fs.existsSync(tempTranspileDir)) {
        fs.rmSync(tempTranspileDir, { recursive: true, force: true });
    }

    console.log("Creating temp directory");
    fs.mkdirSync(tempTranspileDir);
    const tempFileName = path.join(tempTranspileDir, "_routes.ts");
    const tempTranspiledFileName = path.join(tempTranspileDir, "_routes.compiled.js");

    console.log("Reading routes file and patching for TSC transpilation");
    let appRoutes = fs.readFileSync(basePath, "utf8");
    let patchedObj = appRoutes.replace("export default class AppRoutes", "// @ts-nocheck\nclass AppRoutes");
    fs.writeFileSync(tempFileName, patchedObj);

    console.log("Compiling routes into temp js file");
    const ts = require("./../node_modules/typescript");
    let program = ts.createProgram([tempFileName], {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS,
        outFile: tempTranspiledFileName,
    });
    let emitResult = program.emit();

    console.log("COnstructing backend routes file");
    let transpiledFile = fs.readFileSync(tempTranspiledFileName, "utf8");
    fs.rmSync(tempTranspileDir, { recursive: true, force: true });

    //This creates global AppRoutes object
    eval(transpiledFile);

    let bodyBuilder = "";
    for (const propName in AppRoutes) {
        if (bodyBuilder.length > 0) {
            bodyBuilder += "\n\n";
        }

        bodyBuilder += `    static readonly ${propName}: IFrontendRoute = {
        name: '${AppRoutes[propName].name}',
        path: '${AppRoutes[propName].path}'         
    }`;
    }

    const routerFileBody = `//This file is generated from app-routes from the frontend project with title and component removed

export interface IFrontendRoute {
    path: string,
    name: string,
    alias?: string[],
    hideMenu?: boolean,
    hideHeader?: boolean,
    meta?: any,
    fullScreen?: boolean,
    title?: () => string
}

export default class FrontendRoutes {
${bodyBuilder}
}`;

    console.log("Patching frontend router - removing component import");

    const backendPath = path.join(__dirname, "..", "..", "back-end", "src");
    if (!fs.existsSync(backendPath)) {
        console.error(`Backend project not found in expected path ${backendPath}, aborting...`);
        process.exit();
    }

    const frontendBuildPath = path.join(__dirname, "..", "dist", "build-prod");
    if (!fs.existsSync(frontendBuildPath)) {
        console.error(`Frontend build not found, have you run build-app-prod NPM script?`);
        process.exit();
    }

    const backendFeTempPath = path.join(backendPath, "frontend-tmp");
    if (fs.existsSync(backendFeTempPath)) {
        fs.rmSync(backendFeTempPath, { recursive: true, force: true });
    }

    console.log("Creating temporary frontend folder");
    const tempTargetDir = path.join(backendFeTempPath, "build");
    fs.mkdirSync(backendFeTempPath);
    fs.mkdirSync(tempTargetDir);

    const liveFrontendDir = path.join(backendPath, "frontend");
    if (!fs.existsSync(liveFrontendDir)) {
        fs.mkdirSync(liveFrontendDir);
    }

    let routerCopied = false;

    console.log("Ensuring router base file");
    if (fs.existsSync(path.join(liveFrontendDir, "frontend-router.ts"))) {
        //fs.copyFileSync(path.join(liveFrontendDir, 'frontend-router.ts'), path.join(backendFeTempPath, 'frontend-router.ts'));
        routerCopied = true;
    }

    routerCopied = false;
    if (!routerCopied) {
        const defaultRouter = `import { NextFunction, Request, Response, Router } from 'express'
import FrontendRoutes, { IFrontendRoute } from './fe-routes'
import fs from 'fs'
import config from 'config'
import { IServerConfig } from '../types/interfaces'
        
const router = Router()
const processCdnPaths = (html: string) => {
	const serverConfig: IServerConfig = config.get('server');
	console.log('useCdnForStaticData: ' + serverConfig.useCdnForStaticData);

	if (serverConfig.useCdnForStaticData) {	
		return html
			.split("window.__publicAssetPath = '/'")
			.join("window.__publicAssetPath = '" + serverConfig.cdnUrl + "/'")
			.split('link href="/')
			.join('link href="' + serverConfig.cdnUrl + '/')
			.split('script src="/')
			.join('script src="' + serverConfig.cdnUrl + '/')
	} else {
		return html
	}
}

export const frontendIndexHtml = processCdnPaths(
	fs.readFileSync(__dirname + '/build/dwh-fe.html').toString()
);

const indexHandler = async (req: Request, res: Response, next: NextFunction) => {
	res.setHeader('Surrogate-Control', 'no-store')
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
	res.setHeader('Pragma', 'no-cache')
	res.setHeader('Expires', '0')
	res.setHeader('Content-Type', 'text/html')
	res.send(frontendIndexHtml)
}
        
export default () => {
    for (const routeName in FrontendRoutes) { 
        const route: IFrontendRoute = (FrontendRoutes as any)[routeName];
        if (route.path.indexOf('/') != 0) {
            console.error('Route invalid [' + route.path + ']');
        }
        
        router.use(route.path, indexHandler);
    }
        
    return router
}`;

        console.log("Base file not found, created from default template");
        fs.writeFileSync(path.join(backendFeTempPath, "frontend-router.ts"), defaultRouter);
    }

    console.log("Writing patched app routes");
    fs.writeFileSync(path.join(backendFeTempPath, "fe-routes.ts"), routerFileBody);

    console.log("Copying output build, might take a while");
    copyRecursiveSync(frontendBuildPath, tempTargetDir);

    const tempOldPath = path.join(backendPath, "frontend-old");
    console.log("Swapping folders");
    fs.renameSync(liveFrontendDir, tempOldPath);
    fs.renameSync(backendFeTempPath, liveFrontendDir);

    console.log("Deleting previous build");
    fs.rmSync(tempOldPath, { recursive: true, force: true });

    console.log("All done, ok");
    process.exit();
};

appWorker();
