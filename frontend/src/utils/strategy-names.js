const nameMapping = {
    applicationHostname: {
        name: 'Hosts',
        description: 'Enable the feature for a specific set of hostnames',
    },
    default: {
        name: 'Standard',
        description: 'The standard strategy is strictly on / off for your entire userbase.',
    },
    flexibleRollout: {
        name: 'Gradual rollout',
        description:
            'Roll out to a percentage of your userbase, and ensure that the experience is the same for the user on each visit.',
    },
    gradualRolloutRandom: {
        name: 'Randomized',
        description: 'Roll out to a percentage of your userbase and randomly enable the feature on a per request basis',
    },
    gradualRolloutSessionId: {
        name: 'Sessions',
        description: 'Roll out to a percentage of your userbase and configure stickiness based on sessionId',
    },
    gradualRolloutUserId: {
        name: 'Users',
        description: 'Roll out to a percentage of your userbase and configure stickiness based on userId',
    },
    remoteAddress: {
        name: 'IPs',
        description: 'Enable the feature for a specific set of IP addresses',
    },
    userWithId: {
        name: 'UserIDs',
        description: 'Enable the feature for a specific set of userIds',
    },
};

export const getHumanReadbleStrategy = strategyName => nameMapping[strategyName];

export const getHumanReadbleStrategyName = strategyName => {
    const humanReadableStrategy = nameMapping[strategyName];

    if (humanReadableStrategy) {
        return humanReadableStrategy.name;
    }
    return strategyName;
};
