import { UnleashError } from './unleash-error.js';

class BadGatewayError extends UnleashError {
    statusCode = 502;

    constructor(message: string = 'Bad Gateway') {
        super(message);
    }
}

export default BadGatewayError;
