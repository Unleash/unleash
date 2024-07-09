import { UnleashError } from './unleash-error';

export class PasswordPreviouslyUsedError extends UnleashError {
    statusCode = 400;

    constructor(
        message: string = `You've previously used this password, please use a new password`,
    ) {
        super(message);
    }
}
