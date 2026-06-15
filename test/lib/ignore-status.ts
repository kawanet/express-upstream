// 30.ignore-status: ignoreStatus filter falls back to the local handler.

import * as http from "node:http"
import {after, before, describe, it} from "node:test"
import request from "supertest"
import {upstream, type UpstreamOptions} from "../../lib/express-upstream.ts"
import {closeServer, startServer, type ExpressModule} from "./util.ts"

export function runIgnoreStatusTests(express: ExpressModule): void {
    describe("ignore-status: pass-through vs fallback to local", () => {
        let server: http.Server
        let UPSTREAM: string

        before(async () => {
            ({server, url: UPSTREAM} = await startServer(getUpstream(express)))
        })

        after(() => closeServer(server))

        // upstream respond
        it("ignoreStatus: null", async () => {
            const local = getLocal(express, UPSTREAM, {logger: console, ignoreStatus: null})
            await request(local).get("/404/").expect(404, "UPSTREAM")
            await request(local).get("/500/").expect(500, "UPSTREAM")
        })

        // fallback to local
        it("ignoreStatus: /404/", async () => {
            const local = getLocal(express, UPSTREAM, {logger: console, ignoreStatus: /404/})
            await request(local).get("/404/").expect(200, "LOCAL")
            await request(local).get("/500/").expect(500, "UPSTREAM")
        })
    })
}

function getLocal(express: ExpressModule, target: string, options: UpstreamOptions) {
    const app = express()
    app.use(upstream(target, options))
    app.use((_req: any, res: any) => res.send("LOCAL"))
    return app
}

function getUpstream(express: ExpressModule) {
    const app = express()
    app.get("/:status/", sampleAPI())
    return app
}

function sampleAPI() {
    return (req: any, res: any) => {
        const {status} = req.params
        res.status(+status || 200).type("html")
        res.send("UPSTREAM")
    }
}
