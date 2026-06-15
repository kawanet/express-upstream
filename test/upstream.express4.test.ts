// Test entry for the Express 4 line.

import {describe} from "node:test"
import express from "express4"

import {runUpstreamTests} from "./lib/upstream.ts"
import {runPostTests} from "./lib/post.ts"
import {runIgnoreStatusTests} from "./lib/ignore-status.ts"
import {runOriginPathTests} from "./lib/origin-path.ts"
import {runKeepAliveTests} from "./lib/keep-alive.ts"
import {runErrorTests} from "./lib/error.ts"

describe("upstream.express4.test.ts", () => {
    runUpstreamTests(express)
    runPostTests(express)
    runIgnoreStatusTests(express)
    runOriginPathTests(express)
    runKeepAliveTests(express)
    runErrorTests(express)
})
