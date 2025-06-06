/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { StrategyVariantSchemaPayload } from './strategyVariantSchemaPayload.js';
import type { StrategyVariantSchemaWeightType } from './strategyVariantSchemaWeightType.js';

/**
 * This is an experimental property. It may change or be removed as we work on it. Please don't depend on it yet. A strategy variant allows you to attach any data to strategies instead of only returning `true`/`false`. Strategy variants take precedence over feature variants.
 */
export interface StrategyVariantSchema {
    /** The variant name. Must be unique for this feature flag */
    name: string;
    /** Extra data configured for this variant */
    payload?: StrategyVariantSchemaPayload;
    /** The [stickiness](https://docs.getunleash.io/reference/feature-toggle-variants#variant-stickiness) to use for distribution of this variant. Stickiness is how Unleash guarantees that the same user gets the same variant every time */
    stickiness: string;
    /**
     * The weight is the likelihood of any one user getting this variant. It is an integer between 0 and 1000. See the section on [variant weights](https://docs.getunleash.io/reference/feature-toggle-variants#variant-weight) for more information
     * @minimum 0
     * @maximum 1000
     */
    weight: number;
    /** Set to `fix` if this variant must have exactly the weight allocated to it. If the type is `variable`, the weight will adjust so that the total weight of all variants adds up to 1000. Refer to the [variant weight documentation](https://docs.getunleash.io/reference/feature-toggle-variants#variant-weight). */
    weightType: StrategyVariantSchemaWeightType;
}
