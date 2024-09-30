type FlagLimitsProps = {
    global: { limit: number; count: number };
    project: { limit?: number; count: number };
};

export const useFlagLimits = ({ global, project }: FlagLimitsProps) => {
    const {
        limitReached: globalFlagLimitReached,
        limitMessage: globalLimitMessage,
    } = useGlobalFlagLimit(global.limit, global.count);

    const projectFlagLimitReached = isProjectFeatureLimitReached(
        project.limit,
        project.count,
    );

    const limitMessage = globalFlagLimitReached
        ? globalLimitMessage
        : projectFlagLimitReached
          ? `You have reached the project limit of ${project.limit} feature flags.`
          : undefined;

    return {
        limitMessage,
        globalFlagLimitReached,
        projectFlagLimitReached,
    };
};

const useGlobalFlagLimit = (flagLimit: number, flagCount: number) => {
    const limitReached = flagCount >= flagLimit;

    return {
        limitReached,
        limitMessage: limitReached
            ? `You have reached the instance-wide limit of ${flagLimit} feature flags.`
            : undefined,
    };
};

export const isProjectFeatureLimitReached = (
    featureLimit: number | null | undefined,
    currentFeatureCount: number,
): boolean => {
    return (
        featureLimit !== null &&
        featureLimit !== undefined &&
        featureLimit <= currentFeatureCount
    );
};
