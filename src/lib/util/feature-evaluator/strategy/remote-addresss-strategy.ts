import { Strategy } from './strategy';
import { Context } from '../context';
import { StrategyEvaluationResult } from '../client';

const ip = require('ip');

export default class RemoteAddressStrategy extends Strategy {
    constructor() {
        super('remoteAddress');
    }

    isEnabled(parameters: any, context: Context): StrategyEvaluationResult {
        if (!parameters.IPs) {
            return {
                result: false,
                // reasons: [
                //     'You have not provided any IPs to activate this strategy for.',
                // ],
            };
        }

        const enabled = parameters.IPs.split(/\s*,\s*/).some(
            (range: string): Boolean => {
                if (range === context.remoteAddress) {
                    return true;
                }
                if (!ip.isV6Format(range)) {
                    try {
                        return ip
                            .cidrSubnet(range)
                            .contains(context.remoteAddress);
                    } catch (err) {
                        return false;
                    }
                }
                return false;
            },
        );

        return {
            result: enabled,
            // reasons: [
            //     `${context.remoteAddress} is ${enabled ? '' : 'not '}one of ${
            //         parameters.IPs
            //     }`,
            // ],
        };
    }
}
