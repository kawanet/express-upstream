#!/usr/bin/env mocha -R spec

import * as express from "express";
import * as http from "http";
import * as request from "supertest";

import {upstream, UpstreamOptions} from "../lib/express-upstream.js"

const TEST_PORT = +process.env.TEST_PORT || 3000;
const UPSTREAM = "http://127.0.0.1:" + TEST_PORT;
const BINARY = "application/octet-stream";

describe("20.post.ts", () => {
    let server: http.Server;
    const agent = getAgent({logger: console});

    before(done => {
        server = getServer().listen(TEST_PORT, done);
    });

    after(done => {
        server.close(done);
    });

    {
        const path = "/empty/";
        it(path, async () => {
            await agent.post(path).type(BINARY).send("").expect(200).expect("content-length", "0");
        });
    }

    {
        const path = "/hello/";
        it(path, async () => {
            await agent.post(path).type(BINARY).send("hello").expect(200).expect("content-length", "5").expect("hello");
        });
    }
});

function getServer() {
    const app = express();
    app.use(express.raw());
    app.use(sampleAPI());
    return app;
}

function getAgent(options: UpstreamOptions) {
    const app = express();
    app.use(upstream(UPSTREAM, options));
    return request(app);
}

function sampleAPI(): express.RequestHandler {
    return (req, res, next) => {
        res.status(200).type("html");
        res.header({"Content-Length": "" + req.body.length});
        res.send(req.body); // echo
    };
}
