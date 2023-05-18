import { Variant, PayloadType } from 'unleash-client';
import {
    IExperimentalOptions,
    IExternalFlagResolver,
    IFlagContext,
    IFlags,
    IFlagResolver,
    IFlagKey,
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

        Object.keys(flags).forEach((flagName: IFlagKey) => {
            if (!this.experiments[flagName]) {
                if (typeof flags[flagName] === 'boolean') {
                    flags[flagName] = this.externalResolver.isEnabled(
                        flagName,
                        context,
                    );
                } else {
                    flags[flagName] = this.externalResolver.getVariant(
                        flagName,
                        context,
                    );
                }
            }
        });

        return flags;
    }

    isEnabled(expName: IFlagKey, context?: IFlagContext): boolean {
        const exp = this.experiments[expName];
        if (exp) {
            if (typeof exp === 'boolean') return exp;
            else return exp.enabled;
        }
        return this.externalResolver.isEnabled(expName, context);
    }

    getVariant(expName: IFlagKey, context?: IFlagContext): Variant | undefined {
        const exp = this.experiments[expName];
        if (exp) {
            if (typeof exp === 'boolean') return undefined;
            else return exp;
        }
        return this.externalResolver.getVariant(expName, context);
    }
}

export const getVariantValue = <T = string>(
    variant: Variant | undefined,
): T | undefined => {
    if (variant?.payload !== undefined) {
        if (variant.payload.type === PayloadType.JSON) {
            return JSON.parse(variant.payload.value) as T;
        }

        return variant.payload.value as T;
    }
};
