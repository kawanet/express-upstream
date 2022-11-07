# express-upstream

Express.js proxy middleware to pass requests to upstream server

[![Node.js CI](https://github.com/kawanet/express-upstream/workflows/Node.js%20CI/badge.svg?branch=master)](https://github.com/kawanet/express-upstream/actions/)
[![npm version](https://badge.fury.io/js/express-upstream.svg)](https://www.npmjs.com/package/express-upstream)

## SYNOPSIS

```js
const express = require("express");
const upstream = require("express-upstream");
const app = express();

// lookup local files at first
app.use(express.static("htdocs"));

// access remote server otherwise
app.use(upstream("https://example.com", {ignoreStatus: /404|502/}));

// yet another fallback upstream server
app.use(upstream("https://fallback.com"));

app.listen(3000);
```

See TypeScript declaration
[express-upstream.d.ts](https://github.com/kawanet/express-upstream/blob/master/types/express-upstream.d.ts)
for more detail.

## LICENSE

The MIT License (MIT)

Copyright (c) 2020-2022 Yusuke Kawasaki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
