const MAX_POOL_SIZE = 1000;

type CacheConstraint = {
    contextName: string;
    operator: string;
};

type CacheFeature = {
    type?: string;
    strategies?: {
        name: string;
        constraints?: CacheConstraint[];
    }[];
};

type CacheSegment = {
    constraints: CacheConstraint[];
};

const createStringCanonicalizer = () => {
    const pool = new Map<string, string>();

    return <T extends string>(value: T): T => {
        const existing = pool.get(value);
        if (existing !== undefined) {
            return existing as T;
        }
        if (pool.size < MAX_POOL_SIZE) {
            pool.set(value, value);
        }
        return value;
    };
};

export const createClientPayloadCanonicalizer = () => {
    const canonicalizeFeatureType = createStringCanonicalizer();
    const canonicalizeStrategyName = createStringCanonicalizer();
    const canonicalizeContextName = createStringCanonicalizer();
    const canonicalizeOperator = createStringCanonicalizer();

    const constraints = (values: CacheConstraint[] | undefined): void => {
        if (!Array.isArray(values)) {
            return;
        }

        for (const constraint of values) {
            constraint.contextName = canonicalizeContextName(
                constraint.contextName,
            );
            constraint.operator = canonicalizeOperator(constraint.operator);
        }
    };

    const feature = <T extends CacheFeature>(value: T): T => {
        if (value.type !== undefined) {
            value.type = canonicalizeFeatureType(value.type);
        }
        for (const strategy of value.strategies ?? []) {
            strategy.name = canonicalizeStrategyName(strategy.name);
            constraints(strategy.constraints);
        }
        return value;
    };

    const segment = <T extends CacheSegment>(value: T): T => {
        constraints(value.constraints);
        return value;
    };

    return { feature, segment };
};

export type ClientPayloadCanonicalizer = ReturnType<
    typeof createClientPayloadCanonicalizer
>;
