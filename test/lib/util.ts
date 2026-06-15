// Shared helpers for the per-topic test modules.
// Kept minimal so each topic file can stay focused on its scenarios.

import * as http from "node:http"
import type {Express} from "express"

// Express factory shape that includes both the call signature and the
// namespace methods (`.static`, `.Router`, `.json`, `.raw`, ...) the
// runners reach for. Express ships as a CommonJS `export = e`
// namespace, so `typeof import("express")` resolves to the value of
// `import express from "express"` directly (no `.default`).
export type ExpressModule = typeof import("express")

// Bind on a random port so two test entry files (express4 / express5) can
// run in parallel without contending for a fixed TEST_PORT.
//
// `app.listen()` on an Express application internally constructs and returns
// an `http.Server`, which is the object that owns `.address()` / `.close()`.
// Capturing that returned server (rather than re-using the app reference) is
// important because the Express app itself does not expose `.address()` and
// using it would silently throw inside the listening callback.
export function startServer(app: Express): Promise<{server: http.Server, url: string}> {
    return new Promise((resolve, reject) => {
        const server: http.Server = app.listen(0, "127.0.0.1", () => {
            const addr = server.address()
            if (typeof addr === "object" && addr !== null) {
                resolve({server, url: `http://127.0.0.1:${addr.port}`})
            } else {
                reject(new Error("server.address() returned unexpected value"))
            }
        })
        server.once("error", reject)
    })
}

export function closeServer(server: http.Server): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        server.close(err => err ? reject(err) : resolve())
    })
}

// Allocate a port, then immediately release it so subsequent connect attempts
// to that port reliably fail (used to test the "upstream unreachable" path).
export async function reserveUnreachablePort(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        const tmp = http.createServer()
        tmp.once("error", reject)
        tmp.listen(0, "127.0.0.1", () => {
            const addr = tmp.address()
            if (typeof addr !== "object" || addr === null) {
                reject(new Error("server.address() returned unexpected value"))
                return
            }
            const port = addr.port
            tmp.close(err => err ? reject(err) : resolve(port))
        })
    })
}
