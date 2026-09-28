import { ExceptionOptionType as __ExceptionOptionType } from "@smithy/core/client";
import { ValidationExceptionField } from "./models_0";
import { SecurityAgentServiceException as __BaseException } from "./SecurityAgentServiceException";
/**
 * <p>You do not have sufficient access to perform this action.</p>
 * @public
 */
export declare class AccessDeniedException extends __BaseException {
    readonly name: "AccessDeniedException";
    readonly $fault: "client";
    /**
     * @internal
     */
    constructor(opts: __ExceptionOptionType<AccessDeniedException, __BaseException>);
}
/**
 * <p>An unexpected error occurred during the processing of your request.</p>
 * @public
 */
export declare class InternalServerException extends __BaseException {
    readonly name: "InternalServerException";
    readonly $fault: "server";
    /**
     * @internal
     */
    constructor(opts: __ExceptionOptionType<InternalServerException, __BaseException>);
}
/**
 * <p>The specified resource was not found. Verify that the resource identifier is correct and that the resource exists in the specified agent space or account.</p>
 * @public
 */
export declare class ResourceNotFoundException extends __BaseException {
    readonly name: "ResourceNotFoundException";
    readonly $fault: "client";
    /**
     * @internal
     */
    constructor(opts: __ExceptionOptionType<ResourceNotFoundException, __BaseException>);
}
/**
 * <p>The request was denied due to request throttling.</p>
 * @public
 */
export declare class ThrottlingException extends __BaseException {
    readonly name: "ThrottlingException";
    readonly $fault: "client";
    /**
     * <p>Service code for throttling limit.</p>
     * @public
     */
    serviceCode?: string | undefined;
    /**
     * <p>Quota code for throttling limit.</p>
     * @public
     */
    quotaCode?: string | undefined;
    /**
     * @internal
     */
    constructor(opts: __ExceptionOptionType<ThrottlingException, __BaseException>);
}
/**
 * <p>The input fails to satisfy the constraints specified by the service.</p>
 * @public
 */
export declare class ValidationException extends __BaseException {
    readonly name: "ValidationException";
    readonly $fault: "client";
    /**
     * <p>A list of specific failures encountered during validation.</p>
     * @public
     */
    fieldList?: ValidationExceptionField[] | undefined;
    /**
     * @internal
     */
    constructor(opts: __ExceptionOptionType<ValidationException, __BaseException>);
}
/**
 * <p>The request could not be completed due to a conflict with the current state of the resource.</p>
 * @public
 */
export declare class ConflictException extends __BaseException {
    readonly name: "ConflictException";
    readonly $fault: "client";
    /**
     * @internal
     */
    constructor(opts: __ExceptionOptionType<ConflictException, __BaseException>);
}
/**
 * <p>The request exceeds a service quota. Review your current usage and request a quota increase if needed.</p>
 * @public
 */
export declare class ServiceQuotaExceededException extends __BaseException {
    readonly name: "ServiceQuotaExceededException";
    readonly $fault: "client";
    /**
     * @internal
     */
    constructor(opts: __ExceptionOptionType<ServiceQuotaExceededException, __BaseException>);
}
