export default class ProjectWithoutOwnerError extends Error {
    constructor() {
        super();
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.message = 'A project must have at least one owner';
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
