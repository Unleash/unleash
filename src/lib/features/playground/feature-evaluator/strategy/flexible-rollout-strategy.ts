import { Strategy } from './strategy.js';
import type { Context } from '../context.js';
import { normalizedStrategyValue } from './util.js';
import { resolveContextValue } from '../helpers.js';

const STICKINESS = {
    default: 'default',
    random: 'random',
};

export default class FlexibleRolloutStrategy extends Strategy {
    private randomGenerator: Function = () =>
        `${Math.round(Math.random() * 10_000) + 1}`;

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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    isEnabled(
        parameters: {
            groupId?: string;
            rollout: number | string;
            stickiness?: string;
        },
        context: Context,
    ): boolean {
        const groupId: string =
            parameters.groupId ||
            (context.featureToggle && String(context.featureToggle)) ||
            '';
        const percentage = Number(parameters.rollout);
        const stickiness: string = parameters.stickiness || STICKINESS.default;
        const stickinessId = this.resolveStickiness(stickiness, context);

        if (!stickinessId) {
            return false;
        }
        const normalizedUserId = normalizedStrategyValue(stickinessId, groupId);
        return percentage > 0 && normalizedUserId <= percentage;
    }
}
