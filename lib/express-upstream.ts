// express-upstream.ts

import * as http from "node:http";
import * as https from "node:https";
import {URL} from "node:url";
// Self-reference via the package name so `tsc --noEmit` resolves these types
// through `package.json` `exports` — the same path an external consumer would
// take. If the `exports.types` mapping ever breaks, the build fails here.
import type * as types from "express-upstream";

export type UpstreamOptions = types.UpstreamOptions

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

const defaultAgentOptions: http.AgentOptions = {
    // Keep sockets around in a pool to be used by other requests in the future. Default = false
    keepAlive: true,

    // Socket timeout in milliseconds. This will set the timeout after the socket is connected.
    timeout: 10000,
}

/**
 * Express.js proxy middleware that forwards each incoming request to an
 * upstream server. Returns a RequestHandler suitable for `app.use(...)`.
 *
 * @see https://github.com/kawanet/express-upstream/
 */

export const upstream: typeof types.upstream = (server, options) => {
    if (!options) options = {} as types.UpstreamOptions;

    const {ignoreStatus, logger} = options;

    const url = new URL(server);

    const protoPort = defaultPorts[url.protocol];
    if (!protoPort || !url.hostname) {
        throw new Error("Invalid upstream: " + server);
    }

    const {port} = url;

    let httpAgent: http.Agent;
    let httpsAgent: https.Agent;

    return (req, res, next) => {
        const reqOpts = {} as http.RequestOptions;
        reqOpts.method = req.method;
        reqOpts.protocol = url.protocol;
        reqOpts.host = url.hostname;
        if (port) reqOpts.port = port;
        reqOpts.agent = (protoPort === 443) ?
            (options.httpsAgent || httpsAgent || (httpsAgent = new https.Agent(defaultAgentOptions))) :
            (options.httpAgent || httpAgent || (httpAgent = new http.Agent(defaultAgentOptions)));
        reqOpts.path = url.pathname.replace(/\/$/, "") + req.url;

        const reqURL = [url.protocol, "//" + url.host, reqOpts.path].join("");
        if (logger) logger.log(reqURL);

        // copy request headers
        const headers = reqOpts.headers = {} as any;
        Object.keys(req.headers).filter(key => !ignoreHeaders[key]).forEach(key => headers[key] = req.headers[key]);
        headers.host = url.host;

        let started = 0;

        const reqUp = http.request(reqOpts, resUp => {
            if (started++) return;

            // copy response headers
            const {headers, statusCode} = resUp;

            // fallback to the next RequestHandler when upstream response 404 Not Found
            if (allowNext(statusCode)) {
                if (resUp.socket?.destroy && !resUp.socket.destroyed) resUp.socket.destroy();
                return next();
            }

            res.status(statusCode);

            Object.keys(headers).filter(key => !ignoreHeaders[key]).forEach(key => res.setHeader(key, headers[key]));

            // pipe response body
            resUp.pipe(res);
        });

        reqUp.once("error", err => {
            if (logger) logger.log(err + "");
            if (started++) return;
            const statusCode = 502;

            // fallback to the next RequestHandler
            if (allowNext(statusCode)) {
                if (reqUp.socket?.destroy && !reqUp.socket.destroyed) reqUp.socket.destroy();
                return next();
            }

            res.status(statusCode).end();
        });

        // pipe request body
        req.pipe(reqUp);

        function allowNext(statusCode: number) {
            return (ignoreStatus && ignoreStatus.test(String(statusCode)) && req.method === "GET");
        }
    };
}
