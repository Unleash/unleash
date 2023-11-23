// use generics here to make it easier to test
export const sortStrategiesByFeature = <
    T extends { id: string; featureName?: string },
    U extends {
        id?: string;
        featureName: string;
        changeRequest: { id: number };
    },
>(
    strategies: T[],
    changeRequestStrategies: U[],
): { [flagName: string]: (T | U)[] } => {
    const isExistingStrategy = (strategy: T | U) => 'id' in strategy;
    const isNewStrategy = (strategy: T | U) => !isExistingStrategy(strategy);

    const collected = [...strategies, ...changeRequestStrategies].reduce(
        (acc, strategy) => {
            if (!strategy.featureName) {
                return acc;
            }
            const registered = acc[strategy.featureName];
            if (registered) {
                registered.push(strategy);
            } else {
                acc[strategy.featureName] = [strategy];
            }

            return acc;
        },
        {} as { [flagName: string]: (T | U)[] },
    );

    const sorted = Object.entries(collected).map(
        ([featureName, strategies]) => {
            strategies.sort((a, b) => {
                if (isNewStrategy(a) && isNewStrategy(b)) {
                    return a.changeRequest.id - b.changeRequest.id;
                }
                if (isNewStrategy(a)) {
                    return -1;
                }
                if (isNewStrategy(b)) {
                    return 1;
                }
                return 0;
            });
            [featureName, strategies];
        },
    );

    const collected2 = Object.fromEntries(sorted);

    return collected2;
};

export const sortAndFlattenStrategies = <
    T extends { id: string; featureName?: string },
    U extends {
        id?: string;
        featureName: string;
        changeRequest: { id: number };
    },
>(
    strategies: T[],
    changeRequestStrategies: U[],
): (T | U)[] => {
    const sorted = sortStrategiesByFeature(strategies, changeRequestStrategies);

    // flatten list of
    return Object.values(sorted).flat();
};
