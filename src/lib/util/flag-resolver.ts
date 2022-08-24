import {
    IExperimentalOptions,
    IExternalFlagsResolver,
    IFlagContext,
    IFlags,
    IFlagsResolver,
    IUIFlags,
} from '../types/experimental';

const DEFAULT_DYNAMIC_FLAGS = ['ENABLE_DARK_MODE_SUPPORT'];

const DEFAULT_EXT_RESOLVER = { isEnabled: () => false };

export default class FlagsResolver implements IFlagsResolver {
    private uiFlags: IFlags;

    private experiments: IFlags;

    private dynamicFlags: string[] = [];

    private externalResolver: IExternalFlagsResolver;

    constructor(uiFlags: IUIFlags, expOpt: IExperimentalOptions) {
        this.uiFlags = uiFlags || {};
        this.experiments = expOpt.flags || {};
        this.dynamicFlags = [
            ...DEFAULT_DYNAMIC_FLAGS,
            ...(expOpt.dynamicFlags || []),
        ];
        this.externalResolver = expOpt.externalResolver || DEFAULT_EXT_RESOLVER;
    }

    getUIFlags(context?: IFlagContext): IFlags {
        const flags = { ...this.uiFlags };
        this.dynamicFlags.forEach((name: string) => {
            //Only test external resolver if disabled
            if (!flags[name]) {
                flags[name] = this.externalResolver.isEnabled(name, context);
            }
        });
        return flags;
    }

    isExperimentEnabled(name: string, context?: IFlagContext): boolean {
        if (this.experiments[name]) {
            return true;
        }
        if (this.dynamicFlags.includes(name)) {
            return this.externalResolver.isEnabled(name, context);
        }
        return false;
    }
}
