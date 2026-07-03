import {
    normalizedStrategyValue,
    normalizedVariantValue,
} from 'utils/rolloutHash.js';

/**
 * A synthetic end-user of the pretend "sample app" shown in the onboarding
 * closed demo. These are not real Unleash users - they exist only so a rollout
 * percentage / targeting rule / variant split becomes something you can watch.
 */
export interface DemoUser {
    id: string;
    name: string;
    country: DemoCountry;
    plan: 'free' | 'pro';
}

export interface DemoCountry {
    code: string;
    label: string;
    flag: string;
}

export const DEMO_COUNTRIES: DemoCountry[] = [
    { code: 'US', label: 'United States', flag: '🇺🇸' },
    { code: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DE', label: 'Germany', flag: '🇩🇪' },
    { code: 'IN', label: 'India', flag: '🇮🇳' },
    { code: 'BR', label: 'Brazil', flag: '🇧🇷' },
    { code: 'JP', label: 'Japan', flag: '🇯🇵' },
];

export interface DemoVariant {
    name: string;
    /** Weight out of the sum of all variant weights (matches Unleash semantics). */
    weight: number;
}

/** Shared constants so every demo variant tells the same story. */
export const DEMO_FLAG_NAME = 'new-checkout';
export const DEMO_USER_COUNT = 60;
export const DEFAULT_VARIANTS: DemoVariant[] = [
    { name: 'control', weight: 50 },
    { name: 'treatment', weight: 50 },
];

export interface DemoFlagConfig {
    /** Used as the hashing groupId, exactly like a real flag name. */
    flagName: string;
    /** The environment master switch - gates every strategy below it. */
    environmentEnabled: boolean;
    rollout: number;
    targetCountryCodes: string[];
    variantsEnabled: boolean;
    variants: DemoVariant[];
}

export type EvaluationReason = 'rollout' | 'target' | 'off';

export interface UserEvaluation {
    enabled: boolean;
    reason: EvaluationReason;
    /** The user's 1-100 rollout bucket; stable across slider changes. */
    rolloutBucket: number;
    variant?: string;
}

const FIRST_NAMES = [
    'Ada',
    'Ben',
    'Cara',
    'Dev',
    'Eli',
    'Fay',
    'Gus',
    'Hana',
    'Ivo',
    'Jo',
    'Kit',
    'Lena',
    'Milo',
    'Nia',
    'Omar',
    'Pia',
    'Quinn',
    'Rai',
    'Sol',
    'Tom',
    'Uma',
    'Val',
    'Wren',
    'Xan',
    'Yas',
    'Zoe',
];

/**
 * Deterministically generate a stable set of synthetic users. The same index
 * always yields the same identity, so re-generating never reshuffles the grid.
 */
export const generateDemoUsers = (count: number): DemoUser[] =>
    Array.from({ length: count }, (_, i) => {
        const country = DEMO_COUNTRIES[i % DEMO_COUNTRIES.length];
        const name = `${FIRST_NAMES[i % FIRST_NAMES.length]}`;
        return {
            id: `user-${i + 1}`,
            name,
            country,
            plan: i % 3 === 0 ? 'pro' : 'free',
        };
    });

/**
 * Evaluate the whole population against the current flag configuration.
 *
 * Unlike raw hash bucketing (which, on a small fixed population, visibly skews
 * away from the slider value), the demo uses an *idealized even distribution*:
 * users are ranked by their hash and given evenly-spread rollout thresholds, so
 * an N% rollout lights up ~N% of the grid. Ranking by hash keeps the lit tiles
 * scattered across the grid (not filling sequentially), and because each user's
 * threshold is fixed, the rollout is deterministic, sticky, and monotonic - a
 * user who is in at X% stays in for every value above X. The environment master
 * switch gates every strategy, exactly like a real flag.
 */
export const computeEvaluations = (
    users: DemoUser[],
    config: DemoFlagConfig,
): UserEvaluation[] => {
    const n = users.length;
    if (n === 0) {
        return [];
    }

    // Even-spread rollout thresholds (1-100), assigned in hash order so the lit
    // tiles scatter across the grid instead of filling in sequence.
    const order = users
        .map((user, index) => ({
            index,
            key: normalizedStrategyValue(user.id, config.flagName),
        }))
        .sort((a, b) => a.key - b.key || a.index - b.index);
    const threshold: number[] = new Array(n);
    order.forEach((entry, rank) => {
        threshold[entry.index] = Math.round(((rank + 1) / n) * 100);
    });

    const base = users.map((user, index) => {
        const inRollout = threshold[index] <= config.rollout;
        const inTarget =
            config.targetCountryCodes.length > 0 &&
            config.targetCountryCodes.includes(user.country.code);
        const enabled = config.environmentEnabled && (inRollout || inTarget);
        const reason: EvaluationReason = !enabled
            ? 'off'
            : inRollout
              ? 'rollout'
              : 'target';
        return { user, enabled, reason, rolloutBucket: threshold[index] };
    });

    // Variants: an even split across the enabled users, assigned in variant-hash
    // order so the split is exact and scattered.
    const variantByUserId = new Map<string, string>();
    const totalWeight = config.variants.reduce((acc, v) => acc + v.weight, 0);
    if (config.variantsEnabled && totalWeight > 0) {
        const enabled = base
            .filter((entry) => entry.enabled)
            .map((entry) => ({
                id: entry.user.id,
                key: normalizedVariantValue(
                    entry.user.id,
                    config.flagName,
                    1000,
                ),
            }))
            .sort((a, b) => a.key - b.key || (a.id < b.id ? -1 : 1));

        enabled.forEach((entry, rank) => {
            const position = ((rank + 0.5) / enabled.length) * totalWeight;
            let counter = 0;
            let chosen = config.variants[0].name;
            for (const variant of config.variants) {
                counter += variant.weight;
                if (position <= counter) {
                    chosen = variant.name;
                    break;
                }
            }
            variantByUserId.set(entry.id, chosen);
        });
    }

    return base.map((entry) => ({
        enabled: entry.enabled,
        reason: entry.reason,
        rolloutBucket: entry.rolloutBucket,
        variant: entry.enabled ? variantByUserId.get(entry.user.id) : undefined,
    }));
};

export interface DemoStats {
    total: number;
    enabled: number;
    percentage: number;
    variantCounts: Record<string, number>;
}

/** A ready-to-use flag config (everyone on), spread-overridable per variant. */
export const defaultFlagConfig = (
    overrides: Partial<DemoFlagConfig> = {},
): DemoFlagConfig => ({
    flagName: DEMO_FLAG_NAME,
    environmentEnabled: true,
    rollout: 100,
    targetCountryCodes: [],
    variantsEnabled: false,
    variants: DEFAULT_VARIANTS,
    ...overrides,
});

export const summarize = (
    users: DemoUser[],
    evaluations: UserEvaluation[],
): DemoStats => {
    const enabled = evaluations.filter((e) => e.enabled).length;
    const variantCounts: Record<string, number> = {};
    for (const evaluation of evaluations) {
        if (evaluation.variant) {
            variantCounts[evaluation.variant] =
                (variantCounts[evaluation.variant] ?? 0) + 1;
        }
    }
    return {
        total: users.length,
        enabled,
        percentage: users.length
            ? Math.round((enabled / users.length) * 100)
            : 0,
        variantCounts,
    };
};
