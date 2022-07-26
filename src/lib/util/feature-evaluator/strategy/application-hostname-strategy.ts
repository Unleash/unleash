import { hostname } from 'os';
import { StrategyEvaluationResult } from '../client';
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

    isEnabled(parameters: any): StrategyEvaluationResult {
        if (!parameters.hostNames) {
            return {
                result: false,
                // reasons: [
                //     'You have not provided any hostnames to activate this strategy for.',
                // ],
            };
        }

        const enabled = parameters.hostNames
            .toLowerCase()
            .split(/\s*,\s*/)
            .includes(this.hostname);

        return {
            result: enabled,
            // reasons: [
            //     `${this.hostname} is ${enabled ? '' : 'not '}one of ${
            //         parameters.hostNames
            //     }`,
            // ],
        };
    }
}
