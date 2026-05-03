import {builtinModules} from "node:module"

// Anything that ships in `dependencies` or comes from Node core is resolved
// by the consumer at runtime — never bundle it. Cover both the bare specifier
// and the `node:` prefixed form so the result does not depend on which form
// a particular source file uses. `express` is kept external too: it is a
// peer at runtime even though we only see it through types here.
const externals = new Set<string>([
    ...builtinModules,
    ...builtinModules.map(m => `node:${m}`),
    "express",
])

export const isExternal = (id: string): boolean => externals.has(id)
