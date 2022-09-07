import {
    IExperimentalOptions,
    IExternalFlagResolver,
    IFlagContext,
    IFlags,
    IFlagResolver,
} from '../types/experimental';
export default class FlagResolver implements IFlagResolver {
    private experiments: IFlags;

    private externalResolver: IExternalFlagResolver;

    constructor(expOpt: IExperimentalOptions) {
        this.experiments = expOpt.flags;
        this.externalResolver = expOpt.externalResolver;
    }

    getAll(context?: IFlagContext): IFlags {
        const flags: IFlags = { ...this.experiments };

        Object.keys(flags).forEach((flagName) => {
            if (!this.experiments[flagName])
                flags[flagName] = this.externalResolver.isEnabled(
                    flagName,
                    context,
                );
        });

        return flags;
    }

    isEnabled(expName: string, context?: IFlagContext): boolean {
        if (this.experiments[expName]) {
            return true;
        }
        return this.externalResolver.isEnabled(expName, context);
    }
}
