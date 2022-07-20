import { EnabledStatus } from '../client';
import { Strategy } from './strategy';

export default class DefaultStrategy extends Strategy {
    constructor() {
        super('default');
    }

    isEnabled(): EnabledStatus {
        return {
            enabled: true,
            reasons: ['The default strategy is on for all users.'],
        };
    }
}
