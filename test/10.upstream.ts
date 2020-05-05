#!/usr/bin/env mocha -R spec

import * as express from "express";
import * as http from "http";
import * as request from "supertest";

import {upstream, UpstreamOptions} from "../lib/express-upstream";

const TITLE = __filename.split("/").pop();

const TEST_PORT = +process.env.TEST_PORT || 3000;
const UPSTREAM = "http://127.0.0.1:" + TEST_PORT;

describe(TITLE, () => {
    let server: http.Server;
    const agent = getAgent({logger: console});

    before(done => {
        server = getServer().listen(TEST_PORT, done);
    });

    after(done => {
        server.close(done);
    });

    {
        const path = "/200/";
        it(path, async () => {
            await agent.get(path).expect(200, UPSTREAM + "/200/");
            await agent.get(path).expect(200, UPSTREAM + "/200/");
        });
    }

    {
        const path = "/200/?foo=FOO";
        it(path, async () => {
            await agent.get(path).expect(200, UPSTREAM + "/200/?foo=FOO");
            await agent.get(path).expect(200, UPSTREAM + "/200/?foo=FOO");
        });
    }

    {
        const path = "/404/";
        it(path, async () => {
            await agent.get(path).expect(404, UPSTREAM + "/404/");
            await agent.get(path).expect(404, UPSTREAM + "/404/");
        });
    }
});

function getServer() {
    const app = express();
    app.get("/:status/", sampleAPI());
    return app;
}

function getAgent(options: UpstreamOptions) {
    const app = express();
    app.use(upstream(UPSTREAM, options));
    return request(app);
}

function sampleAPI(): express.RequestHandler {
    return (req, res, next) => {
        const {status} = req.params;
        res.status(+status || 200).type("html");
        const url = [req.protocol, "://", req.headers.host, req.url].join("");
        res.send(url);
    };
}
