export default class IncompatibleProjectError extends Error {
    constructor(targetProject: string) {
        super();
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.message = `${targetProject} is not a compatible target`;
    }

    toJSON(): any {
        const obj = {
            isJoi: true,
            name: this.constructor.name,
            details: [
                {
                    validationErrors: [],
                    message: this.message,
                },
            ],
        };
        return obj;
    }
}
