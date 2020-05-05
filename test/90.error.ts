#!/usr/bin/env mocha -R spec

import * as express from "express";
import * as request from "supertest";

import {upstream, UpstreamOptions} from "../lib/express-upstream";

const TITLE = __filename.split("/").pop();

const TEST_PORT = +process.env.TEST_PORT || 3000;
const UPSTREAM = "http://127.0.0.1:" + TEST_PORT;

describe(TITLE, () => {
    {
        const path = "/502/";
        it(path, async () => {
            const agent = getAgent({logger: console, timeout: 500});
            await agent.get(path).expect(502);
        });
    }
});

function getAgent(options: UpstreamOptions) {
    const app = express();
    app.use(upstream(UPSTREAM, options));
    return request(app);
}
