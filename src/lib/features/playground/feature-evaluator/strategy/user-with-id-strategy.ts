import { Strategy } from './strategy.js';
import type { Context } from '../context.js';

export default class UserWithIdStrategy extends Strategy {
    constructor() {
        super('userWithId');
    }

    isEnabled(parameters: { userIds?: string }, context: Context): boolean {
        const userIdList = parameters.userIds
            ? parameters.userIds.split(/\s*,\s*/)
            : [];
        return (
            context.userId !== undefined && userIdList.includes(context.userId)
        );
    }
}
