/**
 * MurmurHash3 (x86, 32-bit) ported to run in the browser with no dependency.
 *
 * This is verified byte-identical to the `murmurhash3js` package that the
 * Unleash server SDK / feature-evaluator uses (see
 * `src/lib/features/playground/feature-evaluator/strategy/util.ts`). Keeping it
 * identical means the onboarding "closed demo" distributes users across a
 * gradual rollout / variant split exactly the way real evaluation would, so the
 * simulation is faithful rather than merely plausible.
 */
const murmur3x86Hash32 = (key: string, seed = 0): number => {
    const remainder = key.length % 4;
    const bytes = key.length - remainder;
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;
    let h1 = seed;
    let i = 0;
    let k1 = 0;

    while (i < bytes) {
        k1 =
            (key.charCodeAt(i) & 0xff) |
            ((key.charCodeAt(++i) & 0xff) << 8) |
            ((key.charCodeAt(++i) & 0xff) << 16) |
            ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;
        k1 =
            ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) &
            0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 =
            ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) &
            0xffffffff;
        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        const h1b =
            ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) &
            0xffffffff;
        h1 =
            (h1b & 0xffff) +
            0x6b64 +
            ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
    }

    k1 = 0;
    // Tail bytes. Written as cascading ifs (rather than a fall-through switch)
    // to stay lint-clean while remaining equivalent to the reference algorithm.
    if (remainder >= 3) {
        k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
    }
    if (remainder >= 2) {
        k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
    }
    if (remainder >= 1) {
        k1 ^= key.charCodeAt(i) & 0xff;
        k1 =
            ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) &
            0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 =
            ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) &
            0xffffffff;
        h1 ^= k1;
    }

    h1 ^= key.length;
    h1 ^= h1 >>> 16;
    h1 =
        ((h1 & 0xffff) * 0x85ebca6b +
            ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) &
        0xffffffff;
    h1 ^= h1 >>> 13;
    h1 =
        ((h1 & 0xffff) * 0xc2b2ae35 +
            ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) &
        0xffffffff;
    h1 ^= h1 >>> 16;
    return h1 >>> 0;
};

const STRATEGY_SEED = 0;
const VARIANT_SEED = 86028157;

/**
 * The normalized (1-100) rollout bucket for a user, matching
 * `normalizedStrategyValue` in the server SDK. A user is inside an X% gradual
 * rollout when this value is `<= X`.
 */
export const normalizedStrategyValue = (id: string, groupId: string): number =>
    (murmur3x86Hash32(`${groupId}:${id}`, STRATEGY_SEED) % 100) + 1;

/**
 * The normalized (1-normalizer) bucket used to pick a variant for a user,
 * matching `normalizedVariantValue` in the server SDK.
 */
export const normalizedVariantValue = (
    id: string,
    groupId: string,
    normalizer: number,
): number =>
    (murmur3x86Hash32(`${groupId}:${id}`, VARIANT_SEED) % normalizer) + 1;
