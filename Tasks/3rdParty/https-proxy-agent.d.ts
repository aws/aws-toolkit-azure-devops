/*
This FILE's LICENSE from https://github.com/TooTallNate/node-https-proxy-agent
File comes from https://github.com/TooTallNate/node-https-proxy-agent/blob/master/index.d.ts and is unmodified barring this header

Copyright (c) 2013 Nathan Rajlich <nathan@tootallnate.net>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

declare module 'https-proxy-agent' {
    import * as https from 'https'

    namespace HttpsProxyAgent {
        interface HttpsProxyAgentOptions {
            host: string
            port: number
            secureProxy?: boolean
            headers?: {
                [key: string]: string
            }
            [key: string]: any
        }
    }

    // HttpsProxyAgent doesnt *actually* extend https.Agent, but for my purposes I want it to pretend that it does
    class HttpsProxyAgent extends https.Agent {
        constructor(opts: HttpsProxyAgent.HttpsProxyAgentOptions | string)
    }

    export = HttpsProxyAgent
}
