/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { buildConnectionParameters, getCredentials } from 'lib/awsConnectionParameters'

jest.mock('azure-pipelines-task-lib/task')

const assumeRoleWithWebIdentity = jest.fn()
jest.mock('aws-sdk/clients/all', () => ({
    STS: jest.fn().mockImplementation(() => ({
        assumeRole: jest.fn(() => ({ promise: async () => ({}) })),
        assumeRoleWithWebIdentity: jest.fn((...args: unknown[]) => ({
            promise: async () => assumeRoleWithWebIdentity(...args)
        }))
    }))
}))

const createOidcToken = jest.fn()
jest.mock('azure-devops-node-api', () => ({
    getHandlerFromToken: jest.fn(() => ({})),
    WebApi: jest.fn().mockImplementation(() => ({
        getTaskApi: async () => ({ createOidcToken })
    }))
}))

const ROLE = 'arn:aws:iam::111111111111:role/AzureDevOpsPentestGate'
const SUBJECT = 'sc://my-org/my-project/my-connection'

/** A JWT-shaped token whose payload carries the subject the lib already logs. */
function oidcToken(sub: string = SUBJECT): string {
    const payload = Buffer.from(JSON.stringify({ iss: 'https://vstoken.dev.azure.com/org', sub, aud: 'aud' })).toString(
        'base64'
    )

    return `header.${payload}.signature`
}

interface Store {
    inputs: Record<string, string | undefined>
    vars: Record<string, string | undefined>
    endpointAuth: tl.EndpointAuthorization | undefined
}

const store: Store = { inputs: {}, vars: {}, endpointAuth: undefined }

beforeEach(() => {
    jest.clearAllMocks()
    store.inputs = { awsCredentials: 'my-connection', regionName: 'us-west-2' }
    store.vars = { 'System.AccessToken': 'pipeline-token', 'System.CollectionUri': 'https://dev.azure.com/org/' }
    store.endpointAuth = undefined
    ;(tl.getInput as jest.Mock).mockImplementation((name: string) => store.inputs[name])
    ;(tl.getVariable as jest.Mock).mockImplementation((name: string) => store.vars[name])
    ;(tl.getBoolInput as jest.Mock).mockImplementation(() => false)
    ;(tl.getEndpointAuthorization as jest.Mock).mockImplementation(() => store.endpointAuth)
    ;(tl.getHttpProxyConfiguration as jest.Mock).mockReturnValue(undefined)
    ;(tl.setSecret as jest.Mock).mockImplementation(() => undefined)
    createOidcToken.mockResolvedValue({ oidcToken: oidcToken() })
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => jest.restoreAllMocks())

/** Service connection with OIDC as its ONLY credential source. */
function oidcOnlyEndpoint(): tl.EndpointAuthorization {
    return { scheme: 'None', parameters: { useOIDC: 'true', assumeRoleArn: ROLE } }
}

describe('getCredentials — OIDC assume-role failure', () => {
    // Runs 41/42: the trust policy did not admit the connection's subject, the
    // AccessDenied was swallowed, and the pipeline failed later reporting an invalid
    // security token — 25 lines away from the actual cause.
    it('throws instead of returning undefined when OIDC is the only credential source', async () => {
        store.endpointAuth = oidcOnlyEndpoint()
        assumeRoleWithWebIdentity.mockRejectedValue(
            Object.assign(new Error('User is not authorized to perform sts:AssumeRoleWithWebIdentity'), {
                code: 'AccessDenied'
            })
        )

        await expect(getCredentials(buildConnectionParameters())).rejects.toThrow(
            /Could not assume role arn:aws:iam::111111111111:role\/AzureDevOpsPentestGate/
        )
    })

    it('names the token subject and the underlying cause in the failure', async () => {
        // The subject is what a trust policy is matched against, so it is the value
        // that makes a mismatch diagnosable; the cause must survive too.
        store.endpointAuth = oidcOnlyEndpoint()
        assumeRoleWithWebIdentity.mockRejectedValue(
            new Error('User is not authorized to perform sts:AssumeRoleWithWebIdentity')
        )

        await expect(getCredentials(buildConnectionParameters())).rejects.toThrow(
            new RegExp(`token subject '${SUBJECT.replace(/[/]/g, '\\/')}'`)
        )
        await expect(getCredentials(buildConnectionParameters())).rejects.toThrow(
            /Cause: User is not authorized to perform sts:AssumeRoleWithWebIdentity/
        )
    })

    it('says there is no other credential source, so the real failure is not looked for elsewhere', async () => {
        store.endpointAuth = oidcOnlyEndpoint()
        assumeRoleWithWebIdentity.mockRejectedValue(new Error('AccessDenied'))

        await expect(getCredentials(buildConnectionParameters())).rejects.toThrow(/no other credential source to use/)
    })

    it('does not fall through to the empty key-based path', async () => {
        // The defect: undefined here let the caller build credentials from the blank
        // key fields, which is what produced the misleading token error downstream.
        store.endpointAuth = oidcOnlyEndpoint()
        assumeRoleWithWebIdentity.mockRejectedValue(new Error('AccessDenied'))

        await expect(getCredentials(buildConnectionParameters())).rejects.toThrow()
        expect(tl.setSecret as jest.Mock).not.toHaveBeenCalled()
    })

    it('still throws when the OIDC token itself cannot be issued', async () => {
        // Same reasoning: with no second credential source, a token failure is fatal
        // rather than something to fall back from. Driven through the missing
        // System.AccessToken case, which fails without entering the retry loop.
        store.endpointAuth = oidcOnlyEndpoint()
        delete store.vars['System.AccessToken']

        await expect(getCredentials(buildConnectionParameters())).rejects.toThrow(
            /Could not assume role .*Cause: System\.AccessToken is undefined/s
        )
    })

    it('omits the subject rather than failing when the token cannot be decoded', async () => {
        store.endpointAuth = oidcOnlyEndpoint()
        createOidcToken.mockResolvedValue({ oidcToken: 'not-a-jwt' })
        assumeRoleWithWebIdentity.mockRejectedValue(new Error('AccessDenied'))

        const err = await getCredentials(buildConnectionParameters()).catch((e: Error) => e)
        expect(String(err)).toMatch(/Could not assume role/)
        expect(String(err)).not.toMatch(/token subject/)
    })
})

describe('getCredentials — paths that keep their previous behaviour', () => {
    it('returns access-key credentials when the connection has keys and no OIDC', async () => {
        store.endpointAuth = {
            scheme: 'None',
            parameters: { username: 'AKIAIOSFODNN7EXAMPLE', password: 'secret-key' }
        }

        const credentials = await getCredentials(buildConnectionParameters())
        expect(credentials?.accessKeyId).toBe('AKIAIOSFODNN7EXAMPLE')
        expect(credentials?.secretAccessKey).toBe('secret-key')
        expect(assumeRoleWithWebIdentity).not.toHaveBeenCalled()
    })

    it('does not throw for a connection that has keys alongside OIDC', async () => {
        // A key-carrying connection genuinely does have a second source, so the
        // previous return-undefined-and-continue behaviour is kept for it: the OIDC
        // attempt declines without being tried, and the endpoint path supplies the
        // credentials.
        store.endpointAuth = {
            scheme: 'None',
            parameters: {
                useOIDC: 'true',
                assumeRoleArn: ROLE,
                username: 'AKIAIOSFODNN7EXAMPLE',
                password: 'secret-key'
            }
        }

        await expect(getCredentials(buildConnectionParameters())).resolves.toBeDefined()
        expect(assumeRoleWithWebIdentity).not.toHaveBeenCalled()
    })

    it('returns OIDC credentials unchanged on success', async () => {
        store.endpointAuth = oidcOnlyEndpoint()
        assumeRoleWithWebIdentity.mockResolvedValue({
            Credentials: {
                AccessKeyId: 'ASIAEXAMPLE',
                SecretAccessKey: 'session-secret',
                SessionToken: 'session-token'
            },
            AssumedRoleUser: { Arn: `${ROLE}/session` }
        })

        const credentials = await getCredentials(buildConnectionParameters())
        expect(credentials?.accessKeyId).toBe('ASIAEXAMPLE')
        expect(credentials?.sessionToken).toBe('session-token')
    })
})

describe('getCredentials — OIDC STS region validation', () => {
    // A region carrying a URL delimiter moved the SDK-built STS host off AWS, and the
    // AssumeRoleWithWebIdentity body carries the OIDC token.
    it.each(['@evil.com/', 'us-east-1.attacker.example#', 'us-east-1/x', 'us-east-1:443', 'us-east-1?a'])(
        'refuses %s before minting a token or calling STS',
        async region => {
            store.endpointAuth = oidcOnlyEndpoint()
            store.inputs.regionName = region

            await expect(getCredentials(buildConnectionParameters())).rejects.toThrow(/Invalid AWS region/)
            expect(createOidcToken).not.toHaveBeenCalled()
            expect(assumeRoleWithWebIdentity).not.toHaveBeenCalled()
        }
    )

    it('applies to a region from the AWS.Region variable too', async () => {
        store.endpointAuth = oidcOnlyEndpoint()
        delete store.inputs.regionName
        store.vars['AWS.Region'] = '@evil.com/'

        await expect(getCredentials(buildConnectionParameters())).rejects.toThrow(/Invalid AWS region/)
        expect(createOidcToken).not.toHaveBeenCalled()
    })

    it('does not echo the rejected value', async () => {
        store.endpointAuth = oidcOnlyEndpoint()
        store.inputs.regionName = '@evil.com/'

        const err = await getCredentials(buildConnectionParameters()).catch((e: Error) => e)
        expect(String(err)).not.toContain('evil.com')
    })

    it('names what this path refuses, which is not what an ordinary client refuses', async () => {
        // The format check is shared with SdkUtils' client construction (one regex, so
        // the two cannot drift), but the CONSEQUENCE differs: here an unvalidated
        // region would send the OIDC token itself to another host. The wording has to
        // survive that sharing.
        store.endpointAuth = oidcOnlyEndpoint()
        store.inputs.regionName = '@evil.com/'

        const err = await getCredentials(buildConnectionParameters()).catch((e: Error) => e)
        expect(String(err)).toContain('Refusing to send the OIDC token to an STS endpoint')
    })

    it.each(['us-east-1', 'us-gov-west-1', 'cn-north-1', 'us-isob-east-1', 'ap-southeast-5'])(
        'accepts %s',
        async region => {
            store.endpointAuth = oidcOnlyEndpoint()
            store.inputs.regionName = region
            assumeRoleWithWebIdentity.mockResolvedValue({
                Credentials: { AccessKeyId: 'ASIAEXAMPLE', SecretAccessKey: 's', SessionToken: 't' }
            })

            await expect(getCredentials(buildConnectionParameters())).resolves.toBeDefined()
            expect(assumeRoleWithWebIdentity).toHaveBeenCalledTimes(1)
        }
    )
})
