/// <reference types="node" />
import * as express from "express";
import * as http from "http";
import * as https from "https";
export interface UpstreamOptions {
    httpAgent?: http.Agent;
    httpsAgent?: https.Agent;
    ignoreStatus?: RegExp | {
        test: (status: string) => boolean;
    };
    logger?: {
        log: (message: string) => void;
    };
    timeout?: number;
}
export declare function upstream(server: string, options?: UpstreamOptions): express.RequestHandler;
