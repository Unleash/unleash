import { TestResult } from 'owasp-password-strength-test';
import { UnleashError } from './api-error';

class OwaspValidationError extends UnleashError {
    private errors: string[];

    constructor(testResult: TestResult) {
        super({
            message: testResult.errors[0],
            name: 'OwaspValidationError',
        });
        this.errors = testResult.errors;
    }

    additionalSerializedProps(): object {
        return {
            details: [
                {
                    validationErrors: this.errors,
                    message: this.errors[0],
                },
            ],
        };
    }
}
export default OwaspValidationError;
module.exports = OwaspValidationError;
