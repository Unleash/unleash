import { type ApiErrorSchema, UnleashError } from './unleash-error.js';

class PatternError extends UnleashError {
    statusCode = 400;

    details?: { message: string }[];

    constructor(message: string, details?: string[]) {
        super(message);
        this.details = details?.map((description) => ({
            message: description,
        }));
    }

    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
            details: this.details,
        };
    }
}

export default PatternError;
