// express-upstream.ts

import * as express from "express";
import * as http from "http";
import * as https from "https";
import {URL} from "url";

export interface UpstreamOptions {
    httpAgent?: http.Agent;
    httpsAgent?: https.Agent;
    ignoreStatus?: RegExp | { test: (status: string) => boolean };
    logger?: { log: (message: string) => void };
    timeout?: number;
}

type numMap = { [type: string]: number };

const defaultPorts: numMap = {
    "http:": 80,
    "https:": 443,
};

const ignoreHeaders: numMap = {
    "cache-control": 1,
    "content-security-policy": 1,
    "cookie": 1,
    "date": 1,
    "host": 1,
    "referer": 1,
    "set-cookie": 1,
    "te": 1,
    "transfer-encoding": 1,
    "vary": 1,
};

export function upstream(server: string, options?: UpstreamOptions): express.RequestHandler {
    if (!options) options = {} as UpstreamOptions;

    const {ignoreStatus, logger, timeout} = options;

    const url = new URL(server);

    const protoPort = defaultPorts[url.protocol];
    if (!protoPort || !url.hostname) {
        throw new Error("Invalid upstream: " + server);
    }

    const {port} = url;

    return (req, res, next) => {
        const reqOpts = {} as http.RequestOptions;
        reqOpts.method = req.method;
        reqOpts.protocol = url.protocol;
        reqOpts.host = url.hostname;
        if (port) reqOpts.port = port;
        reqOpts.agent = (protoPort === 443) ? (options.httpsAgent || new https.Agent()) : (options.httpAgent || new http.Agent());
        reqOpts.path = req.url;
        if (timeout) reqOpts.timeout = timeout;

        const reqURL = [url.protocol, "//" + url.host, reqOpts.path].join("");
        if (logger) logger.log(reqURL);

        // copy request headers
        const headers = reqOpts.headers = {} as any;
        Object.keys(req.headers).filter(key => !ignoreHeaders[key]).forEach(key => headers[key] = req.headers[key]);
        headers.host = url.host;

        const reqUp = http.request(reqOpts, resUp => {
            // copy response headers
            const {headers, statusCode} = resUp;

            // fallback to the next RequestHandler when upstream response 404 Not Found
            if (ignoreStatus && ignoreStatus.test(String(statusCode)) && req.method === "GET") {
                return next();
            }

            res.status(statusCode);

            Object.keys(headers).filter(key => !ignoreHeaders[key]).forEach(key => res.setHeader(key, headers[key]));

            // pipe response body
            resUp.pipe(res);
        });

        reqUp.on("error", err => {
            if (logger) logger.log(err + "");
            res.status(502).end();
        });

        // pipe request body
        req.pipe(reqUp);
    };
}
