import { ServiceExceptionOptions as __ServiceExceptionOptions, ServiceException as __ServiceException } from "@smithy/core/client";
export { __ServiceExceptionOptions };
export { __ServiceException };
/**
 * @public
 *
 * Base exception class for all service exceptions from SecurityAgent service.
 */
export declare class SecurityAgentServiceException extends __ServiceException {
    /**
     * @internal
     */
    constructor(options: __ServiceExceptionOptions);
}
