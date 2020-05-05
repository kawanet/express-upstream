/// <reference types="node" />
import * as express from "express";
import * as http from "http";
import * as https from "https";
export interface UpstreamOptions {
    timeout?: number;
    logger?: {
        log: (message: string) => void;
    };
    httpAgent?: http.Agent;
    httpsAgent?: https.Agent;
}
export declare function upstream(server: string, options?: UpstreamOptions): express.RequestHandler;
