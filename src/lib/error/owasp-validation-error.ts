class OwaspValidationError extends Error {
    private testResult;

    constructor(testResult: owaspPasswordStrengthTest.TestResult) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.testResult = testResult;
    }

    toJSON(): any {
        const obj = {
            isJoi: true,
            name: this.constructor.name,
            details: [
                {
                    validationErrors: this.testResult.errors,
                    message: 'Error',
                },
            ],
        };
        return obj;
    }
}

export default OwaspValidationError;
module.exports = OwaspValidationError;
