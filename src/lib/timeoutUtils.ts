/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

/**
 * Executes the given function, retrying if it throws.
 *
 * @param opts - if no opts given, defaults are used
 */
export async function withRetries<T>(
    fn: () => Promise<T>,
    opts?: { maxRetries?: number; delay?: number; backoff?: number }
): Promise<T> {
    const maxRetries = opts?.maxRetries ?? 3
    const delay = opts?.delay ?? 0
    const backoff = opts?.backoff ?? 1
    let retryCount = 0
    let latestDelay = delay
    while (true) {
        try {
            if (retryCount > 0) {
                console.log(`Retry count: ${retryCount}`)
            }
            return await fn()
        } catch (err) {
            console.log(`Call failed: ${err}`)
            retryCount++
            if (retryCount >= maxRetries) {
                throw err
            }
            if (latestDelay > 0) {
                await sleep(latestDelay)
                latestDelay = latestDelay * backoff
            }
        }
    }
}

/**
 * Sleeps for the specified duration in milliseconds. Note that a duration of 0 will always wait 1 event loop.
 */
export function sleep(duration = 0): Promise<void> {
    return new Promise(r => setTimeout(r, Math.max(duration, 0)))
}
