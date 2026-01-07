import murmurHash3 from 'murmurhash3js';

function normalizedValue(
    id: string,
    groupId: string,
    normalizer: number,
    seed = 0,
): number {
    const hash = murmurHash3.x86.hash32(`${groupId}:${id}`, seed);
    return (hash % normalizer) + 1;
}

const STRATEGY_SEED = 0;

export function normalizedStrategyValue(id: string, groupId: string): number {
    return normalizedValue(id, groupId, 100, STRATEGY_SEED);
}

const VARIANT_SEED = 86028157;

export function normalizedVariantValue(
    id: string,
    groupId: string,
    normalizer: number,
): number {
    return normalizedValue(id, groupId, normalizer, VARIANT_SEED);
}
