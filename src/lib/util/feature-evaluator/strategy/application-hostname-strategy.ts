import { hostname } from 'os';
import { EnabledStatus } from '../client';
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

    isEnabled(parameters: any): EnabledStatus {
        if (!parameters.hostNames) {
            return {
                enabled: false,
                reasons: [
                    'You have not provided any hostnames to activate this strategy for.',
                ],
            };
        }

        const enabled = parameters.hostNames
            .toLowerCase()
            .split(/\s*,\s*/)
            .includes(this.hostname);

        return {
            enabled,
            reasons: [
                `${this.hostname} is ${enabled ? '' : 'not '}one of ${
                    parameters.hostNames
                }`,
            ],
        };
    }
}
