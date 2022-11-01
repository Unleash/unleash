import { Strategy } from './strategy';
import { Context } from '../context';

export default class WithCsAccountdStrategy extends Strategy {
    constructor() {
        super('withCsAccountId');
    }

    isEnabled(
        parameters: { csAccountIds?: string },
        context: Context,
    ): boolean {
        const csAccountIdList = parameters.csAccountIds
            ? parameters.csAccountIds.split(/\s*,\s*/)
            : [];
        return csAccountIdList.includes(String(context.csAccountId));
    }
}
