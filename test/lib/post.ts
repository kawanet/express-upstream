// 20.post: POST body forwarding (raw bytes echo).

import {after, before, describe, it} from "node:test";
import * as http from "node:http";
import request from "supertest";

import {upstream, type UpstreamOptions} from "../../lib/express-upstream.ts";
import {type ExpressModule, closeServer, startServer} from "./util.ts";

const BINARY = "application/octet-stream";

export function runPostTests(express: ExpressModule): void {
    describe("post: raw POST forwarding", () => {
        let server: http.Server;
        let UPSTREAM: string;
        let agent: ReturnType<typeof request>;

        before(async () => {
            ({server, url: UPSTREAM} = await startServer(getServer(express)));
            agent = getAgent(express, UPSTREAM, {logger: console});
        });

        after(() => closeServer(server));

        it("/empty/", async () => {
            await agent.post("/empty/").type(BINARY).send("").expect(200).expect("content-length", "0");
        });

        it("/hello/", async () => {
            await agent.post("/hello/").type(BINARY).send("hello").expect(200).expect("content-length", "5").expect("hello");
        });
    });
}

function getServer(express: ExpressModule) {
    const app = express();
    app.use(express.raw());
    app.use(sampleAPI());
    return app;
}

function getAgent(express: ExpressModule, target: string, options: UpstreamOptions) {
    const app = express();
    app.use(upstream(target, options));
    return request(app);
}

function sampleAPI() {
    return (req: any, res: any) => {
        res.status(200).type("html");
        res.header({"Content-Length": "" + req.body.length});
        res.send(req.body); // echo
    };
}
