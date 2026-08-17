import { describe, expect, it } from 'vitest';
import {
    computeEvaluations,
    type IntroFlagConfig,
    generateIntroUsers,
    summarize,
} from './introModel.js';

const baseConfig = (
    overrides: Partial<IntroFlagConfig> = {},
): IntroFlagConfig => ({
    flagName: 'new-checkout',
    environmentEnabled: true,
    rollout: 0,
    targetCountryCodes: [],
    targetPlans: [],
    variantsEnabled: false,
    variants: [],
    ...overrides,
});

const countEnabled = (
    users: ReturnType<typeof generateIntroUsers>,
    config: IntroFlagConfig,
) => computeEvaluations(users, config).filter((e) => e.enabled).length;

describe('introModel', () => {
    it('generates stable users', () => {
        const a = generateIntroUsers(60);
        const b = generateIntroUsers(60);
        expect(a).toEqual(b);
        expect(a).toHaveLength(60);
        expect(a[0].id).toBe('user-1');
    });

    it('covers every country x plan combination in the demo grid', () => {
        const users = generateIntroUsers(20);
        const seen = new Set(
            users.map((user) => `${user.country.code}:${user.plan}`),
        );
        for (const code of ['NO', 'US', 'CA', 'GB', 'JP']) {
            for (const plan of ['pro', 'enterprise']) {
                expect(seen).toContain(`${code}:${plan}`);
            }
        }
    });

    it('spreads the rollout evenly: an N% rollout enables ~N% of users', () => {
        const users = generateIntroUsers(60);
        expect(countEnabled(users, baseConfig({ rollout: 0 }))).toBe(0);
        expect(countEnabled(users, baseConfig({ rollout: 25 }))).toBe(15);
        expect(countEnabled(users, baseConfig({ rollout: 50 }))).toBe(30);
        expect(countEnabled(users, baseConfig({ rollout: 100 }))).toBe(60);
    });

    it('gates everything behind the environment master switch', () => {
        const users = generateIntroUsers(60);
        expect(
            countEnabled(
                users,
                baseConfig({
                    environmentEnabled: false,
                    rollout: 100,
                    targetCountryCodes: ['US'],
                }),
            ),
        ).toBe(0);
    });

    it('is monotonic: a user enabled at X% stays enabled as the rollout grows', () => {
        const users = generateIntroUsers(60);
        const enabledIdsAt = (rollout: number) => {
            const evaluations = computeEvaluations(
                users,
                baseConfig({ rollout }),
            );
            return new Set(
                users.filter((_, i) => evaluations[i].enabled).map((u) => u.id),
            );
        };
        let previous = new Set<string>();
        for (let rollout = 0; rollout <= 100; rollout += 5) {
            const current = enabledIdsAt(rollout);
            for (const id of previous) {
                expect(current.has(id)).toBe(true);
            }
            previous = current;
        }
    });

    it('ANDs constraints with the rollout, like a real Unleash strategy', () => {
        const users = generateIntroUsers(60);

        // A constraint alone doesn't enable anyone at 0% rollout.
        expect(
            countEnabled(
                users,
                baseConfig({ rollout: 0, targetCountryCodes: ['US'] }),
            ),
        ).toBe(0);

        // At 100% rollout, exactly the matching users are enabled.
        const evaluations = computeEvaluations(
            users,
            baseConfig({ rollout: 100, targetCountryCodes: ['US'] }),
        );
        users.forEach((user, i) => {
            expect(evaluations[i].enabled).toBe(user.country.code === 'US');
            expect(evaluations[i].matchesConstraints).toBe(
                user.country.code === 'US',
            );
        });
    });

    it('spreads the rollout evenly within each country, not just overall', () => {
        const users = generateIntroUsers(20);
        const evaluations = computeEvaluations(
            users,
            baseConfig({ rollout: 50 }),
        );
        const enabledByCountry = new Map<string, number>();
        users.forEach((user, i) => {
            if (evaluations[i].enabled) {
                enabledByCountry.set(
                    user.country.code,
                    (enabledByCountry.get(user.country.code) ?? 0) + 1,
                );
            }
        });
        // 20 users / 5 countries = 4 per country; a 50% rollout hits 2 each.
        for (const code of ['NO', 'US', 'CA', 'GB', 'JP']) {
            expect(enabledByCountry.get(code)).toBe(2);
        }
    });

    it('treats no constraints as matching everyone', () => {
        const users = generateIntroUsers(60);
        const evaluations = computeEvaluations(
            users,
            baseConfig({ rollout: 50 }),
        );
        for (const evaluation of evaluations) {
            expect(evaluation.matchesConstraints).toBe(true);
        }
    });

    it('ANDs country and plan constraints', () => {
        const users = generateIntroUsers(50);
        const evaluations = computeEvaluations(
            users,
            baseConfig({
                rollout: 100,
                targetCountryCodes: ['NO'],
                targetPlans: ['pro'],
            }),
        );

        users.forEach((user, index) => {
            expect(evaluations[index].enabled).toBe(
                user.country.code === 'NO' && user.plan === 'pro',
            );
        });
    });

    it('keeps variant assignments stable when the rollout changes', () => {
        const users = generateIntroUsers(60);
        const config = baseConfig({
            rollout: 100,
            variantsEnabled: true,
            variants: [
                { name: 'control', weight: 50 },
                { name: 'treatment', weight: 50 },
            ],
        });
        const at100 = computeEvaluations(users, config);
        const at40 = computeEvaluations(users, { ...config, rollout: 40 });
        users.forEach((_, i) => {
            if (at40[i].enabled) {
                expect(at40[i].variant).toBe(at100[i].variant);
            }
        });
    });

    it('splits enabled users into even, sticky variants', () => {
        const users = generateIntroUsers(60);
        const config = baseConfig({
            rollout: 100,
            variantsEnabled: true,
            variants: [
                { name: 'control', weight: 50 },
                { name: 'treatment', weight: 50 },
            ],
        });
        const evaluations = computeEvaluations(users, config);
        for (const evaluation of evaluations) {
            expect(evaluation.variant).toBeDefined();
        }
        const stats = summarize(users, evaluations);
        expect(stats.variantCounts.control).toBe(30);
        expect(stats.variantCounts.treatment).toBe(30);

        // stickiness: recomputing with the same config is identical
        const again = computeEvaluations(users, config);
        expect(again.map((e) => e.variant)).toEqual(
            evaluations.map((e) => e.variant),
        );
    });
});
