export default class UsedTokenError extends Error {
    constructor(usedAt: Date) {
        super(`Token was already used at ${usedAt}`);
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON(): any {
        const obj = {
            isJoi: true,
            name: this.constructor.name,
            details: [
                {
                    message: super.message,
                },
            ],
        };
        return obj;
    }
}

module.exports = UsedTokenError;
