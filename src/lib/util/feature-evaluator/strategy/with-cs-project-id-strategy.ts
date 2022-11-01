import { Strategy } from './strategy';
import { Context } from '../context';

export default class WithCsProjectIdStrategy extends Strategy {
    constructor() {
        super('withCsProjectId');
    }

    isEnabled(
        parameters: { csProjectIds?: string },
        context: Context,
    ): boolean {
        const csProjectIdList = parameters.csProjectIds
            ? parameters.csProjectIds.split(/\s*,\s*/)
            : [];
        return csProjectIdList.includes(String(context.csProjectId));
    }
}
