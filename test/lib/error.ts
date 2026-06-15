// 90.error: upstream unreachable yields a 502 from the middleware.

import * as http from "node:http"
import {after, before, describe, it} from "node:test"
import request from "supertest"

import {upstream, type UpstreamOptions} from "../../lib/express-upstream.ts"
import {type ExpressModule, reserveUnreachablePort} from "./util.ts"

export function runErrorTests(express: ExpressModule): void {
    describe("error: 502 on upstream unreachable", () => {
        let UPSTREAM: string
        const agents: http.Agent[] = []

        before(async () => {
            const port = await reserveUnreachablePort()
            UPSTREAM = `http://127.0.0.1:${port}`
        })

        after(() => {
            for (const a of agents) a.destroy()
        })

        it("/502/", async () => {
            const httpAgent = new http.Agent({timeout: 500})
            agents.push(httpAgent)
            const agent = getAgent(express, UPSTREAM, {logger: console, httpAgent: httpAgent})
            await agent.get("/502/").expect(502)
        })
    })
}

function getAgent(express: ExpressModule, target: string, options: UpstreamOptions) {
    const app = express()
    app.use(upstream(target, options))
    return request(app)
}
