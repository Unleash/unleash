import { Strategy } from './strategy';
import { Context } from '../context';

export default class UserWithIdStrategy extends Strategy {
    constructor() {
        super('userWithId');
    }

    isEnabled(parameters: { userIds?: string }, context: Context): boolean {
        const userIdList = parameters.userIds
            ? parameters.userIds.split(/\s*,\s*/)
            : [];
        return userIdList.includes(context.userId);
    }
}
