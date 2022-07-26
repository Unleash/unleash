import { Strategy } from './strategy';
import { Context } from '../context';
import { StrategyEvaluationResult } from '../client';

export default class UserWithIdStrategy extends Strategy {
    constructor() {
        super('userWithId');
    }

    isEnabled(parameters: any, context: Context): StrategyEvaluationResult {
        const userIdList = parameters.userIds
            ? parameters.userIds.split(/\s*,\s*/)
            : [];
        const enabled = userIdList.includes(context.userId);
        return {
            result: enabled,
            // reasons: [
            //     `${context.userId} is ${enabled ? '' : 'not '}one of ${
            //         parameters.userIds
            //     }`,
            // ],
        };
    }
}
