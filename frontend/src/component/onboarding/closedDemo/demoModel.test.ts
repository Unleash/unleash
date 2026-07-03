import {
    computeEvaluations,
    type DemoFlagConfig,
    generateDemoUsers,
    summarize,
} from './demoModel.js';

const baseConfig = (
    overrides: Partial<DemoFlagConfig> = {},
): DemoFlagConfig => ({
    flagName: 'new-checkout',
    environmentEnabled: true,
    rollout: 0,
    targetCountryCodes: [],
    variantsEnabled: false,
    variants: [],
    ...overrides,
});

const countEnabled = (
    users: ReturnType<typeof generateDemoUsers>,
    config: DemoFlagConfig,
) => computeEvaluations(users, config).filter((e) => e.enabled).length;

describe('demoModel', () => {
    it('generates stable users', () => {
        const a = generateDemoUsers(60);
        const b = generateDemoUsers(60);
        expect(a).toEqual(b);
        expect(a).toHaveLength(60);
        expect(a[0].id).toBe('user-1');
    });

    it('spreads the rollout evenly: an N% rollout enables ~N% of users', () => {
        const users = generateDemoUsers(60);
        expect(countEnabled(users, baseConfig({ rollout: 0 }))).toBe(0);
        expect(countEnabled(users, baseConfig({ rollout: 25 }))).toBe(15);
        expect(countEnabled(users, baseConfig({ rollout: 50 }))).toBe(30);
        expect(countEnabled(users, baseConfig({ rollout: 100 }))).toBe(60);
    });

    it('gates everything behind the environment master switch', () => {
        const users = generateDemoUsers(60);
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
        const users = generateDemoUsers(60);
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

    it('targets a country at 100% regardless of the rollout percentage', () => {
        const users = generateDemoUsers(60);
        const evaluations = computeEvaluations(
            users,
            baseConfig({ rollout: 0, targetCountryCodes: ['US'] }),
        );
        const usIndexes = users
            .map((u, i) => ({ u, i }))
            .filter(({ u }) => u.country.code === 'US');
        expect(usIndexes.length).toBeGreaterThan(0);
        for (const { i } of usIndexes) {
            expect(evaluations[i].enabled).toBe(true);
            expect(evaluations[i].reason).toBe('target');
        }
    });

    it('splits enabled users into even, sticky variants', () => {
        const users = generateDemoUsers(60);
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
