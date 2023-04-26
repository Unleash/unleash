import { UnleashError } from './api-error';

export default class IncompatibleProjectError extends UnleashError {
    constructor(targetProject: string) {
        super({
            message: `${targetProject} is not a compatible target`,
            name: 'IncompatibleProjectError',
        });
    }

    additionalSerializedProps(): object {
        return {
            details: [
                {
                    validationErrors: [],
                    message: this.message,
                },
            ],
        };
    }
}
