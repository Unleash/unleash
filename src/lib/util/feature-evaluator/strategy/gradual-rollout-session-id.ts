import { Strategy } from './strategy';
import normalizedValue from './util';
import { Context } from '../context';

export default class GradualRolloutSessionIdStrategy extends Strategy {
    constructor() {
        super('gradualRolloutSessionId');
    }

    isEnabled(parameters: any, context: Context) {
        const { sessionId } = context;
        if (!sessionId) {
            return {
                enabled: false,
                reasons: ['There was no session ID provided.'],
            };
        }

        const percentage = Number(parameters.percentage);
        const groupId = parameters.groupId || '';

        const normalizedId = normalizedValue(sessionId, groupId);

        const enabled = percentage > 0 && normalizedId <= percentage;
        const reason = `This feature is enabled for ${percentage}% of your users and is sticky on the "sessionId" context field. Based on the provided context, this feature is ${
            enabled ? '' : 'not '
        }active.`;

        return {
            enabled,
            reasons: [reason],
        };
    }
}
