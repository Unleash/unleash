import type { TestResult } from 'owasp-password-strength-test';
import { type ApiErrorSchema, UnleashError } from './unleash-error.js';

type ValidationError = {
    validationErrors: string[];
    message: string;
};

class OwaspValidationError extends UnleashError {
    statusCode = 400;

    private details: [ValidationError];

    constructor(testResult: TestResult) {
        const details = {
            validationErrors: testResult.errors,
            message: testResult.errors[0],
        };
        super(testResult.errors[0]);

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
