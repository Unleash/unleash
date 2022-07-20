import { once } from 'events';
import { Unleash, UnleashConfig } from './unleash';
import { Variant, getDefaultVariant } from './variant';
import { Context } from './context';
import { TagFilter } from './tags';
import { UnleashEvents } from './events';
import { ClientFeaturesResponse } from './feature';
import InMemStorageProvider from './repository/storage-provider-in-mem';
import { EnabledStatus } from './client';

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
): EnabledStatus {
    console.log('index.isEnabled');
    if (!instance) {
        return {
            enabled: false,
            reasons: ["The Unleash client instance doesn't exist."],
        };
    } else {
        console.log('Have an instance. Feature:', name);

        return instance.isEnabled(name, context, fallbackValue);
    }
}

export function destroy() {
    return instance && instance.destroy();
}

export function getFeatureToggleDefinition(toggleName: string) {
    return instance && instance.getFeatureToggleDefinition(toggleName);
}

export function getFeatureToggleDefinitions() {
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
