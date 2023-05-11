import { ApiErrorSchema, UnleashError } from './unleash-error';

export default class ProjectWithoutOwnerError extends UnleashError {
    constructor() {
        super('A project must have at least one owner');
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
