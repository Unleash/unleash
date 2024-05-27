import { type ApiErrorSchema, UnleashError } from './unleash-error';

export default class ProjectWithoutOwnerError extends UnleashError {
    statusCode = 409;

    constructor() {
        super('A project must have at least one owner');
    }

    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
            details: [
                {
                    message: this.message,
                    validationErrors: [],
                },
            ],
        };
    }
}
