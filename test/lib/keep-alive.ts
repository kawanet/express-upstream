// 50.keep-alive: ten requests reuse a single keep-alive socket against the upstream.

import {after, before, describe, it} from "node:test";
import * as http from "node:http";
import request from "supertest";

import {upstream} from "../../lib/express-upstream.ts";
import {type ExpressModule, closeServer, startServer} from "./util.ts";

export function runKeepAliveTests(express: ExpressModule): void {
    describe("keep-alive: socket reuse", () => {
        let server: http.Server;
        let UPSTREAM: string;
        // Track keep-alive agents so we can destroy them in `after`.
        // Without explicit destroy, the open sockets keep the event loop
        // alive and `node --test` never exits.
        const agents: http.Agent[] = [];

        before(async () => {
            // always respond 400 status
            const app = express().use((_req: any, res: any) => res.status(400).end());
            ({server, url: UPSTREAM} = await startServer(app));
        });

        after(async () => {
            for (const a of agents) a.destroy();
            await closeServer(server);
        });

        it("keepAlive: true", async () => {
            const httpAgent = new http.Agent({timeout: 500, keepAlive: true, keepAliveMsecs: 1000, maxSockets: 4});
            agents.push(httpAgent);

            const app = express();
            app.use(upstream(UPSTREAM, {logger: console, httpAgent: httpAgent}));
            const agent = request(app);

            for (let i = 1; i <= 10; i++) {
                const path = `/req-${i}/`;
                await agent.get(path).expect(400);
            }
        });
    });
}
