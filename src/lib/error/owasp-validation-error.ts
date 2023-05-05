import { TestResult } from 'owasp-password-strength-test';
import { ApiErrorSchema, UnleashError } from './api-error';

class OwaspValidationError extends UnleashError {
    private details: [
        { validationErrors: string[]; message: string },
        ...{ validationErrors: string[]; message: string }[],
    ];

    constructor(testResult: TestResult) {
        const details = {
            validationErrors: testResult.errors,
            message: testResult.errors[0],
        };
        super({
            message: testResult.errors[0],
            name: 'OwaspValidationError',
            details: [details],
        });

        this.details = [details];
    }

    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
            details: this.details,
        };
    }
}
export default OwaspValidationError;
module.exports = OwaspValidationError;
