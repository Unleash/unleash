class InvalidOperationError extends Error {
    constructor(message: string) {
        super();
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.message = message;
    }

    toJSON(): object {
        return {
            isJoi: true,
            name: this.constructor.name,
            details: [
                {
                    message: this.message,
                },
            ],
        };
    }
}
export default InvalidOperationError;
module.exports = InvalidOperationError;
