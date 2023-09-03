import BadDataError from './bad-data-error';
import { ApiErrorSchema } from './unleash-error';

class PatternError extends BadDataError {
    pattern: string;

    prompt: string;

    constructor(message: string, pattern: string) {
        super(message);
        this.pattern = pattern;
    }

    toJSON(): ApiErrorSchema {
        return {
            ...super.toJSON(),
            pattern: this.pattern,
        };
    }
}

export default PatternError;
