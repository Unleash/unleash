class UsedTokenError extends Error {
    constructor(usedAt: Date) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = `Token was already used at ${usedAt}`;
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

export default UsedTokenError;
module.exports = UsedTokenError;
