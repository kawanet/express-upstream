// 10.upstream: basic GET pass-through to the upstream origin.

import {after, before, describe, it} from "node:test"
import * as http from "node:http"
import request from "supertest"

import {upstream, type UpstreamOptions} from "../../lib/express-upstream.ts"
import {type ExpressModule, closeServer, startServer} from "./util.ts"

export function runUpstreamTests(express: ExpressModule): void {
    describe("upstream: basic GET pass-through", () => {
        let server: http.Server
        let UPSTREAM: string
        let agent: ReturnType<typeof request>

        before(async () => {
            ({server, url: UPSTREAM} = await startServer(getServer(express)))
            agent = getAgent(express, UPSTREAM, {logger: console})
        })

        after(() => closeServer(server))

        it("/200/", async () => {
            await agent.get("/200/").expect(200, UPSTREAM + "/200/")
            await agent.get("/200/").expect(200, UPSTREAM + "/200/")
        })

        it("/200/?foo=FOO", async () => {
            await agent.get("/200/?foo=FOO").expect(200, UPSTREAM + "/200/?foo=FOO")
            await agent.get("/200/?foo=FOO").expect(200, UPSTREAM + "/200/?foo=FOO")
        })

        it("/404/", async () => {
            await agent.get("/404/").expect(404, UPSTREAM + "/404/")
            await agent.get("/404/").expect(404, UPSTREAM + "/404/")
        })
    })
}

function getServer(express: ExpressModule) {
    const app = express()
    app.get("/:status/", sampleAPI())
    return app
}

function getAgent(express: ExpressModule, target: string, options: UpstreamOptions) {
    const app = express()
    app.use(upstream(target, options))
    return request(app)
}

function sampleAPI() {
    return (req: any, res: any) => {
        const {status} = req.params
        res.status(+status || 200).type("html")
        const url = [req.protocol, "://", req.headers.host, req.url].join("")
        res.send(url)
    }
}
