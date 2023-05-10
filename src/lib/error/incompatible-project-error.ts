import { ApiErrorSchema, UnleashError } from './api-error';

export default class IncompatibleProjectError extends UnleashError {
    constructor(targetProject: string) {
        super(`${targetProject} is not a compatible target`);
    }

    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
            details: [
                {
                    validationErrors: [],
                    message: this.message,
                    description: this.message,
                },
            ],
        };
    }
}
