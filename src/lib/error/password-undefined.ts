export default class PasswordUndefinedError extends Error {
    constructor() {
        super();
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.message = 'Password cannot be empty or undefined';
    }

    toJSON(): any {
        const obj = {
            isJoi: true,
            name: this.constructor.name,
            details: [
                {
                    validationErrors: [],
                    message: 'Password cannot be empty or undefined',
                },
            ],
        };
        return obj;
    }
}
