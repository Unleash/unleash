class NotFoundError extends Error {
    constructor(message?: string) {
        super();
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.message = message;
    }
}
export default NotFoundError;
module.exports = NotFoundError;
