#!/usr/bin/env mocha -R spec

import express from "express";
import * as http from "http";
import request from "supertest";

import {upstream, UpstreamOptions} from "../lib/express-upstream.js"

const TEST_PORT = +process.env.TEST_PORT || 3000;
const UPSTREAM = "http://127.0.0.1:" + TEST_PORT;

describe("90.error.ts", () => {
    {
        const path = "/502/";
        it(path, async () => {
            const httpAgent = new http.Agent({timeout: 500});
            const agent = getAgent({logger: console, httpAgent: httpAgent});
            await agent.get(path).expect(502);
        });
    }
});

function getAgent(options: UpstreamOptions) {
    const app = express();
    app.use(upstream(UPSTREAM, options));
    return request(app);
}
