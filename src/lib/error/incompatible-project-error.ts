import { ApiErrorSchema, UnleashError } from './unleash-error';

export default class IncompatibleProjectError extends UnleashError {
    statusCode = 403;

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
