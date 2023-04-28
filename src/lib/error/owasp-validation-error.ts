import { TestResult } from 'owasp-password-strength-test';
import { ApiErrorSchema, UnleashError } from './api-error';

class OwaspValidationError extends UnleashError {
    private errors: string[];

    constructor(testResult: TestResult) {
        super({
            message: testResult.errors[0],
            name: 'OwaspValidationError',
        });
        this.errors = testResult.errors;
    }

    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
            details: [
                {
                    validationErrors: this.errors,
                    message: this.errors[0],
                    description: this.errors[0],
                },
            ],
        };
    }
}
export default OwaspValidationError;
module.exports = OwaspValidationError;
