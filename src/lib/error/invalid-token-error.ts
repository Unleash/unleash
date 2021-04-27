class InvalidTokenError extends Error {
    constructor() {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = 'Token was not valid';
    }

    toJSON(): any {
        const obj = {
            isJoi: true,
            name: this.constructor.name,
            details: [
                {
                    message: this.message,
                },
            ],
        };
        return obj;
    }
}

export default InvalidTokenError;
module.exports = InvalidTokenError;
