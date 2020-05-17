/// <reference types="node" />
import * as express from "express";
import * as http from "http";
import * as https from "https";
export interface UpstreamOptions {
    /**
     * HTTP agent
     * @see https://nodejs.org/api/http.html
     * @example
     * httpAgent: new http.Agent({keepAlive: true})
     */
    httpAgent?: http.Agent;
    /**
     * HTTPS agent
     * @example
     * httpsAgent: new https.Agent({keepAlive: true})
     */
    httpsAgent?: https.Agent;
    /**
     * Pass to the next RequestAgent if the upstream server respond the statusCode.
     * @example
     * ignoreStatus: /404|502/
     * ignoreStatus: { test: status => (+status === 404) }
     */
    ignoreStatus?: RegExp | {
        test: (status: string) => boolean;
    };
    /**
     * Logging
     * @example
     * logger: console
     */
    logger?: {
        log: (message: string) => void;
    };
}
/**
 * Express.js proxy middleware to pass requests to upstream server
 * @see https://github.com/kawanet/express-upstream/
 * @returns RequestHandler
 */
export declare function upstream(server: string, options?: UpstreamOptions): express.RequestHandler;
