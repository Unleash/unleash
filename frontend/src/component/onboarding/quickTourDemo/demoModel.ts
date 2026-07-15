import {
    normalizedStrategyValue,
    normalizedVariantValue,
} from './rolloutHash.js';

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
    look: DemoLook;
}

/**
 * Palette indices for the character illustration. Which palettes they index
 * into is owned by DemoCharacter; the model only guarantees the indices are
 * deterministic per user, so the crowd never reshuffles.
 */
export interface DemoLook {
    skin: number;
    hair: number;
    hairColor: number;
    shirt: number;
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
    /** JSON payload delivered to users who get this variant. */
    payload?: string;
    /** The payload's colour, extracted for rendering (shirts, bar, preview). */
    color?: string;
    /** The payload's call-to-action text, shown in the app preview. */
    cta?: string;
}

export interface DemoFlagConfig {
    /** Used as the hashing groupId, exactly like a real flag name. */
    flagName: string;
    /** The environment master switch - gates every strategy below it. */
    environmentEnabled: boolean;
    rollout: number;
    /**
     * A constraint on the strategy, exactly like real Unleash semantics:
     * constraints are ANDed with the rollout, so the rollout percentage applies
     * only within the users who match. Empty means unconstrained.
     */
    targetCountryCodes: string[];
    variantsEnabled: boolean;
    variants: DemoVariant[];
}

export interface UserEvaluation {
    enabled: boolean;
    /** Whether the user passes the strategy constraints (true if none set). */
    matchesConstraints: boolean;
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
            // Multipliers co-prime with each palette size cycle through every
            // palette entry and scatter the combinations so neighbouring users
            // don't look like siblings. Country repeats with period 6, so the
            // hair formula (also mod 6) mixes in a floor(i/6) term - a plain
            // linear formula would give every compatriot the same haircut.
            look: {
                skin: i % 5,
                hair: (i + Math.floor(i / 6) * 5 + 2) % 6,
                hairColor: (i * 3 + 1) % 8,
                shirt: (i * 11 + 3) % 8,
            },
        };
    });

/**
 * Evaluate the whole population against the current flag configuration.
 *
 * Unlike raw hash bucketing (which, on a small fixed population, visibly skews
 * away from the slider value), the demo uses an *idealized even distribution*:
 * users are ranked and given evenly-spread rollout thresholds, so an N% rollout
 * lights up ~N% of the grid. The ranking interleaves countries round-robin
 * (each country's users ordered by hash), which additionally makes an N%
 * rollout hit ~N% of *every country* - so combining a country constraint with
 * a 50% rollout visibly enables about half of that country. Hash ordering
 * keeps the lit users scattered across the grid, and because each user's
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

    // Even-spread rollout thresholds (1-100). Users are grouped per country
    // (each group ordered by hash) and the groups are interleaved round-robin,
    // so every stretch of the global ranking contains each country once. The
    // starting country rotates per round so no country always leads a block.
    const keyed = users.map((user, index) => ({
        index,
        countryCode: user.country.code,
        key: normalizedStrategyValue(user.id, config.flagName),
    }));
    const groups = new Map<string, typeof keyed>();
    for (const entry of keyed) {
        const group = groups.get(entry.countryCode) ?? [];
        group.push(entry);
        groups.set(entry.countryCode, group);
    }
    for (const group of groups.values()) {
        group.sort((a, b) => a.key - b.key || a.index - b.index);
    }
    const countryCodes = [...groups.keys()];
    const order: typeof keyed = [];
    for (let round = 0; order.length < n; round++) {
        for (let c = 0; c < countryCodes.length; c++) {
            const code = countryCodes[(c + round) % countryCodes.length];
            const group = groups.get(code) ?? [];
            if (round < group.length) {
                order.push(group[round]);
            }
        }
    }
    const threshold: number[] = new Array(n);
    order.forEach((entry, rank) => {
        threshold[entry.index] = Math.round(((rank + 1) / n) * 100);
    });

    const base = users.map((user, index) => {
        const inRollout = threshold[index] <= config.rollout;
        // Constraints AND with the rollout, like a real Unleash strategy: the
        // rollout percentage applies within the matching users only.
        const matchesConstraints =
            config.targetCountryCodes.length === 0 ||
            config.targetCountryCodes.includes(user.country.code);
        const enabled =
            config.environmentEnabled && matchesConstraints && inRollout;
        return {
            user,
            enabled,
            matchesConstraints,
            rolloutBucket: threshold[index],
        };
    });

    // Variants: each user has a fixed position in the weight space, derived
    // from a ranking of the *whole* population by variant hash. Like real
    // Unleash, a user's variant depends only on the weights - changing the
    // rollout (or constraints) never reshuffles who gets which variant.
    const variantByUserId = new Map<string, string>();
    const totalWeight = config.variants.reduce((acc, v) => acc + v.weight, 0);
    if (config.variantsEnabled && totalWeight > 0) {
        const ranked = users
            .map((user) => ({
                id: user.id,
                key: normalizedVariantValue(user.id, config.flagName, 1000),
            }))
            .sort((a, b) => a.key - b.key || (a.id < b.id ? -1 : 1));

        ranked.forEach((entry, rank) => {
            const position = ((rank + 0.5) / ranked.length) * totalWeight;
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
        matchesConstraints: entry.matchesConstraints,
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
