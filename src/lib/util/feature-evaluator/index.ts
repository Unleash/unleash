import { once } from 'events';
import { Unleash, UnleashConfig } from './unleash';
import { Variant, getDefaultVariant } from './variant';
import { Context } from './context';
import { TagFilter } from './tags';
import { UnleashEvents } from './events';
import { ClientFeaturesResponse, FeatureInterface } from './feature';
import InMemStorageProvider from './repository/storage-provider-in-mem';
import { FeatureEvaluationResult } from './client';

// exports
export { Strategy } from './strategy/index';
export {
    Context,
    Variant,
    Unleash,
    TagFilter,
    InMemStorageProvider,
    UnleashEvents,
};
export type { ClientFeaturesResponse, UnleashConfig };

let instance: Unleash | undefined;
export function initialize(options: UnleashConfig): Unleash {
    if (instance) {
        instance.emit(
            UnleashEvents.Warn,
            'This global unleash instance is initialized multiple times.',
        );
    }
    instance = new Unleash(options);
    instance.on('error', () => {});
    return instance;
}

export async function startUnleash(options: UnleashConfig): Promise<Unleash> {
    const unleash = initialize(options);
    await once(unleash, 'synchronized');
    return unleash;
}

export function isEnabled(
    name: string,
    context: Context = {},
    fallbackValue?: boolean,
): FeatureEvaluationResult {
    console.log('index.isEnabled');
    if (!instance) {
        return {
            enabled: false,
            strategies: [],
            reasons: ["The Unleash client instance doesn't exist."],
        } as FeatureEvaluationResult;
    } else {
        console.log('Have an instance. Feature:', name);

        return instance.isEnabled(name, context, fallbackValue);
    }
}

export function destroy(): void {
    return instance && instance.destroy();
}

export function getFeatureToggleDefinition(
    toggleName: string,
): FeatureInterface {
    return instance && instance.getFeatureToggleDefinition(toggleName);
}

export function getFeatureToggleDefinitions(): FeatureInterface[] {
    return instance && instance.getFeatureToggleDefinitions();
}

export function getVariant(
    name: string,
    context: Context = {},
    fallbackVariant?: Variant,
): Variant {
    const variant = fallbackVariant || getDefaultVariant();
    return instance ? instance.getVariant(name, context, variant) : variant;
}

export function forceGetVariant(
    name: string,
    context: Context = {},
    fallbackVariant?: Variant,
): Variant {
    const variant = fallbackVariant || getDefaultVariant();
    return instance
        ? instance.forceGetVariant(name, context, variant)
        : variant;
}
