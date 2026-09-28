import { EndpointV2, Logger } from "@smithy/types";
import { EndpointParameters } from "./EndpointParameters";
/**
 * @internal
 */
export declare const defaultEndpointResolver: (endpointParams: EndpointParameters, context?: {
    logger?: Logger;
}) => EndpointV2;
