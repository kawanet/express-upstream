// Test entry for the Express 5 line.

import {describe} from "node:test";
import express5 from "express5";

import {runUpstreamTests} from "./lib/upstream.ts";
import {runPostTests} from "./lib/post.ts";
import {runIgnoreStatusTests} from "./lib/ignore-status.ts";
import {runOriginPathTests} from "./lib/origin-path.ts";
import {runKeepAliveTests} from "./lib/keep-alive.ts";
import {runErrorTests} from "./lib/error.ts";
import type {ExpressModule} from "./lib/util.ts";

// Runtime tests cover both Express 4 and 5. Type-level dual coverage
// is intentionally out of scope, so this cast pins express5 to the
// Express 4 baseline that the shared runners type-check against.
const express = express5 as unknown as ExpressModule;

describe("upstream.express5.test.ts", () => {
    runUpstreamTests(express);
    runPostTests(express);
    runIgnoreStatusTests(express);
    runOriginPathTests(express);
    runKeepAliveTests(express);
    runErrorTests(express);
});
