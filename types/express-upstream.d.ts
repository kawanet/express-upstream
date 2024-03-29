/// <reference types="node" />

import type * as express from "express";
import type * as http from "http";
import type * as https from "https";

declare interface UpstreamOptions {
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
export declare const upstream: (server: string, options?: UpstreamOptions) => express.RequestHandler;
