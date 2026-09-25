import { AwsRestJsonProtocol } from "@aws-sdk/core/protocols";
import type { SecurityAgentClientConfig } from "./SecurityAgentClient";
/**
 * @internal
 */
export declare const getRuntimeConfig: (config: SecurityAgentClientConfig) => {
    apiVersion: string;
    base64Decoder: import("@smithy/types").Decoder;
    base64Encoder: (_input: Uint8Array | string) => string;
    disableHostPrefix: boolean;
    endpointProvider: (params: import("./endpoint/EndpointParameters").EndpointParameters, context?: {
        logger?: import("@smithy/types").Logger;
    }) => import("@smithy/types").EndpointV2;
    extensions: import("./runtimeExtensions").RuntimeExtension[];
    httpAuthSchemeProvider: import("./auth/httpAuthSchemeProvider").SecurityAgentHttpAuthSchemeProvider;
    httpAuthSchemes: import("@smithy/types").HttpAuthScheme[];
    logger: import("@smithy/types").Logger;
    protocol: import("@smithy/types").$ClientProtocol<any, any> | import("@smithy/types").$ClientProtocolCtor<any, any> | typeof AwsRestJsonProtocol;
    protocolSettings: {
        [setting: string]: unknown;
        defaultNamespace?: string;
    };
    serviceId: string;
    sha256: import("@smithy/types").HashConstructor;
    urlParser: import("@smithy/types").UrlParser;
    utf8Decoder: import("@smithy/types").Decoder;
    utf8Encoder: (input: Uint8Array | string) => string;
};
