import { Strategy } from './strategy';
import { Context } from '../context';
import normalizedValue from './util';
import { EnabledStatus } from '../client';

export default class GradualRolloutUserIdStrategy extends Strategy {
    constructor() {
        super('gradualRolloutUserId');
    }

    isEnabled(parameters: any, context: Context): EnabledStatus {
        const { userId } = context;
        if (!userId) {
            return {
                enabled: false,
                reasons: ['There was no user ID provided.'],
            };
        }

        const percentage = Number(parameters.percentage);
        const groupId = parameters.groupId || '';

        const normalizedUserId = normalizedValue(userId, groupId);

        const enabled = percentage > 0 && normalizedUserId <= percentage;

        const reason = `This feature is enabled for ${percentage}% of your users and is sticky on the "userId" context field. Based on the provided context, this feature is ${
            enabled ? '' : 'not '
        }active.`;

        return {
            enabled,
            reasons: [reason],
        };
    }
}
