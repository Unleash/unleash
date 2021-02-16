class FeatureHasTagError extends Error {
    constructor(message: string) {
        super();
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.message = message;
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

export default { FeatureHasTagError };
