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
    it("ignore404: false", async () => {
        const local = getLocal({logger: console, ignore404: false});
        await request(local).get("/404/").expect(404, "UPSTREAM");
    });

    // fallback to local
    it("ignore404: true", async () => {
        const local = getLocal({logger: console, ignore404: true});
        await request(local).get("/404/").expect(200, "LOCAL");
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
