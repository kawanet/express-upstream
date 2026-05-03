SRC := $(wildcard ../lib/*.ts)
TYPES := $(wildcard ../types/*.d.ts)
BUILDER_SRC := $(wildcard ./*.ts)

MJS_DST := ../dist/express-upstream.mjs
CJS_DST := ../dist/express-upstream.cjs

MJS_CONFIG := ./rollup-mjs.config.ts
CJS_CONFIG := ./rollup-cjs.config.ts

# Bundle is small: this package is a single source file that only uses
# node:http / node:https / node:url at runtime (all kept external) and
# has no production dependencies. `express` is type-only here so it is
# external too. Anything noticeably larger means an accidental bundling
# of a Node built-in or of `express` itself — fail the build so it
# cannot slip in.
MAX_BYTES := 15000

# Every named export the package documents must survive the round trip
# through both CJS and ESM bundles. List them once and assert in both
# smoke checks below.
NAMED_EXPORTS := upstream

ALL := $(MJS_DST) $(CJS_DST)

####

all: $(ALL)

$(MJS_DST): $(MJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@test "$$(wc -c < $@)" -le $(MAX_BYTES) || { echo "ERROR: $@ exceeds $(MAX_BYTES) byte cap" >&2; exit 1; }
	@ls -l $@
	@echo ""

$(CJS_DST): $(CJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@test "$$(wc -c < $@)" -le $(MAX_BYTES) || { echo "ERROR: $@ exceeds $(MAX_BYTES) byte cap" >&2; exit 1; }
	@ls -l $@
	@echo ""

# Verify the bundles by importing/requiring the package itself.
# This ensures that the public entrypoints (exports/main) are correctly configured.
# Note: process.argv.slice(1) is used because node -e 'code' arg1 arg2
# results in process.argv = ['node', 'arg1', 'arg2'].
smoke: all
	@# MJS smoke test via public entrypoint
	cd .. && node --input-type=module -e 'const m = await import("express-upstream"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing MJS export:", k); process.exit(1); } console.log("MJS export OK:", k); }' $(NAMED_EXPORTS)
	@# CJS smoke test via public entrypoint
	cd .. && node --input-type=commonjs -e 'const m = require("express-upstream"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing CJS export:", k); process.exit(1); } console.log("CJS export OK:", k); }' $(NAMED_EXPORTS)

####

# Build, run smoke tests, and conditionally run full tests (tsc and node:test).
test: all smoke $(TYPES)
	@node -v | grep -qv "^v20" || echo "Node 20 detected: skipping full tests."
	@ [ "$$npm_command" != "install" ] || echo "npm install detected: skipping full tests."
	@node -v | grep -q "^v20" || [ "$$npm_command" = "install" ] || $(MAKE) test-ts

test-ts:
	../node_modules/.bin/tsc --noEmit
	cd .. && node --test test/*.test.ts

clean:
	/bin/rm -fr $(ALL)

.PHONY: all clean test smoke test-ts
