import { TestResult } from 'owasp-password-strength-test';

class OwaspValidationError extends Error {
    private errors: string[];

    constructor(testResult: TestResult) {
        super(testResult.errors[0]);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.errors = testResult.errors;
    }

    toJSON(): any {
        const obj = {
            isJoi: true,
            name: this.constructor.name,
            details: [
                {
                    validationErrors: this.errors,
                    message: this.errors[0],
                },
            ],
        };
        return obj;
    }
}

export default OwaspValidationError;
module.exports = OwaspValidationError;
