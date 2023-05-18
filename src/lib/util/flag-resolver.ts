import { Variant, PayloadType } from 'unleash-client';
import {
    IExperimentalOptions,
    IExternalFlagResolver,
    IFlagContext,
    IFlags,
    IFlagResolver,
    IFlagKey,
} from '../types/experimental';
import { getDefaultVariant } from 'unleash-client/lib/variant';

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
            const flag = flags[flagName];
            if (typeof flag === 'boolean') {
                if (!flag) {
                    flags[flagName] = this.externalResolver.isEnabled(
                        flagName,
                        context,
                    );
                }
            } else {
                if (!flag?.enabled) {
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

    getVariant(expName: IFlagKey, context?: IFlagContext): Variant {
        const exp = this.experiments[expName];
        if (exp) {
            if (typeof exp === 'boolean') return getDefaultVariant();
            else return exp;
        }
        return this.externalResolver.getVariant(expName, context);
    }
}

export const getVariantValue = <T = string>(
    variant: Variant | undefined,
): T | undefined => {
    if (variant?.enabled) {
        if (!variant.payload) return variant.name as T;
        if (variant.payload.type === PayloadType.JSON) {
            return JSON.parse(variant.payload.value) as T;
        }

        return variant.payload.value as T;
    }
};
