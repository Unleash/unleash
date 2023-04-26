import { UnleashError } from './api-error';

export default class ProjectWithoutOwnerError extends UnleashError {
    constructor() {
        super({
            message: 'A project must have at least one owner',
            name: 'ProjectWithoutOwnerError',
        });
    }
}
