// 40.origin-path: how the request path is rewritten when the origin URL has a path component.

import {strict as assert} from "node:assert"
import * as http from "node:http"
import {after, before, describe, it} from "node:test"
import request from "supertest"
import {upstream} from "../../lib/express-upstream.ts"
import {type ExpressModule, closeServer, startServer} from "./util.ts"

export function runOriginPathTests(express: ExpressModule): void {
    describe("origin-path: path rewriting based on origin URL", () => {
        let server: http.Server
        let UPSTREAM: string

        before(async () => {
            ({server, url: UPSTREAM} = await startServer(getServer(express)))
        })

        after(() => closeServer(server))

        it("origin = UPSTREAM + '/'", async () => {
            const origin = UPSTREAM + "/"
            const app = express()
            app.use("/foo/", upstream(origin))

            await request(app).get("/foo/").expect((res: any) => {
                assert.equal(res.text, UPSTREAM + "/")
            })

            await request(app).get("/foo/bar/").expect((res: any) => {
                assert.equal(res.text, UPSTREAM + "/bar/")
            })
        })

        it("origin = UPSTREAM + '/bar/'", async () => {
            const origin = UPSTREAM + "/bar/"
            const app = express()
            app.use("/", upstream(origin))

            await request(app).get("/").expect((res: any) => {
                assert.equal(res.text, UPSTREAM + "/bar/")
            })

            await request(app).get("/foo/").expect((res: any) => {
                assert.equal(res.text, UPSTREAM + "/bar/foo/")
            })
        })

        it("origin = UPSTREAM + '/buz/'", async () => {
            const origin = UPSTREAM + "/buz/"
            const app = express()
            app.use("/foo/", upstream(origin))

            await request(app).get("/foo/").expect((res: any) => {
                assert.equal(res.text, UPSTREAM + "/buz/")
            })

            await request(app).get("/foo/bar/").expect((res: any) => {
                assert.equal(res.text, UPSTREAM + "/buz/bar/")
            })
        })
    })
}

function getServer(express: ExpressModule) {
    const app = express()
    app.use(sampleAPI())
    return app
}

function sampleAPI() {
    return (req: any, res: any) => {
        const {status} = req.params || {}
        res.status(+status || 200).type("html")
        const url = [req.protocol, "://", req.headers.host, req.url].join("")
        res.send(url)
    }
}
