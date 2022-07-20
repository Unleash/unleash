import { Strategy } from './strategy';
import { Context } from '../context';
import normalizedValue from './util';
import { resolveContextValue } from '../helpers';
import { EnabledStatus } from '../client';

const STICKINESS = {
    default: 'default',
    random: 'random',
};

export default class FlexibleRolloutStrategy extends Strategy {
    private randomGenerator: Function = () =>
        `${Math.round(Math.random() * 100) + 1}`;

    constructor(radnomGenerator?: Function) {
        super('flexibleRollout');
        if (radnomGenerator) {
            this.randomGenerator = radnomGenerator;
        }
    }

    resolveStickiness(stickiness: string, context: Context): any {
        switch (stickiness) {
            case STICKINESS.default:
                return (
                    context.userId ||
                    context.sessionId ||
                    this.randomGenerator()
                );
            case STICKINESS.random:
                return this.randomGenerator();
            default:
                return resolveContextValue(context, stickiness);
        }
    }

    isEnabled(parameters: any, context: Context): EnabledStatus {
        const groupId = parameters.groupId || context.featureToggle || '';
        const percentage = Number(parameters.rollout);
        const stickiness: string = parameters.stickiness || STICKINESS.default;
        const stickinessId = this.resolveStickiness(stickiness, context);

        if (!stickinessId) {
            return {
                enabled: false,
                reasons: [
                    'There is no stickiness ID provided to this strategy.',
                ],
            };
        }
        const normalizedUserId = normalizedValue(stickinessId, groupId);

        const enabled = percentage > 0 && normalizedUserId <= percentage;

        const reason = `This feature is enabled for ${percentage}% of your users and is sticky on the ${
            parameters.stickiness || STICKINESS.default
        } context field. Based on the provided context, this feature is ${
            enabled ? '' : 'not '
        }active.`;

        return {
            enabled,
            reasons: [reason],
        };
    }
}
