export const sortStrategiesByFeature = <
    ExistingStrategy extends { id: string; featureName?: string },
    UpdatedStrategy extends {
        id: string;
        featureName: string;
        changeRequest: { id: number };
    },
    NewStrategy extends {
        featureName: string;
        changeRequest: { id: number };
    },
>(
    strategies: ExistingStrategy[],
    changeRequestStrategies: (UpdatedStrategy | NewStrategy)[],
): (ExistingStrategy | UpdatedStrategy | NewStrategy)[] => {
    const strategiesByFlag = [...strategies, ...changeRequestStrategies].reduce(
        (acc, strategy) => {
            if (!strategy.featureName) {
                // this shouldn't ever happen here, but because the
                // type system allows it to, we need to handle it. If
                // a strategy doesn't have a feature name, discard it.
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
        {} as {
            [flagName: string]: (
                | ExistingStrategy
                | UpdatedStrategy
                | NewStrategy
            )[];
        },
    );

    const flagToStrategiesList = Object.entries(strategiesByFlag);

    flagToStrategiesList.sort(([flagA], [flagB]) => {
        return flagA.localeCompare(flagB);
    });

    return flagToStrategiesList.flatMap(([_, strategies]) => {
        const isExistingStrategy = (
            strategy: ExistingStrategy | UpdatedStrategy | NewStrategy,
        ): strategy is ExistingStrategy | UpdatedStrategy => 'id' in strategy;

        const isChangeRequest = (
            strategy: ExistingStrategy | UpdatedStrategy | NewStrategy,
        ): strategy is UpdatedStrategy | NewStrategy =>
            'changeRequest' in strategy;

        strategies.sort((a, b) => {
            if (isExistingStrategy(a) && isExistingStrategy(b)) {
                // both strategies exist already
                const idComp = a.id.localeCompare(b.id);
                if (idComp === 0) {
                    const crA = isChangeRequest(a);
                    const crB = isChangeRequest(b);

                    if (crA && !crB) {
                        return 1;
                    } else if (!crA && crB) {
                        return -1;
                    } else if (crA && crB) {
                        return a.changeRequest.id - b.changeRequest.id;
                    } else {
                        return 0;
                    }
                } else {
                    return idComp;
                }
            } else if (isExistingStrategy(a)) {
                // strategy b is new
                return -1;
            } else if (isExistingStrategy(b)) {
                // strategy a is new
                return 1;
            } else {
                // both strategies are new
                return a.changeRequest.id - b.changeRequest.id;
            }
        });

        return strategies;
    });
};
