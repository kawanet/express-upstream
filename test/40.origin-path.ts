#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import * as express from "express";
import * as http from "http";
import * as request from "supertest";

import {upstream} from "../lib/express-upstream.js"

const TEST_PORT = +process.env.TEST_PORT || 3000;
const UPSTREAM = "http://127.0.0.1:" + TEST_PORT;

describe("40.origin-path.ts", () => {
    let server: http.Server;

    before(done => {
        server = getServer().listen(TEST_PORT, done);
    });

    after(done => {
        server.close(done);
    });

    {
        const origin = UPSTREAM + "/";
        it(origin, async () => {
            const app = express();
            app.use("/foo/", upstream(origin));

            await request(app).get("/foo/").expect(res => {
                assert.equal(res.text, UPSTREAM + "/");
            });

            await request(app).get("/foo/bar/").expect(res => {
                assert.equal(res.text, UPSTREAM + "/bar/");
            });
        });
    }

    {
        const origin = UPSTREAM + "/bar/";
        it(origin, async () => {
            const app = express();
            app.use("/", upstream(origin));

            await request(app).get("/").expect(res => {
                assert.equal(res.text, UPSTREAM + "/bar/");
            });

            await request(app).get("/foo/").expect(res => {
                assert.equal(res.text, UPSTREAM + "/bar/foo/");
            });
        });
    }

    {
        const origin = UPSTREAM + "/buz/";
        it(origin, async () => {
            const app = express();
            app.use("/foo/", upstream(origin));

            await request(app).get("/foo/").expect(res => {
                assert.equal(res.text, UPSTREAM + "/buz/");
            });

            await request(app).get("/foo/bar/").expect(res => {
                assert.equal(res.text, UPSTREAM + "/buz/bar/");
            });
        });
    }
});

function getServer() {
    const app = express();
    app.use(sampleAPI());
    return app;
}

function sampleAPI(): express.RequestHandler {
    return (req, res, next) => {
        const {status} = req.params;
        res.status(+status || 200).type("html");
        const url = [req.protocol, "://", req.headers.host, req.url].join("");
        res.send(url);
    };
}
