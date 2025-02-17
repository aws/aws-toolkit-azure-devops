/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import assert from 'assert'
import * as FakeTimers from '@sinonjs/fake-timers'
import { withRetries } from 'lib/timeoutUtils'
import { SinonStub, SinonSandbox, createSandbox } from 'sinon'

describe('timeoutUtils', () => {
    let clock: FakeTimers.InstalledClock
    let sandbox: SinonSandbox

    function installFakeClock() {
        return FakeTimers.install({
            shouldClearNativeTimers: true,
            shouldAdvanceTime: false
        })
    }

    beforeAll(function() {
        clock = installFakeClock()
    })

    beforeEach(function() {
        sandbox = createSandbox()
    })

    afterAll(function() {
        clock.uninstall()
    })

    afterEach(function() {
        clock.reset()
        sandbox.restore()
    })

    describe('waitUntil w/ retries', () => {
        let fn: SinonStub<[], Promise<string | boolean>>

        beforeEach(function() {
            fn = sandbox.stub()
        })

        test('honors retry delay + backoff multiplier', async function() {
            fn.onCall(0).throws(Error('0')) // 0ms
            fn.onCall(1).throws(Error('1')) // 100ms
            fn.onCall(2).throws(Error('2')) // 200ms
            fn.onCall(3).resolves('success') // 400ms

            // Note 701 instead of 700 for timeout. The 1 millisecond allows the final call to execute
            // since the timeout condition is >= instead of >
            const res = withRetries(fn, { delay: 100, backoff: 2, maxRetries: 4 })

            // Check the call count after each iteration, ensuring the function is called
            // after the correct delay between retries.
            await clock.tickAsync(99)
            assert.strictEqual(fn.callCount, 1)
            await clock.tickAsync(1)
            assert.strictEqual(fn.callCount, 2)

            await clock.tickAsync(199)
            assert.strictEqual(fn.callCount, 2)
            await clock.tickAsync(1)
            assert.strictEqual(fn.callCount, 3)

            await clock.tickAsync(399)
            assert.strictEqual(fn.callCount, 3)
            await clock.tickAsync(1)
            assert.strictEqual(fn.callCount, 4)

            assert.strictEqual(await res, 'success')
        })

        test('throws error if all tries fail', async function() {
            fn.onCall(0).throws(Error('0')) // 0ms
            fn.onCall(1).throws(Error('1')) // 100ms
            fn.onCall(2).throws(Error('2')) // 200ms

            let flag = false
            withRetries(fn, { delay: 100, backoff: 1, maxRetries: 3 }).catch((e: Error) => {
                if (e.message == '2') {
                    flag = true
                }
            })

            await clock.tickAsync(500)

            assert.ok(flag)
        })
    })
})
