/// <reference types="node" />

import type * as express from "express";
import type * as http from "http";
import type * as https from "https";

declare interface UpstreamOptions {
    /**
     * Custom HTTP agent used to dial the upstream when the URL scheme is
     * `http:`. If omitted, a default `http.Agent({keepAlive: true})` is
     * created lazily on the first request.
     *
     * @see https://nodejs.org/api/http.html#class-httpagent
     * @example
     * httpAgent: new http.Agent({keepAlive: true})
     */
    httpAgent?: http.Agent;

    /**
     * Custom HTTPS agent used to dial the upstream when the URL scheme is
     * `https:`. If omitted, a default `https.Agent({keepAlive: true})` is
     * created lazily on the first request.
     *
     * @example
     * httpsAgent: new https.Agent({keepAlive: true})
     */
    httpsAgent?: https.Agent;

    /**
     * Pass control to the next middleware in the Express chain when the
     * upstream responds with one of the given status codes (instead of
     * forwarding that status to the client). Useful for layering a remote
     * upstream behind local fallbacks.
     *
     * Accepts either a `RegExp` matched against the status code as a string,
     * or any object exposing a `test(status)` method.
     *
     * @example
     * ignoreStatus: /404|502/
     * @example
     * ignoreStatus: { test: status => (+status === 404) }
     */
    ignoreStatus?: RegExp | {
        test: (status: string) => boolean;
    };

    /**
     * Optional logger used for diagnostic output (one line per outbound
     * upstream request). Anything with a `log(message)` method works,
     * including the global `console`.
     *
     * @example
     * logger: console
     */
    logger?: {
        log: (message: string) => void;
    };
}

/**
 * Express.js proxy middleware that forwards each incoming request to an
 * upstream server. Returns a `RequestHandler` suitable for `app.use(...)`.
 *
 * @param server  Origin URL of the upstream (scheme + host[:port][/path]).
 * @param options Optional behavior tweaks (see `UpstreamOptions`).
 *
 * @see https://github.com/kawanet/express-upstream/
 */
export declare const upstream: (server: string, options?: UpstreamOptions) => express.RequestHandler;
