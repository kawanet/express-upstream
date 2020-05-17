"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upstream = void 0;
const http = require("http");
const https = require("https");
const url_1 = require("url");
const defaultPorts = {
    "http:": 80,
    "https:": 443,
};
const ignoreHeaders = {
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
function upstream(server, options) {
    if (!options)
        options = {};
    const { ignoreStatus, logger } = options;
    const url = new url_1.URL(server);
    const protoPort = defaultPorts[url.protocol];
    if (!protoPort || !url.hostname) {
        throw new Error("Invalid upstream: " + server);
    }
    const { port } = url;
    return (req, res, next) => {
        const reqOpts = {};
        reqOpts.method = req.method;
        reqOpts.protocol = url.protocol;
        reqOpts.host = url.hostname;
        if (port)
            reqOpts.port = port;
        reqOpts.agent = (protoPort === 443) ? (options.httpsAgent || new https.Agent()) : (options.httpAgent || new http.Agent());
        reqOpts.path = req.url;
        const reqURL = [url.protocol, "//" + url.host, reqOpts.path].join("");
        if (logger)
            logger.log(reqURL);
        const headers = reqOpts.headers = {};
        Object.keys(req.headers).filter(key => !ignoreHeaders[key]).forEach(key => headers[key] = req.headers[key]);
        headers.host = url.host;
        const reqUp = http.request(reqOpts, resUp => {
            const { headers, statusCode } = resUp;
            if (ignoreStatus && ignoreStatus.test(String(statusCode)) && req.method === "GET") {
                return next();
            }
            res.status(statusCode);
            Object.keys(headers).filter(key => !ignoreHeaders[key]).forEach(key => res.setHeader(key, headers[key]));
            resUp.pipe(res);
        });
        reqUp.on("error", err => {
            if (logger)
                logger.log(err + "");
            res.status(502).end();
        });
        req.pipe(reqUp);
    };
}
exports.upstream = upstream;
