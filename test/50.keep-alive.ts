#!/usr/bin/env mocha -R spec

import express from "express";
import * as http from "http";
import request from "supertest";

import {upstream} from "../lib/express-upstream.js"

const TEST_PORT = +process.env.TEST_PORT || 3000;
const UPSTREAM = "http://127.0.0.1:" + TEST_PORT;

describe("50.keep-alive.ts", () => {
    let server: http.Server;

    before(done => {
        // always response 400 status
        server = express().use((req, res) => res.status(400).end()).listen(TEST_PORT, done);
    });

    after(done => {
        server.close(done);
    });

    {
        it("keepAlive: true", async () => {
            const httpAgent = new http.Agent({timeout: 500, keepAlive: true, keepAliveMsecs: 1000, maxSockets: 4});

            const app = express();
            app.use(upstream(UPSTREAM, {logger: console, httpAgent: httpAgent}));
            const agent = request(app);

            for (let i = 1; i <= 10; i++) {
                const path = `/req-${i}/`;
                await agent.get(path).expect(400);
            }
        });
    }
});
