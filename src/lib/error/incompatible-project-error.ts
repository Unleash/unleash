import { ApiErrorSchema, UnleashError } from './api-error';

export default class IncompatibleProjectError extends UnleashError {
    constructor(targetProject: string) {
        super({
            message: `${targetProject} is not a compatible target`,
            name: 'IncompatibleProjectError',
        });
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
