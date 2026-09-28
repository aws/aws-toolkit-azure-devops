import { ServiceException as __ServiceException, } from "@smithy/core/client";
export { __ServiceException };
export class SecurityAgentServiceException extends __ServiceException {
    constructor(options) {
        super(options);
        Object.setPrototypeOf(this, SecurityAgentServiceException.prototype);
    }
}
