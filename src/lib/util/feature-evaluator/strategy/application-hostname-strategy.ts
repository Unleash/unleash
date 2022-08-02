import { hostname } from 'os';
import { Strategy } from './strategy';

export default class ApplicationHostnameStrategy extends Strategy {
    private hostname: string;

    constructor() {
        super('applicationHostname');
        this.hostname = (
            process.env.HOSTNAME ||
            hostname() ||
            'undefined'
        ).toLowerCase();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    isEnabled(parameters: { hostNames: string }): boolean {
        if (!parameters.hostNames) {
            return false;
        }

        return parameters.hostNames
            .toLowerCase()
            .split(/\s*,\s*/)
            .includes(this.hostname);
    }
}
