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

    before(done => {
        server = getUpstream().listen(TEST_PORT, done);
    });

    after(done => {
        server.close(done);
    });

    // upstream respond
    it("ignoreStatus: null", async () => {
        const local = getLocal({logger: console, ignoreStatus: null});
        await request(local).get("/404/").expect(404, "UPSTREAM");
        await request(local).get("/500/").expect(500, "UPSTREAM");
    });

    // fallback to local
    it("ignoreStatus: /404/", async () => {
        const local = getLocal({logger: console, ignoreStatus: /404/});
        await request(local).get("/404/").expect(200, "LOCAL");
        await request(local).get("/500/").expect(500, "UPSTREAM");
    });
});

function getLocal(options: UpstreamOptions) {
    const app = express();
    app.use(upstream(UPSTREAM, options));
    app.use((req, res) => res.send("LOCAL"));
    return app;
}

function getUpstream() {
    const app = express();
    app.get("/:status/", sampleAPI());
    return app;
}

function sampleAPI(): express.RequestHandler {
    return (req, res, next) => {
        const {status} = req.params;
        res.status(+status || 200).type("html");
        res.send("UPSTREAM");
    };
}
