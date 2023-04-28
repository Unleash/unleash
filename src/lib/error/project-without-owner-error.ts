import { ApiErrorSchema, UnleashError } from './api-error';

export default class ProjectWithoutOwnerError extends UnleashError {
    constructor() {
        super({
            message: 'A project must have at least one owner',
            name: 'ProjectWithoutOwnerError',
        });
    }

    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
            details: [
                {
                    description: this.message,
                    message: this.message,
                    validationErrors: [],
                },
            ],
        };
    }
}
