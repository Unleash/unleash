import { UnleashError } from './unleash-error.js';

class GatewayTimeoutError extends UnleashError {
    statusCode = 504;

    constructor(message: string = 'Gateway Timeout') {
        super(message);
    }
}

export default GatewayTimeoutError;
